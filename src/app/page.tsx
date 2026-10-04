'use client';

import React from 'react';
import { FinanceProvider, useFinance } from '@/lib/store';
import { Navbar } from '@/components/ui/Navbar';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { StatCards } from '@/components/ui/StatCards';
import { InteractiveCharts } from '@/components/ui/InteractiveCharts';
import { WalletsSection } from '@/components/ui/WalletsSection';
import { SavingsSection } from '@/components/ui/SavingsSection';
import { TransactionList } from '@/components/ui/TransactionList';
import { Shield } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentUser, currentTenant, getVisibilityForUser } = useFinance();

  const userRule = getVisibilityForUser(currentUser.id);
  const isUserRole = currentUser.role === 'user';

  return (
    <div className="min-h-screen bg-[#0a0b10] text-slate-100 flex flex-col selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* User Scope & Active Role Banner */}
        <div className="bg-gradient-to-r from-[#12141d] via-[#161926] to-[#12141d] border border-[#1e2436] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-wide uppercase">
                {currentTenant.type === 'household'
                  ? 'Rumah Tangga'
                  : currentTenant.type === 'personal'
                  ? 'Pribadi'
                  : 'Organisasi'}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">
                Scope Aktif: <strong className="text-slate-200">{currentTenant.name}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              Dashboard Keuangan & Manajemen Tabungan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Login sebagai{' '}
              <span className="text-emerald-400 font-semibold">{currentUser.name}</span> (
              {currentUser.role.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isUserRole && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                <Shield className="w-3.5 h-3.5" />
                Mode Visibilitas Terbatas oleh Admin
              </div>
            )}
          </div>
        </div>

        {/* 1. Period Selector */}
        <PeriodSelector />

        {/* 2. Top Summary Stat Cards */}
        <StatCards />

        {/* 3. Interactive Visual Charts */}
        {(!isUserRole || userRule?.can_view_analytics !== false) && (
          <InteractiveCharts />
        )}

        {/* 4. Rekening & Sumber Dana */}
        <WalletsSection />

        {/* 5. Savings Goals Section */}
        {(!isUserRole || userRule?.can_view_savings !== false) && (
          <SavingsSection />
        )}

        {/* 6. Transaction Mutasi History */}
        <TransactionList />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2436] py-6 px-4 text-center text-xs text-slate-500 bg-[#0a0b10]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ArthaFlow Financial Management System &copy; 2026. Free Tier Serverless Ready.</span>
          <span className="text-[11px] text-slate-600">
            Arsitektur RBAC Multi-Scope & Multi-Tenant Terisolasi
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
