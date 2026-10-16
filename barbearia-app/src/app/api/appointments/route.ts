import { NextResponse } from 'next/server';
import { createAppointment, getAppointments } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const barberId = searchParams.get('barberId') || undefined;
    const status = searchParams.get('status') || undefined;

    const appointments = await getAppointments({
      date,
      barberId,
      status,
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      clientName,
      customerPhone, 
      clientPhone,
      customerEmail, 
      clientEmail,
      serviceId, 
      barberId, 
      date, 
      time, 
      notes,
      slug,
      barbershopId
    } = body;

    const name = customerName || clientName;
    const phone = customerPhone || clientPhone;

    if (!name || !phone || !serviceId || !barberId || !date || !time) {
      return NextResponse.json(
        { error: 'Todos os campos essenciais devem ser preenchidos.' },
        { status: 400 }
      );
    }

    const result = await createAppointment({
      clientId: `client-${Date.now()}`,
      clientName: name,
      clientPhone: phone,
      clientEmail: customerEmail || clientEmail,
      serviceId,
      barberId,
      date,
      time,
      notes,
      slug,
      barbershopId,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json(result.appointment, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
