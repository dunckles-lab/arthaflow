'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import {
  Database,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Server
} from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPABASE_SQL_DDL = `-- ==============================================================================
-- SKRIP MIGRASI LENGKAP ARTHAFLOW POSTGRESQL (SUPABASE)
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'household', 'organization')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  account_number TEXT,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT DEFAULT '#10b981',
  budget_limit NUMERIC(15, 2),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(15, 2) NOT NULL,
  category_id TEXT,
  wallet_id TEXT REFERENCES public.wallets(id) ON DELETE SET NULL,
  target_wallet_id TEXT REFERENCES public.wallets(id) ON DELETE SET NULL,
  notes TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  category TEXT,
  color TEXT DEFAULT '#38bdf8',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Savings Contributions Table
CREATE TABLE IF NOT EXISTS public.savings_contributions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  savings_goal_id TEXT REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Visibility Rules Table
CREATE TABLE IF NOT EXISTS public.visibility_rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  target_user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  allowed_wallet_ids TEXT[] DEFAULT '{}',
  allowed_category_ids TEXT[] DEFAULT '{}',
  allowed_savings_goal_ids TEXT[] DEFAULT '{}',
  can_view_all_transactions BOOLEAN DEFAULT TRUE,
  can_view_savings BOOLEAN DEFAULT TRUE,
  can_view_analytics BOOLEAN DEFAULT TRUE,
  can_export_reports BOOLEAN DEFAULT TRUE,
  can_manage_categories BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  target_resource TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 10. Telegram Bindings Table
CREATE TABLE IF NOT EXISTS public.telegram_bindings (
  id TEXT PRIMARY KEY,
  telegram_user_id TEXT NOT NULL UNIQUE,
  telegram_username TEXT,
  telegram_chat_id TEXT NOT NULL,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  default_wallet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 11. Initial Seed Data
INSERT INTO public.tenants (id, name, type)
VALUES ('t-personal', 'Pribadi (Superadmin)', 'personal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, tenant_id, email, name, role)
VALUES ('u-superadmin', 't-personal', 'dunckles123@gmail.com', 'Superadmin', 'superadmin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wallets (id, tenant_id, name, type, balance, currency, color)
VALUES 
  ('w-1', 't-personal', 'BCA Utama', 'bank', 0, 'IDR', '#10b981'),
  ('w-2', 't-personal', 'Dompet Tunai', 'cash', 0, 'IDR', '#06b6d4'),
  ('w-3', 't-personal', 'GoPay / OVO', 'e-wallet', 0, 'IDR', '#6366f1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, tenant_id, name, type, icon, color)
VALUES
  ('c-1', 't-personal', 'Gaji & Pendapatan', 'income', 'Briefcase', '#10b981'),
  ('c-2', 't-personal', 'Makanan & Minuman', 'expense', 'Utensils', '#f43f5e'),
  ('c-3', 't-personal', 'Transportasi', 'expense', 'Car', '#f59e0b'),
  ('c-4', 't-personal', 'Tagihan & Utilitas', 'expense', 'Zap', '#8b5cf6'),
  ('c-5', 't-personal', 'Belanja & Hiburan', 'expense', 'ShoppingBag', '#ec4899')
ON CONFLICT (id) DO NOTHING;

-- 12. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bindings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access for app usage" ON public.tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.wallets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.savings_contributions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.visibility_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access for app usage" ON public.telegram_bindings FOR ALL USING (true) WITH CHECK (true);
`;

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isLiveDbConnected, refreshData } = useFinance();
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyMessage(null);
    try {
      await refreshData();
      setTimeout(() => {
        setIsVerifying(false);
        if (isLiveDbConnected) {
          setVerifyMessage('success');
        } else {
          setVerifyMessage('error');
        }
      }, 1000);
    } catch {
      setIsVerifying(false);
      setVerifyMessage('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#1e2436] bg-slate-50 dark:bg-[#12141d]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isLiveDbConnected ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Setup Database Supabase
                {isLiveDbConnected ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 font-semibold">
                    Tersinkronisasi
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20 font-semibold">
                    Perlu Inisialisasi
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Penyimpanan lokal dinonaktifkan agar data sinkron lintas semua perangkat & bot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#1e2436] text-slate-700 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs bg-white dark:bg-[#12141d]">
          {/* Status Alert Banner */}
          {!isLiveDbConnected ? (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3 text-amber-900 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-amber-950 dark:text-amber-200">Tabel Database Belum Dibuat di Supabase</p>
                <p className="text-[11px] text-amber-900 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  Agar mutasi transaksi, saldo dompet, dan rekap otomatis bot sinkron lintas HP dan laptop, skema tabel harus dieksekusi 1x di Supabase SQL Editor.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3 text-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-950 dark:text-emerald-200">Database Supabase Aktif & Terhubung</p>
                <p className="text-[11px] text-emerald-900 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                  Semua data tersimpan langsung di PostgreSQL cloud dan akan otomatis sinkron ke seluruh perangkat Anda.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Open SQL Editor */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs truncate">Buka SQL Editor</span>
              </div>
              <a
                href="https://supabase.com/dashboard/project/fhtpseqhrhjtpzucnnrx/sql/new"
                target="_blank"
                rel="noreferrer"
                title="Buka Supabase SQL Editor"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                <span className="hidden sm:inline">Buka SQL Editor</span>
                <span className="sm:hidden text-[11px]">Buka</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Masuk ke project Supabase Anda dan buka menu <strong>SQL Editor</strong> &gt; <strong>New Query</strong>.
            </p>
          </div>

          {/* Step 2: Copy SQL Script */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs truncate">Salin & Tempel Skrip SQL</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                title="Salin Skrip SQL Lengkap"
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}</span>
                <span className="sm:hidden text-[11px]">{copied ? 'Tersalin' : 'Salin SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Tempel kode SQL di bawah ke dalam editor Supabase, lalu tekan tombol <strong>Run</strong> (atau tombol Play hijau).
            </p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 dark:bg-[#0a0b10] dark:text-slate-300 border border-slate-800 dark:border-[#1e2436] text-[10px] font-mono overflow-x-auto max-h-40 select-text leading-relaxed">
                {SUPABASE_SQL_DDL}
              </pre>
            </div>
          </div>

          {/* Step 3: Verify Connection */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs truncate">Verifikasi & Hubungkan</span>
              </div>
              <button
                type="button"
                disabled={isVerifying}
                onClick={handleVerify}
                title="Verifikasi status koneksi tabel Supabase"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isVerifying ? 'Memeriksa...' : 'Verifikasi Sekarang'}</span>
                <span className="sm:hidden text-[11px]">{isVerifying ? 'Cek...' : 'Verifikasi'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Setelah menjalankan skrip di Supabase, klik tombol di atas untuk memastikan tabel telah aktif dan data tersinkron.
            </p>
            {verifyMessage === 'error' && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                Tabel belum terdeteksi di Supabase. Pastikan skrip SQL sudah di-Run.
              </p>
            )}
            {verifyMessage === 'success' && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Koneksi berhasil! Database PostgreSQL Supabase aktif dan tersinkronisasi.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1e2436] flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#0a0b10]">
          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Host: <strong className="text-slate-900 dark:text-slate-200">PostgreSQL (Supabase)</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#1e2436] hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs cursor-pointer transition-colors"
          >
            Tutup Dialog
          </button>
        </div>
      </div>
    </div>
  );
};