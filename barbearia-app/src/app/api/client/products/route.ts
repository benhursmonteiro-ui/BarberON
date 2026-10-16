import { NextResponse } from 'next/server';
import { getProducts, checkoutCart } from '@/lib/db';

export async function GET() {
  try {
    const products = await getProducts();
    const activeProducts = products.filter((p) => p.active !== false);
    return NextResponse.json(activeProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar catálogo de produtos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await checkoutCart({
      clientId: body.clientId,
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      items: body.items,
      paymentMethod: body.paymentMethod || 'pix',
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.order, { status: 201 });
  } catch (error) {
    console.error('Erro no checkout de produtos:', error);
    return NextResponse.json({ error: 'Erro ao processar compra de produtos.' }, { status: 500 });
  }
}
