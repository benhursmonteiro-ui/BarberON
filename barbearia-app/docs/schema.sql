-- =====================================================================
-- BARBERON PRO - SCHEMA RELACIONAL INICIAL (PostgreSQL / MySQL / SQLite)
-- Modelagem completa para múltiplos barbeiros, financeiro, clientes e agenda
-- =====================================================================

-- 1. Tabela de Barbearias (Multi-tenancy / Dados do Estabelecimento)
CREATE TABLE barbershops (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    cnpj_cpf VARCHAR(20),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    plan VARCHAR(20) DEFAULT 'PRO', -- 'FREE' ou 'PRO'
    open_hours VARCHAR(100) DEFAULT '09:00 às 20:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Barbeiros (Múltiplos Barbeiros no Plano PRO)
CREATE TABLE barbers (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120),
    avatar_url TEXT,
    specialty VARCHAR(150),
    commission_rate DECIMAL(5,2) DEFAULT 50.00, -- Ex: 50.00% de comissão por corte
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_barbers_barbershop ON barbers(barbershop_id);

-- 3. Tabela de Horários de Atendimento dos Barbeiros (Jornada semanal)
CREATE TABLE barber_schedules (
    id VARCHAR(36) PRIMARY KEY,
    barber_id VARCHAR(36) NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL, -- 0 (Domingo) a 6 (Sábado)
    start_time TIME NOT NULL,      -- Ex: 09:00:00
    end_time TIME NOT NULL,        -- Ex: 19:00:00
    lunch_start TIME,              -- Ex: 12:00:00
    lunch_end TIME,                -- Ex: 13:00:00
    is_working BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_barber_day UNIQUE (barber_id, day_of_week)
);

-- 4. Tabela de Bloqueios de Horários / Folgas
CREATE TABLE schedule_blocks (
    id VARCHAR(36) PRIMARY KEY,
    barber_id VARCHAR(36) NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedule_blocks_date ON schedule_blocks(barber_id, date);

-- 5. Tabela de Serviços
CREATE TABLE services (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) DEFAULT 'cabelo', -- 'cabelo', 'barba', 'combo', 'tratamento'
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_barbershop ON services(barbershop_id);

-- 6. Tabela de Clientes
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120),
    notes TEXT, -- Observações técnicas: degradê navalhado, alergia a gilete, etc.
    total_visits INTEGER DEFAULT 0,
    last_visit DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_phone UNIQUE (barbershop_id, phone)
);

CREATE INDEX idx_customers_phone ON customers(phone);

-- 7. Tabela de Agendamentos (Agenda Completa)
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    barber_id VARCHAR(36) NOT NULL REFERENCES barbers(id) ON DELETE RESTRICT,
    service_id VARCHAR(36) NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmado', -- 'pendente', 'confirmado', 'concluido', 'cancelado'
    total_amount DECIMAL(10,2) NOT NULL,
    barber_commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_date ON appointments(barbershop_id, date);
CREATE INDEX idx_appointments_barber_date ON appointments(barber_id, date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);

-- 8. Tabela de Transações Financeiras (Fluxo de Caixa & Despesas)
CREATE TABLE financial_transactions (
    id VARCHAR(36) PRIMARY KEY,
    barbershop_id VARCHAR(36) NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    appointment_id VARCHAR(36) REFERENCES appointments(id) ON DELETE SET NULL,
    barber_id VARCHAR(36) REFERENCES barbers(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'receita', 'despesa', 'comissao'
    category VARCHAR(60) NOT NULL, -- 'servico', 'produtos', 'aluguel', 'energia', 'comissao', 'outros'
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'pix', -- 'pix', 'cartao_credito', 'cartao_debito', 'dinheiro'
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_date ON financial_transactions(barbershop_id, date);

-- 9. Tabela de Fila de Lembretes / WhatsApp
CREATE TABLE reminder_notifications (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- 'confirmacao_imediata', 'lembrete_24h', 'lembrete_2h', 'pos_venda'
    status VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'enviado', 'cancelado'
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_status_sched ON reminder_notifications(status, scheduled_for);
