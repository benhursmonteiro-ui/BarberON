export type UserRole = 'admin' | 'barber' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string;
  photo?: string;
  blocked: boolean;
  barbershopId?: string;
  createdAt: string;
}

export interface Barber {
  id: string;
  userId: string; // FK para Users
  name: string;
  specialty: string;
  commission: number; // Porcentagem de 0 a 100
  commissionRate?: number; // Alias para compatibilidade
  rating: number; // Média (ex: 4.8)
  reviews: number; // Quantidade de avaliações
  active: boolean;
  blockedSlots: string[]; // ex: ["12:00", "12:30"] ou "YYYY-MM-DD HH:MM"
  holidays: string[]; // Dias de folga específicos (YYYY-MM-DD) ou dias da semana
  avatar?: string;
  phone?: string;
  email?: string;
  barbershopId?: string;
  workingHours?: {
    start: string; // "09:00"
    end: string;   // "19:00"
    lunchStart?: string;
    lunchEnd?: string;
  };
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5, 6]
}

export type ServiceCategory = 'cabelo' | 'barba' | 'combo' | 'tratamento';

export interface Service {
  id: string;
  barbershopId?: string;
  name: string;
  description: string;
  price: number;
  duration: number; // Minutos (15, 30, 45, 60)
  durationMinutes?: number; // Alias para compatibilidade
  icon?: string;
  popular: boolean;
  active: boolean;
  category?: ServiceCategory;
}

export type AppointmentStatus = 
  | 'agendado' 
  | 'confirmado' 
  | 'em atendimento' 
  | 'concluido' 
  | 'cancelado'
  | 'pendente'; // Compatibilidade

export type PaymentStatus = 'pago' | 'pendente' | 'fiado';
export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao' | 'fiado';

export interface Appointment {
  id: string;
  barbershopId?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  commission: number; // Valor em R$ gerado para o barbeiro: (price * commissionRate) / 100
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes?: number;
  notes?: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  isFiado: boolean;
  fiadoPaid: boolean;
  fiadoPaidAt?: string; // Timestamp ISO quando quitado
  reviewId?: string;
  createdAt: string;

  // Aliases para compatibilidade de componentes anteriores
  customerName?: string;
  customerPhone?: string;
  totalAmount?: number;
  barberCommission?: number;
}

export interface Product {
  id: string;
  barbershopId?: string;
  name: string;
  category: string;
  price: number;
  stock: number; // Quantidade atual em estoque
  minStock: number; // Alerta de estoque mínimo
  image?: string;
  active: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  barbershopId?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pendente' | 'pago' | 'retirado' | 'cancelado';
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface FinancialExpense {
  id: string;
  barbershopId?: string;
  label: string;
  value: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  category?: string;
  createdAt: string;
}

export interface FinancialIncome {
  id: string;
  barbershopId?: string;
  label: string;
  value: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  category?: string;
  appointmentId?: string;
  isFiadoPayment?: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  barbershopId?: string;
  tag: string;
  title: string;
  description: string;
  price: number;
  color: string;
  active: boolean;
}

export type NotificationType = 'appointment' | 'reminder' | 'finance' | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  referenceId?: string;
  createdAt: string;
}

export interface DayWorkingHour {
  start: string; // "08:00"
  end: string;   // "19:00"
  closed: boolean;
}

export interface ShopConfig {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  openHours?: string;
  slug?: string;
  plan?: BarbershopPlan;
  monthlyRevenueGoal: number; // Meta mensal para barra de progresso
  workingHours: {
    segunda: DayWorkingHour;
    terca: DayWorkingHour;
    quarta: DayWorkingHour;
    quinta: DayWorkingHour;
    sexta: DayWorkingHour;
    sabado: DayWorkingHour;
    domingo: DayWorkingHour;
  };
  blockedSlots: string[]; // Horários bloqueados globalmente na loja (ex: "12:00")
  holidays: string[];     // Feriados da loja (YYYY-MM-DD)
}

export interface Review {
  id: string;
  appointmentId: string;
  barberId: string;
  barberName: string;
  clientId: string;
  clientName: string;
  rating: number; // 1 a 5
  comment: string;
  createdAt: string;
}

// Mantido para compatibilidade multi-tenant existente
export type BarbershopPlan = 'FREE' | 'PRO';

export interface Barbershop {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  openHours: string;
  plan: BarbershopPlan;
  maxBarbers: number;
  monthlyAppointmentLimit: number;
  logoUrl?: string;
  instagram?: string;
  createdAt: string;

  // Controle de Assinatura e Pagamento (Kiwify)
  subscriptionStatus?: 'active' | 'past_due' | 'unpaid' | 'canceled';
  subscriptionExpiresAt?: string; // Data ISO de expiração da mensalidade
  kiwifyOrderId?: string;
  kiwifySubscriptionId?: string;
}

export type BarbershopSettings = Barbershop;

export interface Customer {
  id: string;
  barbershopId: string;
  userId?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  blocked?: boolean;
  totalVisits: number;
  totalSpent?: number;
  lastVisit?: string;
  createdAt: string;
}

export interface BarberCommissionSummary {
  barberId: string;
  barberName: string;
  commissionRate: number;
  cutsCount: number;
  totalGenerated: number;
  commissionDue: number;
}

export interface FinancialTransaction {
  id: string;
  barbershopId?: string;
  type: 'receita' | 'despesa' | 'comissao';
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  date: string;
  barberId?: string;
  barberName?: string;
  appointmentId?: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalCommissions: number;
  netProfit: number;
  commissionsByBarber: BarberCommissionSummary[];
  recentTransactions: FinancialTransaction[];
}

export interface DashboardStats {
  todayAppointmentsCount: number;
  todayRevenue: number;
  monthRevenue: number;
  monthExpenses: number;
  monthNetProfit: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  canceledCount: number;
  totalClientsServed: number;
  barbersCount: number;
  monthAppointmentsCount: number;
  monthlyLimit: number;
  limitReached: boolean;
  plan: BarbershopPlan;
}
