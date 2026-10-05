'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/export';
import { SavingsGoal } from '@/types';
import {
  PiggyBank,
  Plus,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { AmountInput } from './AmountInput';
import { ColorPickerInput } from './ColorPickerInput';
import { CustomSelect } from './CustomSelect';

export const SavingsSection: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    depositToSavings,
    withdrawFromSavings,
    wallets,
    currentUser,
    userRule,
  } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null);

  // Deposit modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedDepositGoal, setSelectedDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositWalletId, setDepositWalletId] = useState(wallets[0]?.id || '');
  const [depositNotes, setDepositNotes] = useState('');

  // Withdraw modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedWithdrawGoal, setSelectedWithdrawGoal] = useState<SavingsGoal | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawWalletId, setWithdrawWalletId] = useState(wallets[0]?.id || '');
  const [withdrawNotes, setWithdrawNotes] = useState('');

  // Goal Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Dana Darurat');
  const [color, setColor] = useState('#8b5cf6');

  // Admin and Superadmin have full CRUD access unconditionally, plus users with delegated permission
  const canManage = currentUser.role === 'admin' || currentUser.role === 'superadmin' || !!userRule?.can_manage_savings;

  const categoryPresets = [
    'Dana Darurat',
    'Investasi',
    'Pendidikan',
    'Rekreasi & Liburan',
    'Kendaraan / Properti',
    'Elektronik & Gadget',
    'Qurban / Zakat',
    'Lainnya',
  ];

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount(0);
    setCurrentAmount(0);
    setDeadline('');
    setCategory('Dana Darurat');
    setColor('#8b5cf6');
    setIsGoalModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.target_amount);
    setCurrentAmount(goal.current_amount);
    setDeadline(goal.deadline || '');
    setCategory(goal.category || 'Dana Darurat');
    setColor(goal.color || '#8b5cf6');
    setIsGoalModalOpen(true);
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || targetAmount <= 0) return;

    if (editingGoal) {
      await updateSavingsGoal(editingGoal.id, {
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        deadline: deadline || undefined,
        category,
        color,
      });
    } else {
      await addSavingsGoal({
        name,
        target_amount: targetAmount,
        deadline,
        category,
        color,
      });
    }

    setIsGoalModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteSavingsGoal(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const openDeposit = (goal: SavingsGoal) => {
    setSelectedDepositGoal(goal);
    setDepositAmount(0);
    setDepositNotes('');
    if (wallets.length > 0) setDepositWalletId(wallets[0].id);
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepositGoal || depositAmount <= 0 || !depositWalletId) return;
    await depositToSavings(
      selectedDepositGoal.id,
      depositAmount,
      depositWalletId,
      depositNotes
    );
    setIsDepositModalOpen(false);
  };

  const openWithdraw = (goal: SavingsGoal) => {
    setSelectedWithdrawGoal(goal);
    setWithdrawAmount(0);
    setWithdrawNotes('');
    if (wallets.length > 0) setWithdrawWalletId(wallets[0].id);
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawGoal || withdrawAmount <= 0 || !withdrawWalletId) return;
    await withdrawFromSavings(
      selectedWithdrawGoal.id,
      withdrawAmount,
      withdrawWalletId,
      withdrawNotes
    );
    setIsWithdrawModalOpen(false);
  };

  return (
    <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-200">
            Manajemen Tabungan & Target
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Rencana alokasi dana dan pencapaian target impian ({savingsGoals.length})
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Target Baru</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {savingsGoals.map((goal) => {
          const percentage = Math.min(
            100,
            goal.target_amount > 0
              ? Math.round((goal.current_amount / goal.target_amount) * 100)
              : 0
          );
          const isDone = goal.is_completed || percentage >= 100;
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);

          return (
            <div
              key={goal.id}
              className="bg-[#0a0b10] border border-[#1e2436] hover:border-purple-500/40 rounded-xl p-4 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium inline-block">
                      {goal.category || 'Tabungan'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 mt-1.5 truncate">{goal.name}</h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#12141d] transition-colors cursor-pointer"
                          title="Edit Target"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(goal)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Hapus Target"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#1e2436] rounded-full h-2.5 my-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone
                        ? 'bg-emerald-500'
                        : percentage > 50
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <span className="text-[10px] text-slate-400">Terkumpul:</span>
                    <p className="text-sm font-bold text-slate-100 font-mono">
                      {formatCurrency(goal.current_amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Target:</span>
                    <p className="text-xs font-semibold text-slate-300 font-mono">
                      {formatCurrency(goal.target_amount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1e2436]/50">
                  <span className="text-purple-400 font-mono font-bold flex items-center gap-1">
                    {percentage}%
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {isDone ? 'Target Tercapai!' : `Kurang ${formatCurrency(remaining)}`}
                  </span>
                </div>

                {goal.deadline && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Target: {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Deposit & Withdraw */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#1e2436]">
                <button
                  onClick={() => openDeposit(goal)}
                  className="py-2 px-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Setor</span>
                </button>
                <button
                  onClick={() => openWithdraw(goal)}
                  disabled={goal.current_amount <= 0}
                  className="py-2 px-2 bg-[#12141d] hover:bg-[#1e2436] text-slate-300 border border-[#1e2436] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Tarik</span>
                </button>
              </div>
            </div>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="col-span-full py-8 text-center bg-[#0a0b10] border border-dashed border-[#1e2436] rounded-xl text-slate-500 text-xs">
            Belum ada target tabungan yang dibuat.
          </div>
        )}
      </div>

      {/* Modal Add / Edit Savings Goal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#1e2436] mb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  {editingGoal ? 'Edit Target Tabungan' : 'Buat Target Tabungan Baru'}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  Rencanakan tabungan dan alokasi dana masa depan
                </p>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e2436] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Target</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dana Darurat 6 Bulan, DP Rumah, Liburan Jepang"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Target Amount Input */}
              <AmountInput
                value={targetAmount}
                onChange={setTargetAmount}
                label="Target Nominal (IDR)"
                required
                colorScheme="purple"
                showPresets={true}
                presets={[1000000, 5000000, 10000000, 25000000, 50000000]}
              />

              {editingGoal && (
                <AmountInput
                  value={currentAmount}
                  onChange={setCurrentAmount}
                  label="Penyesuaian Saldo Terkumpul (IDR)"
                  colorScheme="indigo"
                  showPresets={false}
                />
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategory(val)}
                    options={categoryPresets.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tenggat Waktu</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* ColorPickerInput */}
              <ColorPickerInput
                value={color}
                onChange={setColor}
                label="Warna Aksen Tabungan"
              />

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#1e2436]">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  {editingGoal ? 'Simpan Perubahan' : 'Buat Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Setor Tabungan */}
      {isDepositModalOpen && selectedDepositGoal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#1e2436] mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">Setor ke Tabungan</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">{selectedDepositGoal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e2436] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              {/* AmountInput for Deposit */}
              <AmountInput
                value={depositAmount}
                onChange={setDepositAmount}
                label="Nominal Setoran (IDR)"
                required
                colorScheme="purple"
                showPresets={true}
              />

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ambil dari Rekening / Dompet
                </label>
                <CustomSelect
                  value={depositWalletId}
                  onChange={(val) => setDepositWalletId(val)}
                  options={wallets.map((w) => ({
                    value: w.id,
                    label: w.name,
                    badge: `Rp ${w.balance.toLocaleString('id-ID')}`,
                  }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catatan Setoran</label>
                <input
                  type="text"
                  placeholder="Contoh: Sisa gaji bulanan"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#1e2436]">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  Konfirmasi Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tarik Tabungan */}
      {isWithdrawModalOpen && selectedWithdrawGoal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#1e2436] mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">Tarik dari Tabungan</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">{selectedWithdrawGoal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e2436] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
              <div className="p-3 bg-[#0a0b10] border border-[#1e2436] rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-400">Saldo Tabungan Tersedia:</span>
                <span className="text-sm font-mono font-bold text-purple-400">
                  {formatCurrency(selectedWithdrawGoal.current_amount)}
                </span>
              </div>

              {/* AmountInput for Withdraw */}
              <AmountInput
                value={withdrawAmount}
                onChange={setWithdrawAmount}
                label="Nominal Penarikan (IDR)"
                required
                colorScheme="rose"
                max={selectedWithdrawGoal.current_amount}
                showPresets={true}
              />

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kirim ke Rekening / Dompet Tujuan
                </label>
                <CustomSelect
                  value={withdrawWalletId}
                  onChange={(val) => setWithdrawWalletId(val)}
                  options={wallets.map((w) => ({
                    value: w.id,
                    label: w.name,
                    badge: `Rp ${w.balance.toLocaleString('id-ID')}`,
                  }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alasan / Catatan Penarikan</label>
                <input
                  type="text"
                  placeholder="Contoh: Kebutuhan mendesak / realisasi target"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#1e2436]">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  Konfirmasi Penarikan
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
                <h3 className="text-sm sm:text-base font-bold text-slate-100">Hapus Target Tabungan?</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Konfirmasi tindakan penghapusan</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 bg-[#0a0b10] border border-[#1e2436] p-3 rounded-xl leading-relaxed">
              Apakah Anda yakin ingin menghapus target <strong className="text-slate-100">{deleteTarget.name}</strong> dengan target <strong className="text-purple-400 font-mono">{formatCurrency(deleteTarget.target_amount)}</strong>?
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
                Ya, Hapus Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
