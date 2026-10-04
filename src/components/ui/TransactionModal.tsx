'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { TransactionType } from '@/types';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
} from 'lucide-react';
import { CategoryManagementModal } from './CategoryManagementModal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
  const { wallets, categories, addTransaction, currentUser } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [targetWalletId, setTargetWalletId] = useState(wallets[1]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) => c.type === (type === 'income' ? 'income' : 'expense')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || !walletId) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);

    await addTransaction({
      user_id: currentUser.id,
      user_name: currentUser.name,
      type,
      amount: numAmount,
      wallet_id: walletId,
      target_wallet_id: type === 'transfer' ? targetWalletId : undefined,
      category_id: type !== 'transfer' ? categoryId || undefined : undefined,
      category_name: type !== 'transfer' ? selectedCategory?.name : undefined,
      date,
      notes: notes.trim(),
    });

    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
        <div
          className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        >
          {/* Drag Handle on mobile */}
          <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2436] mb-3.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">Catat Transaksi Baru</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Pemasukan, pengeluaran, atau transfer saldo
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1e2436] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Transaction Type Segmented Buttons */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0a0b10] border border-[#1e2436] rounded-xl mb-3.5">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">Pengeluaran</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Pemasukan</span>
            </button>

            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'transfer'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Transfer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nominal Transaksi (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">
                  Rp
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl pl-9 pr-3 py-2.5 text-sm sm:text-base font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Wallets and Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {type === 'transfer' ? 'Dari Rekening / Dompet' : 'Rekening / Dompet'}
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Rp {w.balance.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              {type === 'transfer' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ke Rekening Tujuan
                  </label>
                  <select
                    value={targetWalletId}
                    onChange={(e) => setTargetWalletId(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {wallets
                      .filter((w) => w.id !== walletId)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} (Rp {w.balance.toLocaleString('id-ID')})
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Kategori</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      + Kelola
                    </button>
                  </div>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Pilih Kategori...</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Belanja mingguan"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#1e2436]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
              >
                Simpan Transaksi
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category CRUD Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  );
};
