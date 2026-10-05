import { TransactionType } from '@/types';

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  walletNameHint?: string;
  targetWalletNameHint?: string;
  categoryNameHint?: string;
  notes: string;
  rawText: string;
}

/**
 * Parse Indonesian / English natural amount string:
 * - 50k, 50rb, 50000, 50.000, 50,000 -> 50000
 * - 1.5jt, 1.5juta, 1,5jt, 1.5m, 1.5mio -> 1500000
 * - 2500 -> 2500
 */
export function parseAmount(text: string): { amount: number; matchedString: string } | null {
  // Regex looks for patterns like:
  // 1.5jt, 1.5 juta, 500rb, 50k, 100.000, 100,000, 50000
  const amountRegex = /(\d+(?:[.,]\d+)?)\s*(jt|juta|mio|m|rb|k|ribu|r)?\b/i;
  const match = text.match(amountRegex);

  if (!match) return null;

  const numPart = match[1].replace(',', '.');
  const unitPart = (match[2] || '').toLowerCase();
  let baseNum = parseFloat(numPart);

  if (isNaN(baseNum) || baseNum <= 0) return null;

  if (unitPart === 'jt' || unitPart === 'juta' || unitPart === 'mio' || unitPart === 'm') {
    baseNum = Math.round(baseNum * 1_000_000);
  } else if (unitPart === 'rb' || unitPart === 'k' || unitPart === 'ribu' || unitPart === 'r') {
    baseNum = Math.round(baseNum * 1_000);
  } else if (match[1].includes('.') && match[1].split('.').length > 1) {
    // Check if it's Indonesian thousand separator e.g. 50.000 -> 50000
    const parts = match[1].split('.');
    if (parts.length > 1 && parts.every((p, idx) => idx === 0 || p.length === 3)) {
      baseNum = parseInt(match[1].replace(/\./g, ''), 10);
    }
  }

  return {
    amount: baseNum,
    matchedString: match[0],
  };
}

/**
 * Parse transaction command line:
 * Examples:
 * - "keluar 50rb makan siang bca" -> type: expense, amount: 50000, hints: "makan siang", wallet: "bca"
 * - "masuk 5jt bonus projek cash" -> type: income, amount: 5000000, hints: "bonus projek", wallet: "cash"
 * - "tf 100k bca ke gopay admin 2500" -> type: transfer, amount: 100000, source: "bca", target: "gopay"
 * - "beli kopi 25rb" -> type: expense, amount: 25000, notes: "beli kopi"
 */
export function parseTelegramMessage(text: string): ParsedTransaction | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith('/')) return null;

  const lower = trimmed.toLowerCase();
  let type: TransactionType = 'expense';

  // 1. Detect Type
  const isTransfer = /^(tf|transfer|kirim|pindah)\b/i.test(lower) || /\b(ke|menuju)\b/i.test(lower);
  const isIncome = /^(masuk|gaji|terima|dapat|pendapatan|income|inc|in)\b/i.test(lower) || /\b(gaji|bonus|cair)\b/i.test(lower);
  const isExpense = /^(keluar|byr|bayar|beli|makan|minum|jajan|belanja|out|expense|exp)\b/i.test(lower);

  if (isTransfer) {
    type = 'transfer';
  } else if (isIncome && !isExpense) {
    type = 'income';
  } else {
    type = 'expense';
  }

  // 2. Extract Amount
  const parsedAmt = parseAmount(trimmed);
  if (!parsedAmt || parsedAmt.amount <= 0) return null;

  // Remove the amount from string to analyze notes/hints
  const withoutAmount = trimmed.replace(parsedAmt.matchedString, ' ').replace(/\s+/g, ' ').trim();

  // Strip initial action verbs
  let cleanNotes = withoutAmount
    .replace(/^(keluar|byr|bayar|beli|masuk|terima|dapat|tf|transfer|kirim|pindah|out|in)\s+/i, '')
    .trim();

  let walletHint: string | undefined;
  let targetWalletHint: string | undefined;

  // Check for transfer syntax: "dari [wallet] ke [targetWallet]" or "[wallet] ke [targetWallet]"
  if (type === 'transfer') {
    const transferMatch = cleanNotes.match(/(?:dari\s+)?(\w+)\s+(?:ke|menuju|\->|to)\s+(\w+)/i);
    if (transferMatch) {
      walletHint = transferMatch[1];
      targetWalletHint = transferMatch[2];
      cleanNotes = cleanNotes.replace(transferMatch[0], '').trim();
    }
  }

  return {
    type,
    amount: parsedAmt.amount,
    walletNameHint: walletHint,
    targetWalletNameHint: targetWalletHint,
    notes: cleanNotes || (type === 'expense' ? 'Pengeluaran via Bot' : type === 'income' ? 'Pemasukan via Bot' : 'Transfer via Bot'),
    rawText: text,
  };
}
