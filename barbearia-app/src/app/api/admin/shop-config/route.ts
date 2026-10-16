import { NextResponse } from 'next/server';
import { getShopConfig, updateShopConfig } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopIdOrSlug = searchParams.get('slug') || searchParams.get('shopId') || undefined;
    const config = await getShopConfig(shopIdOrSlug);
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar configurações.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopIdOrSlug = searchParams.get('slug') || searchParams.get('shopId') || undefined;
    const body = await request.json();
    const updated = await updateShopConfig(body, shopIdOrSlug);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar configurações.' }, { status: 500 });
  }
}
