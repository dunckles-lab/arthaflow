import { Tenant, User, Wallet, Category, Transaction, SavingsGoal, SavingsContribution, VisibilityRule, AuditLog } from '@/types';

export const initialTenants: Tenant[] = [
  {
    id: 't-household',
    name: 'Keluarga Utama',
    type: 'household',
    currency: 'IDR',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 't-personal',
    name: 'Dompet Pribadi',
    type: 'personal',
    currency: 'IDR',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 't-org',
    name: 'Organisasi / Usaha',
    type: 'organization',
    currency: 'IDR',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const initialUsers: User[] = [
  {
    id: 'u-superadmin',
    email: 'dunckles123@gmail.com',
    name: 'Ilham (Superadmin)',
    role: 'superadmin',
    tenant_id: 't-household',
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const initialWallets: Wallet[] = [
  {
    id: 'w-bca',
    tenant_id: 't-household',
    name: 'Bank BCA',
    type: 'bank',
    balance: 0,
    account_number: '',
    color: '#3b82f6',
    icon: 'landmark',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'w-mandiri',
    tenant_id: 't-household',
    name: 'Bank Mandiri',
    type: 'bank',
    balance: 0,
    account_number: '',
    color: '#eab308',
    icon: 'credit-card',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'w-cash',
    tenant_id: 't-household',
    name: 'Kas Tunai',
    type: 'cash',
    balance: 0,
    account_number: '',
    color: '#10b981',
    icon: 'wallet',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'w-gopay',
    tenant_id: 't-household',
    name: 'E-Wallet',
    type: 'e-wallet',
    balance: 0,
    account_number: '',
    color: '#06b6d4',
    icon: 'smartphone',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const defaultStandardCategories: Omit<Category, 'id' | 'tenant_id' | 'created_at'>[] = [
  // Pemasukan (Income)
  { name: 'Gaji Pokok & Upah', type: 'income', icon: 'badge-dollar-sign', color: '#10b981' },
  { name: 'Bonus & Tunjangan', type: 'income', icon: 'sparkles', color: '#06b6d4' },
  { name: 'Hasil Bisnis & Usaha', type: 'income', icon: 'briefcase', color: '#3b82f6' },
  { name: 'Freelance & Proyek Sampingan', type: 'income', icon: 'laptop', color: '#6366f1' },
  { name: 'Dividen & Hasil Investasi', type: 'income', icon: 'trending-up', color: '#8b5cf6' },
  { name: 'Hadiah, Hibah & THR', type: 'income', icon: 'gift', color: '#ec4899' },
  { name: 'Cashback & Pengembalian Dana', type: 'income', icon: 'rotate-ccw', color: '#14b8a6' },
  { name: 'Pendapatan Lain-lain', type: 'income', icon: 'coins', color: '#64748b' },

  // Pengeluaran (Expense)
  { name: 'Makanan & Kuliner', type: 'expense', icon: 'coffee', color: '#f97316', budget_limit: 2500000 },
  { name: 'Belanja Bulanan & Sembako', type: 'expense', icon: 'shopping-cart', color: '#f43f5e', budget_limit: 3000000 },
  { name: 'Tagihan Listrik, Air & Gas', type: 'expense', icon: 'zap', color: '#fbbf24', budget_limit: 1000000 },
  { name: 'Pulsa, Internet & Kuota', type: 'expense', icon: 'wifi', color: '#06b6d4', budget_limit: 500000 },
  { name: 'Bensin & Transportasi', type: 'expense', icon: 'car', color: '#8b5cf6', budget_limit: 1000000 },
  { name: 'Cicilan, Sewa & Pinjaman', type: 'expense', icon: 'credit-card', color: '#ef4444' },
  { name: 'Kesehatan & Obat-obatan', type: 'expense', icon: 'heart-pulse', color: '#10b981', budget_limit: 500000 },
  { name: 'Pendidikan, Kursus & Buku', type: 'expense', icon: 'book-open', color: '#3b82f6' },
  { name: 'Hiburan, Liburan & Hobi', type: 'expense', icon: 'film', color: '#a855f7', budget_limit: 800000 },
  { name: 'Zakat, Infaq & Sedekah', type: 'expense', icon: 'hand-heart', color: '#14b8a6' },
  { name: 'Perawatan Tubuh & Pakaian', type: 'expense', icon: 'sparkles', color: '#ec4899', budget_limit: 500000 },
  { name: 'Perlengkapan Rumah Tangga', type: 'expense', icon: 'home', color: '#d97706' },
  { name: 'Pengeluaran Tak Terduga', type: 'expense', icon: 'alert-circle', color: '#64748b' },
];

export const initialCategories: Category[] = defaultStandardCategories.map((cat, idx) => ({
  ...cat,
  id: `c-init-${idx + 1}`,
  tenant_id: 't-household',
  created_at: '2026-01-01T00:00:00Z',
}));

export const initialSavingsGoals: SavingsGoal[] = [];
export const initialContributions: SavingsContribution[] = [];
export const initialTransactions: Transaction[] = [];
export const initialVisibilityRules: VisibilityRule[] = [];
export const initialAuditLogs: AuditLog[] = [];
