// ============================================
// TRANSACTION PARSER TESTS
// Test all 3 formats
// ============================================

import { parseTransaction } from "./parser";

describe("parseTransaction", () => {
  // Sample 1: Clean format
  const sample1 = `Date: 11 Dec 2025
Description: STARBUCKS COFFEE MUMBAI
Amount: -420.00
Balance after transaction: 18,420.50`;

  // Sample 2: Inline format with arrows
  const sample2 = `Uber Ride * Airport Drop
12/11/2025 → ₹1,250.00 debited
Available Balance → ₹17,170.50`;

  // Sample 3: Compact format
  const sample3 = `txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00 Dr Bal 14171.50 Shopping`;

  test("parses sample 1", () => {
    const result = parseTransaction(sample1);
    expect(result.description).toContain("STARBUCKS");
    expect(result.amount).toBeCloseTo(-420);
    expect(result.balance).toBeCloseTo(18420.5);
  });

  test("parses sample 2", () => {
    const result = parseTransaction(sample2);
    expect(result.description).toContain("Uber");
    expect(result.amount).toBeCloseTo(-1250);
    expect(result.balance).toBeCloseTo(17170.5);
  });

  test("parses sample 3", () => {
    const result = parseTransaction(sample3);
    expect(result.description).toContain("Amazon");
    expect(result.amount).toBeCloseTo(-2999);
    expect(result.balance).toBeCloseTo(14171.5);
  });
});
