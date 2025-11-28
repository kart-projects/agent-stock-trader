import { StockSearch } from '@/components/stock/StockSearch';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-[#adbbda]/40 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3d52a0] via-[#7091e6] to-[#c9a227] flex items-center justify-center shadow-lg shadow-[#3d52a0]/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-[#1e2a4a] via-[#3d52a0] to-[#7091e6] bg-clip-text text-transparent">StockAI Pro</h1>
              <p className="text-xs text-[#3d52a0]/60">Multi-Model Analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1e2a4a] pb-1 drop-shadow-sm">
            Intelligent Stock Analysis
          </h2>
          <p className="text-lg text-[#1e2a4a] font-medium max-w-xl mx-auto mb-10 drop-shadow-sm">
            Get consensus-driven insights from multiple AI models.
            Make informed decisions backed by diverse analytical perspectives.
          </p>

          {/* Search Box */}
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-lg">
              <StockSearch />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-12">
            <div className="text-center px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/40 shadow-sm shadow-[#8697c4]/10">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#1e2a4a] to-[#3d52a0] bg-clip-text text-transparent">Multi-AI</div>
              <div className="text-sm text-[#1e2a4a]/60">Consensus</div>
            </div>
            <div className="text-center px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/40 shadow-sm shadow-[#8697c4]/10">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#1e2a4a] to-[#3d52a0] bg-clip-text text-transparent">Real-time</div>
              <div className="text-sm text-[#1e2a4a]/60">Market Data</div>
            </div>
            <div className="text-center px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/40 shadow-sm shadow-[#8697c4]/10">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#1e2a4a] to-[#3d52a0] bg-clip-text text-transparent">200+</div>
              <div className="text-sm text-[#1e2a4a]/60">Technical Indicators</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Real-Time Data"
            description="Live quotes, historical prices, and technical indicators updated in real-time"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            title="Multi-Model AI"
            description="Multiple AI models analyze each stock to provide diverse analytical perspectives"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Consensus Signals"
            description="Stronger confidence when multiple models agree on recommendations"
          />
        </div>

        {/* Popular Stocks */}
        <div className="mb-16">
          <h3 className="text-sm font-medium text-[#3d52a0]/60 uppercase tracking-wider mb-4 text-center">
            Popular Stocks
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { symbol: 'AAPL', name: 'Apple' },
              { symbol: 'MSFT', name: 'Microsoft' },
              { symbol: 'GOOGL', name: 'Alphabet' },
              { symbol: 'AMZN', name: 'Amazon' },
              { symbol: 'NVDA', name: 'NVIDIA' },
              { symbol: 'TSLA', name: 'Tesla' },
              { symbol: 'META', name: 'Meta' },
              { symbol: 'JPM', name: 'JPMorgan' },
            ].map((stock) => (
              <a
                key={stock.symbol}
                href={`/stock/${stock.symbol}`}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-xl border border-[#adbbda]/40 hover:border-[#7091e6] hover:shadow-md hover:shadow-[#8697c4]/20 transition-all text-sm group"
              >
                <CompanyLogo symbol={stock.symbol} name={stock.name} size="sm" className="flex-shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-[#3d52a0] whitespace-nowrap">{stock.symbol}</span>
                  <span className="text-[#1e2a4a]/60 group-hover:text-[#1e2a4a] truncate">{stock.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-sm font-medium text-[#3d52a0]/60 uppercase tracking-wider mb-8 text-center">
            How It Works
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <StepCard number={1} title="Search" description="Enter any stock symbol" />
            <Arrow />
            <StepCard number={2} title="Analyze" description="AI models study the data" />
            <Arrow />
            <StepCard number={3} title="Consensus" description="Get unified recommendation" />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-5 bg-white/80 backdrop-blur-sm border border-[#adbbda]/40 rounded-2xl shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center border border-[#adbbda]/50 flex-shrink-0">
              <svg className="w-5 h-5 text-[#3d52a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-[#1e2a4a] mb-1">Disclaimer</h4>
              <p className="text-sm text-[#1e2a4a]/60 leading-relaxed">
                This application is for educational and informational purposes only. It is not financial advice.
                AI analysis is experimental and should not be the sole basis for investment decisions.
                Always consult with qualified financial advisors.
              </p>
            </div>
          </div>
        </div>
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/40 hover:border-[#7091e6]/60 hover:shadow-lg hover:shadow-[#8697c4]/20 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center text-[#3d52a0] mb-4 group-hover:from-[#adbbda] group-hover:to-[#8697c4] transition-colors border border-[#adbbda]/40">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#1e2a4a] mb-2">{title}</h3>
      <p className="text-[#1e2a4a]/70 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3d52a0] via-[#7091e6] to-[#c9a227] text-white flex items-center justify-center font-bold mb-3 shadow-lg shadow-[#3d52a0]/25 text-lg">
        {number}
      </div>
      <h4 className="text-[#1e2a4a] font-semibold">{title}</h4>
      <p className="text-[#1e2a4a]/60 text-sm">{description}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:block text-[#adbbda]">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  );
}
