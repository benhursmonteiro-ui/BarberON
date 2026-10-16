import { NextResponse } from 'next/server';
import { getUserNotifications, markNotificationAsRead } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-client-1';
    const notifs = await getUserNotifications(userId);
    return NextResponse.json(notifs);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar notificações.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'ID da notificação é obrigatório.' }, { status: 400 });

    const success = await markNotificationAsRead(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao marcar notificação como lida.' }, { status: 500 });
  }
}
