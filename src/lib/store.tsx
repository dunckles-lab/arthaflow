'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Tenant,
  User,
  Wallet,
  Category,
  Transaction,
  SavingsGoal,
  SavingsContribution,
  VisibilityRule,
  AuditLog,
  PeriodFilterState,
  UserRole,
} from '@/types';
import {
  initialTenants,
  initialUsers,
  initialWallets,
  initialCategories,
  initialTransactions,
  initialSavingsGoals,
  initialContributions,
  initialVisibilityRules,
  initialAuditLogs,
} from './seed-data';
import { getSupabase, isSupabaseConfigured, signInWithGoogle, signOutSupabase } from './supabase';

interface FinanceContextType {
  // Current Scope & User
  currentTenant: Tenant;
  currentUser: User;
  tenants: Tenant[];
  users: User[];
  allUsers: User[];
  setCurrentTenant: (tenant: Tenant) => void;
  setCurrentUser: (user: User) => void;

  // Google SSO Auth
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authEmail: string | null;
  isAuthenticated: boolean;
  isAuthChecking: boolean;

  // Data Collections (Filtered by RBAC & Visibility)
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  savingsContributions: SavingsContribution[];
  visibilityRules: VisibilityRule[];
  userRule?: VisibilityRule;
  auditLogs: AuditLog[];

