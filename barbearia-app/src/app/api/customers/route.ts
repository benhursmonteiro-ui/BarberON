import { NextResponse } from 'next/server';
import { createCustomer, getCustomers } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const search = searchParams.get('q') || undefined;
    const customers = await getCustomers(shop, search);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barbershopId, shop, slug, name, phone, email, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nome e telefone/WhatsApp são obrigatórios.' },
        { status: 400 }
      );
    }

    const targetShop = barbershopId || shop || slug || 'shop-imperial';

    const customer = await createCustomer({
      barbershopId: targetShop,
      name,
      phone,
      email,
      notes,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
