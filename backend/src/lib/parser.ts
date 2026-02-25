// ============================================
// TRANSACTION PARSER
// Handles 3 different bank statement formats
// ============================================

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  balance: number;
}

/**
 * Parses a single transaction from raw bank statement text
 * 
 * Supports 3 formats:
 * 1. Clean format with labels (Date:, Description:, Amount:, Balance after transaction:)
 * 2. Inline format with arrows (Description on first line, date/amount/balance on second)
 * 3. Compact format (all on one line with txn ID, date, description, amount, balance)
 * 
 * @param text - Raw transaction text (can be single or multiple lines)
 * @returns Parsed transaction object
 * @throws Error if parsing fails
 */
export function parseTransaction(text: string): ParsedTransaction {
  // Normalize text: trim whitespace, normalize line breaks
  const normalized = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Try Format 1: Clean format with labels
  // Date: 11 Dec 2025
  // Description: STARBUCKS COFFEE MUMBAI
  // Amount: -420.00
  // Balance after transaction: 18,420.50
  if (normalized.match(/Date:/i)) {
    // Check if it's a single line format
    if (lines.length === 1 || !normalized.includes('\n')) {
      try {
        return parseFormat1SingleLine(normalized);
      } catch (e) {
        // If single line parse fails, fall back to multi-line (lines array)
      }
    }
    return parseFormat1(lines);
  }

  // Try Format 2: Inline format with arrows or dashes
  // Uber Ride * Airport Drop
  // 12/11/2025 → ₹1,250.00 debited
  // 12 Nov 2025 — ₹1,250.00 debited
  // Available Balance → ₹17,170.50
  if (normalized.includes('→') || normalized.includes('—') || normalized.includes('–') ||
    normalized.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || normalized.match(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/)) {
    return parseFormat2(lines);
  }

  // Try Format 3: Compact format (all on one line)
  // txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00 Dr Bal 14171.50 Shopping
  if (normalized.match(/\d{4}-\d{2}-\d{2}/) && normalized.match(/txn/i)) {
    return parseFormat3(normalized);
  }

  // Fallback: Try to parse as Format 3 (most flexible)
  return parseFormat3(normalized);
}

/**
 * Format 1: Clean format with labels
 * Date: 11 Dec 2025
 * Description: STARBUCKS COFFEE MUMBAI
 * Amount: -420.00
 * Balance after transaction: 18,420.50
 */
function parseFormat1(lines: string[]): ParsedTransaction {
  let date: Date | null = null;
  let description = '';
  let amount: number | null = null;
  let balance: number | null = null;

  for (const line of lines) {
    // Parse date: "Date: 11 Dec 2025"
    if (line.match(/^Date:\s*(.+)/i)) {
      const dateMatch = line.match(/^Date:\s*(.+)/i);
      if (dateMatch) {
        date = parseDate(dateMatch[1].trim());
      }
    }
    // Parse description: "Description: STARBUCKS COFFEE MUMBAI"
    else if (line.match(/^Description:\s*(.+)/i)) {
      const descMatch = line.match(/^Description:\s*(.+)/i);
      if (descMatch) {
        description = descMatch[1].trim();
      }
    }
    // Parse amount: "Amount: -420.00"
    else if (line.match(/^Amount:\s*(.+)/i)) {
      const amountMatch = line.match(/^Amount:\s*(.+)/i);
      if (amountMatch) {
        amount = parseAmount(amountMatch[1].trim());
      }
    }
    // Parse balance: "Balance after transaction: 18,420.50"
    else if (line.match(/^Balance\s+(?:after\s+transaction|after):\s*(.+)/i)) {
      const balanceMatch = line.match(/^Balance\s+(?:after\s+transaction|after):\s*(.+)/i);
      if (balanceMatch) {
        balance = parseBalance(balanceMatch[1].trim());
      }
    }
  }

  if (!date || !description || amount === null || balance === null) {
    throw new Error(`Failed to parse Format 1. Missing fields: date=${!!date}, description=${!!description}, amount=${amount !== null}, balance=${balance !== null}`);
  }

  return { date, description, amount, balance };
}

/**
 * Format 1 (Single Line): Clean format with labels all on one line
 * Example: Date: 11 Dec 2025 Description: STARBUCKS COFFEE MUMBAI Amount: -420.00 Balance after transaction: 18,420.50
 */