  // Period Filter State
  periodFilter: PeriodFilterState;
  setPeriodFilter: React.Dispatch<React.SetStateAction<PeriodFilterState>>;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'tenant_id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addWallet: (wallet: Omit<Wallet, 'id' | 'created_at' | 'tenant_id'>) => Promise<void>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'tenant_id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'tenant_id' | 'current_amount' | 'is_completed'>) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  depositToSavings: (goalId: string, amount: number, walletId: string, notes?: string) => Promise<void>;
  withdrawFromSavings: (goalId: string, amount: number, walletId: string, notes?: string) => Promise<void>;
  updateVisibilityRule: (rule: VisibilityRule) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'created_at'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Theme state
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // System & Connection State
  isLiveDbConnected: boolean;
  isDbSetupRequired: boolean;
  setIsDbSetupRequired: (val: boolean) => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncTime: Date | null;
  refreshData: () => Promise<void>;
  getVisibilityForUser: (userId: string) => VisibilityRule | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [currentTenant, setCurrentTenantState] = useState<Tenant>(initialTenants[0]);
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUserState] = useState<User>(initialUsers[0]);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  // Load theme preference on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('arthaflow_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', savedTheme === 'light' ? '#f8fafc' : '#0a0b10');
        }
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', '#0a0b10');
        }
      }
    } catch (e) {}
  }, []);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('arthaflow_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', newTheme === 'light' ? '#f8fafc' : '#0a0b10');
      }
    } catch (e) {}
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  // Listen to Supabase Auth State Change (Google SSO)
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      setIsAuthChecking(false);
      return;
    }

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthUser(session.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthChecking(false);
    }).catch(() => {
      setIsAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleAuthUser(session.user);
        setIsAuthenticated(true);
      } else {
        setAuthEmail(null);
        setIsAuthenticated(false);
      }
      setIsAuthChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthUser = (authUser: any) => {
    const email = authUser.email || '';
    setAuthEmail(email);
    setIsAuthenticated(true);
    const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split('@')[0];
    const avatar = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture;

    // If it is dunckles123@gmail.com, automatically promote to Superadmin
    const isOwner = email.toLowerCase() === 'dunckles123@gmail.com';

    setAllUsers((prevUsers) => {
      const existingUser = prevUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        const updated = {
          ...existingUser,
          role: isOwner ? ('superadmin' as UserRole) : existingUser.role,
          name: fullName || existingUser.name,
          avatar_url: avatar || existingUser.avatar_url,
        };
        setCurrentUserState(updated);
        return prevUsers.map((u) => (u.id === existingUser.id ? updated : u));
      } else {
        const newUser: User = {
          id: authUser.id || 'u-' + Date.now(),
          email,
          name: isOwner ? `${fullName} (Superadmin)` : fullName,
          role: isOwner ? 'superadmin' : 'user',
          tenant_id: currentTenant.id,
          avatar_url: avatar,
          created_at: new Date().toISOString(),
        };
        setCurrentUserState(newUser);
        return [...prevUsers, newUser];
      }
    });
  };

  const loginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await signOutSupabase();
    setAuthEmail(null);
    setIsAuthenticated(false);
    setCurrentUserState(initialUsers[0]);
  };

  const [rawWallets, setRawWallets] = useState<Wallet[]>(initialWallets);
  const [rawCategories, setRawCategories] = useState<Category[]>(initialCategories);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>(initialTransactions);
  const [rawSavingsGoals, setRawSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [rawContributions, setRawContributions] = useState<SavingsContribution[]>(initialContributions);
  const [rawVisibilityRules, setRawVisibilityRules] = useState<VisibilityRule[]>(initialVisibilityRules);
  const [rawAuditLogs, setRawAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const [isLiveDbConnected, setIsLiveDbConnected] = useState<boolean>(false);
  const [isDbSetupRequired, setIsDbSetupRequired] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  const today = new Date();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterState>({
    type: 'monthly',
    selectedDate: today.toISOString().split('T')[0],
    selectedMonth: today.getMonth(),
    selectedYear: today.getFullYear(),
    startDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  });

  // Purge legacy financial data from localStorage to ensure pure database persistence
  useEffect(() => {
    try {
      const keysToPurge = [
        'arthaflow_tenant',
        'arthaflow_user',
        'arthaflow_wallets',
        'arthaflow_categories',
        'arthaflow_transactions',
        'arthaflow_savings',
        'arthaflow_contributions',
        'arthaflow_visibility_rules',
        'arthaflow_audit_logs',
        'arthaflow_users',
      ];
      keysToPurge.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('LocalStorage cleanup skipped:', e);
    }
  }, []);

  // Check Supabase Live Connection and Realtime Subscriptions
  const refreshData = useCallback(async () => {
    setSyncStatus('syncing');
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      setIsLiveDbConnected(false);
      setIsDbSetupRequired(true);
      setSyncStatus('offline');
      setLastSyncTime(new Date());
      return;
    }

    try {
      // 1. Probe tenants table to detect if tables exist in Supabase
      const { data: tenantCheck, error: tenantErr } = await supabase
        .from('tenants')
        .select('id')
        .limit(1);

      if (tenantErr) {
        console.warn('Supabase schema missing or inaccessible:', tenantErr.message);
        setIsLiveDbConnected(false);
        setIsDbSetupRequired(true);
        setSyncStatus('offline');
        return;
      }

      // If probe passes, schema is active
      setIsLiveDbConnected(true);
      setIsDbSetupRequired(false);

      // 2. Fetch all collections from Supabase
      const [
        { data: txData },
        { data: walletData },
        { data: catData },
        { data: savData },
        { data: contribData },
        { data: rulesData },
        { data: usersData },
        { data: logsData }
      ] = await Promise.all([
        supabase.from('transactions').select('*').eq('tenant_id', currentTenant.id).order('date', { ascending: false }),
        supabase.from('wallets').select('*').eq('tenant_id', currentTenant.id),
        supabase.from('categories').select('*').eq('tenant_id', currentTenant.id),
        supabase.from('savings_goals').select('*').eq('tenant_id', currentTenant.id),
        supabase.from('savings_contributions').select('*').eq('tenant_id', currentTenant.id).order('date', { ascending: false }),
        supabase.from('visibility_rules').select('*').eq('tenant_id', currentTenant.id),
        supabase.from('users').select('*').eq('tenant_id', currentTenant.id),
        supabase.from('audit_logs').select('*').eq('tenant_id', currentTenant.id).order('created_at', { ascending: false }).limit(50),
      ]);

      if (txData !== null && txData !== undefined) setRawTransactions(txData);
      if (walletData !== null && walletData !== undefined) setRawWallets(walletData);
      if (catData !== null && catData !== undefined) setRawCategories(catData);
      if (savData !== null && savData !== undefined) setRawSavingsGoals(savData);
      if (contribData !== null && contribData !== undefined) setRawContributions(contribData);
      if (rulesData !== null && rulesData !== undefined) setRawVisibilityRules(rulesData);
      if (usersData !== null && usersData !== undefined && usersData.length > 0) setAllUsers(usersData);
      if (logsData !== null && logsData !== undefined) setRawAuditLogs(logsData);

      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Supabase fetch failed:', err);
      setIsLiveDbConnected(false);
      setIsDbSetupRequired(true);
      setSyncStatus('offline');
    }
  }, [currentTenant.id]);

  // Supabase Realtime Channel & Polling
  useEffect(() => {
    refreshData();
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const channel = supabase
        .channel('arthaflow-realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          refreshData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const interval = setInterval(() => {
      setLastSyncTime(new Date());
    }, 20000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Log Audit Action
  const logAudit = (
    action: AuditLog['action'],
    entity: AuditLog['entity'],
    details: string
  ) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      tenant_id: currentTenant.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      action,
      entity,
      details,
      ip_address: '127.0.0.1 (Client)',
      created_at: new Date().toISOString(),
    };
    setRawAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper: Get user's visibility rule
  const getVisibilityForUser = (userId: string): VisibilityRule | undefined => {
    return rawVisibilityRules.find((r) => r.target_user_id === userId && r.tenant_id === currentTenant.id);
  };

  // Apply RBAC and Granular Visibility Filtering
  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';
  const userRule = getVisibilityForUser(currentUser.id);

  // Wallets visible
  const visibleWallets = rawWallets.filter((w) => {
    if (isSuperadmin) return true;
    if (w.tenant_id !== currentTenant.id) return false;
    if (isAdmin) return true;
    // For normal user: check visibility rule
    if (userRule && userRule.allowed_wallet_ids && userRule.allowed_wallet_ids.length > 0) {
      return userRule.allowed_wallet_ids.includes(w.id);
    }
    return true;
  });

  // Categories visible
  const visibleCategories = rawCategories.filter((c) => {
    if (isSuperadmin) return true;
    if (c.tenant_id !== currentTenant.id) return false;
    if (isAdmin) return true;
    if (userRule && userRule.allowed_category_ids && userRule.allowed_category_ids.length > 0) {
      return userRule.allowed_category_ids.includes(c.id);
    }
    return true;
  });

  // Transactions visible
  const visibleTransactions = rawTransactions.filter((tx) => {
    if (isSuperadmin) return true;
    if (tx.tenant_id !== currentTenant.id) return false;
    if (isAdmin) return true;
    if (userRule && !userRule.can_view_all_transactions) {
      return tx.user_id === currentUser.id;
    }
    // Filter by allowed wallets/categories if configured
    if (userRule && userRule.allowed_wallet_ids && userRule.allowed_wallet_ids.length > 0) {
      if (!userRule.allowed_wallet_ids.includes(tx.wallet_id)) return false;
    }
    return true;
  });

  // Savings goals visible
  const visibleSavingsGoals = rawSavingsGoals.filter((sg) => {
    if (isSuperadmin) return true;
    if (sg.tenant_id !== currentTenant.id) return false;
    if (isAdmin) return true;
    if (userRule && userRule.can_view_savings === false) return false;
    if (userRule && userRule.allowed_savings_goal_ids && userRule.allowed_savings_goal_ids.length > 0) {
      return userRule.allowed_savings_goal_ids.includes(sg.id);
    }
    return true;
  });

  // Users in current tenant
  const tenantUsers = allUsers.filter((u) => isSuperadmin || u.tenant_id === currentTenant.id);

  // ==========================================
  // MUTATION HANDLERS
  // ==========================================

  const addTransaction = async (txData: Omit<Transaction, 'id' | 'created_at' | 'tenant_id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      tenant_id: currentTenant.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      created_at: new Date().toISOString(),
    };

    // Update wallet balance
    setRawWallets((prev) =>
      prev.map((w) => {
        if (w.id === txData.wallet_id) {
          if (txData.type === 'income') {
            return { ...w, balance: w.balance + txData.amount };
          } else if (txData.type === 'expense' || txData.type === 'transfer') {
            return { ...w, balance: Math.max(0, w.balance - txData.amount) };
          }
        }
        if (txData.type === 'transfer' && w.id === txData.target_wallet_id) {
          return { ...w, balance: w.balance + txData.amount };
        }
        return w;
      })
    );

    setRawTransactions((prev) => [newTx, ...prev]);
    logAudit(
      'CREATE',
      'transaction',
      `Mencatat transaksi ${txData.type.toUpperCase()}: ${txData.notes || 'Tanpa catatan'} senilai Rp ${txData.amount.toLocaleString('id-ID')}`
    );

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('transactions').insert([newTx]);
      } catch (err) {
        console.warn('Supabase insert transaction fallback:', err);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    const txToDelete = rawTransactions.find((t) => t.id === id);
    if (!txToDelete) return;

    // Rollback wallet balance
    setRawWallets((prev) =>
      prev.map((w) => {
        if (w.id === txToDelete.wallet_id) {
          if (txToDelete.type === 'income') {
            return { ...w, balance: Math.max(0, w.balance - txToDelete.amount) };
          } else if (txToDelete.type === 'expense') {
            return { ...w, balance: w.balance + txToDelete.amount };
          }
        }
        return w;
      })
    );

    setRawTransactions((prev) => prev.filter((t) => t.id !== id));
    logAudit('DELETE', 'transaction', `Menghapus transaksi ID ${id}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete transaction fallback:', err);
      }
    }
  };

  const addWallet = async (walletData: Omit<Wallet, 'id' | 'created_at' | 'tenant_id'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: 'w-' + Date.now(),
      tenant_id: currentTenant.id,
      created_at: new Date().toISOString(),
    };
    setRawWallets((prev) => [...prev, newWallet]);
    logAudit('CREATE', 'wallet', `Menambahkan rekening/dompet baru: ${walletData.name}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('wallets').insert([newWallet]);
      } catch (err) {
        console.warn('Supabase insert wallet error:', err);
      }
    }
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    setRawWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
    logAudit('UPDATE', 'wallet', `Memperbarui rekening ID ${id}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('wallets').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update wallet error:', err);
      }
    }
  };

  const deleteWallet = async (id: string) => {
    setRawWallets((prev) => prev.filter((w) => w.id !== id));
    logAudit('DELETE', 'wallet', `Menghapus dompet/rekening ID ${id}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('wallets').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete wallet error:', err);
      }
    }
  };

  const addCategory = async (catData: Omit<Category, 'id' | 'created_at' | 'tenant_id'>) => {
    const newCat: Category = {
      ...catData,
      id: 'c-' + Date.now(),
      tenant_id: currentTenant.id,
      created_at: new Date().toISOString(),
    };
    setRawCategories((prev) => [...prev, newCat]);
    logAudit('CREATE', 'category' as any, `Menambahkan kategori: ${catData.name}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').insert([newCat]);
      } catch (err) {
        console.warn('Supabase insert category error:', err);
      }
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setRawCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAudit('UPDATE', 'category' as any, `Memperbarui kategori ID ${id}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update category error:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setRawCategories((prev) => prev.filter((c) => c.id !== id));
    logAudit('DELETE', 'category' as any, `Menghapus kategori ID ${id}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete category error:', err);
      }
    }
  };

  const addSavingsGoal = async (
    goalData: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'tenant_id' | 'current_amount' | 'is_completed'>
  ) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: 'sg-' + Date.now(),
      tenant_id: currentTenant.id,
      current_amount: 0,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRawSavingsGoals((prev) => [...prev, newGoal]);
    logAudit('CREATE', 'savings', `Membuat target tabungan baru: ${goalData.name}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('savings_goals').insert([newGoal]);
      } catch (err) {
        console.warn('Supabase insert savings goal error:', err);
      }
    }
  };

  const depositToSavings = async (
    goalId: string,
    amount: number,
    walletId: string,
    notes?: string
  ) => {
    // 1. Deduct from wallet
    setRawWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: Math.max(0, w.balance - amount) } : w))
    );

    // 2. Add contribution record
    const contribution: SavingsContribution = {
      id: 'sc-' + Date.now(),
      tenant_id: currentTenant.id,
      savings_goal_id: goalId,
      user_id: currentUser.id,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes: notes || 'Setoran tabungan',
      created_at: new Date().toISOString(),
    };
    setRawContributions((prev) => [contribution, ...prev]);

    // 3. Update savings goal current amount
    let updatedGoal: SavingsGoal | null = null;
    setRawSavingsGoals((prev) =>
      prev.map((sg) => {
        if (sg.id === goalId) {
          const newCurrent = sg.current_amount + amount;
          updatedGoal = {
            ...sg,
            current_amount: newCurrent,
            is_completed: newCurrent >= sg.target_amount,
            updated_at: new Date().toISOString(),
          };
          return updatedGoal;
        }
        return sg;
      })
    );

    // 4. Log transaction as expense / savings allocation
    const goalObj = rawSavingsGoals.find((g) => g.id === goalId);
    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      tenant_id: currentTenant.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      type: 'expense',
      amount,
      wallet_id: walletId,
      notes: `Alokasi Tabungan: ${goalObj?.name || 'Target Tabungan'}`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    setRawTransactions((prev) => [tx, ...prev]);

    logAudit('UPDATE', 'savings', `Setoran tabungan ${goalObj?.name || ''} sebesar Rp ${amount.toLocaleString('id-ID')}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('savings_contributions').insert([contribution]);
        if (updatedGoal) {
          await supabase.from('savings_goals').update(updatedGoal).eq('id', goalId);
        }
        await supabase.from('transactions').insert([tx]);
        const updatedWallet = rawWallets.find((w) => w.id === walletId);
        if (updatedWallet) {
          await supabase.from('wallets').update({ balance: Math.max(0, updatedWallet.balance - amount) }).eq('id', walletId);
        }
      } catch (err) {
        console.warn('Supabase deposit sync error:', err);
      }
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    setRawSavingsGoals((prev) =>
      prev.map((sg) => {
        if (sg.id === id) {
          const updated = { ...sg, ...updates, updated_at: new Date().toISOString() };
          if (updates.target_amount !== undefined || updates.current_amount !== undefined) {
            const cur = updates.current_amount !== undefined ? updates.current_amount : updated.current_amount;
            const tgt = updates.target_amount !== undefined ? updates.target_amount : updated.target_amount;
            updated.is_completed = cur >= tgt;
          }
          return updated;
        }
        return sg;
      })
    );
    logAudit('UPDATE', 'savings', `Memperbarui target tabungan ID: ${id}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('savings_goals').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update savings error:', err);
      }
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    setRawSavingsGoals((prev) => prev.filter((sg) => sg.id !== id));
    logAudit('DELETE', 'savings', `Menghapus target tabungan ID: ${id}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('savings_goals').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete savings error:', err);
      }
    }
  };

  const withdrawFromSavings = async (
    goalId: string,
    amount: number,
    walletId: string,
    notes?: string
  ) => {
    // 1. Add back to wallet
    setRawWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: w.balance + amount } : w))
    );

    // 2. Reduce savings goal current amount
    setRawSavingsGoals((prev) =>
      prev.map((sg) => {
        if (sg.id === goalId) {
          const newCurrent = Math.max(0, sg.current_amount - amount);
          return {
            ...sg,
            current_amount: newCurrent,
            is_completed: newCurrent >= sg.target_amount,
            updated_at: new Date().toISOString(),
          };
        }
        return sg;
      })
    );

    // 3. Log transaction as income / savings withdrawal
    const goalObj = rawSavingsGoals.find((g) => g.id === goalId);
    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      tenant_id: currentTenant.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      type: 'income',
      amount,
      wallet_id: walletId,
      notes: `Penarikan Tabungan: ${goalObj?.name || 'Target Tabungan'} (${notes || 'Tarik dana'})`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    setRawTransactions((prev) => [tx, ...prev]);

    logAudit('UPDATE', 'savings', `Penarikan tabungan ${goalObj?.name || ''} sebesar Rp ${amount.toLocaleString('id-ID')}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('transactions').insert([tx]);
        const updatedGoal = rawSavingsGoals.find((g) => g.id === goalId);
        if (updatedGoal) {
          const newCurrent = Math.max(0, updatedGoal.current_amount - amount);
          await supabase.from('savings_goals').update({ current_amount: newCurrent, is_completed: newCurrent >= updatedGoal.target_amount }).eq('id', goalId);
        }
        const updatedWallet = rawWallets.find((w) => w.id === walletId);
        if (updatedWallet) {
          await supabase.from('wallets').update({ balance: updatedWallet.balance + amount }).eq('id', walletId);
        }
      } catch (err) {
        console.warn('Supabase withdraw sync error:', err);
      }
    }
  };

  const updateVisibilityRule = async (rule: VisibilityRule) => {
    setRawVisibilityRules((prev) => {
      const index = prev.findIndex((r) => r.target_user_id === rule.target_user_id && r.tenant_id === rule.tenant_id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...rule, updated_at: new Date().toISOString() };
        return updated;
      }
      return [...prev, { ...rule, id: 'vr-' + Date.now(), updated_at: new Date().toISOString() }];
    });

    const targetUser = allUsers.find((u) => u.id === rule.target_user_id);
    logAudit(
      'CONFIG_CHANGE',
      'visibility',
      `Admin memperbarui hak visibilitas data untuk user: ${targetUser?.name || rule.target_user_id}`
    );

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('visibility_rules').upsert([rule]);
      } catch (err) {
        console.warn('Supabase visibility rule error:', err);
      }
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'created_at'>) => {
    const newUser: User = {
      ...userData,
      id: 'u-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setAllUsers((prev) => [...prev, newUser]);

    // Create default visibility rule for user
    const defaultRule: VisibilityRule = {
      id: 'vr-' + Date.now(),
      tenant_id: userData.tenant_id,
      target_user_id: newUser.id,
      allowed_wallet_ids: [],
      allowed_category_ids: [],
      can_view_all_transactions: true,
      can_view_savings: true,
      can_view_analytics: true,
      can_export_reports: true,
      can_manage_categories: false,
      can_manage_wallets: false,
      can_manage_savings: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRawVisibilityRules((prev) => [...prev, defaultRule]);

    logAudit('CREATE', 'user', `Menambahkan akun anggota/partner baru: ${userData.name} (${userData.role})`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('users').insert([newUser]);
        await supabase.from('visibility_rules').insert([defaultRule]);
      } catch (err) {
        console.warn('Supabase add user error:', err);
      }
    }
  };

  const deleteUser = async (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    setRawVisibilityRules((prev) => prev.filter((r) => r.target_user_id !== userId));
    logAudit('DELETE', 'user', `Menghapus akses user ID: ${userId}`);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('users').delete().eq('id', userId);
        await supabase.from('visibility_rules').delete().eq('target_user_id', userId);
      } catch (err) {
        console.warn('Supabase delete user error:', err);
      }
    }
  };

  const setCurrentTenant = (tenant: Tenant) => {
    setCurrentTenantState(tenant);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
  };

  return (
    <FinanceContext.Provider
      value={{
        currentTenant,
        currentUser,
        tenants,
        users: tenantUsers,
        allUsers,
        setCurrentTenant,
        setCurrentUser,
        loginWithGoogle,
        logout,
        authEmail,
        isAuthenticated,
        isAuthChecking,
        wallets: visibleWallets,
        categories: visibleCategories,
        transactions: visibleTransactions,
        savingsGoals: visibleSavingsGoals,
        savingsContributions: rawContributions,
        visibilityRules: rawVisibilityRules,
        userRule,
        auditLogs: rawAuditLogs,
        periodFilter,
        setPeriodFilter,
        addTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        addCategory,
        updateCategory,
        deleteCategory,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        depositToSavings,
        withdrawFromSavings,
        updateVisibilityRule,
        addUser,
        deleteUser,
        theme,
        setTheme,
        toggleTheme,
        isLiveDbConnected,
        isDbSetupRequired,
        setIsDbSetupRequired,
        syncStatus,
        lastSyncTime,
        refreshData,
        getVisibilityForUser,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
