'use client';

import React from 'react';
import { LayoutDashboard, Receipt, PiggyBank, Plus, Shield, Wallet } from 'lucide-react';
import { useFinance } from '@/lib/store';

interface MobileBottomNavProps {
  activeTab: 'overview' | 'transactions' | 'wallets' | 'savings';
  setActiveTab: (tab: 'overview' | 'transactions' | 'wallets' | 'savings') => void;
  onOpenNewTransaction: () => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenMenu,
}) => {
  const { currentUser } = useFinance();
  const isAdminOrSuper = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#12141d] border-t border-slate-200 dark:border-[#1e2436] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl transition-colors">
      <div className="flex items-center justify-around">
        {/* Tab 1: Ringkasan */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center gap-1 min-w-[54px] min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Ringkasan</span>
        </button>

        {/* Tab 2: Mutasi */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center gap-1 min-w-[54px] min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'transactions' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">Mutasi</span>
        </button>

        {/* Tab 3: Primary Action (+) Floating Center */}
        <button
          onClick={onOpenNewTransaction}
          className="relative -top-4 w-12 h-12 rounded-full bg-emerald-500 active:bg-emerald-600 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform cursor-pointer"
          aria-label="Catat Transaksi"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Tab 4: Rekening & Tabungan */}
        <button
          onClick={() => setActiveTab('wallets')}
          className={`flex flex-col items-center justify-center gap-1 min-w-[54px] min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'wallets' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Rekening</span>
        </button>

        {/* Tab 5: Tabungan / Goals */}
        <button
          onClick={() => setActiveTab('savings')}
          className={`flex flex-col items-center justify-center gap-1 min-w-[54px] min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'savings' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PiggyBank className="w-5 h-5" />
          <span className="text-[10px]">Tabungan</span>
        </button>
      </div>
    </nav>
  );
};
