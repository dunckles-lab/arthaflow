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
} from 'lucide-react';
import { TransactionModal } from './TransactionModal';
import { VisibilityConfigModal } from './VisibilityConfigModal';
import { UserManagementModal } from './UserManagementModal';
import { AuditLogModal } from './AuditLogModal';
import { ExportModal } from './ExportModal';
import { DatabaseConfigModal } from './DatabaseConfigModal';
import { CategoryManagementModal } from './CategoryManagementModal';
import { MenuSheet } from './MenuSheet';

export const Navbar: React.FC = () => {
  const {
    currentTenant,
    tenants,
    setCurrentTenant,
    currentUser,
    allUsers,
    setCurrentUser,
    isLiveDbConnected,
    logout,
  } = useFinance();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isVisModalOpen, setIsVisModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0b10]/95 backdrop-blur-md border-b border-[#1e2436] px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3">
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

            {/* Scope / Tenant Selector (Desktop Only or compact mobile) */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#12141d] border border-[#1e2436] rounded-xl px-2.5 py-1.5 text-xs ml-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={currentTenant.id}
                onChange={(e) => {
                  const selected = tenants.find((t) => t.id === e.target.value);
                  if (selected) setCurrentTenant(selected);
                }}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#12141d] text-slate-200">
                    {t.name} ({t.type === 'household' ? 'Rumah Tangga' : t.type === 'personal' ? 'Pribadi' : 'Organisasi'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Supabase status badge */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-[11px] text-slate-300 transition-colors cursor-pointer"
              title="Konfigurasi Database"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isLiveDbConnected ? 'Live DB' : 'Supabase Setup'}</span>
            </button>

            {/* Category Management Button */}
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              title="Kelola Kategori"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kategori</span>
            </button>

            {/* Export Reports Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Ekspor</span>
            </button>

            {/* Admin/Superadmin controls */}
            {(isAdmin || isSuperadmin) && (
              <>
                <button
                  onClick={() => setIsVisModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-indigo-300 transition-colors cursor-pointer"
                  title="Atur Hak Visibilitas Anggota"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Visibilitas</span>
                </button>

                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                  title="Manajemen Pengguna"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Anggota</span>
                </button>
              </>
            )}

            {isSuperadmin && (
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-amber-300 transition-colors cursor-pointer"
                title="Log Audit Sistem"
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit</span>
              </button>
            )}

            {/* Primary Action: Catat Transaksi */}
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Catat Transaksi
            </button>

            {/* User Account / Logout */}
            <div className="flex items-center gap-2 bg-[#12141d] border border-emerald-500/30 rounded-xl px-2.5 py-1">
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

          {/* Mobile Right Controls: Compact Scope Trigger + Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Quick scope badge */}
            <button
              onClick={() => setIsMenuSheetOpen(true)}
              className="px-2 py-1 rounded-lg bg-[#12141d] border border-[#1e2436] text-[11px] font-medium text-slate-300 flex items-center gap-1 max-w-[130px] truncate"
            >
              <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">{currentTenant.name}</span>
            </button>

            {/* User Profile & Menu Sheet Trigger */}
            <button
              onClick={() => setIsMenuSheetOpen(true)}
              className="w-8 h-8 rounded-lg bg-[#12141d] border border-[#1e2436] flex items-center justify-center text-slate-300 active:scale-95"
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
      <VisibilityConfigModal isOpen={isVisModalOpen} onClose={() => setIsVisModalOpen(false)} />
      <UserManagementModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
      <AuditLogModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <DatabaseConfigModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />

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
      />
    </>
  );
};
