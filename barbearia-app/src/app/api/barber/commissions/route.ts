import { NextResponse } from 'next/server';
import { getAppointments, getBarberById } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    const month = searchParams.get('month'); // YYYY-MM
    const date = searchParams.get('date');   // YYYY-MM-DD

    if (!barberId) {
      return NextResponse.json({ error: 'barberId é obrigatório.' }, { status: 400 });
    }

    const barber = await getBarberById(barberId);
    let appointments = await getAppointments({ barberId });

    // Apenas concluídos geram comissão
    appointments = appointments.filter((a) => a.status === 'concluido');

    if (month) {
      appointments = appointments.filter((a) => a.date.startsWith(month));
    } else if (date) {
      appointments = appointments.filter((a) => a.date === date);
    }

    const statement = appointments.map((a) => {
      const commRate = barber?.commission || 50;
      const commissionEarned = a.commission || Number(((a.price * commRate) / 100).toFixed(2));
      return {
        id: a.id,
        date: a.date,
        time: a.time,
        clientName: a.clientName,
        clientPhone: a.clientPhone,
        serviceName: a.serviceName,
        servicePrice: a.price,
        commissionPercentage: commRate,
        commissionEarned,
        paymentMethod: a.paymentMethod,
        isFiado: a.isFiado,
        fiadoPaid: a.fiadoPaid,
      };
    });

    const totalRevenueGenerated = statement.reduce((sum, s) => sum + s.servicePrice, 0);
    const totalCommissionsEarned = statement.reduce((sum, s) => sum + s.commissionEarned, 0);

    return NextResponse.json({
      barber,
      totalCuts: statement.length,
      totalRevenueGenerated,
      totalCommissionsEarned,
      statement,
    });
  } catch (error) {
    console.error('Erro ao buscar extrato de comissões:', error);
    return NextResponse.json({ error: 'Erro ao buscar extrato de comissões.' }, { status: 500 });
  }
}
