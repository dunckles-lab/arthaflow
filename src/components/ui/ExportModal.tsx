'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { exportToExcel, exportToPDF, formatCurrency, formatPeriodLabel } from '@/lib/export';
import { FileSpreadsheet, FileText, Download, CheckCircle, Calendar, ShieldCheck } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const {
    transactions,
    wallets,
    categories,
    savingsGoals,
    periodFilter,
    currentTenant,
  } = useFinance();

  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Filter transactions for export
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    if (periodFilter.type === 'daily') {
      return tx.date === periodFilter.selectedDate;
    } else if (periodFilter.type === 'monthly') {
      return (
        txDate.getMonth() === periodFilter.selectedMonth &&
        txDate.getFullYear() === periodFilter.selectedYear
      );
    } else if (periodFilter.type === 'yearly') {
      return txDate.getFullYear() === periodFilter.selectedYear;
    } else if (periodFilter.type === 'custom') {
      return tx.date >= periodFilter.startDate && tx.date <= periodFilter.endDate;
    }
    return true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportToExcel({
        transactions: filteredTransactions,
        wallets,
        categories,
        savingsGoals,
        periodFilter,
        tenant: currentTenant,
      });
      setSuccessMsg('Laporan Excel (.xlsx) berhasil diunduh');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      exportToPDF({
        transactions: filteredTransactions,
        wallets,
        categories,
        savingsGoals,
        periodFilter,
        tenant: currentTenant,
      });
      setSuccessMsg('Laporan PDF resmi berhasil diunduh');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2436] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Ekspor Laporan Keuangan</h3>
              <p className="text-xs text-slate-400">Unduh ringkasan dan rincian transaksi</p>
            </div>
          </div>
        </div>

        {/* Scope & Period Summary Box */}
        <div className="bg-[#0a0b10] border border-[#1e2436] rounded-xl p-4 mb-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Entitas / Scope:</span>
            <span className="font-semibold text-slate-200">
              {currentTenant.name} ({currentTenant.type.toUpperCase()})
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Periode Terpilih:</span>
            <span className="font-semibold text-emerald-400">
              {formatPeriodLabel(periodFilter)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Total Mutasi Transaksi:</span>
            <span className="font-mono">{filteredTransactions.length} transaksi</span>
          </div>
          <div className="border-t border-[#1e2436] pt-2 flex items-center justify-between font-bold text-slate-100">
            <span>Arus Kas Bersih (Net):</span>
            <span
              className={
                netBalance >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'
              }
            >
              {formatCurrency(netBalance)}
            </span>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Excel Export Card */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#0a0b10] hover:bg-emerald-500/10 border border-[#1e2436] hover:border-emerald-500/40 text-slate-200 transition-all group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-200">Format Excel (.xlsx)</span>
              <span className="text-[10px] text-slate-400">Multi-sheet dengan kalkulasi otomatis</span>
            </div>
          </button>

          {/* PDF Export Card */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#0a0b10] hover:bg-rose-500/10 border border-[#1e2436] hover:border-rose-500/40 text-slate-200 transition-all group"
          >
            <div className="p-3 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-400 border border-rose-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-200">Format Dokumen PDF</span>
              <span className="text-[10px] text-slate-400">Format nota & laporan resmi A4</span>
            </div>
          </button>
        </div>

        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1.5 mb-3">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#1e2436]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-[#1e2436]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
