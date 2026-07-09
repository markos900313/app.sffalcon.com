import React from 'react';

interface PageSkeletonProps {
  showHeader?: boolean;  // default true
  rows?: number;         // default 5
  showKPIs?: boolean;    // default true
}

export default function PageSkeleton({
  showHeader = true,
  rows = 5,
  showKPIs = true
}: PageSkeletonProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-white overflow-hidden p-6 animate-pulse">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between gap-4 card-premium py-6 px-4 md:px-8 bg-[#111F3A] border border-[#1E3A5F] shadow-sm rounded-2xl">
          <div className="space-y-2">
            <div className="h-8 w-[200px] bg-[#1A2744] rounded-lg" />
            <div className="h-4 w-[350px] bg-[#1A2744] rounded-lg opacity-60" />
          </div>
          <div className="h-10 w-[120px] bg-[#1A2744] rounded-xl" />
        </div>
      )}

      {/* KPIs */}
      {showKPIs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div 
              key={idx} 
              className="card-premium p-6 md:p-8 bg-[#0D1B2E] border border-[#1E3A5F]/40 shadow-sm rounded-2xl space-y-4"
            >
              <div className="h-3 w-[100px] bg-[#1A2744] rounded" />
              <div className="h-8 w-[150px] bg-[#243156] rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Table/List Skeleton */}
      <div className="card-premium p-6 md:p-8 bg-[#111F3A] border border-[#1E3A5F] shadow-sm rounded-2xl space-y-4">
        {Array.from({ length: rows }).map((_, idx) => {
          const widths = ['w-2/3', 'w-1/2', 'w-3/4', 'w-5/6', 'w-full'];
          const width = widths[idx % widths.length];
          return (
            <div key={idx} className="flex flex-col gap-2 py-3 border-b border-[#1E3A5F]/20 last:border-b-0">
              <div className={`h-4 bg-[#1A2744] rounded ${width}`} />
              <div className="h-3 bg-[#243156]/40 rounded w-1/4" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
