
import { parseTransaction } from '../src/lib/parser';

describe('Transaction Parser', () => {
    // Sample 1: Clean format with labels
    const sample1 = `Date: 11 Dec 2025
Description: STARBUCKS COFFEE MUMBAI
Amount: -420.00
Balance after transaction: 18,420.50`;

    const sample1SingleLine = `Date: 11 Dec 2025 Description: STARBUCKS COFFEE MUMBAI Amount: -420.00 Balance after transaction: 18,420.50`;

    // Sample 2: Inline format with arrows
    const sample2 = `Uber Ride * Airport Drop
12/11/2025 → ₹1,250.00 debited
Available Balance → ₹17,170.50`;

    // Sample 3: Compact format
    const sample3 = `txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00 Dr Bal 14171.50 Shopping`;

    // Expected values for assertions
    const expectedDateSample1 = new Date(Date.UTC(2025, 11, 11)); // 11 Dec 2025
    const expectedDateSample2 = new Date(Date.UTC(2025, 10, 12)); // 12 Nov 2025 (12/11/2025 - likely DD/MM or MM/DD, parser assumes MM/DD in code comments? No, let's check implementation.
    // Implementation says:
    // Format: "12/11/2025" (MM/DD/YYYY)
    // const [, month, day, year] = format2Match;
    // return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    // So 12/11/2025 is Dec 11, 2025.
    const expectedDateSample2_Correct = new Date(Date.UTC(2025, 11, 11));

    const expectedDateSample3 = new Date(Date.UTC(2025, 11, 10)); // 2025-12-10

    test('Parser handles Sample 1 format correctly (Multi-line)', () => {
        const result = parseTransaction(sample1);

        expect(result.date).toEqual(expectedDateSample1);
        expect(result.description).toBe('STARBUCKS COFFEE MUMBAI');
        expect(result.amount).toBe(-420.00);
        expect(result.balance).toBe(18420.50);
    });

    test('Parser handles Sample 1 format correctly (Single-line)', () => {
        const result = parseTransaction(sample1SingleLine);

        expect(result.date).toEqual(expectedDateSample1);
        expect(result.description).toBe('STARBUCKS COFFEE MUMBAI');
        expect(result.amount).toBe(-420.00);
        expect(result.balance).toBe(18420.50);
    });

    test('Parser handles Sample 2 format correctly', () => {
        const result = parseTransaction(sample2);

        // Note: Parser implementation treats 12/11/2025 as MM/DD/YYYY -> Dec 11, 2025.
        expect(result.date).toEqual(expectedDateSample2_Correct);
        expect(result.description).toBe('Uber Ride * Airport Drop');
        expect(result.amount).toBe(-1250.00); // Debited means negative
        expect(result.balance).toBe(17170.50);
    });

    test('Parser handles Sample 3 format correctly', () => {
        const result = parseTransaction(sample3);

        expect(result.date).toEqual(expectedDateSample3);
        // Description parsing might be tricky, it extracts between date and amount.
        // "txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00..."
        // Extracted: "Amazon.in Order #403-1234567-8901234"
        expect(result.description).toContain('Amazon.in Order #403-1234567-8901234');
        expect(result.amount).toBe(-2999.00); // Dr means negative
        expect(result.balance).toBe(14171.50);
    });
});
