'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import {
  X,
  Layers,
  Users,
  ShieldCheck,
  History,
  Download,
  Database,
  LogOut,
  UserCheck,
  Sparkles,
  Shield,
  CreditCard,
} from 'lucide-react';

interface MenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExport: () => void;
  onOpenVisibility: () => void;
  onOpenUsers: () => void;
  onOpenAudit: () => void;
  onOpenDb: () => void;
}

export const MenuSheet: React.FC<MenuSheetProps> = ({
  isOpen,
  onClose,
  onOpenExport,
  onOpenVisibility,
  onOpenUsers,
  onOpenAudit,
  onOpenDb,
}) => {
  const {
    currentUser,
    currentTenant,
    tenants,
    setCurrentTenant,
    allUsers,
    setCurrentUser,
    isLiveDbConnected,
    logout,
    authEmail,
  } = useFinance();

  if (!isOpen) return null;

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#12141d] border-t border-[#1e2436] rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2436]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">{currentUser.name}</h3>
              <p className="text-[11px] text-emerald-400 font-mono">
                {currentUser.role.toUpperCase()} • {authEmail || 'Sesi Aktif'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2436] flex items-center justify-center text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Selector */}
        <div className="mt-4 p-3 rounded-2xl bg-[#0a0b10] border border-[#1e2436]">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Pilih Scope Keuangan Aktif
          </label>
          <select
            value={currentTenant.id}
            onChange={(e) => {
              const selected = tenants.find((t) => t.id === e.target.value);
              if (selected) setCurrentTenant(selected);
            }}
            className="w-full bg-[#161926] border border-[#1e2436] rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#12141d] text-slate-200">
                {t.name} ({t.type === 'household' ? 'Rumah Tangga' : t.type === 'personal' ? 'Pribadi' : 'Organisasi'})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Menu List */}
        <div className="mt-4 space-y-2">
          {/* Ekspor Laporan */}
          <button
            onClick={() => {
              onClose();
              onOpenExport();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#161926] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor Laporan (Excel & PDF)</span>
            </div>
            <span className="text-[10px] text-slate-500">XLSX / PDF</span>
          </button>

          {/* Database Setup & Sync Status */}
          <button
            onClick={() => {
              onClose();
              onOpenDb();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#161926] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Koneksi Database Supabase</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isLiveDbConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {isLiveDbConnected ? 'Connected' : 'Setup DB'}
            </span>
          </button>

          {/* Admin & Superadmin Controls */}
          {(isAdmin || isSuperadmin) && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenVisibility();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#161926] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Konfigurasi Hak Visibilitas Partner</span>
                </div>
                <span className="text-[10px] text-indigo-400">Admin</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenUsers();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#161926] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-300" />
                  <span>Manajemen Anggota & Akun</span>
                </div>
                <span className="text-[10px] text-slate-400">RBAC</span>
              </button>
            </>
          )}

          {/* Superadmin Audit Logs */}
          {isSuperadmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAudit();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#161926] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-amber-400" />
                <span>Log Audit Keamanan Sistem</span>
              </div>
              <span className="text-[10px] text-amber-400">Superadmin</span>
            </button>
          )}
        </div>

        {/* Demo Switch Role */}
        <div className="mt-4 p-3 rounded-2xl bg-[#0a0b10] border border-[#1e2436]">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Simulasi Ganti Peran (Dev/Demo)
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const selected = allUsers.find((u) => u.id === e.target.value);
              if (selected) setCurrentUser(selected);
            }}
            className="w-full bg-[#161926] border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#12141d] text-slate-200">
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="mt-4 w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Sesi (Logout)
        </button>
      </div>
    </div>
  );
};
