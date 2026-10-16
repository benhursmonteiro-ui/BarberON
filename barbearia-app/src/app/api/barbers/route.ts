import { NextResponse } from 'next/server';
import { createBarber, getBarbers, updateBarber } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const barbers = await getBarbers(shop);
    return NextResponse.json(barbers);
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    return NextResponse.json({ error: 'Erro ao buscar barbeiros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBarber = await createBarber({
      ...body,
      barbershopId: body.barbershopId || 'shop-imperial',
    });
    return NextResponse.json(newBarber, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar barbeiro' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await updateBarber(id, data);

    if (!updated) {
      return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao atualizar barbeiro' }, { status: 500 });
  }
}
