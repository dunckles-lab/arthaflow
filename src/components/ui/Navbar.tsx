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
    loginWithGoogle,
    logout,
    authEmail,
  } = useFinance();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isVisModalOpen, setIsVisModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      await loginWithGoogle();
    } catch (err: any) {
      alert('Gagal login dengan Google SSO: ' + (err.message || err));
    } finally {
      setIsSigningIn(false);
    }
  };

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

            {/* Google SSO Status / Login Button */}
            {authEmail ? (
              <div className="flex items-center gap-2 bg-[#12141d] border border-emerald-500/30 rounded-xl px-2.5 py-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-200">{authEmail}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-[10px] text-rose-400 hover:text-rose-300 ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                  title="Keluar"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-medium text-slate-200 transition-colors shadow-sm"
                title="Login via Google OAuth"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSigningIn ? 'Menghubungkan...' : 'Google SSO'}</span>
              </button>
            )}

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
