import { NextResponse } from 'next/server';
import { getCustomerHistory } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const history = await getCustomerHistory(id, shop);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico do cliente:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}
