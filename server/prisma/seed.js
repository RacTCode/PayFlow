//seed data for testing
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { randomUUID } from "node:crypto";
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({
    adapter,
});
async function main() {
    const passwordHash = await bcrypt.hash("Password123!", 12);
    const merchant = await prisma.user.upsert({
        where: {
            email: "merchant@example.com",
        },
        update: {},
        create: {
            name: "Demo Merchant",
            email: "merchant@example.com",
            passwordHash,
            role: "MERCHANT",
        },
    });
    const admin = await prisma.user.upsert({
        where: {
            email: "admin@example.com",
        },
        update: {},
        create: {
            name: "System Admin",
            email: "admin@example.com",
            passwordHash,
            role: "ADMIN",
        },
    });
    console.log("Created users:", {
        merchant: merchant.email,
        admin: admin.email,
    });
    await prisma.transaction.deleteMany({
        where: {
            merchantId: merchant.id,
        },
    });
    const transactions = [
        {
            amount: 500,
            status: "SUCCESSFUL",
            customerReference: "ORD-1001",
        },
        {
            amount: 1250,
            status: "SUCCESSFUL",
            customerReference: "ORD-1002",
        },
        {
            amount: 800,
            status: "PENDING",
            customerReference: "ORD-1003",
        },
        {
            amount: 2100,
            status: "FAILED",
            customerReference: "ORD-1004",
        },
        {
            amount: 350,
            status: "SUCCESSFUL",
            customerReference: "ORD-1005",
        },
        {
            amount: 1750,
            status: "SUCCESSFUL",
            customerReference: "ORD-1006",
        },
        {
            amount: 950,
            status: "FAILED",
            customerReference: "ORD-1007",
        },
        {
            amount: 3200,
            status: "SUCCESSFUL",
            customerReference: "ORD-1008",
        },
    ];
    for (const transaction of transactions) {
        await prisma.transaction.create({
            data: {
                transactionId: `TXN-${randomUUID()
                    .replaceAll("-", "")
                    .slice(0, 10)
                    .toUpperCase()}`,
                merchantId: merchant.id,
                amount: transaction.amount,
                currency: "INR",
                status: transaction.status,
                paymentMethod: "QR",
                customerReference: transaction.customerReference,
            },
        });
    }
    console.log("Created transactions");
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
