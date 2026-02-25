import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to connect to database...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    try {
        await prisma.$connect();
        console.log("✅ Successfully connected to database");
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);
    } catch (error) {
        console.error("❌ Failed to connect to database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
