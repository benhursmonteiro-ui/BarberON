import { NextResponse } from 'next/server';
import { 
  getServices, 
  getBarbers, 
  getAvailableSlots, 
  createAppointment 
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    const date = searchParams.get('date');
    const duration = searchParams.get('duration') ? Number(searchParams.get('duration')) : 30;

    const shopIdOrSlug = searchParams.get('slug') || searchParams.get('shopId') || searchParams.get('barbershopId') || undefined;

    if (!barberId || !date) {
      // Se não passou parâmetros de data/barbeiro, retorna listas iniciais para o fluxo
      const [services, barbers] = await Promise.all([
        getServices(shopIdOrSlug),
        getBarbers(shopIdOrSlug),
      ]);
      return NextResponse.json({ services, barbers });
    }

    // Calcula slots disponíveis considerando a duração do corte e bloqueios
    const slots = await getAvailableSlots(barberId, date, duration);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Erro no booking client:', error);
    return NextResponse.json({ error: 'Erro ao consultar disponibilidade.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createAppointment(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.appointment, { status: 201 });
  } catch (error) {
    console.error('Erro ao realizar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao processar agendamento.' }, { status: 500 });
  }
}
