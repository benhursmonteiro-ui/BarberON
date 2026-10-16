import { NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const barberId = searchParams.get('barberId');
    const date = searchParams.get('date');
    const duration = searchParams.get('duration');

    if (!barberId || !date) {
      return NextResponse.json(
        { error: 'barberId e date são obrigatórios' },
        { status: 400 }
      );
    }

    const durationMinutes = duration ? parseInt(duration, 10) : 30;
    const slots = await getAvailableSlots(barberId, date, durationMinutes);

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Erro ao calcular horários disponíveis:', error);
    return NextResponse.json({ error: 'Erro ao calcular horários disponíveis' }, { status: 500 });
  }
}
