import { NextResponse } from 'next/server';
import { deleteBarber, updateBarber } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateBarber(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao atualizar barbeiro' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteBarber(id);

    if (!success) {
      return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Barbeiro removido com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao excluir barbeiro' }, { status: 500 });
  }
}
