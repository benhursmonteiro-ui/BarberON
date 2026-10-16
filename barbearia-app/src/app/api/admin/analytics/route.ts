import { NextResponse } from 'next/server';
import { getAnalyticsReport } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || undefined;
    const report = await getAnalyticsReport(month);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar relatório analítico.' }, { status: 500 });
  }
}
