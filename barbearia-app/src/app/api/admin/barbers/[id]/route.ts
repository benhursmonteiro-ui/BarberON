import { NextResponse } from 'next/server';
import { updateBarber, deleteBarber, getBarberById } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const barber = await getBarberById(id);
    if (!barber) return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    return NextResponse.json(barber);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar barbeiro.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updateBarber(id, body);
    if (!updated) return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar barbeiro.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const success = await deleteBarber(id);
    if (!success) return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir barbeiro.' }, { status: 500 });
  }
}
