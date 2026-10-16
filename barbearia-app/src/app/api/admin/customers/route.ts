import { NextResponse } from 'next/server';
import { getCustomers, toggleCustomerBlock } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || undefined;
    const customers = await getCustomers(search);
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar clientes.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'ID do cliente é obrigatório.' }, { status: 400 });

    const updated = await toggleCustomerBlock(id);
    if (!updated) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao alterar status do cliente.' }, { status: 500 });
  }
}
