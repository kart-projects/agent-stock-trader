import { NextResponse } from 'next/server';
import { stockai } from '@/lib/stockai';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    // Fetch crypto data from backend via SDK
    const cryptoData = await stockai.crypto.get(upperSymbol);

    return NextResponse.json({
      success: true,
      data: cryptoData,
    });
  } catch (error) {
    console.error('Error fetching crypto data:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to fetch crypto data';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
