import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const stats = await getDashboardStats(shop);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao calcular estatísticas' }, { status: 500 });
  }
}
