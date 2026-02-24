import "dotenv/config";
console.log("Checking Environment Variables:");
console.log("DATABASE_URL defined:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL starts with:", process.env.DATABASE_URL.substring(0, 15) + "...");
}
console.log("BETTER_AUTH_SECRET defined:", !!process.env.BETTER_AUTH_SECRET);
if (process.env.BETTER_AUTH_SECRET) {
    console.log("BETTER_AUTH_SECRET is set");
} else {
    console.log("BETTER_AUTH_SECRET is MISSING");
}
