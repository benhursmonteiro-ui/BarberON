import { NextResponse } from 'next/server';
import { createFinancialTransaction, getFinancialSummary } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const month = searchParams.get('month') || undefined;
    const summary = await getFinancialSummary(shop, month);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Erro ao buscar financeiro:', error);
    return NextResponse.json({ error: 'Erro ao buscar financeiro' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barbershopId, shop, slug, type, category, amount, description, paymentMethod, date, barberId } = body;

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Tipo, valor e descrição são obrigatórios.' },
        { status: 400 }
      );
    }

    const targetShop = barbershopId || shop || slug || 'shop-imperial';

    const tx = await createFinancialTransaction({
      barbershopId: targetShop,
      type,
      category: category || 'outros',
      amount: Number(amount),
      description,
      paymentMethod: paymentMethod || 'pix',
      date: date || new Date().toISOString().split('T')[0],
      barberId: barberId || undefined,
    });

    return NextResponse.json(tx, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar transação financeira:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar transação' }, { status: 500 });
  }
}
