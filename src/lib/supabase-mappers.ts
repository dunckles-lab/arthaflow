import {
  Wallet,
  Category,
  Transaction,
  SavingsGoal,
  SavingsContribution,
  VisibilityRule,
  AuditLog,
  User,
  Tenant,
} from '@/types';

// ============================================================================
// SUPABASE DB MAPPERS (Pure Database Isolation - Zero LocalStorage Leakage)
// ============================================================================

export function toDbWallet(w: Partial<Wallet> & { tenant_id?: string; name?: string; type?: any }): any {
  const dbObj: any = {};
  if (w.id !== undefined) dbObj.id = w.id;
  if (w.tenant_id !== undefined) dbObj.tenant_id = w.tenant_id;
  if (w.name !== undefined) dbObj.name = w.name;
  if (w.type !== undefined) dbObj.type = w.type;
  if (w.balance !== undefined) dbObj.balance = Number(w.balance) || 0;
  dbObj.currency = 'IDR';
  if (w.account_number !== undefined) dbObj.account_number = w.account_number || null;
  if (w.color !== undefined) dbObj.color = w.color || 'emerald';
  if (w.created_at !== undefined) dbObj.created_at = w.created_at;
  return dbObj;
}

export function fromDbWallet(row: any): Wallet {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    type: row.type || 'bank',
    balance: Number(row.balance) || 0,
    account_number: row.account_number || '',
    color: row.color || 'emerald',
    icon: 'Landmark',
    is_active: true,
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function toDbCategory(c: Partial<Category> & { tenant_id?: string; name?: string; type?: any }): any {
  const dbObj: any = {};
  if (c.id !== undefined) dbObj.id = c.id;
  if (c.tenant_id !== undefined) dbObj.tenant_id = c.tenant_id;
  if (c.name !== undefined) dbObj.name = c.name;
  if (c.type !== undefined) dbObj.type = c.type;
  if (c.icon !== undefined) dbObj.icon = c.icon;
  if (c.color !== undefined) dbObj.color = c.color;
  if (c.budget_limit !== undefined) dbObj.budget_limit = c.budget_limit ? Number(c.budget_limit) : null;
  if (c.created_at !== undefined) dbObj.created_at = c.created_at;
  return dbObj;
}

export function fromDbCategory(row: any): Category {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    type: row.type || 'expense',
    icon: row.icon || 'Tag',
    color: row.color || 'slate',
    budget_limit: row.budget_limit ? Number(row.budget_limit) : undefined,
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function toDbTransaction(tx: Partial<Transaction> & { tenant_id?: string; user_id?: string; type?: any; amount?: number; wallet_id?: string }): any {
  const dbObj: any = {};
  if (tx.id !== undefined) dbObj.id = tx.id;
  if (tx.tenant_id !== undefined) dbObj.tenant_id = tx.tenant_id;
  if (tx.user_id !== undefined) dbObj.user_id = tx.user_id;
  if (tx.user_name !== undefined) dbObj.user_name = tx.user_name || null;
  if (tx.type !== undefined) dbObj.type = tx.type;
  if (tx.amount !== undefined) dbObj.amount = Number(tx.amount) || 0;
  if (tx.wallet_id !== undefined) dbObj.wallet_id = tx.wallet_id;
  if (tx.target_wallet_id !== undefined) dbObj.target_wallet_id = tx.target_wallet_id || null;
  if (tx.category_id !== undefined) dbObj.category_id = tx.category_id || null;
  if (tx.date !== undefined) dbObj.date = tx.date;
  if (tx.notes !== undefined) dbObj.notes = tx.notes || '';
  if (tx.attachment_url !== undefined) dbObj.receipt_url = tx.attachment_url || null;
  if (tx.created_at !== undefined) dbObj.created_at = tx.created_at;
  return dbObj;
}

export function fromDbTransaction(row: any): Transaction {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    user_id: row.user_id,
    user_name: row.user_name || '',
    type: row.type,
    amount: Number(row.amount) || 0,
    wallet_id: row.wallet_id,
    target_wallet_id: row.target_wallet_id || undefined,
    category_id: row.category_id || undefined,
    date: row.date || new Date().toISOString().split('T')[0],
    notes: row.notes || '',
    attachment_url: row.receipt_url || undefined,
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function toDbSavingsGoal(sg: Partial<SavingsGoal> & { tenant_id?: string; name?: string; target_amount?: number }): any {
  const dbObj: any = {};
  if (sg.id !== undefined) dbObj.id = sg.id;
  if (sg.tenant_id !== undefined) dbObj.tenant_id = sg.tenant_id;
  if (sg.name !== undefined) dbObj.name = sg.name;
  if (sg.target_amount !== undefined) dbObj.target_amount = Number(sg.target_amount) || 0;
  if (sg.current_amount !== undefined) dbObj.current_amount = Number(sg.current_amount) || 0;
  if (sg.deadline !== undefined) dbObj.target_date = sg.deadline;
  if (sg.category !== undefined) dbObj.category = sg.category || null;
  if (sg.color !== undefined) dbObj.color = sg.color || 'emerald';
  if (sg.is_completed !== undefined) dbObj.is_completed = Boolean(sg.is_completed);
  if (sg.created_at !== undefined) dbObj.created_at = sg.created_at;
  if (sg.updated_at !== undefined) dbObj.updated_at = sg.updated_at;
  return dbObj;
}

export function fromDbSavingsGoal(row: any): SavingsGoal {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    target_amount: Number(row.target_amount) || 0,
    current_amount: Number(row.current_amount) || 0,
    deadline: row.target_date || new Date().toISOString().split('T')[0],
    category: row.category || '',
    color: row.color || 'emerald',
    is_completed: Boolean(row.is_completed),
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export function toDbSavingsContribution(sc: Partial<SavingsContribution>): any {
  const dbObj: any = {};
  if (sc.id !== undefined) dbObj.id = sc.id;
  if (sc.tenant_id !== undefined) dbObj.tenant_id = sc.tenant_id;
  if (sc.savings_goal_id !== undefined) dbObj.savings_goal_id = sc.savings_goal_id;
  if (sc.user_id !== undefined) dbObj.user_id = sc.user_id;
  if (sc.amount !== undefined) dbObj.amount = Number(sc.amount) || 0;
  if (sc.date !== undefined) dbObj.date = sc.date;
  if (sc.notes !== undefined) dbObj.notes = sc.notes || null;
  if (sc.created_at !== undefined) dbObj.created_at = sc.created_at;
  return dbObj;
}

export function fromDbSavingsContribution(row: any): SavingsContribution {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    savings_goal_id: row.savings_goal_id,
    user_id: row.user_id,
    amount: Number(row.amount) || 0,
    date: row.date,
    notes: row.notes || '',
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function toDbVisibilityRule(vr: Partial<VisibilityRule>): any {
  const dbObj: any = {};
  if (vr.id !== undefined) dbObj.id = vr.id;
  if (vr.tenant_id !== undefined) dbObj.tenant_id = vr.tenant_id;
  if (vr.target_user_id !== undefined) dbObj.target_user_id = vr.target_user_id;
  if (vr.allowed_wallet_ids !== undefined) dbObj.allowed_wallet_ids = vr.allowed_wallet_ids || [];
  if (vr.allowed_category_ids !== undefined) dbObj.allowed_category_ids = vr.allowed_category_ids || [];
  if (vr.allowed_savings_goal_ids !== undefined) dbObj.allowed_savings_goal_ids = vr.allowed_savings_goal_ids || [];
  if (vr.can_view_all_transactions !== undefined) dbObj.can_view_all_transactions = Boolean(vr.can_view_all_transactions);
  if (vr.can_view_savings !== undefined) dbObj.can_view_savings = Boolean(vr.can_view_savings);
  if (vr.can_view_analytics !== undefined) dbObj.can_view_analytics = Boolean(vr.can_view_analytics);
  if (vr.can_export_reports !== undefined) dbObj.can_export_reports = Boolean(vr.can_export_reports);
  if (vr.can_manage_categories !== undefined) dbObj.can_manage_categories = Boolean(vr.can_manage_categories);
  if (vr.created_at !== undefined) dbObj.created_at = vr.created_at;
  if (vr.updated_at !== undefined) dbObj.updated_at = vr.updated_at;
  return dbObj;
}

export function fromDbVisibilityRule(row: any): VisibilityRule {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    target_user_id: row.target_user_id,
    allowed_wallet_ids: row.allowed_wallet_ids || [],
    allowed_category_ids: row.allowed_category_ids || [],
    allowed_savings_goal_ids: row.allowed_savings_goal_ids || [],
    can_view_all_transactions: row.can_view_all_transactions ?? true,
    can_view_savings: row.can_view_savings ?? true,
    can_view_analytics: row.can_view_analytics ?? true,
    can_export_reports: row.can_export_reports ?? true,
    can_manage_categories: row.can_manage_categories ?? false,
    can_manage_wallets: false,
    can_manage_savings: false,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export function toDbAuditLog(log: Partial<AuditLog>): any {
  const dbObj: any = {};
  if (log.id !== undefined) dbObj.id = log.id;
  if (log.tenant_id !== undefined) dbObj.tenant_id = log.tenant_id;
  if (log.user_id !== undefined) dbObj.user_id = log.user_id;
  if (log.user_name !== undefined) dbObj.user_name = log.user_name;
  if (log.action !== undefined) dbObj.action = log.action;
  if (log.entity !== undefined) dbObj.target_resource = log.entity;
  if (log.details !== undefined) dbObj.details = log.details;
  if (log.ip_address !== undefined) dbObj.ip_address = log.ip_address || null;
  if (log.created_at !== undefined) dbObj.created_at = log.created_at;
  return dbObj;
}

export function fromDbAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    user_id: row.user_id,
    user_name: row.user_name,
    user_role: 'user',
    action: row.action,
    entity: (row.target_resource || 'general') as any,
    details: row.details || '',
    ip_address: row.ip_address || '127.0.0.1',
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function toDbUser(u: Partial<User>): any {
  const dbObj: any = {};
  if (u.id !== undefined) dbObj.id = u.id;
  if (u.tenant_id !== undefined) dbObj.tenant_id = u.tenant_id;
  if (u.email !== undefined) dbObj.email = u.email.trim().toLowerCase();
  if (u.name !== undefined) dbObj.name = u.name;
  if (u.role !== undefined) {
    const r = u.role as string;
    dbObj.role = (r === 'superadmin' || r === 'admin') ? r : 'user';
  }
  if (u.avatar_url !== undefined) dbObj.avatar_url = u.avatar_url || null;
  if (u.created_at !== undefined) dbObj.created_at = u.created_at;
  return dbObj;
}

export function fromDbUser(row: any): User {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    email: row.email,
    name: row.name,
    role: row.role || 'user',
    avatar_url: row.avatar_url || undefined,
    created_at: row.created_at || new Date().toISOString(),
  };
}
