'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/export';
import { PiggyBank, Plus, CheckCircle2, Calendar, Target, ArrowUpRight } from 'lucide-react';

export const SavingsSection: React.FC = () => {
  const { savingsGoals, addSavingsGoal, depositToSavings, wallets, currentUser } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // New goal form
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Dana Darurat');

  // Deposit form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositWalletId, setDepositWalletId] = useState(wallets[0]?.id || '');
  const [depositNotes, setDepositNotes] = useState('');

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    await addSavingsGoal({
      name,
      target_amount: parseFloat(targetAmount) || 0,
      deadline,
      category,
      color: '#10b981',
    });
    setName('');
    setTargetAmount('');
    setDeadline('');
    setIsGoalModalOpen(false);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !depositAmount || !depositWalletId) return;
    await depositToSavings(
      selectedGoalId,
      parseFloat(depositAmount) || 0,
      depositWalletId,
      depositNotes
    );
    setDepositAmount('');
    setDepositNotes('');
    setIsDepositModalOpen(false);
  };

  const openDeposit = (goalId: string) => {
    setSelectedGoalId(goalId);
    if (wallets.length > 0) setDepositWalletId(wallets[0].id);
    setIsDepositModalOpen(true);
  };

  return (
    <div className="bg-[#12141d] border border-[#1e2436] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Manajemen Tabungan & Target</h3>
          <p className="text-xs text-slate-400">Rencana alokasi dana dan pencapaian target</p>
        </div>
        <button
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Target Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {savingsGoals.map((goal) => {
          const percentage = Math.min(
            100,
            goal.target_amount > 0
              ? Math.round((goal.current_amount / goal.target_amount) * 100)
              : 0
          );
          const isDone = goal.is_completed || percentage >= 100;

          return (
            <div
              key={goal.id}
              className="bg-[#0a0b10] border border-[#1e2436] hover:border-purple-500/30 rounded-xl p-4 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                      {goal.category || 'Tabungan'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 mt-1">{goal.name}</h4>
                  </div>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Tercapai
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-purple-400">{percentage}%</span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#1e2436] rounded-full h-2 my-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? 'bg-emerald-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs mt-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Terkumpul</span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {formatCurrency(goal.current_amount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Target</span>
                    <span className="font-semibold text-slate-400 font-mono">
                      {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                </div>

                {goal.deadline && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-3">
                    <Calendar className="w-3 h-3" />
                    <span>Tenggat: {goal.deadline}</span>
                  </div>
                )}
              </div>

              {!isDone && (
                <button
                  onClick={() => openDeposit(goal.id)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Setor Tabungan
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add Goal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">Buat Target Tabungan Baru</h3>
            <p className="text-xs text-slate-400 mb-4">Rencanakan target dana masa depan</p>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Target</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dana Darurat, DP Rumah, Liburan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Nominal (IDR)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 10000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kategori Target</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Dana Darurat">Dana Darurat</option>
                    <option value="Investasi">Investasi</option>
                    <option value="Pendidikan">Pendidikan</option>
                    <option value="Rekreasi">Rekreasi & Liburan</option>
                    <option value="Kendaraan / Rumah">Kendaraan / Properti</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tenggat Waktu / Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-[#1e2436] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Deposit */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">Setor Tabungan</h3>
            <p className="text-xs text-slate-400 mb-4">Alokasikan saldo dari rekening ke pos tabungan ini</p>

            <form onSubmit={handleDeposit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sumber Rekening / Dompet</label>
                <select
                  value={depositWalletId}
                  onChange={(e) => setDepositWalletId(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Saldo: {formatCurrency(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nominal Setoran (IDR)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 1000000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Sisa bonus bulanan"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-[#1e2436] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-semibold transition-colors"
                >
                  Konfirmasi Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
