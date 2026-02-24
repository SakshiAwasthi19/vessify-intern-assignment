
const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    log: ['query']
});

async function main() {
    console.log("--- DB State Check (JS) ---");
    console.log("URL:", process.env.DATABASE_URL);
    try {
        const userCount = await prisma.user.count();
        console.log("Total Users:", userCount);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                take: 5
            });
            console.log("Users found:", JSON.stringify(users, null, 2));
        } else {
            console.log("No users found.");
        }

        const transactionCount = await prisma.transaction.count();
        console.log("Total Transactions:", transactionCount);
    } catch (e) {
        console.error("Error:", e);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
