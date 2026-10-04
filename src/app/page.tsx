'use client';

import React, { useState } from 'react';
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
import { LoginPage } from '@/components/ui/LoginPage';
import { Layers, Shield } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentUser, currentTenant, getVisibilityForUser, isAuthenticated, isAuthChecking } = useFinance();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'wallets' | 'savings'>('overview');
  const [isMobileTxOpen, setIsMobileTxOpen] = useState(false);

  // 1. Loading state while verifying active session
  if (isAuthChecking) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0b10] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-xl animate-pulse shadow-lg shadow-emerald-500/20 mb-4">
          A
        </div>
        <p className="text-xs text-slate-400">Memeriksa sesi autentikasi...</p>
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
    <div className="min-h-screen bg-[#0a0b10] text-slate-100 flex flex-col selection:bg-emerald-500/30 pb-24 md:pb-6">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 space-y-3.5 sm:space-y-6">
        {/* Compact Breadcrumb / Scope Header (Clean on mobile, expanded on desktop) */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
              {currentTenant.type === 'household'
                ? 'Rumah Tangga'
                : currentTenant.type === 'personal'
                ? 'Pribadi'
                : 'Organisasi'}
            </span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs text-slate-300 font-semibold truncate">
              {currentTenant.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Peran: <strong className="text-emerald-400">{currentUser.role.toUpperCase()}</strong>
            </span>
            {isUserRole && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                Mode Terbatas
              </span>
            )}
          </div>
        </div>

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
