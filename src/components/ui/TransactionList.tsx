'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/export';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  User as UserIcon,
} from 'lucide-react';

export const TransactionList: React.FC = () => {
  const { transactions, wallets, categories, deleteTransaction, periodFilter, currentUser } = useFinance();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWallet, setFilterWallet] = useState<string>('all');

  // Filter transactions according to selected period
  const periodFiltered = transactions.filter((tx) => {
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

  // Filter by search & dropdowns
  const displayedTransactions = periodFiltered.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterWallet !== 'all' && tx.wallet_id !== filterWallet) return false;
    if (search) {
      const notesMatch = tx.notes?.toLowerCase().includes(search.toLowerCase());
      const catMatch = tx.category_name?.toLowerCase().includes(search.toLowerCase());
      const userMatch = tx.user_name?.toLowerCase().includes(search.toLowerCase());
      return notesMatch || catMatch || userMatch;
    }
    return true;
  });

  const getBadge = (type: string) => {
    switch (type) {
      case 'income':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
            <ArrowUpRight className="w-3 h-3" /> Masuk
          </span>
        );
      case 'expense':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
            <ArrowDownLeft className="w-3 h-3" /> Keluar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold">
            <ArrowLeftRight className="w-3 h-3" /> Transfer
          </span>
        );
    }
  };

  return (
    <div className="bg-[#12141d] border border-[#1e2436] rounded-xl p-5 shadow-lg">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Riwayat Mutasi Transaksi</h3>
          <p className="text-xs text-slate-400">
            {displayedTransactions.length} transaksi tercatat pada periode ini
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari catatan / kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0a0b10] border border-[#1e2436] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-44"
            />
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#0a0b10] border border-[#1e2436] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Wallet filter */}
          <select
            value={filterWallet}
            onChange={(e) => setFilterWallet(e.target.value)}
            className="bg-[#0a0b10] border border-[#1e2436] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Rekening</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Table / List */}
      <div className="overflow-x-auto">
        {displayedTransactions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2436] text-[11px] font-semibold text-slate-400">
                <th className="py-2.5 px-3">TANGGAL</th>
                <th className="py-2.5 px-3">TIPE</th>
                <th className="py-2.5 px-3">DESKRIPSI / KATEGORI</th>
                <th className="py-2.5 px-3">REKENING</th>
                <th className="py-2.5 px-3">DICATAT OLEH</th>
                <th className="py-2.5 px-3 text-right">NOMINAL</th>
                <th className="py-2.5 px-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2436] text-xs">
              {displayedTransactions.map((tx) => {
                const wallet = wallets.find((w) => w.id === tx.wallet_id);
                const targetWallet = wallets.find((w) => w.id === tx.target_wallet_id);
                const category = categories.find((c) => c.id === tx.category_id);

                return (
                  <tr key={tx.id} className="hover:bg-[#0a0b10]/60 transition-colors group">
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {tx.date}
                      </div>
                    </td>
                    <td className="py-3 px-3">{getBadge(tx.type)}</td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-medium text-slate-200 block">
                          {tx.notes || 'Tanpa Catatan'}
                        </span>
                        {category && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Tag className="w-2.5 h-2.5 text-slate-500" />
                            {category.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <WalletIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{wallet?.name || '-'}</span>
                        {tx.type === 'transfer' && targetWallet && (
                          <span className="text-slate-500 text-[10px]">
                            &rarr; {targetWallet.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{tx.user_name || 'Admin'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          tx.type === 'income'
                            ? 'text-emerald-400'
                            : tx.type === 'expense'
                            ? 'text-rose-400'
                            : 'text-indigo-400'
                        }
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            Tidak ada data transaksi yang sesuai filter
          </div>
        )}
      </div>
    </div>
  );
};
