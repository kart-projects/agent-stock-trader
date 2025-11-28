'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
}

export function StockSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (symbol: string) => {
    setQuery('');
    setIsOpen(false);
    router.push(`/stock/${symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.length > 0) {
      // Navigate directly to the symbol if Enter is pressed
      handleSelect(query.toUpperCase());
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-[#7091e6] group-focus-within:text-[#3d52a0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          placeholder="Search stocks (e.g., AAPL, MSFT)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-[#adbbda]/60 rounded-2xl text-[#1e2a4a] placeholder-[#8697c4] focus:outline-none focus:ring-2 focus:ring-[#7091e6]/50 focus:border-[#7091e6] focus:bg-white transition-all text-lg shadow-sm hover:shadow-md hover:shadow-[#8697c4]/20"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-[#3d52a0]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Enter hint */}
        {!isLoading && query.length > 0 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <kbd className="px-2.5 py-1 text-xs bg-[#ede8f5] text-[#3d52a0] rounded-lg border border-[#adbbda] font-medium">
              Enter
            </kbd>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border border-[#adbbda]/60 rounded-2xl shadow-xl shadow-[#8697c4]/20 max-h-72 overflow-auto">
          {results.map((result, index) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result.symbol)}
              className={`w-full px-4 py-3 text-left hover:bg-[#ede8f5]/50 flex items-center justify-between transition-colors ${
                index === 0 ? 'rounded-t-2xl' : ''
              } ${index === results.length - 1 ? 'rounded-b-2xl' : ''}`}
            >
              <div className="flex items-center gap-3">
                <CompanyLogo symbol={result.symbol} name={result.name} size="md" />
                <div>
                  <div className="font-semibold text-[#1e2a4a]">{result.symbol}</div>
                  <div className="text-sm text-[#1e2a4a]/60 truncate max-w-[200px]">{result.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-[#ede8f5] text-[#3d52a0] rounded-lg border border-[#adbbda]">
                  {result.type}
                </span>
                <svg className="w-4 h-4 text-[#7091e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length > 0 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border border-[#adbbda]/60 rounded-2xl shadow-xl shadow-[#8697c4]/20 p-6 text-center">
          <div className="text-[#1e2a4a]/60 mb-2">No stocks found</div>
          <div className="text-sm text-[#3d52a0] font-medium">
            Press Enter to search for &quot;{query.toUpperCase()}&quot;
          </div>
        </div>
      )}
    </div>
  );
}
