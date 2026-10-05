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
  Tag,
  Sun,
  Moon,
  Send,
} from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface MenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExport: () => void;
  onOpenVisibility: () => void;
  onOpenUsers: () => void;
  onOpenAudit: () => void;
  onOpenDb: () => void;
  onOpenCategories: () => void;
  onOpenTelegram: () => void;
}

export const MenuSheet: React.FC<MenuSheetProps> = ({
  isOpen,
  onClose,
  onOpenExport,
  onOpenVisibility,
  onOpenUsers,
  onOpenAudit,
  onOpenDb,
  onOpenCategories,
  onOpenTelegram,
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
    theme,
    toggleTheme,
  } = useFinance();

  if (!isOpen) return null;

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';

  const tenantOptions = tenants
    .filter((t) => isSuperadmin || t.id === currentUser.tenant_id)
    .map((t) => ({
      value: t.id,
      label: t.name,
      badge: isSuperadmin
        ? 'Global'
        : t.type === 'household'
        ? 'Keluarga'
        : t.type === 'personal'
        ? 'Pribadi'
        : 'Organisasi',
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#12141d] border-t border-slate-200 dark:border-[#1e2436] rounded-t-3xl p-5 max-h-[88vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e2436]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                {currentUser.role.toUpperCase()} • {authEmail || 'Sesi Aktif'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e2436] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Switcher Card */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Tema Tampilan</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {theme === 'dark' ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#12141d] hover:bg-slate-100 dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{theme === 'dark' ? 'Ganti Terang' : 'Ganti Gelap'}</span>
          </button>
        </div>

        {/* Scope Selector */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436]">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Pilih Scope Keuangan Aktif
          </label>
          <CustomSelect
            value={currentTenant.id}
            onChange={(val) => {
              const selected = tenants.find((t) => t.id === val);
              if (selected) setCurrentTenant(selected);
            }}
            options={tenantOptions}
          />
        </div>

        {/* Quick Menu List */}
        <div className="mt-4 space-y-2">
          {/* Integrasi Telegram Bot */}
          <button
            onClick={() => {
              onClose();
              onOpenTelegram();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200 dark:border-sky-500/20 text-xs font-semibold text-sky-700 dark:text-sky-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Integrasi Bot Telegram</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono">
              Gateway
            </span>
          </button>

          {/* Kelola Kategori */}
          <button
            onClick={() => {
              onClose();
              onOpenCategories();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161926] hover:bg-slate-100 dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Kelola Kategori Anggaran</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">CRUD</span>
          </button>

          {/* Ekspor Laporan */}
          <button
            onClick={() => {
              onClose();
              onOpenExport();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161926] hover:bg-slate-100 dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
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
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161926] hover:bg-slate-100 dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Koneksi Database Supabase</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isLiveDbConnected
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
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
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161926] hover:bg-slate-100 dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Konfigurasi Hak Visibilitas Partner</span>
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Admin</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenUsers();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161926] hover:bg-slate-100 dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>Manajemen Anggota & Akun</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">RBAC</span>
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
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161926] hover:bg-slate-100 dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Log Audit Keamanan Sistem</span>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">Superadmin</span>
            </button>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="mt-4 w-full py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Sesi (Logout)
        </button>
      </div>
    </div>
  );
};
