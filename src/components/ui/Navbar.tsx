'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import {
  Layers,
  Users,
  ShieldCheck,
  History,
  Download,
  Database,
  Plus,
  Menu,
  Tag,
  Sun,
  Moon,
  Send,
  LogOut,
} from 'lucide-react';
import { TransactionModal } from './TransactionModal';
import { VisibilityConfigModal } from './VisibilityConfigModal';
import { UserManagementModal } from './UserManagementModal';
import { AuditLogModal } from './AuditLogModal';
import { ExportModal } from './ExportModal';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { CategoryManagementModal } from './CategoryManagementModal';
import { TelegramIntegrationModal } from './TelegramIntegrationModal';
import { MenuSheet } from './MenuSheet';
import { CustomSelect } from './CustomSelect';

export const Navbar: React.FC = () => {
  const {
    currentTenant,
    tenants,
    setCurrentTenant,
    currentUser,
    isLiveDbConnected,
    logout,
    theme,
    toggleTheme,
  } = useFinance();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isVisModalOpen, setIsVisModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';

  const tenantOptions = tenants
    .filter((t) => isSuperadmin || t.id === currentUser.tenant_id)
    .map((t) => ({
      value: t.id,
      label: isSuperadmin ? `${t.name}` : t.name,
      badge: isSuperadmin
        ? 'Global'
        : t.type === 'household'
        ? 'Keluarga'
        : t.type === 'personal'
        ? 'Pribadi'
        : 'Organisasi',
    }));

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--card-bg)] border-b border-[var(--card-border)] px-3 sm:px-4 lg:px-8 pt-[calc(0.625rem+env(safe-area-inset-top,0px))] pb-2.5 sm:pb-3 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Scope Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-sm sm:text-base shadow-md shadow-emerald-500/20 shrink-0">
              A
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none flex items-center gap-1.5">
                ArthaFlow
                <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                  v1.0
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Financial Operating System</p>
            </div>

            {/* Scope / Tenant Custom Select (Desktop) */}
            <div className="hidden sm:block ml-2 w-44 lg:w-56">
              <CustomSelect
                value={currentTenant.id}
                onChange={(val) => {
                  const selected = tenants.find((t) => t.id === val);
                  if (selected) setCurrentTenant(selected);
                }}
                options={tenantOptions}
                placeholder="Pilih Scope..."
              />
            </div>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Supabase status badge */}
            <button
              type="button"
              onClick={() => setIsDbModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-slate-700 dark:text-slate-300 relative transition-colors cursor-pointer"
              title={isLiveDbConnected ? 'Supabase Terhubung (Live DB)' : 'Konfigurasi Supabase Setup'}
              aria-label="Database Supabase"
            >
              <Database className={`w-4 h-4 ${isLiveDbConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                  isLiveDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </button>

            {/* Telegram Bot Button */}
            <button
              type="button"
              onClick={() => setIsTelegramModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
              title="Integrasi Telegram Bot"
              aria-label="Telegram Bot"
            >
              <Send className="w-4 h-4" />
            </button>

            {/* Category Management Button */}
            <button
              type="button"
              onClick={() => setIsCatModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
              title="Kelola Kategori Anggaran"
              aria-label="Kelola Kategori"
            >
              <Tag className="w-4 h-4" />
            </button>

            {/* Export Reports Button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Ekspor Laporan (Excel & PDF)"
              aria-label="Ekspor Laporan"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Admin/Superadmin controls */}
            {(isAdmin || isSuperadmin) && (
              <>
                <button
                  type="button"
                  onClick={() => setIsVisModalOpen(true)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                  title="Atur Hak Visibilitas Anggota"
                  aria-label="Visibilitas Anggota"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(true)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Manajemen Pengguna & Anggota"
                  aria-label="Manajemen Pengguna"
                >
                  <Users className="w-4 h-4" />
                </button>
              </>
            )}

            {isSuperadmin && (
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(true)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                title="Log Audit Sistem"
                aria-label="Log Audit"
              >
                <History className="w-4 h-4" />
              </button>
            )}

            {/* Primary Action: Catat Transaksi */}
            <button
              type="button"
              onClick={() => setIsTxModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Catat Transaksi Baru"
              aria-label="Catat Transaksi"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            {/* User Profile Badge (Icon/Avatar) & Logout */}
            <div
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#12141d] border border-slate-200 dark:border-emerald-500/30 flex items-center justify-center relative font-bold text-xs text-slate-800 dark:text-slate-200 cursor-default shrink-0"
              title={`${currentUser.name} (${currentUser.role.toUpperCase()})`}
            >
              <span>{currentUser.name.charAt(0).toUpperCase()}</span>
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-[var(--card-bg)]" />
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-colors cursor-pointer shrink-0"
              title="Keluar (Logout)"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Right Controls: Theme Toggle + Quick Scope Trigger + Menu Button */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 cursor-pointer"
              title="Ganti Tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Quick scope badge */}
            <button
              onClick={() => setIsMenuSheetOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 max-w-[130px] truncate cursor-pointer"
            >
              <Layers className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span className="truncate">{currentTenant.name}</span>
            </button>

            {/* User Profile & Menu Sheet Trigger */}
            <button
              onClick={() => setIsMenuSheetOpen(true)}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Render Modals */}
      <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} />
      <CategoryManagementModal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} />
      <TelegramIntegrationModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />
      <VisibilityConfigModal isOpen={isVisModalOpen} onClose={() => setIsVisModalOpen(false)} />
      <UserManagementModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
      <AuditLogModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <SupabaseSetupModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />

      {/* Mobile Slide-up Menu Drawer */}
      <MenuSheet
        isOpen={isMenuSheetOpen}
        onClose={() => setIsMenuSheetOpen(false)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenVisibility={() => setIsVisModalOpen(true)}
        onOpenUsers={() => setIsUserModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenDb={() => setIsDbModalOpen(true)}
        onOpenCategories={() => setIsCatModalOpen(true)}
        onOpenTelegram={() => setIsTelegramModalOpen(true)}
      />
    </>
  );
};
