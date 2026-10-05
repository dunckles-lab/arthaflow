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

  const tenantOptions = tenants.map((t) => ({
    value: t.id,
    label: t.name,
    badge: t.type === 'household' ? 'Rumah Tangga' : t.type === 'personal' ? 'Pribadi' : 'Organisasi',
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
              <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none flex items-center gap-1.5">
                ArthaFlow
                <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  v1.0
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">Financial Operating System</p>
            </div>

            {/* Scope / Tenant Custom Select (Desktop) */}
            <div className="hidden sm:block ml-2 w-56">
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
          <div className="hidden md:flex items-center gap-2">
            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Supabase status badge */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-[11px] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Konfigurasi Database Supabase"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isLiveDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden xl:inline">{isLiveDbConnected ? 'Live DB' : 'Supabase Setup'}</span>
            </button>

            {/* Telegram Bot Button */}
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200 dark:border-sky-500/20 text-xs font-semibold text-sky-700 dark:text-sky-400 transition-colors cursor-pointer"
              title="Integrasi Telegram Bot"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Bot Tele</span>
            </button>

            {/* Category Management Button */}
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Kelola Kategori"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">Kategori</span>
            </button>

            {/* Export Reports Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Ekspor Laporan (Excel & PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Ekspor</span>
            </button>

            {/* Admin/Superadmin controls */}
            {(isAdmin || isSuperadmin) && (
              <>
                <button
                  onClick={() => setIsVisModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                  title="Atur Hak Visibilitas Anggota"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Visibilitas</span>
                </button>

                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Manajemen Pengguna"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Anggota</span>
                </button>
              </>
            )}

            {isSuperadmin && (
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12141d] dark:hover:bg-[#1e2436] border border-slate-200 dark:border-[#1e2436] text-xs font-medium text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                title="Log Audit Sistem"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Audit</span>
              </button>
            )}

            {/* Primary Action: Catat Transaksi */}
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Catat Transaksi</span>
            </button>

            {/* User Account / Logout */}
            <div className="flex items-center gap-2 bg-[#12141d] border border-emerald-500/30 rounded-xl px-2.5 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-200">{currentUser.name}</span>
                <span className="text-[9px] text-emerald-400 font-mono">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-[10px] text-rose-400 hover:text-rose-300 ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                title="Keluar"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Right Controls: Theme Toggle + Quick Scope Trigger + Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-[#12141d] border border-[#1e2436] flex items-center justify-center text-slate-300 active:scale-95 cursor-pointer"
              title="Ganti Tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Quick scope badge */}
            <button
              onClick={() => setIsMenuSheetOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#12141d] border border-[#1e2436] text-[11px] font-medium text-slate-300 flex items-center gap-1.5 max-w-[130px] truncate cursor-pointer"
            >
              <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">{currentTenant.name}</span>
            </button>

            {/* User Profile & Menu Sheet Trigger */}
            <button
              onClick={() => setIsMenuSheetOpen(true)}
              className="w-8 h-8 rounded-xl bg-[#12141d] border border-[#1e2436] flex items-center justify-center text-slate-300 active:scale-95 cursor-pointer"
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
