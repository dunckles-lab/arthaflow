'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import { ShieldCheck, History, Clock, User, Terminal } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141d] border border-[#1e2436] rounded-2xl w-full max-w-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2436]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Log Audit & Keamanan Sistem
              </h3>
              <p className="text-xs text-slate-400">
                Catatan riwayat seluruh aksi mutasi, otorisasi RBAC, dan perubahan konfigurasi
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 pr-1">
          <div className="space-y-2.5">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#0a0b10] border border-[#1e2436] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-[#12141d] border border-[#1e2436] text-slate-400 mt-0.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-200">
                          {log.action} : {log.entity.toUpperCase()}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#12141d] text-slate-400 border border-[#1e2436]">
                          {log.user_name} ({log.user_role})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{log.details}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-600">{log.ip_address}</span>
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
