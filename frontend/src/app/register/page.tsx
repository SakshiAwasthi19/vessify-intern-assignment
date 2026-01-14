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

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setLoading(true);

    try {
      const res = await authApi.register(data.email, data.password, data.name);

      // Better Auth typically doesn't return JWT in register response
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
        // Try to extract from register response as last resort
        token = 
          res.token || 
          res.session?.token || 
          res.data?.token ||
          res.data?.session?.token ||
          res.user?.session?.token ||
          null;
        
        // Only use if it looks like a JWT (not a session ID)
        if (token && (token.length < 50 || !token.includes('.'))) {
          console.warn("⚠️ Token from register response doesn't look like a JWT, ignoring:", token.substring(0, 30));
          token = null;
        }
      }

      // Log full response for debugging (remove in production)
      if (!token) {
        console.error("Register response structure:", JSON.stringify(res, null, 2));
        throw new Error("No token received from server. Please check console for response structure.");
      }

      // Save token to localStorage
      setToken(token);
      console.log("✅ Token saved to localStorage:", token.substring(0, 20) + "...");

      // Redirect to login page
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="John Doe"
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
                {loading ? "Registering..." : "Register"}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Login
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
