'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { TransactionType } from '@/types';
import { PlusCircle, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

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

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

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
      notes,
    });

    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Catat Transaksi Baru</h3>
            <p className="text-xs text-slate-400">Pemasukan, pengeluaran, atau transfer saldo</p>
          </div>
        </div>

        {/* Transaction Type Picker */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-[#0a0b10] text-slate-400 border-[#1e2436] hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
            Pengeluaran
          </button>

          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-[#0a0b10] text-slate-400 border-[#1e2436] hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            Pemasukan
          </button>

          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              type === 'transfer'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                : 'bg-[#0a0b10] text-slate-400 border-[#1e2436] hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nominal Transaksi (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">Rp</span>
              <input
                type="number"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Wallets */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {type === 'transfer' ? 'Dari Rekening / Dompet' : 'Rekening / Dompet'}
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {wallets
                    .filter((w) => w.id !== walletId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Catatan</label>
              <input
                type="text"
                placeholder="Contoh: Belanja mingguan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-[#1e2436] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-semibold transition-colors"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
