import { NextResponse } from 'next/server';
import { getAppointments, updateAppointmentStatus } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const phone = searchParams.get('phone');

    let appointments = await getAppointments();

    if (clientId) {
      appointments = appointments.filter((a) => a.clientId === clientId);
    } else if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      appointments = appointments.filter((a) => a.clientPhone.replace(/\D/g, '').includes(cleanPhone));
    }

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar agendamentos do cliente.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const updated = await updateAppointmentStatus(id, 'cancelado');
    if (!updated) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cancelar agendamento.' }, { status: 500 });
  }
}
