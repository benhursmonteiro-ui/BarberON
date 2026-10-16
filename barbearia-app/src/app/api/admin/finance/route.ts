import { NextResponse } from 'next/server';
import { 
  getFinancialOverview, 
  getDailyCashFlow, 
  getFiadoList, 
  createExpense, 
  createIncome, 
  settleFiado, 
  createManualFiado 
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'overview';
    const date = searchParams.get('date') || undefined;
    const month = searchParams.get('month') || undefined;

    if (mode === 'daily') {
      const daily = await getDailyCashFlow(date);
      return NextResponse.json(daily);
    }

    if (mode === 'fiado') {
      const fiado = await getFiadoList();
      return NextResponse.json(fiado);
    }

    const [overview, daily, fiado] = await Promise.all([
      getFinancialOverview(month),
      getDailyCashFlow(date),
      getFiadoList(),
    ]);

    return NextResponse.json({
      overview,
      daily,
      fiado,
    });
  } catch (error) {
    console.error('Erro na API financeira:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'expense') {
      const newExp = await createExpense({
        label: body.label,
        value: Number(body.value),
        date: body.date || new Date().toISOString().split('T')[0],
        time: body.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        category: body.category || 'Geral',
      });
      return NextResponse.json(newExp, { status: 201 });
    }

    if (action === 'income') {
      const newInc = await createIncome({
        label: body.label,
        value: Number(body.value),
        date: body.date || new Date().toISOString().split('T')[0],
        time: body.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        category: body.category || 'Avulso',
      });
      return NextResponse.json(newInc, { status: 201 });
    }

    if (action === 'settle_fiado') {
      const result = await settleFiado(body.appointmentId, body.paymentMethod || 'pix');
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    if (action === 'manual_fiado') {
      const newFiado = await createManualFiado({
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        barberId: body.barberId,
        serviceName: body.serviceName,
        amount: Number(body.amount),
        date: body.date,
        notes: body.notes,
      });
      return NextResponse.json(newFiado, { status: 201 });
    }

    return NextResponse.json({ error: 'Ação financeira não reconhecida.' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao processar lançamento financeiro:', error);
    return NextResponse.json({ error: 'Erro interno no lançamento financeiro.' }, { status: 500 });
  }
}
