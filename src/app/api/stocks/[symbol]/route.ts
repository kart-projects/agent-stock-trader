import { NextResponse } from 'next/server';
import { getStockData } from '@/services/stockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    // Get period from query params (default to 3mo)
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '3mo') as
      | '1d'
      | '5d'
      | '1mo'
      | '3mo'
      | '6mo'
      | '1y'
      | '5y';

    const stockData = await getStockData(upperSymbol, period);

    return NextResponse.json({
      success: true,
      data: stockData,
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to fetch stock data';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