function parseFormat1SingleLine(text: string): ParsedTransaction {
  // Extract using capturing groups - more robust patterns
  // Match Date until Description (ignoring case)
  const dateMatch = text.match(/Date:\s*(.+?)\s*Description:/i);
  // Match Description until Amount
  const descMatch = text.match(/Description:\s*(.+?)\s*Amount:/i);
  // Match Amount until Balance
  const amountMatch = text.match(/Amount:\s*(.+?)\s*Balance/i);
  // Match Balance: look for "Balance" then any text until the last number-like sequence
  const balanceMatch = text.match(/Balance.*:\s*([₹\d,.-]+)\s*$/i);

  if (!dateMatch || !descMatch || !amountMatch || !balanceMatch) {
    // Try fallback for Balance without colon if user forgot it or OCR missed it
    // e.g. "Balance aner transaction 18,420.50"
    const balanceFallback = text.match(/Balance.*?\s+([₹\d,.-]+)\s*$/i);
    if (dateMatch && descMatch && amountMatch && balanceFallback) {
      return {
        date: parseDate(dateMatch[1].trim()),
        description: descMatch[1].trim(),
        amount: parseAmount(amountMatch[1].trim()),
        balance: parseBalance(balanceFallback[1].trim())
      };
    }
    throw new Error("Failed to parse single-line Format 1");
  }

  return {
    date: parseDate(dateMatch[1].trim()),
    description: descMatch[1].trim(),
    amount: parseAmount(amountMatch[1].trim()),
    balance: parseBalance(balanceMatch[1].trim())
  };
}

/**
 * Format 2: Inline format with arrows
 * Uber Ride * Airport Drop
 * 12/11/2025 → ₹1,250.00 debited
 * Available Balance → ₹17,170.50
 */
function parseFormat2(lines: string[]): ParsedTransaction {
  let description = '';
  let date: Date | null = null;
  let amount: number | null = null;
  let balance: number | null = null;

  for (const line of lines) {
    // First line is usually description (no markers, no date)
    if (!line.includes('→') && !line.includes('—') && !line.includes('–') &&
      !line.match(/\d{1,2}\/\d{1,2}\/\d{4}/) && !line.match(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/) &&
      !line.match(/Available\s+Balance/i)) {
      if (!description) {
        description = line.trim();
      }
    }
    // Line with date and amount: "12/11/2025 → ₹1,250.00 debited" or "12 Nov 2025 — ₹1,250.00 debited"
    else if ((line.includes('→') || line.includes('—') || line.includes('–')) &&
      (line.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || line.match(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/))) {
      const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/) || line.match(/(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/);
      if (dateMatch) {
        date = parseDate(dateMatch[1]);
      }

      // Extract amount (with rupee symbol and "debited" keyword)
      // Match rupee symbol followed by number with commas and decimals (after the arrow or dash)
      const amountMatch = line.match(/(?:→|—|–)\s*[₹]?([\d,]+\.\d{2})/);
      if (amountMatch) {
        const amountStr = amountMatch[1];
        const isDebit = line.toLowerCase().includes('debited') || line.toLowerCase().includes('dr');
        amount = parseAmount(amountStr, isDebit);
      }
    }
    // Line with balance: "Available Balance → ₹17,170.50" or "Available Balance — ₹17,170.50"
    else if (line.match(/Available\s+Balance/i)) {
      const balanceMatch = line.match(/[₹]?([\d,]+\.?\d*)/);
      if (balanceMatch) {
        balance = parseBalance(balanceMatch[1]);
      }
    }
  }

  if (!date || !description || amount === null || balance === null) {
    throw new Error(`Failed to parse Format 2. Missing fields: date=${!!date}, description=${!!description}, amount=${amount !== null}, balance=${balance !== null}`);
  }

  return { date, description, amount, balance };
}

/**
 * Format 3: Compact format (all on one line)
 * txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00 Dr Bal 14171.50 Shopping
 */
