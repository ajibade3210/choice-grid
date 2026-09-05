import React, { useState, useRef } from 'react';
import { Settings } from 'lucide-react';
import QuickLogButton from './QuickLogButton';
import { getDayScore } from '../utils/streak';

export const HabitGrid = ({
  habits,
  year,
  monthIndex,
  daysInMonth,
  gridData,
  onCellToggle,
  onOpenSettings,
  onQuickLogSuccess,
  todayStr,
}) => {
  const paddedMonth = String(monthIndex + 1).padStart(2, '0');
  const [focusedCoords, setFocusedCoords] = useState([0, 0]); // [dayIndex, habitIndex]
  const cellRefs = useRef({});

  // Cycle states: '' -> 'X' -> '.' -> ''
  const handleCellClick = (dateStr, habitId, currentState, targetElement) => {
    let nextState = '';
    if (!currentState || currentState === '') {
      nextState = 'X';
    } else if (currentState === 'X') {
      nextState = '.';
    } else {
      nextState = '';
    }

    const rect = targetElement?.getBoundingClientRect ? targetElement.getBoundingClientRect() : null;
    onCellToggle(dateStr, habitId, nextState, rect);
  };

  // 2D Roving Tabindex & Keyboard Navigation
  const handleKeyDown = (e, dayIndex, habitIndex, dateStr, habitId, cellState) => {
    let nextDay = dayIndex;
    let nextHabit = habitIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextHabit = Math.max(0, habitIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextHabit = Math.min(habits.length - 1, habitIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextDay = Math.max(0, dayIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextDay = Math.min(daysInMonth - 1, dayIndex + 1);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        handleCellClick(dateStr, habitId, cellState, e.currentTarget);
        return;
      default:
        return;
    }

    setFocusedCoords([nextDay, nextHabit]);
    const targetCell = cellRefs.current[`${nextDay}-${nextHabit}`];
    if (targetCell) {
      targetCell.focus({ preventScroll: true });
      targetCell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col overflow-hidden transition-colors">
      {/* Grid Top Toolbar with QuickLogButton and Edit Habits */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Daily Habits ({habits.length})
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            • 44px touch targets • Arrow navigation
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* QuickLogButton */}
          <QuickLogButton
            habits={habits}
            onLogSuccess={onQuickLogSuccess}
          />

          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Habits</span>
          </button>
        </div>
      </div>

      {/* 2D Scrollable Grid Matrix */}
      <div className="grid-scroll-container overflow-x-auto overflow-y-auto max-h-[620px]">
        <table className="w-full border-collapse text-left" role="grid">
          {/* Sticky Header Row */}
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              {/* Sticky Top-Left Corner */}
              <th
                scope="col"
                className="sticky top-0 left-0 z-30 bg-zinc-100 dark:bg-zinc-900 px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 min-w-[56px] w-[56px]"
              >
                Day
              </th>

              {/* Habit Column Headers */}
              {habits.map((habit) => (
                <th
                  key={habit.id}
                  scope="col"
                  className="sticky top-0 z-20 bg-zinc-50 dark:bg-zinc-950 px-2 py-3 text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200 dark:border-zinc-800 min-w-[64px] max-w-[120px]"
                  title={habit.name}
                >
                  <div className="truncate px-1 text-xs" title={habit.name}>
                    {habit.name}
                  </div>
                </th>
              ))}

              {/* Sticky Header: Daily Score Column */}
              <th
                scope="col"
                className="sticky top-0 z-20 bg-zinc-50 dark:bg-zinc-950 px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 min-w-[56px]"
              >
                Score
              </th>
            </tr>
          </thead>

          {/* Grid Rows (Days 1 to DaysInMonth) */}
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {daysArray.map((dayNum, dayIndex) => {
              const dayPadded = String(dayNum).padStart(2, '0');
              const dateStr = `${year}-${paddedMonth}-${dayPadded}`;
              const isToday = dateStr === todayStr;
              const dayScore = getDayScore(gridData, dateStr, habits);
              const isPerfectDay = habits.length > 0 && dayScore === habits.length;

              return (
                <tr
                  key={dateStr}
                  className={`transition-colors ${
                    isToday
                      ? 'bg-zinc-100/70 dark:bg-zinc-800/40 font-semibold'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  {/* Sticky Day Column */}
                  <td
                    className={`sticky left-0 z-10 px-2.5 py-1 text-center text-xs font-mono border-r border-zinc-200 dark:border-zinc-800 transition-colors ${
                      isToday
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
                        : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{dayNum}</span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                      )}
                    </div>
                  </td>

                  {/* Habit Check Cells */}
                  {habits.map((habit, habitIndex) => {
                    const cellState = gridData[dateStr]?.[habit.id] || '';
                    const isFocused =
                      focusedCoords[0] === dayIndex && focusedCoords[1] === habitIndex;

                    // Aria values per WCAG AA: Complete, Missed, or Incomplete
                    const statusText =
                      cellState === 'X'
                        ? 'Complete'
                        : cellState === '.'
                        ? 'Missed'
                        : 'Incomplete';

                    // Aria-pressed: "X"=true, "."=mixed, ""=false
                    const ariaPressed =
                      cellState === 'X'
                        ? 'true'
                        : cellState === '.'
                        ? 'mixed'
                        : 'false';

                    return (
                      <td
                        key={habit.id}
                        className="p-1 text-center border-r border-zinc-200 dark:border-zinc-800"
                        role="presentation"
                      >
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) {
                              cellRefs.current[`${dayIndex}-${habitIndex}`] = el;
                            }
                          }}
                          role="gridcell"
                          tabIndex={isFocused ? 0 : -1}
                          aria-label={`Day ${dayNum}, ${habit.name}: ${statusText}`}
                          aria-pressed={ariaPressed}
                          onClick={(e) =>
                            handleCellClick(dateStr, habit.id, cellState, e.currentTarget)
                          }
                          onFocus={() => setFocusedCoords([dayIndex, habitIndex])}
                          onKeyDown={(e) =>
                            handleKeyDown(
                              e,
                              dayIndex,
                              habitIndex,
                              dateStr,
                              habitId,
                              cellState
                            )
                          }
                          className={`grid-cell w-full min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-950 ${
                            cellState === 'X'
                              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                              : cellState === '.'
                              ? 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                              : 'bg-transparent border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600'
                          }`}
                          title={`${habit.name} on Day ${dayNum}: ${statusText}`}
                        >
                          {cellState === 'X' && (
                            <span className="text-base font-black tracking-tight select-none">
                              X
                            </span>
                          )}
                          {cellState === '.' && (
                            <span className="text-2xl font-black leading-none select-none">
                              •
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}

                  {/* Daily Score Cell */}
                  <td className="p-1 text-center text-xs font-mono">
                    <span
                      className={`inline-block px-2 py-1 rounded-md text-[11px] font-semibold ${
                        isPerfectDay
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : dayScore > 0
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          : 'text-zinc-400 dark:text-zinc-600'
                      }`}
                    >
                      {dayScore}/{habits.length}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HabitGrid;
