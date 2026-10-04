import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Wallet, Category, SavingsGoal, PeriodFilterState, Tenant } from '@/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPeriodLabel = (filter: PeriodFilterState): string => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  if (filter.type === 'daily') {
    return `Harian (${filter.selectedDate})`;
  } else if (filter.type === 'monthly') {
    return `Bulan ${monthNames[filter.selectedMonth]} ${filter.selectedYear}`;
  } else if (filter.type === 'yearly') {
    return `Tahun ${filter.selectedYear}`;
  } else {
    return `Periode Kustom (${filter.startDate} s/d ${filter.endDate})`;
  }
};

// ==========================================
// EXCEL EXPORT (.XLSX)
// ==========================================
export const exportToExcel = async ({
  transactions,
  wallets,
  categories,
  savingsGoals,
  periodFilter,
  tenant,
}: {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  periodFilter: PeriodFilterState;
  tenant: Tenant;
}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ArthaFlow Financial System';
  workbook.created = new Date();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // --- SHEET 1: RINGKASAN EKSEKUTIF ---
  const summarySheet = workbook.addWorksheet('Ringkasan Eksekutif');
  summarySheet.columns = [
    { header: 'Indikator', key: 'metric', width: 35 },
    { header: 'Nilai (IDR)', key: 'value', width: 30 },
  ];

  summarySheet.addRow({ metric: 'Entitas / Scope', value: `${tenant.name} (${tenant.type.toUpperCase()})` });
  summarySheet.addRow({ metric: 'Periode Laporan', value: formatPeriodLabel(periodFilter) });
  summarySheet.addRow({ metric: 'Tanggal Generate', value: new Date().toLocaleString('id-ID') });
  summarySheet.addRow({ metric: 'Total Pemasukan', value: totalIncome });
  summarySheet.addRow({ metric: 'Total Pengeluaran', value: totalExpense });
  summarySheet.addRow({ metric: 'Arus Kas Bersih (Net Cash Flow)', value: netBalance });
  summarySheet.addRow({ metric: 'Jumlah Transaksi', value: transactions.length });

  // Style Header Row
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };

  // --- SHEET 2: DAFTAR TRANSAKSI ---
  const txSheet = workbook.addWorksheet('Mutasi Transaksi');
  txSheet.columns = [
    { header: 'ID Transaksi', key: 'id', width: 18 },
    { header: 'Tanggal', key: 'date', width: 15 },
    { header: 'Tipe', key: 'type', width: 15 },
    { header: 'Kategori', key: 'category', width: 25 },
    { header: 'Akun / Dompet', key: 'wallet', width: 25 },
    { header: 'Nominal (IDR)', key: 'amount', width: 20 },
    { header: 'Dicatat Oleh', key: 'user', width: 25 },
    { header: 'Catatan / Deskripsi', key: 'notes', width: 35 },
  ];

  transactions.forEach((tx) => {
    const wallet = wallets.find((w) => w.id === tx.wallet_id);
    const category = categories.find((c) => c.id === tx.category_id);
    txSheet.addRow({
      id: tx.id,
      date: tx.date,
      type: tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer',
      category: category ? category.name : tx.category_name || '-',
      wallet: wallet ? wallet.name : '-',
      amount: tx.amount,
      user: tx.user_name || '-',
      notes: tx.notes || '-',
    });
  });

  txSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  txSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' },
  };

  // --- SHEET 3: MANAJEMEN TABUNGAN ---
  const savingsSheet = workbook.addWorksheet('Target Tabungan');
  savingsSheet.columns = [
    { header: 'Nama Target', key: 'name', width: 30 },
    { header: 'Kategori', key: 'category', width: 20 },
    { header: 'Target Nominal', key: 'target', width: 20 },
    { header: 'Terkumpul Saat Ini', key: 'current', width: 20 },
    { header: 'Progress (%)', key: 'progress', width: 15 },
    { header: 'Tenggat Waktu', key: 'deadline', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  savingsGoals.forEach((sg) => {
    const progress = sg.target_amount > 0 ? Math.min(100, Math.round((sg.current_amount / sg.target_amount) * 100)) : 0;
    savingsSheet.addRow({
      name: sg.name,
      category: sg.category || 'Umum',
      target: sg.target_amount,
      current: sg.current_amount,
      progress: `${progress}%`,
      deadline: sg.deadline || '-',
      status: sg.is_completed ? 'Tercapai' : 'Sedang Berjalan',
    });
  });

  savingsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  savingsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4338CA' },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_Keuangan_${tenant.name.replace(/\s+/g, '_')}_${periodFilter.type}_${Date.now()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ==========================================
// PDF EXPORT
// ==========================================
export const exportToPDF = ({
  transactions,
  wallets,
  categories,
  savingsGoals,
  periodFilter,
  tenant,
}: {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  periodFilter: PeriodFilterState;
  tenant: Tenant;
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Header Background bar
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 38, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTHAFLOW FINANCIAL REPORT', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Scope: ${tenant.name} (${tenant.type.toUpperCase()}) | Dibuat: ${new Date().toLocaleDateString('id-ID')}`, 14, 26);
  doc.text(`Periode: ${formatPeriodLabel(periodFilter)}`, 14, 32);

  // Summary KPI Cards (Y = 48)
  const startY = 48;

  // Box 1: Pemasukan
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, startY, 56, 24, 2, 2, 'FD');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PEMASUKAN', 18, startY + 8);
  doc.setFontSize(11);
  doc.text(formatCurrency(totalIncome), 18, startY + 18);

  // Box 2: Pengeluaran
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(77, startY, 56, 24, 2, 2, 'FD');
  doc.setTextColor(159, 18, 57);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PENGELUARAN', 81, startY + 8);
  doc.setFontSize(11);
  doc.text(formatCurrency(totalExpense), 81, startY + 18);

  // Box 3: Arus Kas Bersih
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(140, startY, 56, 24, 2, 2, 'FD');
  doc.setTextColor(55, 48, 163);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ARUS KAS BERSIH', 144, startY + 8);
  doc.setFontSize(11);
  doc.text(formatCurrency(netBalance), 144, startY + 18);

  // Section 1: Daftar Mutasi Transaksi
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Daftar Mutasi Transaksi Terpilih', 14, startY + 34);

  const txRows = transactions.slice(0, 25).map((tx) => {
    const wallet = wallets.find((w) => w.id === tx.wallet_id);
    const category = categories.find((c) => c.id === tx.category_id);
    return [
      tx.date,
      tx.type === 'income' ? 'Pemasukan (+)' : tx.type === 'expense' ? 'Pengeluaran (-)' : 'Transfer',
      category ? category.name : tx.category_name || '-',
      wallet ? wallet.name : '-',
      formatCurrency(tx.amount),
      tx.notes || '-',
    ];
  });

  autoTable(doc, {
    startY: startY + 38,
    head: [['Tanggal', 'Tipe', 'Kategori', 'Akun/Dompet', 'Nominal', 'Catatan']],
    body: txRows.length > 0 ? txRows : [['-', '-', 'Tidak ada data transaksi', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer note
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 250;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Laporan ini dihasilkan secara otomatis oleh sistem ArthaFlow. Arsipkan secara berkala.', 14, Math.min(finalY, 280));

  doc.save(`Laporan_Keuangan_${tenant.name.replace(/\s+/g, '_')}_${periodFilter.type}_${Date.now()}.pdf`);
};
