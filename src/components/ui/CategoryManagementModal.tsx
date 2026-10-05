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
  RotateCcw,
} from 'lucide-react';
import { AmountInput } from './AmountInput';
import { ColorPickerInput } from './ColorPickerInput';
import { CustomSelect } from './CustomSelect';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    generateDefaultCategories,
    currentUser,
    userRule,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#10b981');
  const [budgetLimit, setBudgetLimit] = useState<number>(0);

  if (!isOpen) return null;

  const canManage =
    currentUser.role === 'admin' ||
    currentUser.role === 'superadmin' ||
    !!userRule?.can_manage_categories;

  const handleStartAdd = (selectedType: 'income' | 'expense') => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setType(selectedType);
    setColor(selectedType === 'income' ? '#10b981' : '#f43f5e');
    setBudgetLimit(0);
  };

  const handleStartEdit = (cat: Category) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || '#10b981');
    setBudgetLimit(cat.budget_limit || 0);
  };

  const handleGenerateDefaults = async () => {
    setIsGenerating(true);
    try {
      const count = await generateDefaultCategories();
      if (count > 0) {
        setGenMessage(`Berhasil menambahkan ${count} kategori standar!`);
      } else {
        setGenMessage('Semua kategori standar sudah tersedia.');
      }
      setTimeout(() => setGenMessage(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      await updateCategory(editingId, {
        name: name.trim(),
        type,
        color,
        budget_limit: budgetLimit > 0 ? budgetLimit : undefined,
      });
    } else {
      await addCategory({
        name: name.trim(),
        type,
        color,
        icon: type === 'income' ? 'ArrowUpRight' : 'ArrowDownLeft',
        budget_limit: budgetLimit > 0 ? budgetLimit : undefined,
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-[#12141d] border-t sm:border border-slate-200 dark:border-[#1e2436] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Mobile Drag Bar */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200 dark:border-[#1e2436] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Manajemen Kategori</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                Atur pos anggaran pemasukan dan pengeluaran
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

        {/* Success Alert Banner */}
        {genMessage && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{genMessage}</span>
          </div>
        )}

        {/* Tab Selection & Top Actions */}
        {!isEditing && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <div className="flex-1 grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl gap-1">
              <button
                onClick={() => setActiveTab('expense')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'expense'
                    ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Pengeluaran
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'income'
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Pemasukan
              </button>
            </div>

            {canManage && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleGenerateDefaults}
                  disabled={isGenerating}
                  className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Generate otomatis seluruh pos kategori standar (Gaji, Makanan, Tagihan, Transportasi, dsb.)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden sm:inline">Generate Standar</span>
                </button>

                <button
                  onClick={() => handleStartAdd(activeTab)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span className="hidden xs:inline">Tambah</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
          {isEditing ? (
            /* Form Create / Edit Category */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold">
                  {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Bulanan, Gaji, Makan & Minum"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tipe</label>
                <CustomSelect
                  value={type}
                  onChange={(val: any) => setType(val)}
                  options={[
                    { value: 'expense', label: 'Pengeluaran' },
                    { value: 'income', label: 'Pemasukan' },
                  ]}
                />
              </div>

              {/* AmountInput with Auto-Formatting & Terbilang */}
              <AmountInput
                value={budgetLimit}
                onChange={setBudgetLimit}
                label="Batas Anggaran Bulanan (Opsional)"
                colorScheme="purple"
                showPresets={true}
              />

              {/* ColorPickerInput */}
              <ColorPickerInput
                value={color}
                onChange={setColor}
                label="Warna Aksen Tag Kategori"
              />

              {/* Form Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-[#1e2436]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1e2436] dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
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
                    className="bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color || '#10b981' }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                          {cat.name}
                        </h4>
                        {cat.budget_limit ? (
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                            Batas: Rp {cat.budget_limit.toLocaleString('id-ID')}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">Tanpa limit bulanan</p>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 rounded-lg bg-white dark:bg-[#12141d] hover:bg-slate-200 dark:hover:bg-[#1e2436] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-transparent transition-colors cursor-pointer"
                          title="Edit Kategori"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-lg bg-white dark:bg-[#12141d] hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-transparent transition-colors cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-10 text-center px-4 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-dashed border-slate-200 dark:border-[#1e2436] space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200">
                      Belum Ada Kategori {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      Buat kategori baru secara manual atau generate 20+ pos kategori standar Indonesia secara otomatis.
                    </p>
                  </div>
                  {canManage && (
                    <button
                      onClick={handleGenerateDefaults}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Semua Kategori Standar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};