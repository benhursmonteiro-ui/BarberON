import { NextResponse } from 'next/server';
import { authenticateUser, getBarbershops } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas ou conta bloqueada.' },
        { status: 401 }
      );
    }

    // Busca a barbearia vinculada ao usuário para trazer dados reais e plano escolhido
    let barbershopId = user.barbershopId;
    let shopSlug: string | undefined;
    let plan: 'FREE' | 'PRO' | undefined;

    if (barbershopId) {
      const shops = await getBarbershops();
      const shop = shops.find((s) => s.id === barbershopId);
      if (shop) {
        shopSlug = shop.slug;
        plan = shop.plan;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
        barbershopId: user.barbershopId,
        shopSlug,
        plan,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar autenticação.' },
      { status: 500 }
    );
  }
}
