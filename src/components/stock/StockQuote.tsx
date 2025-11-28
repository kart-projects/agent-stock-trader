'use client';

import type { StockQuote as StockQuoteType } from '@/types';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface StockQuoteProps {
  quote: StockQuoteType;
  onResearch?: () => void;
}

export function StockQuote({ quote, onResearch }: StockQuoteProps) {
  const isPositive = quote.change >= 0;

  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/50 overflow-hidden shadow-sm shadow-[#8697c4]/10">
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isPositive ? 'bg-gradient-to-r from-emerald-500 via-[#7091e6] to-[#c9a227]' : 'bg-gradient-to-r from-red-500 to-orange-500'}`} />

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {/* Company Logo */}
                  <CompanyLogo symbol={quote.symbol} name={quote.name} size="lg" />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1e2a4a]">
                      {quote.symbol}
                    </h1>
                    <span className="text-[#1e2a4a]/60">
                      {quote.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-4 flex-wrap">
                  <span className="text-4xl md:text-5xl font-bold text-[#1e2a4a]">
                    {formatCurrency(quote.price)}
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                    isPositive
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <svg
                      className={`w-4 h-4 ${isPositive ? 'text-emerald-500' : 'text-red-500 rotate-180'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className={`text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(quote.change)} ({formatPercent(quote.changePercent)})
                    </span>
                  </div>
                </div>
              </div>
              {onResearch && (
                <button
                  onClick={onResearch}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8697c4] via-[#adbbda] via-55% to-[#c9a227] hover:from-[#7091e6] hover:via-[#8697c4] hover:to-[#e6c55a] text-white font-semibold rounded-lg shadow-md shadow-[#8697c4]/40 hover:shadow-lg hover:shadow-[#7091e6]/50 transition-all duration-300 border border-[#adbbda] hover:border-[#7091e6] text-sm flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Research Stock
                </button>
              )}
            </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatItem label="Open" value={formatCurrency(quote.open)} />
            <StatItem label="Prev Close" value={formatCurrency(quote.previousClose)} />
            <StatItem label="Day High" value={formatCurrency(quote.dayHigh)} color="emerald" />
            <StatItem label="Day Low" value={formatCurrency(quote.dayLow)} color="red" />
            <StatItem label="52W High" value={formatCurrency(quote.high52w)} color="gold" />
            <StatItem label="52W Low" value={formatCurrency(quote.low52w)} color="periwinkle" />
            <StatItem label="Market Cap" value={formatLargeNumber(quote.marketCap)} />
            <StatItem label="P/E Ratio" value={quote.pe?.toFixed(2) || 'N/A'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: 'emerald' | 'red' | 'gold' | 'periwinkle';
}) {
  const colorClasses = {
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    gold: 'text-[#c9a227]',
    periwinkle: 'text-[#7091e6]',
  };

  return (
    <div className="p-3 bg-gradient-to-br from-[#ede8f5]/50 to-white rounded-xl border border-[#adbbda]/50 hover:border-[#7091e6] transition-colors">
      <div className="text-xs text-[#1e2a4a]/50 mb-1">{label}</div>
      <div className={`font-semibold ${color ? colorClasses[color] : 'text-[#1e2a4a]'}`}>
        {value}
      </div>
    </div>
  );
}
