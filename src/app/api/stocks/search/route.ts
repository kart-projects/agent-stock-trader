import { NextResponse } from 'next/server';
import { stockai } from '@/lib/stockai';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
        },
        { status: 400 }
      );
    }

    const results = await stockai.stocks.search(query);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error searching stocks:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to search stocks';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
