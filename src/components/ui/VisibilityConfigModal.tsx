'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { ShieldCheck, Eye, EyeOff, Check, X, PiggyBank } from 'lucide-react';
import { VisibilityRule } from '@/types';

interface VisibilityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisibilityConfigModal: React.FC<VisibilityConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentTenant,
    users,
    wallets,
    categories,
    savingsGoals,
    visibilityRules,
    updateVisibilityRule,
  } = useFinance();

  // Find partner/normal users in current scope
  const targetableUsers = users.filter((u) => u.role === 'user');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    targetableUsers[0]?.id || ''
  );

  const currentRule = visibilityRules.find(
    (r) => r.target_user_id === selectedUserId && r.tenant_id === currentTenant.id
  ) || {
    id: 'vr-new',
    tenant_id: currentTenant.id,
    target_user_id: selectedUserId,
    allowed_wallet_ids: wallets.map((w) => w.id),
    allowed_category_ids: categories.map((c) => c.id),
    allowed_savings_goal_ids: savingsGoals.map((g) => g.id),
    can_view_all_transactions: true,
    can_view_savings: true,
    can_view_analytics: true,
    can_export_reports: true,
    can_manage_categories: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [ruleState, setRuleState] = useState<VisibilityRule>(currentRule);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync rule state when user changes
  const handleUserSelect = (uid: string) => {
    setSelectedUserId(uid);
    const found = visibilityRules.find(
      (r) => r.target_user_id === uid && r.tenant_id === currentTenant.id
    );
    if (found) {
      setRuleState({
        ...found,
        allowed_savings_goal_ids: found.allowed_savings_goal_ids || savingsGoals.map((g) => g.id),
      });
    } else {
      setRuleState({
        id: 'vr-' + Date.now(),
        tenant_id: currentTenant.id,
        target_user_id: uid,
        allowed_wallet_ids: wallets.map((w) => w.id),
        allowed_category_ids: categories.map((c) => c.id),
        allowed_savings_goal_ids: savingsGoals.map((g) => g.id),
        can_view_all_transactions: true,
        can_view_savings: true,
        can_view_analytics: true,
        can_export_reports: true,
        can_manage_categories: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const toggleWallet = (walletId: string) => {
    setRuleState((prev) => {
      const exists = prev.allowed_wallet_ids.includes(walletId);
      return {
        ...prev,
        allowed_wallet_ids: exists
          ? prev.allowed_wallet_ids.filter((id) => id !== walletId)
          : [...prev.allowed_wallet_ids, walletId],
      };
    });
  };

  const toggleCategory = (catId: string) => {
    setRuleState((prev) => {
      const exists = prev.allowed_category_ids.includes(catId);
      return {
        ...prev,
        allowed_category_ids: exists
          ? prev.allowed_category_ids.filter((id) => id !== catId)
          : [...prev.allowed_category_ids, catId],
      };
    });
  };

  const toggleSavingsGoal = (goalId: string) => {
    setRuleState((prev) => {
      const currentList = prev.allowed_savings_goal_ids || savingsGoals.map((g) => g.id);
      const exists = currentList.includes(goalId);
      return {
        ...prev,
        allowed_savings_goal_ids: exists
          ? currentList.filter((id) => id !== goalId)
          : [...currentList, goalId],
      };
    });
  };

  const handleSave = async () => {
    await updateVisibilityRule(ruleState);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl p-4 sm:p-6 shadow-2xl max-h-[92dvh] flex flex-col"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#1e2436]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Hak Visibilitas Pengguna
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Atur modul, rekening, kategori, dan target tabungan yang dapat dilihat anggota
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2436] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* 1. Target User Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pilih Anggota yang Dikonfigurasi
            </label>
            {targetableUsers.length > 0 ? (
              <select
                value={selectedUserId}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {targetableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                Belum ada akun bertipe User/Partner di scope ini. Tambahkan anggota terlebih dahulu.
              </p>
            )}
          </div>

          {/* 2. Feature Toggles */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Akses Modul & Fitur</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0b10] border border-[#1e2436] cursor-pointer hover:border-slate-700">
                <span className="text-xs text-slate-300">Lihat Semua Transaksi Scope</span>
                <input
                  type="checkbox"
                  checked={ruleState.can_view_all_transactions}
                  onChange={(e) =>
                    setRuleState((prev) => ({
                      ...prev,
                      can_view_all_transactions: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0b10] border border-[#1e2436] cursor-pointer hover:border-slate-700">
                <span className="text-xs text-slate-300">Lihat Modul Tabungan Bersama</span>
                <input
                  type="checkbox"
                  checked={ruleState.can_view_savings}
                  onChange={(e) =>
                    setRuleState((prev) => ({
                      ...prev,
                      can_view_savings: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0b10] border border-[#1e2436] cursor-pointer hover:border-slate-700">
                <span className="text-xs text-slate-300">Lihat Grafik & Analitik</span>
                <input
                  type="checkbox"
                  checked={ruleState.can_view_analytics}
                  onChange={(e) =>
                    setRuleState((prev) => ({
                      ...prev,
                      can_view_analytics: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0b10] border border-[#1e2436] cursor-pointer hover:border-slate-700">
                <span className="text-xs text-slate-300">Ekspor Laporan (PDF / Excel)</span>
                <input
                  type="checkbox"
                  checked={ruleState.can_export_reports}
                  onChange={(e) =>
                    setRuleState((prev) => ({
                      ...prev,
                      can_export_reports: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* 3. Allowed Wallets Checkbox Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">
              Visibilitas Rekening / Dompet
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {wallets.map((w) => {
                const isChecked = ruleState.allowed_wallet_ids.includes(w.id);
                return (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => toggleWallet(w.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#0a0b10] border-[#1e2436] text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-xs font-medium truncate">{w.name}</span>
                    {isChecked ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Allowed Categories Checkbox Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">
              Visibilitas Kategori Transaksi
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((c) => {
                const isChecked = ruleState.allowed_category_ids.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                        : 'bg-[#0a0b10] border-[#1e2436] text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-[11px] truncate font-medium">{c.name}</span>
                    {isChecked ? <Eye className="w-3 h-3 shrink-0" /> : <EyeOff className="w-3 h-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Allowed Savings Goals Checkbox Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-purple-400" />
              Visibilitas Target Tabungan Khusus
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savingsGoals.map((sg) => {
                const allowedList = ruleState.allowed_savings_goal_ids || savingsGoals.map((g) => g.id);
                const isChecked = allowedList.includes(sg.id);
                return (
                  <button
                    type="button"
                    key={sg.id}
                    onClick={() => toggleSavingsGoal(sg.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                        : 'bg-[#0a0b10] border-[#1e2436] text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium truncate block">{sg.name}</span>
                      <span className="text-[10px] text-slate-500 block">{sg.category}</span>
                    </div>
                    {isChecked ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}

              {savingsGoals.length === 0 && (
                <div className="col-span-full text-center py-3 text-slate-500 text-[11px] bg-[#0a0b10] rounded-xl border border-[#1e2436]">
                  Belum ada target tabungan di scope ini
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-[#1e2436]">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-4 h-4" /> Aturan berhasil disimpan!
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">
              Perubahan berlaku secara instan
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-[#1e2436]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20"
            >
              Simpan Aturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
