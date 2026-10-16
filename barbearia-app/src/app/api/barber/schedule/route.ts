import { NextResponse } from 'next/server';
import { 
  updateAppointmentStatus, 
  updateBarber, 
  getBarberById, 
  getAppointments 
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    const date = searchParams.get('date') || undefined;

    if (!barberId) {
      return NextResponse.json({ error: 'barberId é obrigatório.' }, { status: 400 });
    }

    const appointments = await getAppointments({
      barberId,
      date,
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar agenda do barbeiro.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios.' }, { status: 400 });
    }

    // Avança status e calcula comissão automática ao concluir
    const updated = await updateAppointmentStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar status do atendimento.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barberId, slot, holiday, action } = body;

    const barber = await getBarberById(barberId);
    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    }

    if (action === 'toggle_slot' && slot) {
      let blockedSlots = barber.blockedSlots || [];
      if (blockedSlots.includes(slot)) {
        blockedSlots = blockedSlots.filter((s) => s !== slot);
      } else {
        blockedSlots.push(slot);
      }
      const updated = await updateBarber(barberId, { blockedSlots });
      return NextResponse.json(updated);
    }

    if (action === 'toggle_holiday' && holiday) {
      let holidays = barber.holidays || [];
      if (holidays.includes(holiday)) {
        holidays = holidays.filter((h) => h !== holiday);
      } else {
        holidays.push(holiday);
      }
      const updated = await updateBarber(barberId, { holidays });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao configurar horários e folgas.' }, { status: 500 });
  }
}
