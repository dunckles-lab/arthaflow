'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/export';
import { TrendingUp, TrendingDown, Scale, Wallet as WalletIcon, PiggyBank } from 'lucide-react';

export const StatCards: React.FC = () => {
  const { transactions, wallets, savingsGoals, periodFilter } = useFinance();

  // Filter transactions according to selected period
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

  const netCashflow = totalIncome - totalExpense;
  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const totalSavingsCurrent = savingsGoals.reduce((sum, s) => sum + s.current_amount, 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, s) => sum + s.target_amount, 0);
  const savingsPercentage = totalSavingsTarget > 0 ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {/* 1. Total Pemasukan */}
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">Pemasukan</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-emerald-400 tracking-tight truncate">
            {formatCurrency(totalIncome)}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
            {filteredTransactions.filter((t) => t.type === 'income').length} transaksi
          </p>
        </div>
      </div>

      {/* 2. Total Pengeluaran */}
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:border-rose-500/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">Pengeluaran</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-rose-400 tracking-tight truncate">
            {formatCurrency(totalExpense)}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
            {filteredTransactions.filter((t) => t.type === 'expense').length} transaksi
          </p>
        </div>
      </div>

      {/* 3. Arus Kas Bersih */}
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:border-indigo-500/40 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">Arus Kas Bersih</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3
            className={`text-base sm:text-lg lg:text-xl font-bold tracking-tight truncate ${
              netCashflow >= 0 ? 'text-indigo-400' : 'text-amber-400'
            }`}
          >
            {formatCurrency(netCashflow)}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
            {netCashflow >= 0 ? 'Surplus' : 'Defisit'}
          </p>
        </div>
      </div>

      {/* 4. Total Saldo Dompet */}
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:border-blue-500/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">Saldo Rekening</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <WalletIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-100 tracking-tight truncate">
            {formatCurrency(totalWalletBalance)}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{wallets.length} rekening</p>
        </div>
      </div>

      {/* 5. Total Tabungan */}
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:border-purple-500/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">Tabungan</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-purple-400 tracking-tight truncate">
            {formatCurrency(totalSavingsCurrent)}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
            {savingsPercentage}% dari target
          </p>
        </div>
      </div>
    </div>
  );
};
