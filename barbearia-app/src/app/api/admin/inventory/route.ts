import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar estoque de produtos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProd = await createProduct({
      name: body.name,
      category: body.category || 'Geral',
      price: Number(body.price),
      stock: Number(body.stock),
      minStock: Number(body.minStock || 3),
      image: body.image,
      active: body.active ?? true,
    });
    return NextResponse.json(newProd, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar produto.' }, { status: 500 });
  }
}
