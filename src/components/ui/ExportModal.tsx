'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { exportToExcel, exportToPDF, formatCurrency, formatPeriodLabel } from '@/lib/export';
import { FileSpreadsheet, FileText, Download, CheckCircle, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#1e2436] mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">Ekspor Laporan Keuangan</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Unduh ringkasan dan rincian transaksi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2436] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope & Period Summary Box */}
        <div className="bg-[#0a0b10] border border-[#1e2436] rounded-xl p-3.5 mb-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Scope Keuangan:</span>
            <span className="font-semibold text-slate-200">
              {currentTenant.name} ({currentTenant.type.toUpperCase()})
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Periode Terpilih:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {formatPeriodLabel(periodFilter)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Total Transaksi:</span>
            <span className="font-mono text-slate-200">{filteredTransactions.length} item</span>
          </div>
          <div className="border-t border-[#1e2436] pt-2 flex items-center justify-between font-bold text-slate-100">
            <span>Arus Kas Bersih (Net):</span>
            <span
              className={`font-mono ${
                netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(netBalance)}
            </span>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
          {/* Excel Export Card */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-[#0a0b10] hover:bg-emerald-500/10 border border-[#1e2436] hover:border-emerald-500/40 text-slate-200 transition-all cursor-pointer active:scale-95 group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-200">Format Excel (.xlsx)</span>
              <span className="text-[10px] text-slate-400">Multi-sheet lengkap dengan formula</span>
            </div>
          </button>

          {/* PDF Export Card */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-[#0a0b10] hover:bg-rose-500/10 border border-[#1e2436] hover:border-rose-500/40 text-slate-200 transition-all cursor-pointer active:scale-95 group"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-400 border border-rose-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-200">Format Dokumen PDF</span>
              <span className="text-[10px] text-slate-400">Laporan resmi siap cetak A4</span>
            </div>
          </button>
        </div>

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1.5 mb-3">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#1e2436]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
