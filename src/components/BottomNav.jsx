import React from 'react';
import { CalendarDays, Flame, Settings } from 'lucide-react';

export const BottomNav = ({ onOpenSettings, activeTab = 'grid', setActiveTab }) => {
  const handleScrollToGrid = () => {
    if (setActiveTab) setActiveTab('grid');
    const gridSection = document.getElementById('grid-section');
    if (gridSection) {
      gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToStats = () => {
    if (setActiveTab) setActiveTab('stats');
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className="sticky bottom-0 z-40 lg:hidden w-full border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg pb-safe transition-colors"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-4">
        {/* Tab 1: Grid */}
        <button
          type="button"
          onClick={handleScrollToGrid}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
            activeTab === 'grid'
              ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          aria-label="Navigate to Habit Grid"
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[11px] tracking-tight">Grid</span>
        </button>

        {/* Tab 2: Stats */}
        <button
          type="button"
          onClick={handleScrollToStats}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
            activeTab === 'stats'
              ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          aria-label="Navigate to Streaks & Chart Stats"
        >
          <Flame className="w-5 h-5" />
          <span className="text-[11px] tracking-tight">Stats</span>
        </button>

        {/* Tab 3: Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          aria-label="Open Habit Settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
