'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/lib/store';
import {
  X,
  Send,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  HelpCircle,
  RefreshCw,
  Database,
} from 'lucide-react';

interface TelegramIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramIntegrationModal: React.FC<TelegramIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, currentTenant } = useFinance();
  const [displayCode, setDisplayCode] = useState<string>('');
  const [deepLinkCode, setDeepLinkCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [bindingInfo, setBindingInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pairing' | 'commands'>('pairing');

  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'agen_arthabot';

  const checkPairingStatus = async () => {
    try {
      const res = await fetch(`/api/bot/pair?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.isPaired) {
        setIsPaired(true);
        setBindingInfo(data.binding);
      } else {
        setIsPaired(false);
      }
    } catch (e) {
      console.warn('Check pairing error:', e);
    }
  };

  const generatePairingCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          tenantId: currentTenant.id,
        }),
      });
      const data = await res.json();
      if (data.code) {
        setDeepLinkCode(data.code);
        setDisplayCode(data.shortCode || data.code);
      }
    } catch (e) {
      console.error('Failed to generate pairing code:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkPairingStatus();
      generatePairingCode();
    }
  }, [isOpen, currentUser.id, currentTenant.id]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    const textToCopy = displayCode ? `/pair ${displayCode}` : '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const telegramDeepLink = `https://t.me/${botUsername}?start=${displayCode || deepLinkCode}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e2436] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Integrasi Bot Telegram
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono">
                  Gateway
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pencatatan mutasi kilat tanpa perlu buka website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e2436] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: Pairing / Panduan */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('pairing')}
            className={`py-2 px-3 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pairing'
                ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Hubungkan Akun
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('commands')}
            className={`py-2 px-3 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'commands'
                ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Contoh Format Catatan
          </button>
        </div>

        {activeTab === 'pairing' ? (
          <div className="space-y-4">
            {/* Status Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isPaired ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {isPaired ? 'Telegram Terhubung' : 'Belum Terhubung'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {isPaired && bindingInfo
                      ? `@${bindingInfo.telegram_username || 'user'} • ID: ${bindingInfo.telegram_user_id}`
                      : 'Kirim kode pairing untuk menghubungkan'}
                  </p>
                </div>
              </div>
              <button
                onClick={checkPairingStatus}
                className="p-1.5 rounded-lg bg-white dark:bg-[#161926] hover:bg-slate-100 dark:hover:bg-[#1e2436] border border-slate-200 dark:border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* OTP Code Generator */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#161926] dark:to-[#0a0b10] border border-slate-200 dark:border-[#1e2436] text-center space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Kode Pairing Anda
              </span>

              <div className="flex items-center justify-center gap-2">
                <div className="font-mono text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 bg-white dark:bg-[#0a0b10] px-4 py-2 rounded-xl border border-sky-200 dark:border-sky-500/30 tracking-widest shadow-inner">
                  {loading ? '...' : displayCode || 'AF-______'}
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-3 rounded-xl bg-white dark:bg-[#1e2436] hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-200 transition-all active:scale-95 cursor-pointer"
                  title="Salin Perintah Pairing"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Salin <code>/pair {displayCode}</code> lalu kirimkan ke Telegram <b>@{botUsername}</b>, atau klik tombol di bawah untuk aktivasi instan:
              </p>

              {/* Direct Open Button */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={telegramDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Buka Bot & Pairing Otomatis
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={generatePairingCode}
                  disabled={loading}
                  className="py-3 px-4 rounded-xl bg-white dark:bg-[#1e2436] hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Kode Baru
                </button>
              </div>
            </div>

            {/* Scope Info */}
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0a0b10] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1e2436]">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Target Sinkronisasi
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Semua mutasi yang dicatat via bot otomatis masuk ke ruang buku <b>{currentTenant.name}</b> sebagai <b>{currentUser.name}</b>.
              </p>
            </div>
          </div>
        ) : (
          /* Commands & Syntax Cheat Sheet */
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436]">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 1. Pengeluaran (Expense)
              </span>
              <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <p className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  keluar 50rb makan siang bca
                </p>
                <p className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  beli kopi 25k cash
                </p>
                <p className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  byr listrik 350.000 mandiri
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436]">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 2. Pemasukan (Income)
              </span>
              <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <p className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  masuk 5jt gaji bca
                </p>
                <p className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  terima 500k refund tiket cash
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436]">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 3. Transfer Saldo
              </span>
              <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <p className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  tf 100k bca ke gopay
                </p>
                <p className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  transfer 500rb mandiri ovo
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436]">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> 4. Perintah Cepat
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  <code>/saldo</code> &rarr; Cek saldo
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#1e2436]">
                  <code>/rekap</code> &rarr; Rekap hari ini
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
