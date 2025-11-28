'use client';

import type { ConsensusResult, ModelResponse, Rating } from '@/types';

interface AnalysisCardProps {
  analysis: ConsensusResult;
  isLoading?: boolean;
}

export function AnalysisCard({ analysis, isLoading }: AnalysisCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/50 overflow-hidden shadow-sm shadow-[#8697c4]/10">
        <div className="px-6 py-4 border-b border-[#adbbda]/30">
          <h2 className="text-lg font-medium text-[#1e2a4a] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3d52a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            AI Analysis
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#adbbda]"></div>
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#3d52a0] animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-[#1e2a4a] font-medium">Analyzing with AI models...</p>
                <p className="text-sm text-[#1e2a4a]/60 mt-1">This may take a few seconds</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/50 overflow-hidden shadow-sm shadow-[#8697c4]/10 flex flex-col h-full">
      <div className="px-6 py-4 border-b border-[#adbbda]/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#1e2a4a] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3d52a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            AI Analysis
          </h2>
          <span className="px-3 py-1 text-sm bg-[#ede8f5] text-[#3d52a0] rounded-full border border-[#adbbda] font-medium">
            {analysis.modelsUsed} models
          </span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#adbbda #ede8f5' }}>
        {/* Consensus Section */}
        <ConsensusSection analysis={analysis} />

        {/* Individual Model Responses */}
        <div>
          <h3 className="text-lg font-medium text-[#1e2a4a] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#7091e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Model Responses
          </h3>
          <div className="space-y-4">
            {analysis.responses.map((response) => (
              <ModelResponseCard key={response.modelId} response={response} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsensusSection({ analysis }: { analysis: ConsensusResult }) {
  const getRatingGradient = (rating: Rating | null) => {
    switch (rating) {
      case 'BUY':
        return 'from-emerald-50 via-[#ede8f5] to-[#adbbda]/30';
      case 'SELL':
        return 'from-red-50 to-orange-50';
      default:
        return 'from-[#ede8f5] to-[#adbbda]/30';
    }
  };

  const getRatingBorder = (rating: Rating | null) => {
    switch (rating) {
      case 'BUY':
        return 'border-emerald-200';
      case 'SELL':
        return 'border-red-200';
      default:
        return 'border-[#adbbda]';
    }
  };

  return (
    <div className={`relative text-center py-8 bg-gradient-to-br ${getRatingGradient(analysis.consensus)} rounded-2xl border ${getRatingBorder(analysis.consensus)} overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/40 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-3">
          {analysis.hasConsensus ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm text-[#1e2a4a]/60 font-medium">
            {analysis.hasConsensus ? 'Full Consensus' : 'Majority Opinion'}
          </span>
        </div>

        {analysis.consensus && (
          <LargeRatingBadge rating={analysis.consensus} />
        )}

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1e2a4a]">{analysis.avgConfidence.toFixed(0)}%</div>
            <div className="text-xs text-[#1e2a4a]/50">Avg Confidence</div>
          </div>
          <div className="w-px h-10 bg-[#adbbda]" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1e2a4a]">{analysis.modelsUsed}</div>
            <div className="text-xs text-[#1e2a4a]/50">Models</div>
          </div>
        </div>

        {!analysis.hasConsensus && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#ede8f5] border border-[#adbbda] rounded-full">
            <svg className="w-4 h-4 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs text-[#3d52a0] font-medium">Models did not reach full consensus</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LargeRatingBadge({ rating }: { rating: Rating }) {
  const styles = {
    BUY: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    SELL: 'bg-red-100 text-red-700 border-red-300',
    HOLD: 'bg-[#ede8f5] text-[#3d52a0] border-[#adbbda]',
  };

  const icons = {
    BUY: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    SELL: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    HOLD: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    ),
  };

  return (
    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl text-2xl font-bold border ${styles[rating]}`}>
      {icons[rating]}
      {rating}
    </div>
  );
}

function ModelResponseCard({ response }: { response: ModelResponse }) {
  const getRatingStyles = (rating: Rating) => {
    switch (rating) {
      case 'BUY':
        return {
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
          border: 'border-l-emerald-400',
        };
      case 'SELL':
        return {
          badge: 'bg-red-100 text-red-700 border-red-300',
          border: 'border-l-red-400',
        };
      default:
        return {
          badge: 'bg-[#ede8f5] text-[#3d52a0] border-[#adbbda]',
          border: 'border-l-[#7091e6]',
        };
    }
  };

  const styles = getRatingStyles(response.rating);

  return (
    <div className={`relative p-4 bg-gradient-to-r from-[#ede8f5]/50 to-white rounded-xl border border-[#adbbda]/50 border-l-4 ${styles.border}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center border border-[#adbbda]">
            <svg className="w-5 h-5 text-[#3d52a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="font-medium text-[#1e2a4a]">{response.modelName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-bold rounded-full border ${styles.badge}`}>
            {response.rating}
          </span>
          <div className="text-right">
            <div className="text-sm font-semibold text-[#1e2a4a]">{response.confidence}%</div>
            <div className="text-xs text-[#1e2a4a]/50">confidence</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-[#1e2a4a]/70 leading-relaxed">{response.reasoning}</p>

      {response.processingTimeMs && (
        <div className="flex items-center gap-1 mt-3 text-xs text-[#8697c4]">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {response.processingTimeMs}ms
        </div>
      )}
    </div>
  );
}
