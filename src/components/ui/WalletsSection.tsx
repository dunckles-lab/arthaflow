'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/export';
import { Wallet as WalletType } from '@/types';
import {
  Wallet,
  Landmark,
  CreditCard,
  Smartphone,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { AmountInput } from './AmountInput';
import { ColorPickerInput } from './ColorPickerInput';

export const WalletsSection: React.FC = () => {
  const { wallets, addWallet, updateWallet, deleteWallet, currentUser } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WalletType | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'e-wallet' | 'cash' | 'investment'>('bank');
  const [balance, setBalance] = useState<number>(0);
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const canManage = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setName('');
    setType('bank');
    setBalance(0);
    setAccountNumber('');
    setColor('#3b82f6');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: WalletType) => {
    setEditingWallet(w);
    setName(w.name);
    setType(w.type);
    setBalance(w.balance);
    setAccountNumber(w.account_number || '');
    setColor(w.color || '#3b82f6');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingWallet) {
      await updateWallet(editingWallet.id, {
        name,
        type,
        balance,
        account_number: accountNumber || undefined,
        color,
      });
    } else {
      await addWallet({
        name,
        type,
        balance,
        account_number: accountNumber || undefined,
        color,
        is_active: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteWallet(deleteTarget.id);
      setDeleteTarget(null);
    }
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
          <h3 className="text-sm sm:text-base font-semibold text-slate-200">Rekening & Sumber Dana</h3>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Daftar dompet, kartu, dan rekening aktif ({wallets.length})
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
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
            className="bg-[#0a0b10] border border-[#1e2436] hover:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="p-2 rounded-xl text-white shadow-sm shrink-0"
                  style={{ backgroundColor: wallet.color || '#3b82f6' }}
                >
                  {getIcon(wallet.type)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">{wallet.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate font-mono">
                    {wallet.account_number || wallet.type}
                  </p>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(wallet)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1e2436] transition-colors cursor-pointer"
                    title="Edit Rekening"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(wallet)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Hapus Rekening"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#1e2436]/60 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-semibold">
                  Saldo Terkini
                </span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {formatCurrency(wallet.balance)}
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#12141d] text-slate-400 border border-[#1e2436] uppercase font-mono">
                {wallet.type}
              </span>
            </div>
          </div>
        ))}

        {wallets.length === 0 && (
          <div className="col-span-full py-8 text-center bg-[#0a0b10] border border-dashed border-[#1e2436] rounded-xl text-slate-500 text-xs">
            Belum ada rekening / dompet. Klik tombol Tambah untuk membuat.
          </div>
        )}
      </div>

      {/* Modal Add / Edit Wallet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#1e2436] mb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  {editingWallet ? 'Edit Rekening / Dompet' : 'Tambah Rekening Baru'}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  {editingWallet ? 'Ubah rincian informasi dan saldo' : 'Akun bank, e-wallet, atau kas tunai'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1e2436] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Rekening / Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Operasional, GoPay, Kas Tunai"
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
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="e-wallet">E-Wallet</option>
                    <option value="cash">Kas Tunai</option>
                    <option value="investment">Investasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Akun / No HP</label>
                  <input
                    type="text"
                    placeholder="Contoh: 8830192831"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* AmountInput with Auto-Formatting & Terbilang */}
              <AmountInput
                value={balance}
                onChange={setBalance}
                label={editingWallet ? 'Penyesuaian Saldo (IDR)' : 'Saldo Awal (IDR)'}
                required
                colorScheme="emerald"
                showPresets={true}
              />

              {/* ColorPickerInput */}
              <ColorPickerInput
                value={color}
                onChange={setColor}
                label="Warna Aksen Rekening"
              />

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#1e2436]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  {editingWallet ? 'Simpan Perubahan' : 'Tambah Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="bg-[#12141d] border-t sm:border border-rose-500/30 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-4 sm:p-6 shadow-2xl"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100">Hapus Rekening?</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Konfirmasi tindakan penghapusan</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 bg-[#0a0b10] border border-[#1e2436] p-3 rounded-xl leading-relaxed">
              Apakah Anda yakin ingin menghapus rekening <strong className="text-slate-100">{deleteTarget.name}</strong> dengan saldo <strong className="text-emerald-400 font-mono">{formatCurrency(deleteTarget.balance)}</strong>?
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-[#1e2436]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
              >
                Ya, Hapus Rekening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
