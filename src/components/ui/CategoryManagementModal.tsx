'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import { Category } from '@/types';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Check,
} from 'lucide-react';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#fbbf24', // Amber
  '#64748b', // Slate
];

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { categories, addCategory, updateCategory, deleteCategory, currentUser } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#10b981');
  const [budgetLimit, setBudgetLimit] = useState('');

  if (!isOpen) return null;

  const canManage = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  const handleStartAdd = (selectedType: 'income' | 'expense') => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setType(selectedType);
    setColor(selectedType === 'income' ? '#10b981' : '#f43f5e');
    setBudgetLimit('');
  };

  const handleStartEdit = (cat: Category) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || '#10b981');
    setBudgetLimit(cat.budget_limit ? cat.budget_limit.toString() : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      await updateCategory(editingId, {
        name: name.trim(),
        type,
        color,
        budget_limit: budgetLimit ? parseFloat(budgetLimit) : undefined,
      });
    } else {
      await addCategory({
        name: name.trim(),
        type,
        color,
        icon: type === 'income' ? 'ArrowUpRight' : 'ArrowDownLeft',
        budget_limit: budgetLimit ? parseFloat(budgetLimit) : undefined,
      });
    }

    setIsEditing(false);
    setEditingId(null);
    setName('');
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Hapus kategori "${catName}"?`)) {
      await deleteCategory(id);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full sm:max-w-lg bg-[#12141d] border-t sm:border border-[#1e2436] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[#1e2436] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Manajemen Kategori</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Atur pos anggaran pemasukan dan pengeluaran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2436] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        {!isEditing && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <div className="flex-1 grid grid-cols-2 p-1 bg-[#0a0b10] border border-[#1e2436] rounded-xl gap-1">
              <button
                onClick={() => setActiveTab('expense')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Pengeluaran
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Pemasukan
              </button>
            </div>

            {canManage && (
              <button
                onClick={() => handleStartAdd(activeTab)}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden xs:inline">Tambah</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {isEditing ? (
            /* Form Create / Edit Category */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-[#0a0b10] border border-[#1e2436] rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">
                  {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Bulanan, Gaji, Makan & Minum"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipe</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Batas Anggaran (Opsional)
                  </label>
                  <input
                    type="number"
                    placeholder="Rp 0"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Warna Aksen Tag
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center ${
                        color === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1e2436] hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  {editingId ? 'Perbarui Kategori' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          ) : (
            /* Category List */
            <div className="space-y-2">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-[#0a0b10] border border-[#1e2436] hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || '#10b981' }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-200 truncate">
                          {cat.name}
                        </h4>
                        {cat.budget_limit ? (
                          <p className="text-[10px] text-slate-400">
                            Batas:{' '}
                            <span className="font-mono text-slate-300">
                              Rp {cat.budget_limit.toLocaleString('id-ID')}
                            </span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500">Tanpa limit bulanan</p>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 rounded-lg bg-[#12141d] hover:bg-[#1e2436] text-slate-400 hover:text-slate-200 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-lg bg-[#12141d] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  Belum ada kategori {activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
