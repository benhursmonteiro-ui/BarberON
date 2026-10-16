import { NextResponse } from 'next/server';
import { getAllBarbersAdmin, createBarber } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopIdOrSlug = searchParams.get('slug') || searchParams.get('barbershopId') || searchParams.get('shopId') || undefined;
    const barbers = await getAllBarbersAdmin(shopIdOrSlug);
    return NextResponse.json(barbers);
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    return NextResponse.json({ error: 'Erro ao buscar barbeiros.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBarber = await createBarber(body);
    return NextResponse.json(newBarber, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar barbeiro.' }, { status: 500 });
  }
}
