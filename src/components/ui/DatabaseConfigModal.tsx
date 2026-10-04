'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { Database, Check, Copy, ExternalLink, RefreshCw, Server } from 'lucide-react';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isLiveDbConnected, syncStatus, lastSyncTime, refreshData } = useFinance();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchemaSnippet = `-- Jalankan script ini di Supabase Dashboard -> SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('personal', 'household', 'organization')),
    currency VARCHAR(10) DEFAULT 'IDR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('cash', 'bank', 'e-wallet', 'investment')),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    color VARCHAR(50) DEFAULT '#6366f1',
    budget_limit NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    target_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) DEFAULT 0.00,
    deadline DATE,
    category VARCHAR(100) DEFAULT 'Umum',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    allowed_wallet_ids JSONB DEFAULT '[]'::jsonb,
    allowed_category_ids JSONB DEFAULT '[]'::jsonb,
    can_view_all_transactions BOOLEAN DEFAULT TRUE,
    can_view_savings BOOLEAN DEFAULT TRUE,
    can_view_analytics BOOLEAN DEFAULT TRUE,
    can_export_reports BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility_rules ENABLE ROW LEVEL SECURITY;
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2436]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Konektivitas Database Supabase & Realtime
              </h3>
              <p className="text-xs text-slate-400">
                Setup penyimpanan PostgreSQL cloud gratis dan sinkronisasi instan
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-[#0a0b10] border border-[#1e2436] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLiveDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              ></div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {isLiveDbConnected
                    ? 'Terhubung ke Supabase PostgreSQL Live'
                    : 'Mode Hybrid / Local State Aktif (Siap Pakai)'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isLiveDbConnected
                    ? 'Sinkronisasi Realtime WebSocket aktif'
                    : 'Aplikasi berjalan lancar secara lokal & siap tersambung ke Supabase saat ENV dimasukkan'}
                </p>
              </div>
            </div>

            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] text-slate-300 border border-[#1e2436] text-xs font-medium transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Ulang
            </button>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">
              Langkah Menghubungkan Akun Supabase Anda:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400 leading-relaxed">
              <li>Buka dashboard akun Supabase Anda di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>Buat project baru (Free tier), lalu buka menu <b>SQL Editor</b>.</li>
              <li>Salin script SQL di bawah ini dan klik <b>Run</b> untuk membuat tabel & relasi.</li>
              <li>Masuk ke <b>Project Settings &rarr; API</b>, salin <code>Project URL</code> dan <code>anon public key</code>.</li>
              <li>Tambahkan variabel environment di project Vercel atau file <code>.env.local</code>:
                <pre className="mt-1 p-2 bg-[#0a0b10] rounded border border-[#1e2436] text-slate-300 font-mono text-[10px]">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co&#10;NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
                </pre>
              </li>
            </ol>
          </div>

          {/* SQL Snippet Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                Skema SQL Supabase (PostgreSQL)
              </span>
              <button
                onClick={copySql}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin!' : 'Salin Semua SQL'}
              </button>
            </div>
            <pre className="max-h-48 overflow-y-auto p-3 bg-[#0a0b10] border border-[#1e2436] rounded-xl text-slate-300 font-mono text-[10px] leading-tight">
              {sqlSchemaSnippet}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#1e2436]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-[#1e2436]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
