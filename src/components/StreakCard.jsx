import React from 'react';
import { Flame, Trophy, Percent, Clock } from 'lucide-react';
import useCountUp from '../hooks/useCountUp';

export const StreakCard = ({ stats, isLoading }) => {
  const targetCurrentStreak = stats?.currentStreak ?? 0;
  const targetLongestStreak = stats?.longestStreak ?? 0;
  const targetMonthlyCompletion = stats?.monthlyCompletion ?? 0;

  // Animated numbers via count-up hook (600ms, decimals: 0, 0, 1)
  const animatedCurrentStreak = useCountUp(targetCurrentStreak, 600, 0);
  const animatedLongestStreak = useCountUp(targetLongestStreak, 600, 0);
  const animatedMonthlyCompletion = useCountUp(targetMonthlyCompletion, 600, 1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-28 flex flex-col justify-between"
          >
            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-7 w-12 bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      {/* Current Streak */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Current Streak</span>
          <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {animatedCurrentStreak}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {Number(animatedCurrentStreak) === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <Clock className="w-3 h-3" />
          <span>Africa/Lagos</span>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Longest Streak</span>
          <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {animatedLongestStreak}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {Number(animatedLongestStreak) === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          Personal Best
        </div>
      </div>

      {/* Monthly Completion */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">This Month</span>
          <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {animatedMonthlyCompletion}%
          </span>
        </div>
        {/* Progress bar with smooth duration-500 transition */}
        <div className="mt-2.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, targetMonthlyCompletion))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
