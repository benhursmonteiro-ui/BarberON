import { NextResponse } from 'next/server';
import { getBarbershopBySlug, getBarbershops, updateBarbershop } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (slug) {
      const shop = await getBarbershopBySlug(slug);
      return NextResponse.json(shop);
    }
    const shops = await getBarbershops();
    return NextResponse.json(shops[0] || null);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || body.slug || 'imperial';
    const updated = await updateBarbershop(slug, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar dados da barbearia:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados da barbearia' }, { status: 500 });
  }
}
