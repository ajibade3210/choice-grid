import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCheck, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import api from '../api/axios';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

export const QuickLogButton = ({ habits, onLogSuccess, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLog = async () => {
    if (!habits || habits.length === 0) return;
    setIsLoading(true);

    try {
      const todayStr = dayjs().tz(TIMEZONE).format('YYYY-MM-DD');

      // Build full log mapping all active habit IDs to "X"
      const logPayload = {};
      habits.forEach((h) => {
        logPayload[h.id] = 'X';
      });

      const res = await api.post('/api/logs/today', {
        log: logPayload,
        maxHabits: habits.length,
      });

      const updatedLog = res.data.log || logPayload;
      toast.success('Completed all choices for today! 🎯');

      if (onLogSuccess) {
        onLogSuccess(todayStr, updatedLog);
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed to quick log today';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleQuickLog}
      disabled={disabled || isLoading || !habits || habits.length === 0}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors shadow-sm disabled:opacity-50"
      title="Mark all habits as done (X) for today"
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CheckCheck className="w-3.5 h-3.5" />
      )}
      <span>Quick Log Today</span>
    </button>
  );
};

export default QuickLogButton;
