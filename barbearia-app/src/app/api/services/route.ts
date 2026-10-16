import { NextResponse } from 'next/server';
import { createService, getServices } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const services = await getServices(shop);
    return NextResponse.json(services);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barbershopId, name, description, durationMinutes, price, category, popular } = body;

    if (!name || !price || !durationMinutes) {
      return NextResponse.json(
        { error: 'Nome, preço e duração são obrigatórios' },
        { status: 400 }
      );
    }

    const newService = await createService({
      barbershopId: barbershopId || 'shop-imperial',
      name,
      description: description || '',
      duration: Number(durationMinutes),
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      category: category || 'cabelo',
      popular: Boolean(popular),
      active: true,
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}
