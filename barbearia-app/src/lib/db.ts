import fs from 'fs/promises';
import path from 'path';
import { 
  Appointment, 
  Barber, 
  Barbershop, 
  Customer, 
  FinancialExpense, 
  FinancialIncome, 
  Notification, 
  Order, 
  Product, 
  Promotion, 
  Review, 
  Service, 
  ShopConfig, 
  User, 
  UserRole 
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  users: User[];
  barbershops: Barbershop[];
  barbers: Barber[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  products: Product[];
  orders: Order[];
  expenses: FinancialExpense[];
  incomes: FinancialIncome[];
  promotions: Promotion[];
  notifications: Notification[];
  reviews: Review[];
  shopConfig: ShopConfig;
  // Legado para compatibilidade
  transactions?: any[];
}

const INITIAL_SHOP_CONFIG: ShopConfig = {
  name: 'Barbearia Imperial & Club',
  logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80',
  address: 'Rua das Palmeiras, 450 - Jardins, São Paulo - SP',
  phone: '(11) 3456-7890',
  whatsapp: '11988887777',
  email: 'contato@barbeariaimperial.com',
  plan: 'PRO',
  monthlyRevenueGoal: 15000.0,
  workingHours: {
    segunda: { start: '08:00', end: '19:00', closed: false },
    terca: { start: '08:00', end: '20:00', closed: false },
    quarta: { start: '08:00', end: '20:00', closed: false },
    quinta: { start: '08:00', end: '20:00', closed: false },
    sexta: { start: '08:00', end: '20:30', closed: false },
    sabado: { start: '08:00', end: '19:00', closed: false },
    domingo: { start: '09:00', end: '14:00', closed: true },
  },
  blockedSlots: ['12:30'],
  holidays: ['2026-12-25', '2026-01-01', '2026-11-15'],
};

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Marcos Silva (Dono & Barbeiro)',
    email: 'admin@barbearia.com',
    password_hash: 'admin123',
    role: 'admin',
    phone: '11988887777',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    blocked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-barber-1',
    name: 'Lucas Andrade',
    email: 'lucas@barbearia.com',
    password_hash: 'barber123',
    role: 'barber',
    phone: '11988882222',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    blocked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-barber-2',
    name: 'Mateus Costa',
    email: 'mateus@barbearia.com',
    password_hash: 'barber123',
    role: 'barber',
    phone: '11988883333',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    blocked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-client-1',
    name: 'Rodrigo Santoro',
    email: 'rodrigo@cliente.com',
    password_hash: 'cliente123',
    role: 'client',
    phone: '11999991111',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    blocked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-client-2',
    name: 'Gabriel Medina',
    email: 'gabriel@cliente.com',
    password_hash: 'cliente123',
    role: 'client',
    phone: '11999992222',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    blocked: false,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_BARBERSHOPS: Barbershop[] = [
  {
    id: 'shop-imperial',
    slug: 'imperial',
    name: 'Barbearia Imperial & Club',
    ownerName: 'Marcos Silva',
    ownerEmail: 'admin@barbearia.com',
    ownerPhone: '11988887777',
    address: 'Rua das Palmeiras, 450 - Jardins, São Paulo - SP',
    openHours: 'Segunda a Sábado, das 08:00 às 20:00',
    plan: 'PRO',
    maxBarbers: 99,
    monthlyAppointmentLimit: 999999,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-admin',
    userId: 'usr-admin-1',
    name: 'Marcos Silva',
    specialty: 'Master Barber, Navalha Afiada & Fade Perfeito',
    commission: 50.0,
    rating: 4.9,
    reviews: 42,
    active: true,
    blockedSlots: [],
    holidays: [],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '11988887777',
    email: 'admin@barbearia.com',
    barbershopId: 'shop-imperial',
    workingHours: { start: '08:30', end: '19:30', lunchStart: '12:00', lunchEnd: '13:00' },
    daysOfWeek: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'barber-lucas',
    userId: 'usr-barber-1',
    name: 'Lucas Andrade',
    specialty: 'Visagismo Masculino & Barboterapia SPA',
    commission: 50.0,
    rating: 4.8,
    reviews: 28,
    active: true,
    blockedSlots: ['16:00'],
    holidays: [],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '11988882222',
    email: 'lucas@barbearia.com',
    barbershopId: 'shop-imperial',
    workingHours: { start: '09:00', end: '19:00', lunchStart: '13:00', lunchEnd: '14:00' },
    daysOfWeek: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'barber-mateus',
    userId: 'usr-barber-2',
    name: 'Mateus Costa',
    specialty: 'Cortes Clássicos, Pompadour & Pigmentação',
    commission: 45.0,
    rating: 4.7,
    reviews: 19,
    active: true,
    blockedSlots: [],
    holidays: [],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    phone: '11988883333',
    email: 'mateus@barbearia.com',
    barbershopId: 'shop-imperial',
    workingHours: { start: '09:00', end: '18:00', lunchStart: '12:30', lunchEnd: '13:30' },
    daysOfWeek: [2, 3, 4, 5, 6],
  },
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    barbershopId: 'shop-imperial',
    name: 'Corte Degradê & Social Moderno',
    description: 'Corte personalizado tesoura/máquina com acabamento na navalha e lavagem com massagem capilar.',
    duration: 30,
    price: 45.0,
    icon: 'scissors',
    popular: true,
    active: true,
    category: 'cabelo',
  },
  {
    id: 'srv-2',
    barbershopId: 'shop-imperial',
    name: 'Barboterapia com Toalha Quente',
    description: 'Modelagem completa de barba, toalha aromatizada quente, óleos hidratantes e pós-barba refrescante.',
    duration: 30,
    price: 35.0,
    icon: 'user',
    popular: true,
    active: true,
    category: 'barba',
  },
  {
    id: 'srv-3',
    barbershopId: 'shop-imperial',
    name: 'Combo Master: Cabelo + Barba SPA',
    description: 'Experiência completa com corte degradê, barba completa com toalha morna e finalização com pomada matte.',
    duration: 60,
    price: 70.0,
    icon: 'sparkles',
    popular: true,
    active: true,
    category: 'combo',
  },
  {
    id: 'srv-4',
    barbershopId: 'shop-imperial',
    name: 'Acabamento & Pezinho Navalhado',
    description: 'Alinhamento dos contornos da nuca, costeletas e sobrancelha com navalha afiada.',
    duration: 15,
    price: 20.0,
    icon: 'zap',
    popular: false,
    active: true,
    category: 'cabelo',
  },
  {
    id: 'srv-5',
    barbershopId: 'shop-imperial',
    name: 'Pigmentação de Barba ou Cabelo',
    description: 'Camuflagem de fios brancos e realce da densidade dos contornos faciais.',
    duration: 45,
    price: 50.0,
    icon: 'palette',
    popular: false,
    active: true,
    category: 'tratamento',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    barbershopId: 'shop-imperial',
    name: 'Pomada Matte Efeito Seco 100g',
    category: 'Modelador',
    price: 45.0,
    stock: 14,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1597852074816-d933c4d2b988?auto=format&fit=crop&w=300&q=80',
    active: true,
  },
  {
    id: 'prod-2',
    barbershopId: 'shop-imperial',
    name: 'Óleo Hidratante para Barba 30ml',
    category: 'Barba',
    price: 38.0,
    stock: 3, // Estoque baixo!
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1608248597359-5f21a42bfae6?auto=format&fit=crop&w=300&q=80',
    active: true,
  },
  {
    id: 'prod-3',
    barbershopId: 'shop-imperial',
    name: 'Shampoo Anticaspa Refrescante 250ml',
    category: 'Cabelo',
    price: 40.0,
    stock: 8,
    minStock: 4,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=300&q=80',
    active: true,
  },
  {
    id: 'prod-4',
    barbershopId: 'shop-imperial',
    name: 'Balm Multifuncional para Barba 120g',
    category: 'Barba',
    price: 42.0,
    stock: 2, // Estoque crítico!
    minStock: 4,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80',
    active: true,
  },
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    barbershopId: 'shop-imperial',
    tag: 'COMBO VIP',
    title: 'Sexta Premium: Cabelo + Barba + Cerveja',
    description: 'Faça o combo corte e barba e ganhe um chopp artesanal ou café expresso grátis.',
    price: 65.0,
    color: '#b45309',
    active: true,
  },
  {
    id: 'promo-2',
    barbershopId: 'shop-imperial',
    tag: 'PRIMEIRA VEZ',
    title: 'Desconto de Boas-Vindas',
    description: 'Agende seu primeiro corte pelo app e ganhe 15% de desconto direto no balcão.',
    price: 38.0,
    color: '#047857',
    active: true,
  },
  {
    id: 'promo-3',
    barbershopId: 'shop-imperial',
    tag: 'FIDELIDADE',
    title: 'Clube Barba & Bigode',
    description: 'Faça 4 barboterapias no mês e a 5ª sai totalmente na faixa!',
    price: 120.0,
    color: '#1d4ed8',
    active: true,
  },
];

