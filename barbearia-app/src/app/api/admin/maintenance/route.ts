import { NextResponse } from 'next/server';
import { runMaintenanceCleanup } from '@/lib/db';

export async function POST() {
  try {
    const result = await runMaintenanceCleanup();
    return NextResponse.json({
      success: true,
      message: `Rotina executada com sucesso! ${result.expiredCount} agendamento(s) pendentes passados foram cancelados/arquivados.`,
      expiredCount: result.expiredCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao executar rotina de manutenção.' }, { status: 500 });
  }
}
