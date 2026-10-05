'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { TransactionType } from '@/types';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react';
import { CategoryManagementModal } from './CategoryManagementModal';
import { AmountInput } from './AmountInput';
import { CustomSelect } from './CustomSelect';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
  const { wallets, categories, addTransaction, currentUser } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
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
    if (!amount || amount <= 0 || !walletId) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);

    await addTransaction({
      user_id: currentUser.id,
      user_name: currentUser.name,
      type,
      amount,
      wallet_id: walletId,
      target_wallet_id: type === 'transfer' ? targetWalletId : undefined,
      category_id: type !== 'transfer' ? categoryId || undefined : undefined,
      category_name: type !== 'transfer' ? selectedCategory?.name : undefined,
      date,
      notes: notes.trim(),
    });

    setAmount(0);
    setNotes('');
    onClose();
  };

  const getColorScheme = () => {
    if (type === 'expense') return 'rose';
    if (type === 'income') return 'emerald';
    return 'indigo';
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
        <div
          className="bg-white dark:bg-[#12141d] border-t sm:border border-slate-200 dark:border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        >
          {/* Drag Handle on mobile */}
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e2436] mb-3.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">Catat Transaksi Baru</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Pemasukan, pengeluaran, atau transfer saldo
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e2436] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Transaction Type Segmented Buttons */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl mb-3.5">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="truncate">Pengeluaran</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Pemasukan</span>
            </button>

            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'transfer'
                  ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">Transfer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Amount Input with Auto-Formatting & Terbilang */}
            <AmountInput
              value={amount}
              onChange={setAmount}
              label="Nominal Transaksi (IDR)"
              required
              colorScheme={getColorScheme()}
              showPresets={true}
            />

            {/* Wallets and Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {type === 'transfer' ? 'Dari Rekening / Dompet' : 'Rekening / Dompet'}
                </label>
                <CustomSelect
                  value={walletId}
                  onChange={(val) => setWalletId(val)}
                  options={wallets.map((w) => ({
                    value: w.id,
                    label: w.name,
                    badge: `Rp ${w.balance.toLocaleString('id-ID')}`,
                  }))}
                />
              </div>

              {type === 'transfer' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ke Rekening Tujuan
                  </label>
                  <CustomSelect
                    value={targetWalletId}
                    onChange={(val) => setTargetWalletId(val)}
                    options={wallets
                      .filter((w) => w.id !== walletId)
                      .map((w) => ({
                        value: w.id,
                        label: w.name,
                        badge: `Rp ${w.balance.toLocaleString('id-ID')}`,
                      }))}
                    placeholder="Pilih rekening tujuan..."
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Kategori</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      + Kelola Kategori
                    </button>
                  </div>
                  <CustomSelect
                    value={categoryId}
                    onChange={(val) => setCategoryId(val)}
                    options={[
                      { value: '', label: 'Pilih Kategori...' },
                      ...filteredCategories.map((c) => ({
                        value: c.id,
                        label: c.name,
                        badge: c.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
                      })),
                    ]}
                    placeholder="Pilih Kategori..."
                  />
                </div>
              )}
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Belanja bulanan, Bensin"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1e2436]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2436] transition-colors cursor-pointer"
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
