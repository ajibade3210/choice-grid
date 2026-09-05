import React from 'react';
import { Activity } from 'lucide-react';

export const ChartSkeleton = () => {
  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4 sm:p-5 flex flex-col transition-colors animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
            <Activity className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-2.5 w-44 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
          </div>
        </div>
        <div className="h-5 w-14 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      </div>

      {/* Chart Canvas Skeleton with exact h-72 fixed height */}
      <div className="h-72 w-full flex flex-col justify-between py-2">
        <div className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800" />
        <div className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800" />
        <div className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800" />
        <div className="w-full border-b border-zinc-200 dark:border-zinc-800 flex justify-between pt-2">
          {[1, 5, 10, 15, 20, 25, 30].map((tick) => (
            <div key={tick} className="h-2.5 w-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartSkeleton;
