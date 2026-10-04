/**
 * Helper utilitas format mata uang Rupiah, pemisah ribuan otomatis,
 * dan konversi terbilang / pembacaan satuan angka Indonesia.
 */

export const formatNumberWithDots = (val: number | string): string => {
  if (val === undefined || val === null || val === '') return '';
  const cleanNum = String(val).replace(/[^0-9]/g, '');
  if (!cleanNum) return '';
  return new Intl.NumberFormat('id-ID').format(Number(cleanNum));
};

export const parseFormattedNumber = (str: string): number => {
  if (!str) return 0;
  const clean = String(str).replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

const UNITS = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

export const numberToWords = (n: number): string => {
  if (n === 0) return 'Nol';
  if (n < 0) return 'Minus ' + numberToWords(Math.abs(n));

  if (n < 12) {
    return UNITS[n];
  } else if (n < 20) {
    return UNITS[n - 10] + ' Belas';
  } else if (n < 100) {
    const unit = n % 10;
    return UNITS[Math.floor(n / 10)] + ' Puluh' + (unit > 0 ? ' ' + UNITS[unit] : '');
  } else if (n < 200) {
    return 'Seratus' + (n % 100 > 0 ? ' ' + numberToWords(n % 100) : '');
  } else if (n < 1000) {
    return UNITS[Math.floor(n / 100)] + ' Ratus' + (n % 100 > 0 ? ' ' + numberToWords(n % 100) : '');
  } else if (n < 2000) {
    return 'Seribu' + (n % 1000 > 0 ? ' ' + numberToWords(n % 1000) : '');
  } else if (n < 1000000) {
    return numberToWords(Math.floor(n / 1000)) + ' Ribu' + (n % 1000 > 0 ? ' ' + numberToWords(n % 1000) : '');
  } else if (n < 1000000000) {
    return numberToWords(Math.floor(n / 1000000)) + ' Juta' + (n % 1000000 > 0 ? ' ' + numberToWords(n % 1000000) : '');
  } else if (n < 1000000000000) {
    return numberToWords(Math.floor(n / 1000000000)) + ' Miliar' + (n % 1000000000 > 0 ? ' ' + numberToWords(n % 1000000000) : '');
  } else {
    return numberToWords(Math.floor(n / 1000000000000)) + ' Triliun' + (n % 1000000000000 > 0 ? ' ' + numberToWords(n % 1000000000000) : '');
  }
};

export const formatTerbilangRupiah = (amount: number): string => {
  if (!amount || isNaN(amount) || amount <= 0) return '';
  return `${numberToWords(amount)} Rupiah`;
};

export const formatCompactUnit = (amount: number): string => {
  if (!amount || isNaN(amount) || amount <= 0) return 'Rp 0';
  if (amount >= 1_000_000_000_000) {
    return `Rp ${(amount / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Triliun`;
  }
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Miliar`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Juta`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Ribu`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};
