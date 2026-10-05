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

export const initialCategories: Category[] = [
  {
    id: 'c-gaji',
    tenant_id: 't-household',
    name: 'Gaji & Pendapatan Pokok',
    type: 'income',
    icon: 'badge-dollar-sign',
    color: '#10b981',
    budget_limit: 0,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c-bonus',
    tenant_id: 't-household',
    name: 'Bonus & Freelance',
    type: 'income',
    icon: 'sparkles',
    color: '#06b6d4',
    budget_limit: 0,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c-belanja',
    tenant_id: 't-household',
    name: 'Belanja & Kebutuhan Pokok',
    type: 'expense',
    icon: 'shopping-cart',
    color: '#f43f5e',
    budget_limit: 0,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c-tagihan',
    tenant_id: 't-household',
    name: 'Tagihan & Utilitas',
    type: 'expense',
    icon: 'zap',
    color: '#fbbf24',
    budget_limit: 0,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c-makan',
    tenant_id: 't-household',
    name: 'Makanan & Minuman',
    type: 'expense',
    icon: 'coffee',
    color: '#f97316',
    budget_limit: 0,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c-transport',
    tenant_id: 't-household',
    name: 'Transportasi',
    type: 'expense',
    icon: 'car',
    color: '#8b5cf6',
    budget_limit: 0,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const initialSavingsGoals: SavingsGoal[] = [];
export const initialContributions: SavingsContribution[] = [];
export const initialTransactions: Transaction[] = [];
export const initialVisibilityRules: VisibilityRule[] = [];
export const initialAuditLogs: AuditLog[] = [];
