export type UserRole = 'superadmin' | 'admin' | 'user';
export type ScopeType = 'personal' | 'household' | 'organization';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type PeriodType = 'daily' | 'monthly' | 'yearly' | 'custom';

export interface Tenant {
  id: string;
  name: string;
  type: ScopeType;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenant_id: string;
  avatar_url?: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  tenant_id: string;
  name: string;
  type: 'cash' | 'bank' | 'e-wallet' | 'investment';
  balance: number;
  account_number?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budget_limit?: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name?: string;
  type: TransactionType;
  amount: number;
  wallet_id: string;
  target_wallet_id?: string; // For transfers
  category_id?: string;
  category_name?: string;
  date: string; // ISO date YYYY-MM-DD
  notes: string;
  attachment_url?: string;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  tenant_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category?: string;
  color?: string;
  wallet_id?: string;
  is_completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsContribution {
  id: string;
  tenant_id: string;
  savings_goal_id: string;
  user_id: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface VisibilityRule {
  id: string;
  tenant_id: string;
  target_user_id: string;
  allowed_wallet_ids: string[]; // empty means all or restricted based on toggle
  allowed_category_ids: string[];
  can_view_all_transactions: boolean;
  can_view_savings: boolean;
  can_view_analytics: boolean;
  can_export_reports: boolean;
  can_manage_categories: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'CONFIG_CHANGE';
  entity: 'transaction' | 'savings' | 'wallet' | 'user' | 'visibility' | 'tenant';
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface PeriodFilterState {
  type: PeriodType;
  selectedDate: string; // YYYY-MM-DD
  selectedMonth: number; // 0-11
  selectedYear: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
