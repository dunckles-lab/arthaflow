'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import { History, Clock, Terminal, X } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#12141d] border-t sm:border border-slate-200 dark:border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full max-w-3xl p-4 sm:p-6 shadow-2xl max-h-[92dvh] flex flex-col"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e2436]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Log Audit & Keamanan Sistem
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Catatan riwayat seluruh mutasi dan perubahan konfigurasi
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

        <div className="flex-1 overflow-y-auto py-4 pr-1">
          <div className="space-y-2">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] text-slate-500 dark:text-slate-400 mt-0.5 shrink-0">
                      <Terminal className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-mono">
                          {log.action} : {log.entity.toUpperCase()}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white dark:bg-[#12141d] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1e2436]">
                          {log.user_name} ({log.user_role})
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{log.details}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-[#1e2436]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">{log.ip_address}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Belum ada catatan aktivitas audit
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1e2436]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2436] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
