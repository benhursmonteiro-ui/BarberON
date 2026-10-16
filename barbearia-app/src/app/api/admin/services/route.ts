import { NextResponse } from 'next/server';
import { getAllServicesAdmin, createService } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopIdOrSlug = searchParams.get('slug') || searchParams.get('barbershopId') || searchParams.get('shopId') || undefined;
    const services = await getAllServicesAdmin(shopIdOrSlug);
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar serviços.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newService = await createService(body);
    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar serviço.' }, { status: 500 });
  }
}
