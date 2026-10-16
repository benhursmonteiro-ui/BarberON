import { NextResponse } from 'next/server';
import { createBarbershop, getBarbershops } from '@/lib/db';

export async function GET() {
  try {
    const barbershops = await getBarbershops();
    return NextResponse.json(barbershops);
  } catch (error) {
    console.error('Erro ao listar barbearias:', error);
    return NextResponse.json({ error: 'Erro ao listar barbearias' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      ownerName, 
      ownerEmail, 
      ownerPhone, 
      address, 
      openHours, 
      plan, 
      desiredSlug, 
      instagram,
      adminEmail,
      adminPassword
    } = body;

    if (!name || !ownerName || !ownerPhone) {
      return NextResponse.json(
        { error: 'Nome da barbearia, nome do dono e WhatsApp são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await createBarbershop({
      name,
      ownerName,
      ownerEmail: adminEmail || ownerEmail || `${ownerName.toLowerCase().replace(/\s+/g, '')}@barberon.com`,
      ownerPhone,
      address,
      openHours,
      plan: plan || 'PRO',
      desiredSlug,
      instagram,
      adminEmail,
      adminPassword,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar barbearia:', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
