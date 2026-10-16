import { NextResponse } from 'next/server';
import { getUpcomingReminders } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const reminders = await getUpcomingReminders(shop);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Erro ao buscar fila de lembretes:', error);
    return NextResponse.json({ error: 'Erro ao buscar lembretes' }, { status: 500 });
  }
}
