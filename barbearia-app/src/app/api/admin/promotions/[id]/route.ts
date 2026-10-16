import { NextResponse } from 'next/server';
import { updatePromotion, deletePromotion } from '@/lib/db';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updatePromotion(id, body);
    if (!updated) return NextResponse.json({ error: 'Promoção não encontrada.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar promoção.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const success = await deletePromotion(id);
    if (!success) return NextResponse.json({ error: 'Promoção não encontrada.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir promoção.' }, { status: 500 });
  }
}
