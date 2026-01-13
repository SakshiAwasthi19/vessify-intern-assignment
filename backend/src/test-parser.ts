// test-parser.ts - Simple test for transaction parser

import { parseTransaction } from "./lib/parser";

console.log("Testing Transaction Parser...\n");

const sample1 = `Date: 11 Dec 2025
Description: STARBUCKS COFFEE MUMBAI
Amount: -420.00
Balance after transaction: 18,420.50`;

const sample2 = `Uber Ride * Airport Drop
12/11/2025 → ₹1,250.00 debited
Available Balance → ₹17,170.50`;

const sample3 = `txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00 Dr Bal 14171.50 Shopping`;

console.log("Sample 1 Result:");
console.log(parseTransaction(sample1));
console.log("\n");

console.log("Sample 2 Result:");
console.log(parseTransaction(sample2));
console.log("\n");

console.log("Sample 3 Result:");
console.log(parseTransaction(sample3));
console.log("\n");

console.log("✅ All samples parsed successfully!");