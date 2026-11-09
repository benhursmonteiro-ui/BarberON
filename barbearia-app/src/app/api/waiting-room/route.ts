import { NextResponse } from 'next/server';
import {
  createWaitingQueueEntry,
  getWaitingQueue,
  updateWaitingQueueStatus,
} from '@/lib/db';
import { WaitingQueueStatus } from '@/lib/types';

const QUEUE_STATUSES: WaitingQueueStatus[] = [
  'aguardando',
  'em_atendimento',
  'concluido',
  'cancelado',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('slug') || searchParams.get('barbershopId') || undefined;
    const queue = await getWaitingQueue(shop);

    return NextResponse.json(queue.map((entry) => ({
      id: entry.id,
      displayName: `${entry.name.trim().split(/\s+/)[0]} ${entry.name.trim().split(/\s+/).slice(1).map((part) => `${part[0]}.`).join(' ')}`.trim(),
      barberName: entry.barberName,
      serviceName: entry.serviceName,
      status: entry.status,
      position: entry.position,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      createdAt: entry.createdAt,
    })));
  } catch (error) {
    console.error('Erro ao buscar fila de espera:', error);
    return NextResponse.json({ error: 'Erro ao buscar fila de espera.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, barbershopId, name, phone, barberId, serviceId, notes } = body;

    if (typeof name !== 'string' || !name.trim() || typeof phone !== 'string' ||
        typeof barberId !== 'string' || typeof serviceId !== 'string') {
      return NextResponse.json(
        { error: 'Nome, telefone, barbeiro e serviço são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await createWaitingQueueEntry({
      shopIdOrSlug: slug || barbershopId,
      name,
      phone,
      barberId,
      serviceId,
      notes: typeof notes === 'string' ? notes : undefined,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, id: result.entry?.id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar cliente à fila:', error);
    return NextResponse.json({ error: 'Erro ao adicionar cliente à fila.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, slug, barbershopId } = body;
    if (typeof id !== 'string' || !QUEUE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Cliente ou status inválido.' }, { status: 400 });
    }

    const result = await updateWaitingQueueStatus(id, status, slug || barbershopId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar fila de espera:', error);
    return NextResponse.json({ error: 'Erro ao atualizar fila de espera.' }, { status: 500 });
  }
}
