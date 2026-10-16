import { NextResponse } from 'next/server';
import { getBarbershopBySlug, updateBarbershop } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const barbershop = await getBarbershopBySlug(slug);

    if (!barbershop) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    return NextResponse.json(barbershop);
  } catch (error) {
    console.error('Erro ao buscar barbearia:', error);
    return NextResponse.json({ error: 'Erro ao buscar barbearia' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const updated = await updateBarbershop(slug, body);

    if (!updated) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar barbearia:', error);
    return NextResponse.json({ error: 'Erro ao atualizar barbearia' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return PUT(request, { params });
}
