import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { getDayScore } from '../utils/streak';
import { Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, habitsCount, isDark }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const percentage = habitsCount > 0 ? Math.round((score / habitsCount) * 100) : 0;

    return (
      <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg text-xs space-y-1">
        <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <span>Day {label}</span>
          <span className="text-[10px] text-zinc-400">({percentage}%)</span>
        </div>
        <div className="text-zinc-600 dark:text-zinc-400 font-mono">
          Score:{' '}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {score} / {habitsCount}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const ScoreChart = ({
  year,
  monthIndex,
  daysInMonth,
  habits,
  gridData,
  theme,
}) => {
  const paddedMonth = String(monthIndex + 1).padStart(2, '0');
  const isDark = theme === 'dark';

  // Screen width observer for dynamic X-Axis interval
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartData = useMemo(() => {
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPadded = String(day).padStart(2, '0');
      const dateStr = `${year}-${paddedMonth}-${dayPadded}`;
      const score = getDayScore(gridData, dateStr, habits);

      data.push({
        day,
        score,
        fullTarget: habits.length,
      });
    }
    return data;
  }, [year, paddedMonth, daysInMonth, habits, gridData]);

  // Monochrome tokens
  const gridStroke = isDark ? '#27272a' : '#e4e4e7';
  const axisColor = isDark ? '#71717a' : '#a1a1aa';
  const lineStroke = isDark ? '#f4f4f5' : '#18181b';
  const dotFill = isDark ? '#18181b' : '#ffffff';

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4 sm:p-5 flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Daily Score Trend
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Score: 0 to {habits.length} habits done per day
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-medium px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          Max: {habits.length}
        </span>
      </div>

      {/* Chart container with fixed height h-72 to eliminate collapsing */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis
              dataKey="day"
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              interval={isMobile ? 4 : 0}
              tickFormatter={(val) => `${val}`}
            />
            <YAxis
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, habits.length || 5]}
              allowDecimals={false}
            />
            <Tooltip
              content={
                <CustomTooltip
                  habitsCount={habits.length}
                  isDark={isDark}
                />
              }
            />
            {/* Reference line showing max target */}
            <ReferenceLine
              y={habits.length}
              stroke={isDark ? '#3f3f46' : '#d4d4d8'}
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={lineStroke}
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: dotFill,
                stroke: lineStroke,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: lineStroke,
                stroke: dotFill,
                strokeWidth: 2,
              }}
              animationDuration={400}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreChart;
