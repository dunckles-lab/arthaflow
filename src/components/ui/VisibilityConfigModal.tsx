'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { ShieldCheck, Eye, EyeOff, Lock, Check } from 'lucide-react';
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
      setRuleState(found);
    } else {
      setRuleState({
        id: 'vr-' + Date.now(),
        tenant_id: currentTenant.id,
        target_user_id: uid,
        allowed_wallet_ids: wallets.map((w) => w.id),
        allowed_category_ids: categories.map((c) => c.id),
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2436]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Konfigurasi Hak Visibilitas Partner / User
              </h3>
              <p className="text-xs text-slate-400">
                Kewenangan Admin untuk membatasi tampilan data yang dapat dilihat oleh anggota
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* 1. Target User Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pilih Anggota / Partner yang Dikonfigurasi
            </label>
            {targetableUsers.length > 0 ? (
              <select
                value={selectedUserId}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {targetableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                Belum ada akun bertipe User/Partner di scope ini. Tambahkan user terlebih dahulu via menu Anggota.
              </p>
            )}
          </div>

          {/* 2. Feature Toggles */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Akses Modul & Fitur</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0b10] border border-[#1e2436] cursor-pointer hover:border-slate-700">
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
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0b10] border border-[#1e2436] cursor-pointer hover:border-slate-700">
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
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0b10] border border-[#1e2436] cursor-pointer hover:border-slate-700">
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
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0b10] border border-[#1e2436] cursor-pointer hover:border-slate-700">
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
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* 3. Allowed Wallets Checkbox Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">
              Visibilitas Rekening / Sumber Dana
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {wallets.map((w) => {
                const isChecked = ruleState.allowed_wallet_ids.includes(w.id);
                return (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => toggleWallet(w.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#0a0b10] border-[#1e2436] text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-xs font-medium">{w.name}</span>
                    {isChecked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
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
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1e2436]">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-4 h-4" /> Aturan berhasil disimpan!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Perubahan berlaku secara instan pada session user
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-[#1e2436]"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              Simpan Aturan Visibilitas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
