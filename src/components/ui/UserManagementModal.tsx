'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { Users, UserPlus, Trash2, Shield, UserCheck, ShieldAlert, X } from 'lucide-react';
import { UserRole } from '@/types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTenant, allUsers, addUser, deleteUser, currentUser, tenants } = useFinance();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [tenantId, setTenantId] = useState(currentTenant.id);

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';

  // Filter users that current actor is allowed to manage
  const manageableUsers = allUsers.filter((u) => {
    if (isSuperadmin) return true;
    return u.tenant_id === currentTenant.id;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    await addUser({
      name,
      email,
      role,
      tenant_id: isSuperadmin ? tenantId : currentTenant.id,
    });

    setName('');
    setEmail('');
    setRole('user');
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
            <ShieldAlert className="w-3 h-3" /> Superadmin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold">
            <Shield className="w-3 h-3" /> Admin Scope
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
            <UserCheck className="w-3 h-3" /> User / Partner
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl p-4 sm:p-6 shadow-2xl max-h-[92dvh] flex flex-col"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#1e2436]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Manajemen Anggota
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                {isSuperadmin
                  ? 'Superadmin dapat mengelola user di semua scope'
                  : 'Kelola anggota dan pasangan dalam scope ini'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2436] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Form Create User */}
          <form
            onSubmit={handleCreate}
            className="p-3.5 sm:p-4 rounded-xl bg-[#0a0b10] border border-[#1e2436] space-y-3"
          >
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              Tambah Anggota Baru
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#12141d] border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="siti.partner@arthaflow.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#12141d] border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Peran / Role</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full bg-[#12141d] border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="user">User / Partner (Dibatasi Aturan Visibilitas)</option>
                  <option value="admin">Admin (Pemilik Scope)</option>
                  {isSuperadmin && <option value="superadmin">Superadmin (Global)</option>}
                </select>
              </div>

              {isSuperadmin ? (
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Scope Entitas / Tenant
                  </label>
                  <select
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full bg-[#12141d] border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.type})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Scope</label>
                  <input
                    type="text"
                    disabled
                    value={currentTenant.name}
                    className="w-full bg-[#12141d]/50 border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Tambahkan Akun
              </button>
            </div>
          </form>

          {/* User List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">
              Daftar Anggota ({manageableUsers.length})
            </h4>

            {/* Mobile View: Cards */}
            <div className="space-y-2 sm:hidden">
              {manageableUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-[#0a0b10] border border-[#1e2436] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="font-semibold text-xs text-slate-200 truncate">{u.name}</span>
                      {getRoleBadge(u.role)}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                  </div>
                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block border border-[#1e2436] rounded-xl overflow-hidden bg-[#0a0b10]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1e2436] text-[11px] text-slate-400 bg-[#12141d]">
                    <th className="py-2.5 px-3">PENGGUNA</th>
                    <th className="py-2.5 px-3">EMAIL</th>
                    <th className="py-2.5 px-3">ROLE</th>
                    <th className="py-2.5 px-3 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2436]">
                  {manageableUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#12141d]/50">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{u.name}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{u.email}</td>
                      <td className="py-2.5 px-3">{getRoleBadge(u.role)}</td>
                      <td className="py-2.5 px-3 text-center">
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#1e2436]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1e2436]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
