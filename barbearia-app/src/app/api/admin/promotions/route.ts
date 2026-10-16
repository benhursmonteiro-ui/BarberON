import { NextResponse } from 'next/server';
import { getAllPromotionsAdmin, createPromotion } from '@/lib/db';

export async function GET() {
  try {
    const promos = await getAllPromotionsAdmin();
    return NextResponse.json(promos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar promoções.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPromo = await createPromotion({
      tag: body.tag,
      title: body.title,
      description: body.description,
      price: Number(body.price),
      color: body.color || '#b45309',
      active: body.active ?? true,
    });
    return NextResponse.json(newPromo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar promoção.' }, { status: 500 });
  }
}
