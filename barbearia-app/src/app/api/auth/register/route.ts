import { NextResponse } from 'next/server';
import { registerUser, getBarbershopBySlug } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, slug } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Nome, e-mail, telefone e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    let barbershopId: string | undefined;
    if (slug) {
      const shop = await getBarbershopBySlug(slug);
      if (shop) barbershopId = shop.id;
    }

    const result = await registerUser({
      name,
      email,
      password_hash: password,
      role: 'client',
      phone,
      barbershopId,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const user = result.user!;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        barbershopId,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erro no cadastro de cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar cadastro.' },
      { status: 500 }
    );
  }
}
