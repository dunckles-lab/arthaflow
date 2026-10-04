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
  ChevronDown,
  Sparkles,
  Shield,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { TransactionModal } from './TransactionModal';
import { VisibilityConfigModal } from './VisibilityConfigModal';
import { UserManagementModal } from './UserManagementModal';
import { AuditLogModal } from './AuditLogModal';
import { ExportModal } from './ExportModal';
import { DatabaseConfigModal } from './DatabaseConfigModal';

export const Navbar: React.FC = () => {
  const {
    currentTenant,
    tenants,
    setCurrentTenant,
    currentUser,
    allUsers,
    setCurrentUser,
    isLiveDbConnected,
    syncStatus,
  } = useFinance();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isVisModalOpen, setIsVisModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0b10]/90 backdrop-blur-md border-b border-[#1e2436] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Brand & Scope Selector */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-emerald-500/20">
                A
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                  ArthaFlow
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    v1.0
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400">Financial Operating System</p>
              </div>
            </div>

            {/* Scope / Tenant Selector */}
            <div className="flex items-center gap-1.5 bg-[#12141d] border border-[#1e2436] rounded-xl px-2.5 py-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={currentTenant.id}
                onChange={(e) => {
                  const selected = tenants.find((t) => t.id === e.target.value);
                  if (selected) setCurrentTenant(selected);
                }}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#12141d] text-slate-200">
                    {t.name} ({t.type === 'household' ? 'Rumah Tangga' : t.type === 'personal' ? 'Pribadi' : 'Organisasi'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Actions & User Switcher */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Supabase status badge */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-[11px] text-slate-300 transition-colors"
              title="Konfigurasi Database"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span>{isLiveDbConnected ? 'Live DB' : 'Supabase Setup'}</span>
            </button>

            {/* Export Reports Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor</span>
            </button>

            {/* Admin/Superadmin controls */}
            {(isAdmin || isSuperadmin) && (
              <>
                <button
                  onClick={() => setIsVisModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-indigo-300 transition-colors"
                  title="Atur Hak Visibilitas Anggota"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Visibilitas</span>
                </button>

                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-300 transition-colors"
                  title="Manajemen Pengguna"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Anggota</span>
                </button>
              </>
            )}

            {isSuperadmin && (
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-amber-300 transition-colors"
                title="Log Audit Sistem"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Audit Log</span>
              </button>
            )}

            {/* Primary Action: Catat Transaksi */}
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Catat Transaksi
            </button>

            {/* Role Switcher for Fast Demonstration */}
            <div className="flex items-center gap-1.5 bg-[#12141d] border border-[#1e2436] rounded-xl px-2 py-1 ml-1">
              <span className="text-[10px] text-slate-500 hidden lg:inline">Peran:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const selected = allUsers.find((u) => u.id === e.target.value);
                  if (selected) setCurrentUser(selected);
                }}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#12141d] text-slate-200">
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Render Modals */}
      <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} />
      <VisibilityConfigModal isOpen={isVisModalOpen} onClose={() => setIsVisModalOpen(false)} />
      <UserManagementModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
      <AuditLogModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <DatabaseConfigModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </>
  );
};
