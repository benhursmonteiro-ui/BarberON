import { NextResponse } from 'next/server';
import { getReviews, createReview } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId') || undefined;
    const reviews = await getReviews(barberId);
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar avaliações.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appointmentId, clientId, clientName, barberId, rating, comment } = body;

    if (!appointmentId || !barberId || !rating) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const newReview = await createReview({
      appointmentId,
      clientId: clientId || 'usr-client-1',
      clientName: clientName || 'Cliente BarberOn',
      barberId,
      rating: Number(rating),
      comment: comment || '',
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Erro ao enviar avaliação:', error);
    return NextResponse.json({ error: 'Erro ao registrar avaliação.' }, { status: 500 });
  }
}
