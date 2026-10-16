import { NextResponse } from 'next/server';
import { 
  getAppointments, 
  getBarberById, 
  getBarberByUserId, 
  getReviews, 
  ensureDb 
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-barber-1';
    const barberIdParam = searchParams.get('barberId');

    const shopIdParam = searchParams.get('shopId') || searchParams.get('barbershopId');
    const slugParam = searchParams.get('slug');

    let barber = barberIdParam 
      ? await getBarberById(barberIdParam) 
      : await getBarberByUserId(userId);

    const db = await ensureDb();

    // Se o usuário não tem perfil de barbeiro direto, busca pelo barbershopId vinculado ao usuário ou pelo slug
    if (!barber && (shopIdParam || slugParam)) {
      const targetShop = db.barbershops.find(
        (b) => b.id === shopIdParam || (slugParam && b.slug.toLowerCase() === slugParam.toLowerCase())
      );
      if (targetShop) {
        barber = db.barbers.find((b) => b.barbershopId === targetShop.id) || null;
      }
    }

    // Se ainda não encontrou, mas o userId foi informado e pertence a um admin/barbeiro de uma barbearia
    if (!barber && userId) {
      const user = db.users.find((u) => u.id === userId);
      if (user?.barbershopId) {
        barber = db.barbers.find((b) => b.barbershopId === user.barbershopId) || null;
      }
    }

    // Fallback apenas para ambiente demo geral quando nada foi especificado
    if (!barber && !shopIdParam && !slugParam && userId === 'usr-barber-1') {
      barber = db.barbers[0];
    }

    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    // Atendimentos de hoje
    const todayAppointments = await getAppointments({
      barberId: barber.id,
      date: today,
    });

    // Todos do mês
    const allAppointments = await getAppointments({
      barberId: barber.id,
    });

    const monthCompleted = allAppointments.filter(
      (a) => a.date.startsWith(currentMonth) && a.status === 'concluido'
    );

    const monthCommissions = monthCompleted.reduce(
      (sum, a) => sum + (a.commission || 0),
      0
    );

    const reviews = await getReviews(barber.id);

    return NextResponse.json({
      barber,
      todayAppointments,
      monthCommissions,
      monthCompletedCount: monthCompleted.length,
      averageRating: barber.rating,
      totalReviews: barber.reviews,
      recentReviews: reviews.slice(0, 5),
    });
  } catch (error) {
    console.error('Erro no dashboard do barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao carregar dashboard do barbeiro.' }, { status: 500 });
  }
}
