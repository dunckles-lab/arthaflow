'use client';

import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from '@/lib/store';
import { Navbar } from '@/components/ui/Navbar';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { StatCards } from '@/components/ui/StatCards';
import { InteractiveCharts } from '@/components/ui/InteractiveCharts';
import { WalletsSection } from '@/components/ui/WalletsSection';
import { SavingsSection } from '@/components/ui/SavingsSection';
import { TransactionList } from '@/components/ui/TransactionList';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import { TransactionModal } from '@/components/ui/TransactionModal';
import { SupabaseSetupModal } from '@/components/ui/SupabaseSetupModal';
import { LoginPage } from '@/components/ui/LoginPage';
import { Layers, Shield, AlertTriangle, Database } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    getVisibilityForUser,
    isAuthenticated,
    isAuthChecking,
    isLiveDbConnected,
    isDbSetupRequired,
  } = useFinance();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'wallets' | 'savings'>('overview');
  const [isMobileTxOpen, setIsMobileTxOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Automatically prompt setup modal if DB is missing
  useEffect(() => {
    if (isDbSetupRequired && isAuthenticated && !isAuthChecking) {
      setIsSetupModalOpen(true);
    }
  }, [isDbSetupRequired, isAuthenticated, isAuthChecking]);

  // 1. Loading state while verifying active session
  if (isAuthChecking) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0a0b10] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-xl animate-pulse shadow-lg shadow-emerald-500/20 mb-4">
          A
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Memeriksa sesi autentikasi...</p>
      </div>
    );
  }

  // 2. Anonymous redirect / Gate: Show LoginPage if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const userRule = getVisibilityForUser(currentUser.id);
  const isUserRole = currentUser.role === 'user';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0b10] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500/30 pb-24 md:pb-6 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 space-y-3.5 sm:space-y-6">
        {/* Compact Breadcrumb / Scope Header (Clean on mobile, expanded on desktop) */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
              {currentTenant.type === 'household'
                ? 'Rumah Tangga'
                : currentTenant.type === 'personal'
                ? 'Pribadi'
                : 'Organisasi'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
              {currentTenant.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
              Peran: <strong className="text-emerald-600 dark:text-emerald-400">{currentUser.role.toUpperCase()}</strong>
            </span>
            {isUserRole && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-medium">
                Mode Terbatas
              </span>
            )}
          </div>
        </div>

        {/* Database Setup Alert Banner if DB is not live */}
        {!isLiveDbConnected && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm">Database Supabase Belum Diinisialisasi</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  Penyimpanan lokal telah dinonaktifkan. Jalankan 1x migrasi SQL agar transaksi tersimpan di database cloud dan otomatis tersinkronisasi di semua perangkat Anda.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md shadow-amber-500/20 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              Lihat Tutorial &amp; Setup SQL
            </button>
          </div>
        )}

        {/* Desktop View: Full Sections */}
        <div className="hidden md:block space-y-6">
          <PeriodSelector />
          <StatCards />
          {(!isUserRole || userRule?.can_view_analytics !== false) && <InteractiveCharts />}
          <WalletsSection />
          {(!isUserRole || userRule?.can_view_savings !== false) && <SavingsSection />}
          <TransactionList />
        </div>

        {/* Mobile View: Dynamic Clean Tabs */}
        <div className="md:hidden space-y-3.5">
          {activeTab === 'overview' && (
            <>
              <PeriodSelector />
              <StatCards />
              {(!isUserRole || userRule?.can_view_analytics !== false) && <InteractiveCharts />}
            </>
          )}

          {activeTab === 'transactions' && (
            <>
              <PeriodSelector />
              <TransactionList />
            </>
          )}

          {activeTab === 'wallets' && (
            <>
              <WalletsSection />
            </>
          )}

          {activeTab === 'savings' && (
            <>
              {(!isUserRole || userRule?.can_view_savings !== false) ? (
                <SavingsSection />
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#12141d] rounded-2xl border border-[#1e2436]">
                  Akses tabungan dinonaktifkan oleh Admin untuk akun Anda.
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => setIsMobileTxOpen(true)}
        onOpenMenu={() => {}}
      />

      {/* Mobile Quick Action Transaction Modal */}
      <TransactionModal isOpen={isMobileTxOpen} onClose={() => setIsMobileTxOpen(false)} />

      {/* Supabase Interactive Setup Modal */}
      <SupabaseSetupModal isOpen={isSetupModalOpen} onClose={() => setIsSetupModalOpen(false)} />

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-[#1e2436] py-6 px-4 text-center text-xs text-slate-500 bg-[#0a0b10]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ArthaFlow Financial Management System &copy; 2026.</span>
          <span className="text-[11px] text-slate-600">
            RBAC Multi-Scope & Multi-Tenant Terisolasi
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function HomePage() {
  return (
    <FinanceProvider>
      <DashboardContent />
    </FinanceProvider>
  );
}
