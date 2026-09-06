import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from 'react';
import { getDaysInMonth } from 'date-fns';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { RefreshCw } from 'lucide-react';

import api from '../api/axios';
import MonthPicker from '../components/MonthPicker';
import StreakCard from '../components/StreakCard';
import HabitGrid from '../components/HabitGrid';
import ChartSkeleton from '../components/ChartSkeleton';
import BottomNav from '../components/BottomNav';
import { hapticCellToggle, hapticCelebrate } from '../utils/haptics';
import { DEFAULT_HABITS } from '../utils/storage';
import { trackEvent } from '../utils/analytics';

// Code Splitting: Lazy load heavy dependencies
const ScoreChart = lazy(() => import('../components/ScoreChart'));
const ConfettiCelebration = lazy(() => import('../components/ConfettiCelebration'));
const HabitSettings = lazy(() => import('../components/HabitSettings'));

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

export const ChoiceGridPage = ({ user, theme }) => {
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    monthlyCompletion: 0,
    isNewRecord: false,
    maxHabits: 5,
  });
  const [gridData, setGridData] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [celebrationState, setCelebrationState] = useState(null);
  const [activeTab, setActiveTab] = useState('grid');

  // Grid Data & Request Sequence Refs for atomic updates & race-condition prevention
  const gridDataRef = useRef({});
  useEffect(() => {
    gridDataRef.current = gridData;
  }, [gridData]);

  const cellSeqRef = useRef({});

  // Pull-to-Refresh State
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const canPull = useRef(false);

  // Today in Africa/Lagos
  const todayStr = useMemo(() => {
    return dayjs().tz(TIMEZONE).format('YYYY-MM-DD');
  }, []);

  const year = selectedDate.getFullYear();
  const monthIndex = selectedDate.getMonth();
  const monthNumber = monthIndex + 1;

  const daysInMonth = useMemo(() => {
    return getDaysInMonth(selectedDate);
  }, [selectedDate]);

  // Fetch stats helper
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/api/stats');
      const newStats = res.data;
      setStats(newStats);

      if (newStats.isNewRecord) {
        setCelebrationState({
          isNewRecord: true,
          currentStreak: newStats.currentStreak,
          totalTasks: habits.length,
        });
        hapticCelebrate();
        trackEvent('record_broken', { streak: newStats.currentStreak });
      }
    } catch (err) {
      console.error('[Stats] Fetch failed:', err.message);
    } finally {
      setIsStatsLoading(false);
    }
  }, [habits.length]);

  // Fetch month logs helper
  const fetchMonthLogs = useCallback(async (y, m) => {
    try {
      const res = await api.get(`/api/logs/month/${y}/${m}`);
      const logsArray = res.data || [];

      setGridData((prev) => {
        const next = { ...prev };
        logsArray.forEach((item) => {
          if (item.date) {
            next[item.date] = {
              ...(next[item.date] || {}),
              ...(item.log || {}),
            };
          }
        });
        return next;
      });
    } catch (err) {
      console.error('[Logs] Month fetch failed:', err.message);
    }
  }, []);

  // Initial Data Mount (Parallel Fetch)
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setIsStatsLoading(true);
        const [settingsRes, statsRes, logsRes] = await Promise.all([
          api.get('/api/settings'),
          api.get('/api/stats'),
          api.get(`/api/logs/month/${year}/${monthNumber}`),
        ]);

        if (!isMounted) return;

        if (settingsRes.data?.habits?.length > 0) {
          setHabits(settingsRes.data.habits);
        }

        const initialStats = statsRes.data;
        setStats(initialStats);
        if (initialStats.isNewRecord) {
          setCelebrationState({
            isNewRecord: true,
            currentStreak: initialStats.currentStreak,
          });
          hapticCelebrate();
        }

        const logsArray = logsRes.data || [];
        const logsMap = {};
        logsArray.forEach((item) => {
          if (item.date) {
            logsMap[item.date] = item.log || {};
          }
        });
        setGridData((prev) => ({ ...prev, ...logsMap }));
      } catch (error) {
        console.error('[ChoiceGrid] Initial load error:', error);
        toast.error('Failed to load habit data. Please refresh.');
      } finally {
        if (isMounted) {
          setIsStatsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [user, year, monthNumber]);

  // Pull-to-refresh Touch Handlers
  const handleTouchStart = (e) => {
    const scrollContainer = e.target.closest('.grid-scroll-container');
    const isAtContainerTop = !scrollContainer || scrollContainer.scrollTop === 0;

    if (window.scrollY === 0 && isAtContainerTop && !isRefreshing) {
      canPull.current = true;
      touchStartY.current = e.touches[0].clientY;
    } else {
      canPull.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (!canPull.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0) {
      // Rubberband easing max 100px
      const distance = Math.min(100, diff * 0.45);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!canPull.current || isRefreshing) return;
    canPull.current = false;

    if (pullDistance >= 75) {
      setIsRefreshing(true);
      setPullDistance(60);
      hapticCelebrate();

      try {
        await Promise.all([
          fetchMonthLogs(year, monthNumber),
          fetchStats(),
        ]);
        toast.success('Grid refreshed!', { duration: 1500 });
      } catch (err) {
        console.error('[Refresh] Failed:', err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleMonthChange = (newDate) => {
    setSelectedDate(newDate);
    const newY = newDate.getFullYear();
    const newM = newDate.getMonth() + 1;
    fetchMonthLogs(newY, newM);
  };

  // Cell Toggle Handler: Cycle '' -> 'X' -> '.' -> ''
  const handleCellToggle = useCallback(
    async (dateStr, habitId, explicitNextState) => {
      // Disallow marking future dates
      if (todayStr && dateStr > todayStr) {
        return;
      }

      const currentDay = gridDataRef.current[dateStr] || {};
      const currentState = currentDay[habitId] || '';

      let nextState = explicitNextState;
      if (nextState === undefined) {
        if (!currentState || currentState === '') {
          nextState = 'X';
        } else if (currentState === 'X') {
          nextState = '.';
        } else {
          nextState = '';
        }
      }

      // Check if day was already all complete
      const wasAllCompleted =
        habits.length > 0 && habits.every((h) => currentDay[h.id] === 'X');

      // 1. Optimistic UI update immediately
      const nextDay = {
        ...currentDay,
        [habitId]: nextState,
      };

      gridDataRef.current = {
        ...gridDataRef.current,
        [dateStr]: nextDay,
      };
      setGridData({ ...gridDataRef.current });

      // Haptic feedback on 'X' toggle
      if (nextState === 'X') {
        hapticCellToggle();
      }

      // Track habit toggle
      trackEvent('habit_toggle', { habitId, newState: nextState });

      // Check if all habits for this day are now completed (e.g. 5/5 tasks done)
      const isNowAllCompleted =
        habits.length > 0 && habits.every((h) => nextDay[h.id] === 'X');

      if (!wasAllCompleted && isNowAllCompleted) {
        setCelebrationState({
          isNewRecord: false,
          totalTasks: habits.length,
        });
        hapticCelebrate();
      }

      // 2. Track request sequence per cell to prevent race conditions
      const cellKey = `${dateStr}:${habitId}`;
      const reqSeq = (cellSeqRef.current[cellKey] || 0) + 1;
      cellSeqRef.current[cellKey] = reqSeq;

      try {
        const res = await api.post(`/api/logs/${dateStr}`, {
          log: { [habitId]: nextState },
          maxHabits: habits.length,
        });

        // Only sync response if no newer toggle occurred while request was in-flight
        if (cellSeqRef.current[cellKey] === reqSeq && res.data?.log) {
          gridDataRef.current = {
            ...gridDataRef.current,
            [dateStr]: {
              ...(gridDataRef.current[dateStr] || {}),
              ...res.data.log,
            },
          };
          setGridData({ ...gridDataRef.current });
        }

        await fetchStats();
      } catch (error) {
        console.error('[Log] Update failed:', error);
        // Only revert if no newer toggle occurred for this cell
        if (cellSeqRef.current[cellKey] === reqSeq) {
          toast.error('Failed to save choice. Reverting...');
          gridDataRef.current = {
            ...gridDataRef.current,
            [dateStr]: {
              ...(gridDataRef.current[dateStr] || {}),
              [habitId]: currentState,
            },
          };
          setGridData({ ...gridDataRef.current });
        }
      }
    },
    [habits, fetchStats, todayStr]
  );

  const handleQuickLogSuccess = useCallback(
    (logDate, updatedLog) => {
      const prevDay = gridDataRef.current[logDate] || {};
      const wasAllCompleted =
        habits.length > 0 && habits.every((h) => prevDay[h.id] === 'X');

      gridDataRef.current = {
        ...gridDataRef.current,
        [logDate]: {
          ...prevDay,
          ...updatedLog,
        },
      };
      setGridData({ ...gridDataRef.current });

      if (!wasAllCompleted) {
        setCelebrationState({
          isNewRecord: false,
          totalTasks: habits.length,
        });
        hapticCelebrate();
      }

      trackEvent('quicklog_used');

      fetchStats();
    },
    [habits, fetchStats]
  );

  const handleSettingsUpdated = useCallback(
    (newHabits) => {
      setHabits(newHabits);
      fetchMonthLogs(year, monthNumber);
      fetchStats();
    },
    [year, monthNumber, fetchMonthLogs, fetchStats]
  );

  const handleResetCelebration = useCallback(() => {
    setCelebrationState(null);
  }, []);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full overflow-x-hidden pb-24 pb-safe relative"
    >
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-16 inset-x-0 flex items-center justify-center z-30 transition-transform pointer-events-none"
          style={{ transform: `translateY(${pullDistance}px)` }}
        >
          <div className="p-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg flex items-center gap-2 text-xs font-semibold">
            <RefreshCw
              className={`w-4 h-4 ${
                isRefreshing || pullDistance >= 75 ? 'animate-spin' : ''
              }`}
            />
            <span>{isRefreshing ? 'Refreshing...' : pullDistance >= 75 ? 'Release to refresh' : 'Pull down'}</span>
          </div>
        </div>
      )}

      {/* Confetti & Sound Celebration Overlay */}
      <Suspense fallback={null}>
        <ConfettiCelebration
          celebrationState={celebrationState}
          onResetCelebration={handleResetCelebration}
        />
      </Suspense>

      {/* Lazy-Loaded Habit Settings Modal */}
      {isSettingsOpen && (
        <Suspense fallback={null}>
          <HabitSettings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            habits={habits}
            onSettingsUpdated={handleSettingsUpdated}
          />
        </Suspense>
      )}

      {/* Responsive Layout: Stacks on mobile, 2-column split on desktop (lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        {/* Left Column: Grid Panel */}
        <section id="grid-section" className="lg:col-span-7 space-y-6 w-full min-w-0">
          <MonthPicker
            selectedDate={selectedDate}
            onMonthChange={handleMonthChange}
          />

          <HabitGrid
            habits={habits}
            year={year}
            monthIndex={monthIndex}
            daysInMonth={daysInMonth}
            gridData={gridData}
            onCellToggle={handleCellToggle}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onQuickLogSuccess={handleQuickLogSuccess}
            todayStr={todayStr}
          />
        </section>

        {/* Right Column: Dashboard Card + Score Chart */}
        <section id="stats-section" className="lg:col-span-5 space-y-6 lg:sticky lg:top-20 w-full min-w-0">
          <StreakCard
            stats={stats}
            isLoading={isStatsLoading}
          />

          <Suspense fallback={<ChartSkeleton />}>
            <ScoreChart
              year={year}
              monthIndex={monthIndex}
              daysInMonth={daysInMonth}
              habits={habits}
              gridData={gridData}
              theme={theme}
            />
          </Suspense>
        </section>
      </div>

      {/* Sticky Mobile Bottom Navigation (<lg screens) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );
};

export default ChoiceGridPage;
