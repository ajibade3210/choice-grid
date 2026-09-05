import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const MonthPicker = ({ selectedDate, onMonthChange }) => {
  // Title dynamically formatted using date-fns in all caps:
  // "YOUR CHOICE GRID FOR {CURRENT_MONTH} {CURRENT_YEAR}"
  const formattedTitle = `YOUR CHOICE GRID FOR ${format(selectedDate, 'MMMM yyyy').toUpperCase()}`;

  const handlePrevMonth = () => {
    onMonthChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(selectedDate, 1));
  };

  const handleCurrentMonth = () => {
    onMonthChange(new Date());
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
          {formattedTitle}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span>Click to toggle:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            X (Done)
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            • (Missed)
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          onClick={handleCurrentMonth}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
          title="Jump to current month"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Today</span>
        </button>

        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Previous month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800" />
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Next month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthPicker;
