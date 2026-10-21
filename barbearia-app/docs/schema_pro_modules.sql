-- =====================================================================
-- BARBERON PRO - COMPLEMENTO DOS MÓDULOS PRO (ESTOQUE, FINANCEIRO, PROMOÇÕES, AVALIAÇÕES)
-- =====================================================================

-- 6. Tabela de Produtos / Estoque (Módulo PRO)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    category VARCHAR(60) DEFAULT 'pomada',
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Promoções / Cupons (Módulo PRO)
CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_percentage INTEGER NOT NULL DEFAULT 10,
    coupon_code VARCHAR(50),
    valid_until DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Transações Financeiras / Despesas / Receitas (Módulo PRO)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    appointment_id VARCHAR(36) REFERENCES appointments(id) ON DELETE SET NULL,
    barber_id VARCHAR(36) REFERENCES barbers(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL, -- 'receita', 'despesa', 'comissao'
    category VARCHAR(60) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'pix',
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabela de Avaliações / Reviews dos Clientes (Módulo PRO)
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    barber_id VARCHAR(36) REFERENCES barbers(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela de Notificações / Lembretes WhatsApp
CREATE TABLE IF NOT EXISTS reminder_notifications (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    appointment_id VARCHAR(36) REFERENCES appointments(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    message_text TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
