'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/export';
import { Wallet, Landmark, CreditCard, Smartphone, Plus, Trash2, X } from 'lucide-react';

export const WalletsSection: React.FC = () => {
  const { wallets, addWallet, deleteWallet, currentUser } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'e-wallet' | 'cash' | 'investment'>('bank');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const canManage = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;
    await addWallet({
      name,
      type,
      balance: parseFloat(balance) || 0,
      account_number: accountNumber || undefined,
      color,
      is_active: true,
    });
    setName('');
    setBalance('');
    setAccountNumber('');
    setIsModalOpen(false);
  };

  const getIcon = (walletType: string) => {
    switch (walletType) {
      case 'bank':
        return <Landmark className="w-4 h-4" />;
      case 'e-wallet':
        return <Smartphone className="w-4 h-4" />;
      case 'cash':
        return <Wallet className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Rekening & Sumber Dana</h3>
          <p className="text-[11px] sm:text-xs text-slate-400">Daftar dompet dan rekening terhubung</p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Tambah</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="bg-[#0a0b10] border border-[#1e2436] hover:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: wallet.color || '#3b82f6' }}
                >
                  {getIcon(wallet.type)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{wallet.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {wallet.account_number || wallet.type}
                  </p>
                </div>
              </div>
              {canManage && (
                <button
                  onClick={() => deleteWallet(wallet.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Hapus Rekening"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="mt-3">
              <span className="text-[10px] text-slate-500 block">Saldo Saat Ini</span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {formatCurrency(wallet.balance)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Wallet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#1e2436] mb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100">Tambah Rekening Baru</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Akun bank, e-wallet, atau kas tunai</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1e2436] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Rekening / Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Operasional, GoPay, Brankas Kas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipe Akun</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="e-wallet">E-Wallet</option>
                    <option value="cash">Kas Tunai</option>
                    <option value="investment">Investasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Warna Label</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 bg-[#0a0b10] border border-[#1e2436] rounded-xl cursor-pointer px-1 py-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Saldo Awal (IDR)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Rekening / No. HP (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 8830192831"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#1e2436]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
