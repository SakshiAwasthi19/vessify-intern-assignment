"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login(data.email, data.password);

      // Log full response for debugging
      console.log("🔍 Login response:", JSON.stringify(res, null, 2));

      // Better Auth typically doesn't return JWT in login response
      // We need to fetch it from the backend token endpoint
      // Wait a bit for session to be created in database
      await new Promise(resolve => setTimeout(resolve, 300));

      let token: string | null = null;

      // Try to get JWT token from backend
      try {
        console.log("🔑 Fetching JWT token from backend...");
        const tokenRes = await authApi.getToken();
        console.log("🔍 Token response:", JSON.stringify(tokenRes, null, 2));
        token = tokenRes.token;

        // Validate token is a JWT (should be long and contain dots)
        if (token && token.length > 50 && token.includes('.')) {
          console.log("✅ Valid JWT token received");
        } else {
          console.warn("⚠️ Token doesn't look like a JWT:", token?.substring(0, 50));
        }
      } catch (tokenErr: any) {
        console.error("❌ Failed to get token from backend:", tokenErr);
        // Try to extract from login response as last resort
        token =
          res.token ||
          res.session?.token ||
          res.data?.token ||
          res.data?.session?.token ||
          res.user?.session?.token ||
          null;

        // Only use if it looks like a JWT (not a session ID)
        if (token && (token.length < 50 || !token.includes('.'))) {
          console.warn("⚠️ Token from login response doesn't look like a JWT, ignoring:", token.substring(0, 30));
          token = null;
        }
      }

      // Final check - if still no token, log error
      if (!token) {
        console.error("❌ No JWT token found");
        console.error("Full login response:", res);
        throw new Error("No JWT token received from server. Please try logging in again.");
      }

      // Save token to localStorage
      setToken(token);
      console.log("✅ Token saved to localStorage:", token.substring(0, 20) + "...");

      // Redirect to home page
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Register
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
