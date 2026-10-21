import { NextResponse } from 'next/server';
import { updateBarbershopSubscription } from '@/lib/db';

/**
 * Webhook Receptor da Kiwify
 * Cadastre esta URL na Kiwify: https://SEUDOMINIO.com/api/webhooks/kiwify
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log('[KIWIFY WEBHOOK RECEIVED]', JSON.stringify(payload, null, 2));

    // A Kiwify envia os dados da ordem/assinatura
    const order = payload.order || payload;
    const orderStatus = (order.order_status || payload.order_status || '').toLowerCase();
    const event = (payload.event || payload.webhook_event_type || '').toLowerCase();

    // Identificação do comprador e da barbearia:
    // 1. Pelo custom_id passado na URL do checkout (ex: ?custom_id=shop-imperial)
    // 2. Pelo email do cliente (Customer)
    const customId = order.custom_id || payload.custom_id || '';
    const customerEmail = order.Customer?.email || payload.Customer?.email || order.email || '';
    const orderId = order.order_id || payload.order_id;
    const subscriptionId = order.subscription_id || payload.subscription_id;

    console.log(`[KIWIFY] Evento: ${event || orderStatus} | Barbearia/CustomId: ${customId} | Email: ${customerEmail}`);

    // Data de validade padrão: 30 dias a partir de hoje
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const expiresAtIso = nextMonth.toISOString();

    // 1. PAGAMENTO APROVADO OU ASSINATURA RENOVADA -> LIBERA O PLANO PRO
    if (
      orderStatus === 'paid' || 
      orderStatus === 'approved' || 
      event.includes('approved') || 
      event.includes('renewed')
    ) {
      const updated = await updateBarbershopSubscription({
        barbershopIdOrSlug: customId || undefined,
        email: customerEmail || undefined,
        plan: 'PRO',
        status: 'active',
        expiresAt: expiresAtIso,
        orderId,
        subscriptionId,
      });

      return NextResponse.json({
        success: true,
        message: 'Assinatura PRO liberada com sucesso por 30 dias.',
        barbershop: updated?.name,
      });
    }

    // 2. PAGAMENTO ATRASADO (Kiwify tenta cobrar e não consegue) -> STATUS PAST_DUE
    if (orderStatus === 'late' || event.includes('late') || orderStatus === 'waiting_payment') {
      const updated = await updateBarbershopSubscription({
        barbershopIdOrSlug: customId || undefined,
        email: customerEmail || undefined,
        plan: 'PRO',
        status: 'past_due',
        orderId,
      });

      return NextResponse.json({
        success: true,
        message: 'Status atualizado para atrasado (past_due).',
        barbershop: updated?.name,
      });
    }

    // 3. CANCELAMENTO, REEMBOLSO OU CHARGEBACK -> BLOQUEIA O ACESSO PRO IMEDIATAMENTE
    if (
      orderStatus === 'refunded' || 
      orderStatus === 'chargedback' || 
      orderStatus === 'canceled' || 
      event.includes('canceled') || 
      event.includes('refunded')
    ) {
      const updated = await updateBarbershopSubscription({
        barbershopIdOrSlug: customId || undefined,
        email: customerEmail || undefined,
        plan: 'FREE', // Rebaixa para o plano gratuito ou bloqueia
        status: 'canceled',
        orderId,
      });

      return NextResponse.json({
        success: true,
        message: 'Assinatura cancelada/reembolsada. Barbearia retornada ao plano FREE.',
        barbershop: updated?.name,
      });
    }

    return NextResponse.json({ received: true, note: 'Evento ignorado ou sem ação necessária.' });
  } catch (error: any) {
    console.error('[KIWIFY WEBHOOK ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook Kiwify', details: error.message },
      { status: 500 }
    );
  }
}
