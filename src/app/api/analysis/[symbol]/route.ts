import { NextResponse } from 'next/server';
import { stockai } from '@/lib/stockai';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    // Get stock data for display
    const stockData = await stockai.stocks.get(upperSymbol);

    // Run multi-model analysis via backend
    const analysisResult = await stockai.analysis.run(upperSymbol);

    return NextResponse.json({
      success: true,
      data: {
        symbol: upperSymbol,
        name: stockData.quote?.name || upperSymbol,
        price: stockData.quote?.price || 0,
        analysis: analysisResult,
      },
    });
  } catch (error) {
    console.error('Error analyzing stock:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to analyze stock';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

// POST endpoint for on-demand analysis with custom parameters
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    // Get stock data for display
    const stockData = await stockai.stocks.get(upperSymbol);

    // Run multi-model analysis via backend
    const analysisResult = await stockai.analysis.run(upperSymbol);

    return NextResponse.json({
      success: true,
      data: {
        symbol: upperSymbol,
        name: stockData.quote?.name || upperSymbol,
        price: stockData.quote?.price || 0,
        analysis: analysisResult,
        requestedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error analyzing stock:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to analyze stock';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
