-- =========================================================
-- ARTHAFLOW: FINANCIAL MANAGEMENT SYSTEM POSTGRESQL SCHEMA
-- Target Database: Supabase PostgreSQL (Free Tier Compatible)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE (Scope Isolation)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('personal', 'household', 'organization')),
    currency VARCHAR(10) DEFAULT 'IDR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE (RBAC Multi-tenant)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'admin', 'user')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WALLETS / ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('cash', 'bank', 'e-wallet', 'investment')),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    account_number VARCHAR(100),
    color VARCHAR(50) DEFAULT '#10b981',
    icon VARCHAR(50) DEFAULT 'wallet',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50) DEFAULT 'tag',
    color VARCHAR(50) DEFAULT '#6366f1',
    budget_limit NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    target_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SAVINGS GOALS TABLE
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) DEFAULT 0.00,
    deadline DATE,
    category VARCHAR(100) DEFAULT 'Umum',
    color VARCHAR(50) DEFAULT '#3b82f6',
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SAVINGS CONTRIBUTIONS TABLE
CREATE TABLE IF NOT EXISTS savings_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    savings_goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VISIBILITY RULES (Admin Granular Control)
CREATE TABLE IF NOT EXISTS visibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    allowed_wallet_ids JSONB DEFAULT '[]'::jsonb,
    allowed_category_ids JSONB DEFAULT '[]'::jsonb,
    allowed_savings_goal_ids JSONB DEFAULT '[]'::jsonb,
    can_view_all_transactions BOOLEAN DEFAULT TRUE,
    can_view_savings BOOLEAN DEFAULT TRUE,
    can_view_analytics BOOLEAN DEFAULT TRUE,
    can_export_reports BOOLEAN DEFAULT FALSE,
    can_manage_categories BOOLEAN DEFAULT FALSE,
    can_manage_wallets BOOLEAN DEFAULT FALSE,
    can_manage_savings BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS (Security & Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TELEGRAM INTEGRATION & PAIRINGS TABLE
CREATE TABLE IF NOT EXISTS telegram_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id VARCHAR(100) UNIQUE NOT NULL,
    telegram_username VARCHAR(100),
    telegram_chat_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    default_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TELEGRAM PAIRING CODES (TEMPORARY OTP)
CREATE TABLE IF NOT EXISTS telegram_pairing_codes (
    code VARCHAR(10) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_savings_tenant ON savings_goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_bindings_user ON telegram_bindings(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_bindings_tg_user ON telegram_bindings(telegram_user_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_pairing_codes ENABLE ROW LEVEL SECURITY;

-- SAMPLE SEED DATA INSERTION (FOR INITIAL SETUP)
INSERT INTO tenants (id, name, type, currency) VALUES
('11111111-1111-1111-1111-111111111111', 'Keluarga Utama (Household)', 'household', 'IDR'),
('22222222-2222-2222-2222-222222222222', 'Keuangan Pribadi Ilham', 'personal', 'IDR'),
('33333333-3333-3333-3333-333333333333', 'Komunitas Developer & Tim', 'organization', 'IDR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, tenant_id, email, name, role) VALUES
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'dunckles123@gmail.com', 'Ilham (Superadmin)', 'superadmin'),
('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'admin.keluarga@arthaflow.id', 'Kepala Keluarga (Admin)', 'admin'),
('00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'partner.user@arthaflow.id', 'Pasangan / Partner (User)', 'user')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role;
