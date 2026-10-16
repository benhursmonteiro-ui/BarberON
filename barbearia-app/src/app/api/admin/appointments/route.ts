import { NextResponse } from 'next/server';
import { 
  getAppointments, 
  createAppointment, 
  updateAppointmentStatus 
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const barberId = searchParams.get('barberId') || undefined;
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const clientId = searchParams.get('clientId') || undefined;
    const barbershopId = searchParams.get('barbershopId') || searchParams.get('shopId') || undefined;
    const slug = searchParams.get('slug') || undefined;

    const list = await getAppointments({
      date,
      barberId,
      status,
      paymentStatus,
      clientId,
      barbershopId,
      slug,
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos.' }, { status: 500 });
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
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao criar agendamento.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, paymentMethod, paymentStatus } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios.' }, { status: 400 });
    }

    const updated = await updateAppointmentStatus(id, status, {
      paymentMethod,
      paymentStatus,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar agendamento.' }, { status: 500 });
  }
}
