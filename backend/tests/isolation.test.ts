
import request from 'supertest';
import { serve } from '@hono/node-server';
import { app } from '../src/app'; // Adjust import path if needed
import { prisma } from '../src/lib/db';

// Helper to create a dummy JWT that passes the auth middleware
function createDummyJwt(userId: string, email: string, name: string) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        id: userId,
        email,
        name,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };

    const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');

    return `${encode(header)}.${encode(payload)}.dummy_signature`;
}

describe('Data Isolation Tests', () => {
    let server: any; // http.Server

    // User A
    const userAId = 'user-a-uuid-123';
    const userAEmail = 'usera@example.com';
    const tokenA = createDummyJwt(userAId, userAEmail, 'User A');

    // User B
    const userBId = 'user-b-uuid-456';
    const userBEmail = 'userb@example.com';
    const tokenB = createDummyJwt(userBId, userBEmail, 'User B');

    beforeAll(async () => {
        // Start server
        server = serve({
            fetch: app.fetch,
            port: 0, // Random port
        });

        // Cleanup database
        await prisma.transaction.deleteMany();
        await prisma.organizationMember.deleteMany();
        await prisma.organization.deleteMany();
        await prisma.session.deleteMany();
        await prisma.account.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        // Teardown
        await prisma.$disconnect();
        if (server) {
            server.close();
        }
    });

    test('Verify multi-user data isolation', async () => {
        // 1. & 2. Register/Login Users (Simulated via Token Usage)
        // The middleware automatically creates the user if they don't exist when a valid token is presented.
        // We trigger this by making a simple request (e.g., getting empty transactions)

        // Initialize User A
        let resA = await request(server)
            .get('/api/transactions')
            .set('Authorization', `Bearer ${tokenA}`);
        expect(resA.status).not.toBe(401);

        // Initialize User B
        let resB = await request(server)
            .get('/api/transactions')
            .set('Authorization', `Bearer ${tokenB}`);
        expect(resB.status).not.toBe(401);

        // 3. User A creates a transaction using JWT_A
        const transactionData = {
            text: "Date: 14 Jan 2026 Description: TEST TRANSACTION Amount: -500.00 Balance after transaction: 10,000.00"
        };

        const createRes = await request(server)
            .post('/api/transactions/extract')
            .set('Authorization', `Bearer ${tokenA}`)
            .send(transactionData);

        expect(createRes.status).toBe(201);
        expect(createRes.body.transaction).toBeDefined();

        // 4. User B fetches /api/transactions using JWT_B
        const fetchResB = await request(server)
            .get('/api/transactions')
            .set('Authorization', `Bearer ${tokenB}`);

        // 5. Expect User B to receive an empty array
        expect(fetchResB.status).toBe(200);
        expect(fetchResB.body.transactions).toHaveLength(0);

        // 6. User A fetches /api/transactions using JWT_A
        const fetchResA = await request(server)
            .get('/api/transactions')
            .set('Authorization', `Bearer ${tokenA}`);

        // 7. Expect User A to see exactly 1 transaction
        expect(fetchResA.status).toBe(200);
        expect(fetchResA.body.transactions).toHaveLength(1);
        expect(fetchResA.body.transactions[0].description).toBe('TEST TRANSACTION');
    });
});
