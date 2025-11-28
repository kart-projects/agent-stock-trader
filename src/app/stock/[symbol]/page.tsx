'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { StockQuote } from '@/components/stock/StockQuote';
import { StockChart } from '@/components/stock/StockChart';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import type { StockData, ConsensusResult } from '@/types';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol } = use(params);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [analysis, setAnalysis] = useState<ConsensusResult | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock data on mount
  useEffect(() => {
    async function fetchStock() {
      setIsLoadingStock(true);
      setError(null);

      try {
        const res = await fetch(`/api/stocks/${symbol}?period=1y`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        if (data.success) {
          setStockData(data.data);
        } else {
          setError(data.error || 'Failed to fetch stock data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
        console.error(err);
      } finally {
        setIsLoadingStock(false);
      }
    }

    fetchStock();
  }, [symbol]);

  // Function to run analysis
  const runAnalysis = async () => {
    setIsLoadingAnalysis(true);

    try {
      const res = await fetch(`/api/analysis/${symbol}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      if (data.success) {
        setAnalysis(data.data.analysis);
      } else {
        setError(data.error || 'Failed to analyze stock');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze stock');
      console.error(err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  if (isLoadingStock) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#adbbda]/50 rounded-xl w-48" />
            <div className="h-48 bg-white/60 rounded-2xl border border-[#adbbda]/50" />
            <div className="h-32 bg-white/60 rounded-2xl border border-[#adbbda]/50" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !stockData) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-200/60 p-8 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center shadow-lg shadow-red-200/50">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ede8f5] hover:bg-[#adbbda]/50 text-[#1e2a4a] rounded-xl border border-[#adbbda] hover:border-[#7091e6] transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-[#adbbda]/40 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3d52a0] via-[#7091e6] to-[#c9a227] flex items-center justify-center shadow-lg shadow-[#3d52a0]/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-[#3d52a0] via-[#7091e6] to-[#c9a227] bg-clip-text text-transparent">StockAI Pro</h1>
              <p className="text-xs text-[#3d52a0]/60">Multi-Model Analysis</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#3d52a0] hover:text-[#7091e6] transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Search
        </Link>

        {/* Stock Quote */}
        {stockData && (
          <StockQuote
            quote={stockData.quote}
            onResearch={() => {
              runAnalysis();
              document.getElementById('research-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* Price Chart - Full Width */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/50 overflow-hidden shadow-sm shadow-[#8697c4]/10 flex flex-col h-[500px]">
          {stockData && stockData.priceHistory.length > 0 && (
            <StockChart symbol={symbol} initialData={stockData.priceHistory} />
          )}
        </div>

        {/* Technical Indicators - Full Width */}
        {stockData && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/50 overflow-hidden shadow-sm shadow-[#8697c4]/10">
            <div className="px-6 py-4 border-b border-[#adbbda]/30">
              <h2 className="text-lg font-semibold text-[#1e2a4a] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#3d52a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Technical Indicators
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <IndicatorItem
                  label="RSI (14)"
                  value={stockData.technicalIndicators.rsi?.toFixed(2) || 'N/A'}
                  description={getRSIDescription(stockData.technicalIndicators.rsi)}
                  color={getRSIColor(stockData.technicalIndicators.rsi)}
                />
                <IndicatorItem
                  label="50-day MA"
                  value={
                    stockData.technicalIndicators.ma50
                      ? `$${stockData.technicalIndicators.ma50.toFixed(2)}`
                      : 'N/A'
                  }
                />
                <IndicatorItem
                  label="200-day MA"
                  value={
                    stockData.technicalIndicators.ma200
                      ? `$${stockData.technicalIndicators.ma200.toFixed(2)}`
                      : 'N/A'
                  }
                />
                <IndicatorItem
                  label="MACD"
                  value={stockData.technicalIndicators.macd?.toFixed(4) || 'N/A'}
                  color={stockData.technicalIndicators.macd && stockData.technicalIndicators.macd > 0 ? 'emerald' : stockData.technicalIndicators.macd && stockData.technicalIndicators.macd < 0 ? 'red' : undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analysis Section - Full Width Below */}
        <div className="flex flex-col" id="research-section">
          {!analysis && !isLoadingAnalysis && (
            <div className="relative bg-gradient-to-br from-[#ede8f5] via-white to-[#f0f0f5] backdrop-blur-sm rounded-2xl border border-[#7091e6]/40 overflow-hidden shadow-md shadow-[#8697c4]/20 flex flex-col">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8697c4]/5 via-transparent to-[#c9a227]/5 pointer-events-none" />
              
              <div className="relative p-8 text-center flex flex-col justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8697c4] via-[#7091e6] to-[#c9a227] flex items-center justify-center shadow-lg shadow-[#8697c4]/40">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3d52a0] via-[#7091e6] to-[#c9a227] bg-clip-text text-transparent mb-2">AI Analysis</h2>
                    <p className="text-[#1e2a4a]/70 text-sm max-w-md mx-auto mb-6">
                      Multi-model consensus analysis with sentiment, technical patterns, and market trends.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(analysis || isLoadingAnalysis) && (
            <AnalysisCard analysis={analysis!} isLoading={isLoadingAnalysis} />
          )}
        </div>

        {/* Recent News */}
        {stockData && stockData.news.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/50 overflow-hidden shadow-sm shadow-[#8697c4]/10">
            <div className="px-6 py-4 border-b border-[#adbbda]/30">
              <h2 className="text-lg font-semibold text-[#1e2a4a] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#3d52a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                Recent News
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stockData.news.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-gradient-to-r from-[#ede8f5]/50 to-white border border-[#adbbda]/50 rounded-xl hover:bg-[#ede8f5]/70 hover:border-[#7091e6] hover:shadow-md hover:shadow-[#8697c4]/20 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-[#1e2a4a] group-hover:text-[#3d52a0] transition-colors line-clamp-2">
                          {item.headline}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-[#ede8f5] text-[#3d52a0] rounded-lg">
                            {item.source}
                          </span>
                          <span className="text-xs text-[#1e2a4a]/50">
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-[#8697c4] group-hover:text-[#7091e6] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-[#adbbda]/40 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3d52a0] via-[#7091e6] to-[#c9a227] flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-[#1e2a4a] text-sm font-medium">StockAI Pro</span>
            </div>
            <p className="text-[#1e2a4a]/60 text-sm">Multi-Model Consensus Analysis Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function IndicatorItem({
  label,
  value,
  description,
  color,
}: {
  label: string;
  value: string;
  description?: string;
  color?: 'emerald' | 'red' | 'amber';
}) {
  const colorClasses = {
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    amber: 'text-[#c9a227]',
  };

  return (
    <div className="p-4 bg-gradient-to-br from-[#ede8f5]/50 to-white rounded-xl border border-[#adbbda]/50 hover:border-[#7091e6] hover:shadow-sm transition-all">
      <div className="text-sm text-[#1e2a4a]/50 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${color ? colorClasses[color] : 'text-[#1e2a4a]'}`}>
        {value}
      </div>
      {description && (
        <div className={`text-xs mt-1 ${color ? colorClasses[color] : 'text-[#1e2a4a]/50'}`}>
          {description}
        </div>
      )}
    </div>
  );
}

function getRSIDescription(rsi: number | null): string {
  if (rsi === null) return '';
  if (rsi >= 70) return 'Overbought';
  if (rsi <= 30) return 'Oversold';
  return 'Neutral';
}

function getRSIColor(rsi: number | null): 'emerald' | 'red' | 'amber' | undefined {
  if (rsi === null) return undefined;
  if (rsi >= 70) return 'red';
  if (rsi <= 30) return 'emerald';
  return 'amber';
}
