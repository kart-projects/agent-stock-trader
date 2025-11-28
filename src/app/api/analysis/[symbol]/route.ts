import { NextResponse } from 'next/server';
import { getStockData } from '@/services/stockData';
import { analyzeWithAllModels } from '@/services/analysis';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    // Fetch stock data first
    const stockData = await getStockData(upperSymbol, '3mo');

    // Run multi-model analysis
    const analysisResult = await analyzeWithAllModels(stockData);

    return NextResponse.json({
      success: true,
      data: {
        symbol: upperSymbol,
        name: stockData.quote.name,
        price: stockData.quote.price,
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
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    // Get optional parameters from request body
    const body = await request.json().catch(() => ({}));
    const period = body.period || '3mo';

    // Fetch stock data
    const stockData = await getStockData(upperSymbol, period);

    // Run multi-model analysis
    const analysisResult = await analyzeWithAllModels(stockData);

    return NextResponse.json({
      success: true,
      data: {
        symbol: upperSymbol,
        name: stockData.quote.name,
        price: stockData.quote.price,
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
