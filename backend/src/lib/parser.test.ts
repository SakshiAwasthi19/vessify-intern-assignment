// ============================================
// TRANSACTION PARSER TESTS
// Test all 3 formats
// ============================================

import { parseTransaction } from './parser';

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

console.log('='.repeat(60));
console.log('TRANSACTION PARSER TEST RESULTS');
console.log('='.repeat(60));

console.log('\n📋 SAMPLE 1 (Clean Format):');
console.log('Input:');
console.log(sample1);
console.log('\nOutput:');
try {
  const result1 = parseTransaction(sample1);
  console.log(JSON.stringify(result1, null, 2));
  console.log('\n✅ Parsed successfully!');
  console.log(`   Date: ${result1.date.toISOString()}`);
  console.log(`   Description: "${result1.description}"`);
  console.log(`   Amount: ${result1.amount}`);
  console.log(`   Balance: ${result1.balance}`);
} catch (error) {
  console.error('❌ Error:', error);
}

console.log('\n' + '-'.repeat(60));

console.log('\n📋 SAMPLE 2 (Inline Format with Arrows):');
console.log('Input:');
console.log(sample2);
console.log('\nOutput:');
try {
  const result2 = parseTransaction(sample2);
  console.log(JSON.stringify(result2, null, 2));
  console.log('\n✅ Parsed successfully!');
  console.log(`   Date: ${result2.date.toISOString()}`);
  console.log(`   Description: "${result2.description}"`);
  console.log(`   Amount: ${result2.amount}`);
  console.log(`   Balance: ${result2.balance}`);
} catch (error) {
  console.error('❌ Error:', error);
}

console.log('\n' + '-'.repeat(60));

console.log('\n📋 SAMPLE 3 (Compact Format):');
console.log('Input:');
console.log(sample3);
console.log('\nOutput:');
try {
  const result3 = parseTransaction(sample3);
  console.log(JSON.stringify(result3, null, 2));
  console.log('\n✅ Parsed successfully!');
  console.log(`   Date: ${result3.date.toISOString()}`);
  console.log(`   Description: "${result3.description}"`);
  console.log(`   Amount: ${result3.amount}`);
  console.log(`   Balance: ${result3.balance}`);
} catch (error) {
  console.error('❌ Error:', error);
}

console.log('\n' + '='.repeat(60));
console.log('ALL TESTS COMPLETE');
console.log('='.repeat(60));