function parseFormat3(text: string): ParsedTransaction {
  // Extract date: YYYY-MM-DD format
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) {
    throw new Error('Failed to parse Format 3: No date found (expected YYYY-MM-DD)');
  }
  const date = parseDate(dateMatch[1]);

  // Extract amount: Look for ₹ followed by number with commas and decimals, then check for "Dr" or "Debit"
  // Must match the rupee amount pattern, not just any number
  const amountMatch = text.match(/[₹]([\d,]+\.\d{2})\s*(?:Dr|Debit|debited)?/i);
  if (!amountMatch) {
    throw new Error('Failed to parse Format 3: No amount found');
  }
  const amountStr = amountMatch[1];
  const isDebit = /Dr|Debit|debited/i.test(text);
  const amount = parseAmount(amountStr, isDebit);

  // Extract balance: Look for "Bal" or "Balance" followed by number
  const balanceMatch = text.match(/(?:Bal|Balance)\s+[₹]?([\d,]+\.?\d*)/i);
  if (!balanceMatch) {
    throw new Error('Failed to parse Format 3: No balance found');
  }
  const balance = parseBalance(balanceMatch[1]);

  // Extract description: Everything between date and amount
  // Start after date, end before amount (but skip "txn" prefix if present)
  const dateEndIndex = dateMatch.index! + dateMatch[0].length;
  const amountStartIndex = amountMatch.index!;
  let description = text.substring(dateEndIndex, amountStartIndex).trim();

  // Clean up description: remove leading "txn" patterns, extra spaces
  description = description.replace(/^txn\w*\s*/i, '').trim();
  description = description.replace(/\s+/g, ' ');

  if (!description) {
    throw new Error('Failed to parse Format 3: No description found');
  }

  return { date, description, amount, balance };
}

/**
 * Parses date string in various formats
 * - "11 Dec 2025" (DD MMM YYYY)
 * - "12/11/2025" (MM/DD/YYYY or DD/MM/YYYY - assumes MM/DD/YYYY)
 * - "2025-12-10" (YYYY-MM-DD)
 */
function parseDate(dateStr: string): Date {
  // Format: "11 Dec 2025" (DD MMM YYYY)
  const format1Match = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (format1Match) {
    const [, day, month, year] = format1Match;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());
    if (monthIndex === -1) {
      throw new Error(`Invalid month: ${month}`);
    }
    // Create date in UTC to avoid timezone issues
    return new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day)));
  }

  // Format: "12/11/2025" (MM/DD/YYYY)
  const format2Match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (format2Match) {
    const [, month, day, year] = format2Match;
    // Create date in UTC to avoid timezone issues
    return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  }

  // Format: "2025-12-10" (YYYY-MM-DD)
  const format3Match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (format3Match) {
    const [, year, month, day] = format3Match;
    // Create date in UTC to avoid timezone issues
    return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  }

  // Try native Date parsing as fallback
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Failed to parse date: ${dateStr}`);
  }
  return parsed;
}

/**
 * Parses amount string, handling:
 * - Rupee symbol (₹)
 * - Commas (1,250.00)
 * - Negative signs
 * - Debit indicators ("Dr", "debited")
 */
function parseAmount(amountStr: string, isDebit: boolean = false): number {
  // Remove rupee symbol, commas, and whitespace
  let cleaned = amountStr.replace(/[₹,\s]/g, '');

  // Check if already negative
  const isNegative = cleaned.startsWith('-');

  // Parse as float
  let amount = parseFloat(cleaned);

  if (isNaN(amount)) {
    throw new Error(`Failed to parse amount: ${amountStr}`);
  }

  // Apply debit logic: if marked as debit or already negative, make negative
  if (isDebit || isNegative) {
    amount = Math.abs(amount) * -1;
  }

  return amount;
}

/**
 * Parses balance string, handling:
 * - Rupee symbol (₹)
 * - Commas (18,420.50)
 */
function parseBalance(balanceStr: string): number {
  // Remove rupee symbol, commas, and whitespace
  const cleaned = balanceStr.replace(/[₹,\s]/g, '');
  const balance = parseFloat(cleaned);

  if (isNaN(balance)) {
    throw new Error(`Failed to parse balance: ${balanceStr}`);
  }

  return balance;
}

/**
 * Parses multiple transactions from a block of text
 * Splits by empty lines or transaction markers
 */
export function parseMultipleTransactions(text: string): ParsedTransaction[] {
  // Split by double newlines or transaction markers
  const transactions: ParsedTransaction[] = [];

  // Try to split by common patterns
  const blocks = text.split(/\n\s*\n/).filter(block => block.trim().length > 0);

  for (const block of blocks) {
    try {
      const transaction = parseTransaction(block);
      transactions.push(transaction);
    } catch (error) {
      console.warn(`Failed to parse transaction block: ${block.substring(0, 50)}...`, error);
      // Continue with other blocks
    }
  }

  // If no blocks found, try parsing as single transaction
  if (transactions.length === 0) {
    try {
      transactions.push(parseTransaction(text));
    } catch (error) {
      throw new Error(`Failed to parse any transactions from text`);
    }
  }

  return transactions;
}