const INITIAL_EXPENSES: FinancialExpense[] = [
  {
    id: 'exp-1',
    barbershopId: 'shop-imperial',
    label: 'Compra de Lâminas descartáveis & Desinfetante',
    value: 120.0,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    category: 'Insumos',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    barbershopId: 'shop-imperial',
    label: 'Conta de Energia Elétrica',
    value: 380.0,
    date: new Date().toISOString().split('T')[0],
    time: '11:15',
    category: 'Contas Fixas',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_INCOMES: FinancialIncome[] = [
  {
    id: 'inc-1',
    barbershopId: 'shop-imperial',
    label: 'Venda de Pomada no Balcão',
    value: 45.0,
    date: new Date().toISOString().split('T')[0],
    time: '09:40',
    category: 'Produtos',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-client-1',
    title: 'Agendamento Confirmado! 💈',
    message: 'Seu corte Degradê & Social está marcado com Marcos Silva.',
    type: 'appointment',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'usr-admin-1',
    title: 'Alerta de Estoque Baixo! ⚠️',
    message: 'O produto Balm Multifuncional está com apenas 2 unidades em estoque.',
    type: 'system',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    appointmentId: 'apt-seed-1',
    barberId: 'barber-admin',
    barberName: 'Marcos Silva',
    clientId: 'usr-client-1',
    clientName: 'Rodrigo Santoro',
    rating: 5,
    comment: 'Atendimento impecável! O degradê navalhado ficou perfeito, recomendo demais.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'rev-2',
    appointmentId: 'apt-seed-2',
    barberId: 'barber-lucas',
    barberName: 'Lucas Andrade',
    clientId: 'usr-client-2',
    clientName: 'Gabriel Medina',
    rating: 5,
    comment: 'A barboterapia com toalha quente é outro nível de relaxamento. Nota 10!',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function getInitialAppointments(): Appointment[] {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'apt-seed-1',
      barbershopId: 'shop-imperial',
      clientId: 'usr-client-1',
      clientName: 'Rodrigo Santoro',
      clientPhone: '11999991111',
      clientEmail: 'rodrigo@cliente.com',
      barberId: 'barber-admin',
      barberName: 'Marcos Silva',
      serviceId: 'srv-1',
      serviceName: 'Corte Degradê & Social Moderno',
      price: 45.0,
      commission: 22.5, // 50%
      date: today,
      time: '09:00',
      durationMinutes: 30,
      status: 'concluido',
      paymentStatus: 'pago',
      paymentMethod: 'pix',
      isFiado: false,
      fiadoPaid: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-seed-2',
      barbershopId: 'shop-imperial',
      clientId: 'usr-client-2',
      clientName: 'Gabriel Medina',
      clientPhone: '11999992222',
      clientEmail: 'gabriel@cliente.com',
      barberId: 'barber-lucas',
      barberName: 'Lucas Andrade',
      serviceId: 'srv-3',
      serviceName: 'Combo Master: Cabelo + Barba SPA',
      price: 70.0,
      commission: 35.0,
      date: today,
      time: '10:00',
      durationMinutes: 60,
      status: 'em atendimento',
      paymentStatus: 'pendente',
      paymentMethod: 'cartao',
      isFiado: false,
      fiadoPaid: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-seed-3',
      barbershopId: 'shop-imperial',
      clientId: 'usr-client-fiado',
      clientName: 'Carlos Eduardo (Fiado Pendente)',
      clientPhone: '11977773333',
      barberId: 'barber-admin',
      barberName: 'Marcos Silva',
      serviceId: 'srv-1',
      serviceName: 'Corte Degradê & Social Moderno',
      price: 45.0,
      commission: 22.5,
      date: yesterday,
      time: '15:30',
      durationMinutes: 30,
      status: 'concluido',
      paymentStatus: 'fiado',
      paymentMethod: 'fiado',
      isFiado: true,
      fiadoPaid: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'apt-seed-4',
      barbershopId: 'shop-imperial',
      clientId: 'usr-client-1',
      clientName: 'Rodrigo Santoro',
      clientPhone: '11999991111',
      barberId: 'barber-admin',
      barberName: 'Marcos Silva',
      serviceId: 'srv-2',
      serviceName: 'Barboterapia com Toalha Quente',
      price: 35.0,
      commission: 17.5,
      date: today,
      time: '14:00',
      durationMinutes: 30,
      status: 'confirmado',
      paymentStatus: 'pendente',
      paymentMethod: 'dinheiro',
      isFiado: false,
      fiadoPaid: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    barbershopId: 'shop-imperial',
    userId: 'usr-client-1',
    name: 'Rodrigo Santoro',
    phone: '11999991111',
    email: 'rodrigo@cliente.com',
    notes: 'Degradê zero baixa navalhado. Gosta de pomada matte.',
    blocked: false,
    totalVisits: 5,
    totalSpent: 225.0,
    lastVisit: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    barbershopId: 'shop-imperial',
    userId: 'usr-client-2',
    name: 'Gabriel Medina',
    phone: '11999992222',
    email: 'gabriel@cliente.com',
    notes: 'Toalha bem quente na barba e alinhamento reto.',
    blocked: false,
    totalVisits: 3,
    totalSpent: 210.0,
    lastVisit: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    barbershopId: 'shop-imperial',
    name: 'Carlos Eduardo (Fiado Pendente)',
    phone: '11977773333',
    notes: 'Cliente com pagamento pendente de corte anterior.',
    blocked: false,
    totalVisits: 2,
    totalSpent: 45.0,
    lastVisit: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

export async function ensureDb(): Promise<DatabaseSchema> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    let modified = false;

    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = INITIAL_USERS;
      modified = true;
    }
    if (!parsed.shopConfig) {
      parsed.shopConfig = INITIAL_SHOP_CONFIG;
      modified = true;
    }
    if (!parsed.barbershops || parsed.barbershops.length === 0) {
      parsed.barbershops = INITIAL_BARBERSHOPS;
      modified = true;
    }
    if (!parsed.barbers || parsed.barbers.length === 0) {
      parsed.barbers = INITIAL_BARBERS;
      modified = true;
    }
    if (!parsed.services || parsed.services.length === 0) {
      parsed.services = INITIAL_SERVICES;
      modified = true;
    }
    if (!parsed.customers || parsed.customers.length === 0) {
      parsed.customers = INITIAL_CUSTOMERS;
      modified = true;
    }
    if (!parsed.appointments || parsed.appointments.length === 0) {
      parsed.appointments = getInitialAppointments();
      modified = true;
    }
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = INITIAL_PRODUCTS;
      modified = true;
    }
    if (!parsed.orders) {
      parsed.orders = [];
      modified = true;
    }
    if (!parsed.expenses || parsed.expenses.length === 0) {
      parsed.expenses = INITIAL_EXPENSES;
      modified = true;
    }
    if (!parsed.incomes || parsed.incomes.length === 0) {
      parsed.incomes = INITIAL_INCOMES;
      modified = true;
    }
    if (!parsed.promotions || parsed.promotions.length === 0) {
      parsed.promotions = INITIAL_PROMOTIONS;
      modified = true;
    }
    if (!parsed.notifications || parsed.notifications.length === 0) {
      parsed.notifications = INITIAL_NOTIFICATIONS;
      modified = true;
    }
    if (!parsed.reviews || parsed.reviews.length === 0) {
      parsed.reviews = INITIAL_REVIEWS;
      modified = true;
    }

    if (modified) {
      await saveDb(parsed);
    }
    return parsed as DatabaseSchema;
  } catch {
    const initialData: DatabaseSchema = {
      users: INITIAL_USERS,
      barbershops: INITIAL_BARBERSHOPS,
      barbers: INITIAL_BARBERS,
      services: INITIAL_SERVICES,
      customers: INITIAL_CUSTOMERS,
      appointments: getInitialAppointments(),
      products: INITIAL_PRODUCTS,
      orders: [],
      expenses: INITIAL_EXPENSES,
      incomes: INITIAL_INCOMES,
      promotions: INITIAL_PROMOTIONS,
      notifications: INITIAL_NOTIFICATIONS,
      reviews: INITIAL_REVIEWS,
      shopConfig: INITIAL_SHOP_CONFIG,
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export async function saveDb(data: DatabaseSchema): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// AUTENTICAÇÃO E USUÁRIOS
// -------------------------------------------------------------

export async function getUsers(): Promise<User[]> {
  const db = await ensureDb();
  return db.users;
}

export async function authenticateUser(email: string, passwordHash: string): Promise<User | null> {
  const db = await ensureDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && (u.password_hash === passwordHash || passwordHash === 'mock_google')
  );
  if (!user || user.blocked) return null;
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await ensureDb();
  return db.users.find((u) => u.id === id) || null;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string;
  barbershopId?: string;
}): Promise<{ user?: User; error?: string }> {
  const db = await ensureDb();
  const normalizedEmail = data.email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { error: 'E-mail já cadastrado no sistema.' };
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: data.name.trim(),
    email: normalizedEmail,
    password_hash: data.password_hash,
    role: data.role,
    phone: data.phone.trim(),
    barbershopId: data.barbershopId,
    blocked: false,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Se o usuário for cliente, garante também cadastro como Customer
  if (data.role === 'client') {
    const cleanPhone = data.phone.replace(/\D/g, '');
    const existingCust = db.customers.find((c) => c.phone.replace(/\D/g, '') === cleanPhone);
    if (!existingCust) {
      db.customers.push({
        id: `cust-${Date.now()}`,
        barbershopId: data.barbershopId || 'shop-imperial',
        userId: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        totalVisits: 0,
        totalSpent: 0,
        blocked: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  await saveDb(db);
  return { user: newUser };
}

// -------------------------------------------------------------
// SHOP CONFIG (CONFIGURAÇÕES GERAIS DA BARBEARIA)
// -------------------------------------------------------------

export async function getShopConfig(shopIdOrSlug?: string): Promise<ShopConfig> {
  const db = await ensureDb();
  let shop = db.barbershops[0];
  if (shopIdOrSlug) {
    const found = db.barbershops.find(
      (b) => b.id === shopIdOrSlug || b.slug.toLowerCase() === shopIdOrSlug.toLowerCase()
    );
    if (found) shop = found;
  }
  return {
    ...db.shopConfig,
    name: shop ? shop.name : db.shopConfig.name,
    address: shop ? shop.address : db.shopConfig.address,
    phone: shop ? shop.ownerPhone : db.shopConfig.phone,
    instagram: shop ? (shop.instagram || '') : (db.shopConfig.instagram || ''),
    openHours: shop ? shop.openHours : db.shopConfig.openHours,
    plan: shop?.plan || db.shopConfig.plan || 'PRO',
    subscriptionStatus: shop?.subscriptionStatus || 'active',
    subscriptionExpiresAt: shop?.subscriptionExpiresAt,
    shopSlug: shop?.slug,
    shopId: shop?.id,
  } as any;
}

export async function updateShopConfig(data: Partial<ShopConfig>, shopIdOrSlug?: string): Promise<ShopConfig> {
  const db = await ensureDb();
  db.shopConfig = { ...db.shopConfig, ...data };
  
  let targetShop = db.barbershops[0];
  if (shopIdOrSlug) {
    const found = db.barbershops.find(
      (b) => b.id === shopIdOrSlug || b.slug.toLowerCase() === shopIdOrSlug.toLowerCase()
    );
    if (found) targetShop = found;
  }

  if (targetShop) {
    if (data.name) targetShop.name = data.name;
    if (data.address) targetShop.address = data.address;
    if (data.phone) targetShop.ownerPhone = data.phone;
    if (data.instagram !== undefined) targetShop.instagram = data.instagram;
    if (data.plan) targetShop.plan = data.plan;
  }

  await saveDb(db);
  return getShopConfig(shopIdOrSlug);
}

// -------------------------------------------------------------
// SERVIÇOS
// -------------------------------------------------------------

export async function getServices(shopIdOrSlug?: string): Promise<Service[]> {
  const db = await ensureDb();
  let list = db.services.filter((s) => s.active !== false);
  if (shopIdOrSlug) {
    const shop = db.barbershops.find((b) => b.id === shopIdOrSlug || b.slug.toLowerCase() === shopIdOrSlug.toLowerCase());
    if (shop) {
      list = list.filter((s) => !s.barbershopId || s.barbershopId === shop.id || s.barbershopId === shop.slug);
    }
  }
  return list;
}

export async function getAllServicesAdmin(shopIdOrSlug?: string): Promise<Service[]> {
  const db = await ensureDb();
  if (shopIdOrSlug) {
    const shop = db.barbershops.find((b) => b.id === shopIdOrSlug || b.slug.toLowerCase() === shopIdOrSlug.toLowerCase());
    if (shop) {
      return db.services.filter((s) => !s.barbershopId || s.barbershopId === shop.id || s.barbershopId === shop.slug);
    }
  }
  return db.services;
}

export async function createService(data: Omit<Service, 'id'>): Promise<Service> {
  const db = await ensureDb();
  const newService: Service = {
    ...data,
    id: `srv-${Date.now()}`,
    active: data.active ?? true,
    popular: data.popular ?? false,
  };
  db.services.push(newService);
  await saveDb(db);
  return newService;
}

export async function updateService(id: string, data: Partial<Service>): Promise<Service | null> {
  const db = await ensureDb();
  const idx = db.services.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  db.services[idx] = { ...db.services[idx], ...data, id };
  await saveDb(db);
  return db.services[idx];
}

export async function deleteService(id: string): Promise<boolean> {
  const db = await ensureDb();
  const init = db.services.length;
  db.services = db.services.filter((s) => s.id !== id);
  if (db.services.length === init) return false;
  await saveDb(db);
  return true;
}

// -------------------------------------------------------------
// BARBEIROS
// -------------------------------------------------------------

export async function getBarbers(shopIdOrSlug?: string): Promise<Barber[]> {
  const db = await ensureDb();
  let list = db.barbers.filter((b) => b.active !== false);
  if (shopIdOrSlug) {
    const shop = db.barbershops.find((b) => b.id === shopIdOrSlug || b.slug.toLowerCase() === shopIdOrSlug.toLowerCase());
    if (shop) {
      list = list.filter((b) => !b.barbershopId || b.barbershopId === shop.id || b.barbershopId === shop.slug);
    }
  }
  return list;
}

export async function getAllBarbersAdmin(shopIdOrSlug?: string): Promise<Barber[]> {
  const db = await ensureDb();
  if (shopIdOrSlug) {
    const shop = db.barbershops.find((b) => b.id === shopIdOrSlug || b.slug.toLowerCase() === shopIdOrSlug.toLowerCase());
    if (shop) {
      return db.barbers.filter((b) => !b.barbershopId || b.barbershopId === shop.id || b.barbershopId === shop.slug);
    }
  }
  return db.barbers;
}

export async function getBarberByUserId(userId: string): Promise<Barber | null> {
  const db = await ensureDb();
  return db.barbers.find((b) => b.userId === userId) || null;
}

export async function getBarberById(id: string): Promise<Barber | null> {
  const db = await ensureDb();
  return db.barbers.find((b) => b.id === id) || null;
}

export async function createBarber(data: Omit<Barber, 'id' | 'rating' | 'reviews'>): Promise<Barber> {
  const db = await ensureDb();
  const newBarber: Barber = {
    ...data,
    id: `barber-${Date.now()}`,
    rating: 5.0,
    reviews: 0,
    active: data.active ?? true,
    blockedSlots: data.blockedSlots || [],
    holidays: data.holidays || [],
  };
  db.barbers.push(newBarber);
  await saveDb(db);
  return newBarber;
}

export async function updateBarber(id: string, data: Partial<Barber>): Promise<Barber | null> {
  const db = await ensureDb();
  const idx = db.barbers.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  db.barbers[idx] = { ...db.barbers[idx], ...data, id };
  await saveDb(db);
  return db.barbers[idx];
}

export async function deleteBarber(id: string): Promise<boolean> {
  const db = await ensureDb();
  const init = db.barbers.length;
  db.barbers = db.barbers.filter((b) => b.id !== id);
  if (db.barbers.length === init) return false;
  await saveDb(db);
  return true;
}

// -------------------------------------------------------------
// DISPONIBILIDADE & REGRAS DE OVERBOOKING COM DURAÇÃO
// -------------------------------------------------------------

export async function getAvailableSlots(
  barberId: string,
  date: string,
  durationMinutes = 30
): Promise<string[]> {
  const db = await ensureDb();
  const config = db.shopConfig;

  // 1. Checa se o dia é feriado geral da barbearia
  if (config.holidays.includes(date)) {
    return [];
  }

  // 2. Busca barbeiro
  const barber = db.barbers.find((b) => b.id === barberId);
  if (!barber || !barber.active) return [];

  // 3. Checa folga específica do barbeiro
  if (barber.holidays.includes(date)) {
    return [];
  }

  // 4. Determina horário de funcionamento do dia
  const dateObj = new Date(`${date}T12:00:00`);
  const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'] as const;
  const dayName = dayNames[dateObj.getDay()];
  const shopDayHours = config.workingHours[dayName];

  if (!shopDayHours || shopDayHours.closed) {
    return [];
  }

  const [shopStartH, shopStartM] = shopDayHours.start.split(':').map(Number);
  const [shopEndH, shopEndM] = shopDayHours.end.split(':').map(Number);
  let startMin = shopStartH * 60 + shopStartM;
  let endMin = shopEndH * 60 + shopEndM;

  // Ajusta se o barbeiro tem horário próprio
  if (barber.workingHours) {
    const [bStartH, bStartM] = barber.workingHours.start.split(':').map(Number);
    const [bEndH, bEndM] = barber.workingHours.end.split(':').map(Number);
    startMin = Math.max(startMin, bStartH * 60 + bStartM);
    endMin = Math.min(endMin, bEndH * 60 + bEndM);
  }

  // Almoço do barbeiro
  let lunchStartMin = -1;
  let lunchEndMin = -1;
  if (barber.workingHours?.lunchStart && barber.workingHours?.lunchEnd) {
    const [lsH, lsM] = barber.workingHours.lunchStart.split(':').map(Number);
    const [leH, leM] = barber.workingHours.lunchEnd.split(':').map(Number);
    lunchStartMin = lsH * 60 + lsM;
    lunchEndMin = leH * 60 + leM;
  }

  // Agendamentos ativos do barbeiro na data
  const dayAppointments = db.appointments.filter(
    (a) => a.barberId === barberId && a.date === date && a.status !== 'cancelado'
  );

  // Mapeia todos os intervalos ocupados por agendamentos existentes (considerando durationMinutes)
  const occupiedRanges: { start: number; end: number }[] = [];

  for (const apt of dayAppointments) {
    const [aH, aM] = apt.time.split(':').map(Number);
    const aStart = aH * 60 + aM;
    const aDuration = apt.durationMinutes || 30;
    occupiedRanges.push({ start: aStart, end: aStart + aDuration });
  }

  // Adiciona almoço aos intervalos ocupados
  if (lunchStartMin !== -1 && lunchEndMin !== -1) {
    occupiedRanges.push({ start: lunchStartMin, end: lunchEndMin });
  }

  // Lista de slots globais bloqueados e bloqueios individuais do barbeiro
  const blockedSlotsSet = new Set<string>([
    ...config.blockedSlots,
    ...(barber.blockedSlots || []),
  ]);

  const availableSlots: string[] = [];
  const slotInterval = 30; // Granularidade da grade em 30 min

  for (let current = startMin; current + durationMinutes <= endMin; current += slotInterval) {
    const candidateEnd = current + durationMinutes;
    const hh = String(Math.floor(current / 60)).padStart(2, '0');
    const mm = String(current % 60).padStart(2, '0');
    const slotTimeStr = `${hh}:${mm}`;

    // Checa bloqueio explícito
    if (blockedSlotsSet.has(slotTimeStr)) {
      continue;
    }

    // Checa sobreposição com qualquer intervalo ocupado
    const hasOverlap = occupiedRanges.some(
      (range) => current < range.end && candidateEnd > range.start
    );

    if (!hasOverlap) {
      availableSlots.push(slotTimeStr);
    }
  }

  return availableSlots;
}

// -------------------------------------------------------------
// AGENDAMENTOS & REGRAS DE NEGÓCIO DE STATUS, COMISSÃO E FIADO
// -------------------------------------------------------------

export async function getAppointments(filters?: {
  date?: string;
  barberId?: string;
  clientId?: string;
  status?: string;
  paymentStatus?: string;
  barbershopId?: string;
  slug?: string;
}): Promise<Appointment[]> {
  const db = await ensureDb();
  let list = db.appointments;

  if (filters?.barbershopId) {
    list = list.filter((a) => a.barbershopId === filters.barbershopId);
  } else if (filters?.slug) {
    const shop = db.barbershops.find((b) => b.slug.toLowerCase() === filters.slug?.toLowerCase());
    if (shop) {
      list = list.filter((a) => a.barbershopId === shop.id || a.barbershopId === shop.slug);
    }
  }

  if (filters?.date) {
    list = list.filter((a) => a.date === filters.date);
  }
  if (filters?.barberId && filters.barberId !== 'all') {
    list = list.filter((a) => a.barberId === filters.barberId);
  }
  if (filters?.clientId) {
    list = list.filter((a) => a.clientId === filters.clientId);
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    list = list.filter((a) => a.paymentStatus === filters.paymentStatus);
  }

  return list.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}

export async function createAppointment(data: {
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  paymentMethod?: Appointment['paymentMethod'];
  notes?: string;
  slug?: string;
  barbershopId?: string;
}): Promise<{ appointment?: Appointment; error?: string }> {
  const db = await ensureDb();

  // Identifica a barbearia correspondente
  const targetShop = db.barbershops.find(
    (s) => s.id === data.barbershopId || s.slug === data.slug || (s.id === data.slug)
  ) || db.barbershops.find((s) => {
    const b = db.barbers.find((bb) => bb.id === data.barberId);
    return b && b.barbershopId === s.id;
  }) || db.barbershops[0];

  // REGRA DE NEGÓCIO: BLOQUEIO POR INADIMPLÊNCIA / EXPIRAÇÃO DA ASSINATURA PRO
  if (targetShop && targetShop.plan === 'PRO') {
    if (targetShop.subscriptionStatus === 'unpaid' || targetShop.subscriptionStatus === 'canceled' || targetShop.subscriptionStatus === 'past_due') {
      return {
        error: 'A barbearia está temporariamente indisponível para novos agendamentos devido a pendência na assinatura.',
      };
    }

    if (targetShop.subscriptionExpiresAt) {
      const expiresAt = new Date(targetShop.subscriptionExpiresAt);
      if (new Date() > expiresAt) {
        return {
          error: 'A barbearia está com a assinatura do sistema expirada. Regularize na Kiwify para reativar.',
        };
      }
    }
  }

  // REGRA DE NEGÓCIO: PLANO GRATUITO TEM LIMITE DE 30 AGENDAMENTOS POR MÊS
  if (targetShop && targetShop.plan === 'FREE') {
    const monthPrefix = data.date.substring(0, 7); // YYYY-MM
    const currentMonthAppointments = db.appointments.filter(
      (a) =>
        (a.barbershopId === targetShop.id || a.barbershopId === targetShop.slug) &&
        a.date.startsWith(monthPrefix) &&
        a.status !== 'cancelado'
    );

    if (currentMonthAppointments.length >= 30) {
      return {
        error: 'Limite de 30 agendamentos mensais do Plano Gratuito atingido nesta barbearia. É necessário assinar o Plano PRO para agendamentos ilimitados.',
      };
    }
  }

  // Valida cliente bloqueado
  const customer = db.customers.find((c) => c.userId === data.clientId || c.phone === data.clientPhone);
  if (customer && customer.blocked) {
    return { error: 'O cliente está com restrição de agendamento. Por favor, fale com a recepção da barbearia.' };
  }

  const service = db.services.find((s) => s.id === data.serviceId);
  if (!service) return { error: 'Serviço não encontrado.' };

  const barber = db.barbers.find((b) => b.id === data.barberId);
  if (!barber) return { error: 'Barbeiro não encontrado.' };

  // Checa disponibilidade
  const availableSlots = await getAvailableSlots(barber.id, data.date, service.duration || 30);
  if (!availableSlots.includes(data.time)) {
    return { error: 'O horário selecionado não está mais disponível para este barbeiro ou colide com outro atendimento.' };
  }

  const commissionRate = barber.commission || 50;
  const commissionValue = Number(((service.price * commissionRate) / 100).toFixed(2));
  const isFiado = data.paymentMethod === 'fiado';

  const newApt: Appointment = {
    id: `apt-${Date.now()}`,
    barbershopId: targetShop?.id || 'shop-imperial',
    clientId: data.clientId,
    clientName: data.clientName.trim(),
    clientPhone: data.clientPhone.trim(),
    clientEmail: data.clientEmail?.trim(),
    barberId: barber.id,
    barberName: barber.name,
    serviceId: service.id,
    serviceName: service.name,
    price: service.price,
    commission: commissionValue,
    date: data.date,
    time: data.time,
    durationMinutes: service.duration || 30,
    notes: data.notes?.trim(),
    status: 'agendado',
    paymentStatus: isFiado ? 'fiado' : 'pendente',
    paymentMethod: data.paymentMethod || 'pix',
    isFiado,
    fiadoPaid: false,
    createdAt: new Date().toISOString(),
  };

  db.appointments.push(newApt);

  // Auto cadastra ou atualiza Customer
  const cleanPhone = data.clientPhone.replace(/\D/g, '');
  const existingCust = db.customers.find(
    (c) => c.phone.replace(/\D/g, '') === cleanPhone || c.userId === data.clientId
  );

  if (existingCust) {
    existingCust.name = data.clientName.trim();
    existingCust.lastVisit = data.date;
    existingCust.totalVisits += 1;
  } else {
    db.customers.push({
      id: `cust-${Date.now()}`,
      barbershopId: targetShop?.id || 'shop-imperial',
      userId: data.clientId,
      name: data.clientName.trim(),
      phone: data.clientPhone.trim(),
      email: data.clientEmail?.trim(),
      blocked: false,
      totalVisits: 1,
      totalSpent: 0,
      lastVisit: data.date,
      createdAt: new Date().toISOString(),
    });
  }

  // Notificação para o barbeiro e para o cliente
  db.notifications.push({
    id: `notif-${Date.now()}-client`,
    userId: data.clientId,
    title: 'Novo Agendamento Confirmado! ✂️',
    message: `Seu agendamento de ${service.name} com ${barber.name} está marcado para ${data.date} às ${data.time}.`,
    type: 'appointment',
    read: false,
    referenceId: newApt.id,
    createdAt: new Date().toISOString(),
  });

  if (barber.userId) {
    db.notifications.push({
      id: `notif-${Date.now()}-barber`,
      userId: barber.userId,
      title: 'Novo Corte na sua Agenda! 💈',
      message: `${data.clientName} agendou ${service.name} para ${data.date} às ${data.time}.`,
      type: 'appointment',
      read: false,
      referenceId: newApt.id,
      createdAt: new Date().toISOString(),
    });
  }

  await saveDb(db);
  return { appointment: newApt };
}

export async function updateAppointmentStatus(
  id: string,
  newStatus: Appointment['status'],
  paymentOptions?: {
    paymentMethod?: Appointment['paymentMethod'];
    paymentStatus?: Appointment['paymentStatus'];
  }
): Promise<Appointment | null> {
  const db = await ensureDb();
  const idx = db.appointments.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const apt = db.appointments[idx];
  apt.status = newStatus;

  if (paymentOptions?.paymentMethod) {
    apt.paymentMethod = paymentOptions.paymentMethod;
    apt.isFiado = paymentOptions.paymentMethod === 'fiado';
    if (apt.isFiado) {
      apt.paymentStatus = 'fiado';
      apt.fiadoPaid = false;
    }
  }

  if (paymentOptions?.paymentStatus) {
    apt.paymentStatus = paymentOptions.paymentStatus;
  }

  // REGRA DE NEGÓCIO OBRIGATÓRIA: CÁLCULO DE COMISSÃO AO CONCLUIR
  if (newStatus === 'concluido') {
    const barber = db.barbers.find((b) => b.id === apt.barberId);
    const commRate = barber?.commission || 50;
    apt.commission = Number(((apt.price * commRate) / 100).toFixed(2));

    // Se não for fiado e já estiver marcado como pago ou se for concluído com pagamento à vista
    if (apt.paymentMethod !== 'fiado') {
      apt.paymentStatus = 'pago';

      // Registra receita de caixa diário se ainda não registrada
      const alreadyHasIncome = db.incomes.some((inc) => inc.appointmentId === apt.id);
      if (!alreadyHasIncome) {
        db.incomes.push({
          id: `inc-apt-${Date.now()}`,
          barbershopId: 'shop-imperial',
          label: `Receita Serviço: ${apt.serviceName} (${apt.clientName})`,
          value: apt.price,
          date: apt.date,
          time: apt.time,
          category: 'Serviço',
          appointmentId: apt.id,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Atualiza total gasto do cliente
    const cust = db.customers.find((c) => c.userId === apt.clientId || c.phone === apt.clientPhone);
    if (cust) {
      cust.totalSpent = (cust.totalSpent || 0) + apt.price;
    }
  }

  await saveDb(db);
  return apt;
}

// -------------------------------------------------------------
// MÓDULO DE FIADO & QUITAÇÃO
// -------------------------------------------------------------

export async function getFiadoList(): Promise<{
  appointments: Appointment[];
  totalFiadoPending: number;
}> {
  const db = await ensureDb();
  const fiados = db.appointments.filter((a) => a.isFiado && !a.fiadoPaid && a.status !== 'cancelado');
  const totalFiadoPending = fiados.reduce((sum, a) => sum + a.price, 0);
  return { appointments: fiados, totalFiadoPending };
}

export async function settleFiado(
  appointmentId: string,
  settlePaymentMethod: 'dinheiro' | 'pix' | 'cartao' = 'pix'
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const db = await ensureDb();
  const idx = db.appointments.findIndex((a) => a.id === appointmentId);
  if (idx === -1) return { success: false, error: 'Atendimento não encontrado.' };

  const apt = db.appointments[idx];
  if (!apt.isFiado) return { success: false, error: 'Este atendimento não foi registrado como fiado.' };

  const now = new Date();
  apt.fiadoPaid = true;
  apt.fiadoPaidAt = now.toISOString();
  apt.paymentStatus = 'pago';
  apt.paymentMethod = settlePaymentMethod;

  // REGRA: Quitação de fiado gera registro de entrada com data de pagamento no caixa diário
  db.incomes.push({
    id: `inc-fiado-${Date.now()}`,
    barbershopId: 'shop-imperial',
    label: `Quitação de Fiado: ${apt.serviceName} - Cliente: ${apt.clientName}`,
    value: apt.price,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    category: 'Quitação Fiado',
    appointmentId: apt.id,
    isFiadoPayment: true,
    createdAt: now.toISOString(),
  });

  await saveDb(db);
  return { success: true, appointment: apt };
}

export async function createManualFiado(data: {
  clientName: string;
  clientPhone: string;
  barberId: string;
  serviceName: string;
  amount: number;
  date?: string;
  notes?: string;
}): Promise<Appointment> {
  const db = await ensureDb();
  const barber = db.barbers.find((b) => b.id === data.barberId) || db.barbers[0];
  const dateStr = data.date || new Date().toISOString().split('T')[0];
  const commRate = barber?.commission || 50;

  const newApt: Appointment = {
    id: `apt-manual-fiado-${Date.now()}`,
    barbershopId: 'shop-imperial',
    clientId: `manual-${Date.now()}`,
    clientName: data.clientName.trim(),
    clientPhone: data.clientPhone.trim(),
    barberId: barber.id,
    barberName: barber.name,
    serviceId: 'srv-manual',
    serviceName: data.serviceName.trim() || 'Serviço Avulso',
    price: data.amount,
    commission: Number(((data.amount * commRate) / 100).toFixed(2)),
    date: dateStr,
    time: '12:00',
    status: 'concluido',
    paymentStatus: 'fiado',
    paymentMethod: 'fiado',
    isFiado: true,
    fiadoPaid: false,
    notes: data.notes?.trim() || 'Lançamento manual de fiado',
    createdAt: new Date().toISOString(),
  };

  db.appointments.push(newApt);
  await saveDb(db);
  return newApt;
}

// -------------------------------------------------------------
// CLIENTES (GESTÃO & BLOQUEIO)
// -------------------------------------------------------------

export async function getCustomers(shopOrSearch?: string, search?: string): Promise<Customer[]> {
  const db = await ensureDb();
  let list = db.customers;
  const q = (search || shopOrSearch || '').toLowerCase();
  if (q && q !== 'shop-imperial') {
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }
  return list;
}

export async function toggleCustomerBlock(id: string): Promise<Customer | null> {
  const db = await ensureDb();
  const idx = db.customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  db.customers[idx].blocked = !db.customers[idx].blocked;

  // Se tiver usuário vinculado, bloqueia login também
  if (db.customers[idx].userId) {
    const uIdx = db.users.findIndex((u) => u.id === db.customers[idx].userId);
    if (uIdx !== -1) {
      db.users[uIdx].blocked = db.customers[idx].blocked!;
    }
  }

  await saveDb(db);
  return db.customers[idx];
}

// -------------------------------------------------------------
// PRODUTOS, ESTOQUE & CARRINHO
// -------------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  const db = await ensureDb();
  return db.products;
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const db = await ensureDb();
  const newProduct: Product = {
    ...data,
    id: `prod-${Date.now()}`,
    active: data.active ?? true,
  };
  db.products.push(newProduct);
  await saveDb(db);
  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const db = await ensureDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...data, id };
  await saveDb(db);
  return db.products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await ensureDb();
  const init = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length === init) return false;
  await saveDb(db);
  return true;
}

export async function checkoutCart(orderData: {
  clientId: string;
  clientName: string;
  clientPhone: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: Appointment['paymentMethod'];
}): Promise<{ order?: Order; error?: string }> {
  const db = await ensureDb();

  // 1. Verifica disponibilidade de estoque
  for (const item of orderData.items) {
    const prod = db.products.find((p) => p.id === item.productId);
    if (!prod) {
      return { error: `Produto não encontrado.` };
    }
    if (prod.stock < item.quantity) {
      return { error: `Estoque insuficiente para o produto "${prod.name}" (disponível: ${prod.stock}).` };
    }
  }

  // 2. Cria itens do pedido e dá baixa no estoque
  let totalAmount = 0;
  const processedItems = orderData.items.map((item) => {
    const prod = db.products.find((p) => p.id === item.productId)!;
    prod.stock -= item.quantity; // BAIXA AUTOMÁTICA NO ESTOQUE
    const subtotal = prod.price * item.quantity;
    totalAmount += subtotal;

    // Alerta de estoque baixo se aplicável
    if (prod.stock <= prod.minStock) {
      db.notifications.push({
        id: `notif-stock-${Date.now()}-${prod.id}`,
        userId: 'usr-admin-1',
        title: 'Estoque Baixo!',
        message: `O produto "${prod.name}" atingiu nível crítico: apenas ${prod.stock} unidade(s) restante(s).`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      productId: prod.id,
      productName: prod.name,
      quantity: item.quantity,
      unitPrice: prod.price,
    };
  });

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    barbershopId: 'shop-imperial',
    clientId: orderData.clientId,
    clientName: orderData.clientName,
    clientPhone: orderData.clientPhone,
    items: processedItems,
    totalAmount,
    status: 'pago',
    paymentMethod: orderData.paymentMethod,
    createdAt: new Date().toISOString(),
  };

  db.orders.push(newOrder);

  // Registra entrada de produtos no caixa
  db.incomes.push({
    id: `inc-ord-${Date.now()}`,
    barbershopId: 'shop-imperial',
    label: `Venda de Produtos (#${newOrder.id.slice(-4)}) - Cliente: ${orderData.clientName}`,
    value: totalAmount,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    category: 'Produtos',
    createdAt: new Date().toISOString(),
  });

  await saveDb(db);
  return { order: newOrder };
}

// -------------------------------------------------------------
// GESTÃO FINANCEIRA (DESPESAS, ENTRADAS & FECHAMENTO DIÁRIO)
// -------------------------------------------------------------

export async function getFinancialOverview(month?: string) {
  const db = await ensureDb();
  const currentMonth = month || new Date().toISOString().substring(0, 7);

  // Faturamento bruto (todos os cortes concluídos no mês, inclusive fiados)
  const monthAppointments = db.appointments.filter(
    (a) => a.date.startsWith(currentMonth) && a.status === 'concluido'
  );

  const brutoServices = monthAppointments.reduce((sum, a) => sum + a.price, 0);

  // Incomes avulsos ou de produtos
  const otherIncomes = db.incomes
    .filter((inc) => inc.date.startsWith(currentMonth) && !inc.appointmentId)
    .reduce((sum, inc) => sum + inc.value, 0);

  const faturamentoBruto = brutoServices + otherIncomes;

  // Comissões geradas no mês
  const totalComissoes = monthAppointments.reduce((sum, a) => sum + (a.commission || 0), 0);

  // Despesas no mês
  const totalDespesas = db.expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.value, 0);

  // Faturamento líquido
  const faturamentoLiquido = faturamentoBruto - totalComissoes - totalDespesas;

  // Fiados em aberto acumulados
  const fiadoEmAberto = db.appointments
    .filter((a) => a.isFiado && !a.fiadoPaid && a.status !== 'cancelado')
    .reduce((sum, a) => sum + a.price, 0);

  const goal = db.shopConfig.monthlyRevenueGoal || 15000.0;
  const goalProgress = Math.min(100, Math.round((faturamentoBruto / goal) * 100));

  return {
    faturamentoBruto,
    faturamentoLiquido,
    totalComissoes,
    totalDespesas,
    fiadoEmAberto,
    monthlyGoal: goal,
    goalProgress,
    monthAppointmentsCount: monthAppointments.length,
  };
}

export async function getDailyCashFlow(date?: string) {
  const db = await ensureDb();
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Atendimentos pagos à vista no dia (NÃO fiado em aberto)
  const paidAppointments = db.appointments.filter(
    (a) => a.date === targetDate && a.status === 'concluido' && (!a.isFiado || a.fiadoPaid)
  );
  const appointmentsRevenue = paidAppointments.reduce((sum, a) => sum + a.price, 0);

  // Entradas avulsas do dia (produtos, quitações de fiado etc.)
  const dayIncomes = db.incomes.filter((inc) => inc.date === targetDate && !inc.appointmentId);
  const otherIncomes = dayIncomes.reduce((sum, inc) => sum + inc.value, 0);

  // Despesas do dia
  const dayExpenses = db.expenses.filter((e) => e.date === targetDate);
  const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.value, 0);

  // Saldo do caixa diário
  const totalInflow = appointmentsRevenue + otherIncomes;
  const netDailyCash = totalInflow - totalExpenses;

  return {
    date: targetDate,
    appointmentsRevenue,
    otherIncomes,
    totalInflow,
    totalExpenses,
    netDailyCash,
    incomesList: db.incomes.filter((i) => i.date === targetDate),
    expensesList: dayExpenses,
  };
}

export async function createExpense(data: Omit<FinancialExpense, 'id' | 'createdAt'>): Promise<FinancialExpense> {
  const db = await ensureDb();
  const newExp: FinancialExpense = {
    ...data,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.expenses.push(newExp);
  await saveDb(db);
  return newExp;
}

export async function createIncome(data: Omit<FinancialIncome, 'id' | 'createdAt'>): Promise<FinancialIncome> {
  const db = await ensureDb();
  const newInc: FinancialIncome = {
    ...data,
    id: `inc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.incomes.push(newInc);
  await saveDb(db);
  return newInc;
}

// -------------------------------------------------------------
// PROMOÇÕES & MARKETING
// -------------------------------------------------------------

export async function getPromotions(): Promise<Promotion[]> {
  const db = await ensureDb();
  return db.promotions.filter((p) => p.active);
}

export async function getAllPromotionsAdmin(): Promise<Promotion[]> {
  const db = await ensureDb();
  return db.promotions;
}

export async function createPromotion(data: Omit<Promotion, 'id'>): Promise<Promotion> {
  const db = await ensureDb();
  const newPromo: Promotion = {
    ...data,
    id: `promo-${Date.now()}`,
    active: data.active ?? true,
  };
  db.promotions.push(newPromo);
  await saveDb(db);
  return newPromo;
}

export async function updatePromotion(id: string, data: Partial<Promotion>): Promise<Promotion | null> {
  const db = await ensureDb();
  const idx = db.promotions.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.promotions[idx] = { ...db.promotions[idx], ...data, id };
  await saveDb(db);
  return db.promotions[idx];
}

export async function deletePromotion(id: string): Promise<boolean> {
  const db = await ensureDb();
  const init = db.promotions.length;
  db.promotions = db.promotions.filter((p) => p.id !== id);
  if (db.promotions.length === init) return false;
  await saveDb(db);
  return true;
}

// -------------------------------------------------------------
// NOTIFICAÇÕES & AVALIAÇÕES (REVIEWS)
// -------------------------------------------------------------

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const db = await ensureDb();
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const db = await ensureDb();
  const notif = db.notifications.find((n) => n.id === id);
  if (!notif) return false;
  notif.read = true;
  await saveDb(db);
  return true;
}

export async function getReviews(barberId?: string): Promise<Review[]> {
  const db = await ensureDb();
  let list = db.reviews;
  if (barberId) {
    list = list.filter((r) => r.barberId === barberId);
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createReview(data: {
  appointmentId: string;
  clientId: string;
  clientName: string;
  barberId: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const db = await ensureDb();
  const barber = db.barbers.find((b) => b.id === data.barberId);

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    appointmentId: data.appointmentId,
    barberId: data.barberId,
    barberName: barber?.name || 'Barbeiro',
    clientId: data.clientId,
    clientName: data.clientName,
    rating: Math.min(5, Math.max(1, data.rating)),
    comment: data.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(newReview);

  // Recalcula média de avaliações do barbeiro
  const barberReviews = db.reviews.filter((r) => r.barberId === data.barberId);
  if (barber) {
    const totalScore = barberReviews.reduce((sum, r) => sum + r.rating, 0);
    barber.reviews = barberReviews.length;
    barber.rating = Number((totalScore / barberReviews.length).toFixed(1));
  }

  // Vincula id da review ao agendamento
  const apt = db.appointments.find((a) => a.id === data.appointmentId);
  if (apt) {
    apt.reviewId = newReview.id;
  }

  await saveDb(db);
  return newReview;
}

// -------------------------------------------------------------
// ROTINA DE LIMPEZA / MANUTENÇÃO AUTOMÁTICA
// -------------------------------------------------------------

export async function runMaintenanceCleanup(): Promise<{ expiredCount: number }> {
  const db = await ensureDb();
  const today = new Date().toISOString().split('T')[0];
  let expiredCount = 0;

  for (const apt of db.appointments) {
    // Se a data já passou e o status ainda for 'agendado' ou 'confirmado', expira
    if (apt.date < today && (apt.status === 'agendado' || apt.status === 'confirmado')) {
      apt.status = 'cancelado';
      apt.notes = (apt.notes ? apt.notes + ' | ' : '') + 'Expirado por rotina de manutenção (no-show automático)';
      expiredCount++;
    }
  }

  if (expiredCount > 0) {
    await saveDb(db);
  }

  return { expiredCount };
}

// -------------------------------------------------------------
// RELATÓRIOS ANALÍTICOS (ADMIN)
// -------------------------------------------------------------

export async function getAnalyticsReport(month?: string) {
  const db = await ensureDb();
  const currentMonth = month || new Date().toISOString().substring(0, 7);

  const monthAppointments = db.appointments.filter(
    (a) => a.date.startsWith(currentMonth)
  );

  const total = monthAppointments.length;
  const completed = monthAppointments.filter((a) => a.status === 'concluido').length;
  const canceled = monthAppointments.filter((a) => a.status === 'cancelado').length;

  const cancelRate = total > 0 ? Number(((canceled / total) * 100).toFixed(1)) : 0;
  const completionRate = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;

  // Desempenho por barbeiro
  const barberPerformance = db.barbers.map((b) => {
    const bApts = monthAppointments.filter((a) => a.barberId === b.id && a.status === 'concluido');
    const faturamentoGerado = bApts.reduce((sum, a) => sum + a.price, 0);
    const comissaoPaga = bApts.reduce((sum, a) => sum + (a.commission || 0), 0);
    return {
      barberId: b.id,
      name: b.name,
      rating: b.rating,
      completedCuts: bApts.length,
      faturamentoGerado,
      comissaoPaga,
      lucroBarbearia: faturamentoGerado - comissaoPaga,
    };
  });

  // Serviços mais pedidos e rentáveis
  const serviceStats = db.services.map((s) => {
    const sApts = monthAppointments.filter((a) => a.serviceId === s.id && a.status === 'concluido');
    const totalVolume = sApts.length;
    const totalRevenue = sApts.reduce((sum, a) => sum + a.price, 0);
    return {
      serviceId: s.id,
      name: s.name,
      price: s.price,
      totalVolume,
      totalRevenue,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    month: currentMonth,
    totalAppointments: total,
    completed,
    canceled,
    cancelRate,
    completionRate,
    barberPerformance,
    serviceStats,
  };
}

// -------------------------------------------------------------
// COMPATIBILIDADE MULTI-TENANT E ROTAS EXISTENTES
// -------------------------------------------------------------

export async function getBarbershops(): Promise<Barbershop[]> {
  const db = await ensureDb();
  return db.barbershops;
}

export async function getBarbershopBySlug(slug: string): Promise<Barbershop | null> {
  const db = await ensureDb();
  const normalized = slug.trim().toLowerCase();
  return db.barbershops.find((b) => b.slug.toLowerCase() === normalized) || db.barbershops[0] || null;
}

export async function updateBarbershop(idOrSlug: string, data: Partial<Barbershop>): Promise<Barbershop | null> {
  const db = await ensureDb();
  const idx = db.barbershops.findIndex((b) => b.id === idOrSlug || b.slug === idOrSlug);
  if (idx === -1) return null;
  db.barbershops[idx] = { ...db.barbershops[idx], ...data };
  await saveDb(db);
  return db.barbershops[idx];
}

export async function createBarbershop(data: {
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  address?: string;
  openHours?: string;
  desiredSlug?: string;
  plan?: 'FREE' | 'PRO';
  instagram?: string;
  adminEmail?: string;
  adminPassword?: string;
}): Promise<{ barbershop: Barbershop; defaultUrl: string; loginUrl: string; adminEmail?: string }> {
  const db = await ensureDb();
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const newShop: Barbershop = {
    id: `shop-${Date.now()}`,
    slug: slug || `shop-${Date.now()}`,
    name: data.name,
    ownerName: data.ownerName,
    ownerEmail: data.adminEmail || `${slug}@barbearia.com`,
    ownerPhone: data.ownerPhone,
    address: data.address || 'Centro',
    openHours: '08:00 às 20:00',
    plan: data.plan || 'PRO',
    maxBarbers: data.plan === 'FREE' ? 1 : 99,
    monthlyAppointmentLimit: data.plan === 'FREE' ? 30 : 999999,
    instagram: data.instagram || '',
    createdAt: new Date().toISOString(),
  };
  db.barbershops.push(newShop);

  // Cadastra o usuário Admin com login e senha fornecidos pelo dono
  const adminEmail = (data.adminEmail || `${slug}@barbearia.com`).trim().toLowerCase();
  const adminPassword = data.adminPassword || 'admin123';
  const existingUserIdx = db.users.findIndex((u) => u.email.toLowerCase() === adminEmail);
  const adminUser: User = {
    id: `usr-admin-${Date.now()}`,
    name: `${data.ownerName} (Dono)`,
    email: adminEmail,
    password_hash: adminPassword,
    role: 'admin',
    phone: data.ownerPhone,
    barbershopId: newShop.id,
    blocked: false,
    createdAt: new Date().toISOString(),
  };

  if (existingUserIdx >= 0) {
    db.users[existingUserIdx] = adminUser;
  } else {
    db.users.push(adminUser);
  }

  // Cria o primeiro barbeiro vinculado à barbearia para permitir agendamentos imediatos
  const initialBarber: Barber = {
    id: `barber-${Date.now()}`,
    userId: adminUser.id,
    barbershopId: newShop.id,
    name: data.ownerName,
    specialty: 'Mestre da Navalha & Cortes Modernos',
    commission: 50,
    commissionRate: 50,
    rating: 5.0,
    reviews: 0,
    active: true,
    phone: data.ownerPhone,
    email: adminEmail,
    blockedSlots: [],
    holidays: [],
    workingHours: {
      start: '08:00',
      end: '20:00',
    },
    daysOfWeek: [1, 2, 3, 4, 5, 6],
  };
  db.barbers.push(initialBarber);

  // Cria os serviços padrão para a nova barbearia
  const defaultServices: Service[] = [
    {
      id: `srv-${Date.now()}-1`,
      barbershopId: newShop.id,
      name: 'Corte Degradê & Social',
      description: 'Corte moderno ou tradicional com acabamento e lavagem.',
      price: 45,
      duration: 30,
      durationMinutes: 30,
      popular: true,
      active: true,
      category: 'cabelo',
    },
    {
      id: `srv-${Date.now()}-2`,
      barbershopId: newShop.id,
      name: 'Barboterapia Completa',
      description: 'Alinhamento com toalha quente, óleos e navalha.',
      price: 35,
      duration: 30,
      durationMinutes: 30,
      popular: true,
      active: true,
      category: 'barba',
    },
    {
      id: `srv-${Date.now()}-3`,
      barbershopId: newShop.id,
      name: 'Combo Cabelo + Barba',
      description: 'Experiência completa de corte e barba com toalha quente.',
      price: 70,
      duration: 50,
      durationMinutes: 50,
      popular: true,
      active: true,
      category: 'combo',
    },
  ];
  db.services.push(...defaultServices);

  await saveDb(db);
  return { 
    barbershop: newShop, 
    defaultUrl: `/b/${newShop.slug}`,
    loginUrl: `/b/${newShop.slug}/login`,
    adminEmail,
  };
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const db = await ensureDb();
  const init = db.customers.length;
  db.customers = db.customers.filter((c) => c.id !== id);
  if (db.customers.length === init) return false;
  await saveDb(db);
  return true;
}

export async function getCustomerHistory(phoneOrId: string, _shopIdOrSlug?: string) {
  const db = await ensureDb();
  const cleanPhone = phoneOrId.replace(/\D/g, '');
  const customer = db.customers.find((c) => c.id === phoneOrId || c.phone.replace(/\D/g, '') === cleanPhone) || null;
  const appointments = db.appointments.filter(
    (a) => (customer && a.clientId === customer.userId) || a.clientPhone.replace(/\D/g, '') === cleanPhone
  );
  return { customer, appointments };
}

export async function getFinancialSummary(_shopIdOrSlug?: string, month?: string) {
  const overview = await getFinancialOverview(month);
  const analytics = await getAnalyticsReport(month);
  return {
    totalRevenue: overview.faturamentoBruto,
    totalExpenses: overview.totalDespesas,
    totalCommissions: overview.totalComissoes,
    netProfit: overview.faturamentoLiquido,
    commissionsByBarber: analytics.barberPerformance.map((b) => ({
      barberId: b.barberId,
      barberName: b.name,
      commissionRate: 50,
      cutsCount: b.completedCuts,
      totalGenerated: b.faturamentoGerado,
      commissionDue: b.comissaoPaga,
    })),
    recentTransactions: [],
  };
}

export async function createFinancialTransaction(data: any) {
  if (data.type === 'despesa') {
    return await createExpense({
      label: data.description || 'Despesa',
      value: data.amount,
      date: data.date,
      time: '12:00',
      category: data.category,
    });
  } else {
    return await createIncome({
      label: data.description || 'Receita',
      value: data.amount,
      date: data.date,
      time: '12:00',
      category: data.category,
    });
  }
}

export async function getDashboardStats(shopIdOrSlug?: string) {
  const db = await ensureDb();
  const shop = shopIdOrSlug
    ? db.barbershops.find((s) => s.id === shopIdOrSlug || s.slug === shopIdOrSlug)
    : db.barbershops[0];

  const plan = shop?.plan || 'PRO';
  const isFree = plan === 'FREE';

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);

  const shopAppointments = db.appointments.filter((a) => {
    if (!shop) return true;
    return a.barbershopId === shop.id || a.barbershopId === shop.slug;
  });

  const todayApts = shopAppointments.filter((a) => a.date === today);
  const todayRevenue = todayApts.filter((a) => a.status === 'concluido').reduce((s, a) => s + a.price, 0);
  const overview = await getFinancialOverview(shop?.id);

  const monthAppointments = shopAppointments.filter(
    (a) => a.date.startsWith(currentMonth) && a.status !== 'cancelado'
  );
  const monthAppointmentsCount = monthAppointments.length;
  const monthlyLimit = isFree ? 30 : 99999;
  const limitReached = isFree ? monthAppointmentsCount >= 30 : false;

  const shopBarbers = db.barbers.filter((b) => !shop || b.barbershopId === shop.id);

  return {
    todayAppointmentsCount: todayApts.length,
    todayRevenue,
    monthRevenue: overview.faturamentoBruto,
    monthExpenses: overview.totalDespesas,
    monthNetProfit: overview.faturamentoLiquido,
    pendingCount: shopAppointments.filter((a) => a.status === 'agendado').length,
    confirmedCount: shopAppointments.filter((a) => a.status === 'confirmado').length,
    completedCount: shopAppointments.filter((a) => a.status === 'concluido').length,
    canceledCount: shopAppointments.filter((a) => a.status === 'cancelado').length,
    totalClientsServed: db.customers.length,
    barbersCount: shopBarbers.length,
    monthAppointmentsCount,
    monthlyLimit,
    limitReached,
    plan,
  };
}

export async function getUpcomingReminders(_shopIdOrSlug?: string) {
  const db = await ensureDb();
  const today = new Date().toISOString().split('T')[0];
  const activeApts = db.appointments.filter((a) => a.date >= today && a.status !== 'cancelado' && a.status !== 'concluido');

  return activeApts.map((a) => ({
    id: a.id,
    customerName: a.clientName,
    customerPhone: a.clientPhone,
    serviceName: a.serviceName,
    barberName: a.barberName,
    date: a.date,
    time: a.time,
    type: (a.date === today ? 'hoje' : 'amanha') as 'hoje' | 'amanha',
    whatsappUrl: `https://wa.me/55${a.clientPhone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(a.clientName)}!%20Lembrete%20do%20seu%20corte.`,
  }));
}

export async function createCustomer(data: {
  barbershopId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}): Promise<Customer> {
  const db = await ensureDb();
  const cleanPhone = data.phone.replace(/\D/g, '');
  const existing = db.customers.find(
    (c) => c.phone.replace(/\D/g, '') === cleanPhone
  );

  if (existing) {
    existing.name = data.name;
    existing.email = data.email || existing.email;
    existing.notes = data.notes || existing.notes;
    await saveDb(db);
    return existing;
  }

  const newCust: Customer = {
    ...data,
    id: `cust-${Date.now()}`,
    totalVisits: 0,
    totalSpent: 0,
    blocked: false,
    createdAt: new Date().toISOString(),
  };
  db.customers.push(newCust);
  await saveDb(db);
  return newCust;
}

export async function updateBarbershopSubscription(data: {
  barbershopIdOrSlug?: string;
  email?: string;
  plan: 'FREE' | 'PRO';
  status: 'active' | 'past_due' | 'unpaid' | 'canceled';
  expiresAt?: string;
  orderId?: string;
  subscriptionId?: string;
}): Promise<Barbershop | null> {
  const db = await ensureDb();
  
  let shop = db.barbershops.find((s) => 
    (data.barbershopIdOrSlug && (s.id === data.barbershopIdOrSlug || s.slug === data.barbershopIdOrSlug)) ||
    (data.email && s.ownerEmail.toLowerCase() === data.email.toLowerCase())
  );

  if (!shop && db.barbershops.length === 1) {
    shop = db.barbershops[0];
  }

  if (!shop) return null;

  shop.plan = data.plan;
  shop.subscriptionStatus = data.status;
  if (data.expiresAt) shop.subscriptionExpiresAt = data.expiresAt;
  if (data.orderId) shop.kiwifyOrderId = data.orderId;
  if (data.subscriptionId) shop.kiwifySubscriptionId = data.subscriptionId;

  await saveDb(db);
  return shop;
}


