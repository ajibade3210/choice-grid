import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const TIMEZONE = 'Africa/Lagos';

// Get today's dayjs object in Africa/Lagos
export const getTodayInLagos = () => {
  return dayjs().tz(TIMEZONE);
};

// Returns date string in YYYY-MM-DD for a given date in Africa/Lagos
export const formatLagosDate = (date) => {
  return dayjs(date).tz(TIMEZONE).format('YYYY-MM-DD');
};

/**
 * Calculates the score (number of 'X') for a specific date given grid data and habits
 */
export const getDayScore = (gridData, dateStr, habits) => {
  const dayChecks = gridData[dateStr];
  if (!dayChecks) return 0;
  
  let score = 0;
  habits.forEach((h) => {
    if (dayChecks[h.id] === 'X') {
      score += 1;
    }
  });
  return score;
};

/**
 * Checks if a day is fully completed.
 * Evaluates whether every habit active for that day was marked 'X'.
 */
export const isDayFullyCompleted = (gridData, dateStr, habits) => {
  if (!habits || habits.length === 0) return false;
  const dayChecks = gridData[dateStr];
  if (!dayChecks) return false;

  const score = getDayScore(gridData, dateStr, habits);
  return score === habits.length;
};

/**
 * Calculates current streak in Africa/Lagos timezone:
 * - If today is fully completed: counts today + consecutive previous days backwards.
 * - If today is incomplete: counts consecutive completed days from yesterday backwards (active streak buffer).
 */
export const calculateCurrentStreak = (gridData, habits) => {
  if (!habits || habits.length === 0) return 0;

  const today = getTodayInLagos();
  const todayStr = today.format('YYYY-MM-DD');
  const todayCompleted = isDayFullyCompleted(gridData, todayStr, habits);

  let streak = 0;
  let checkDay = todayCompleted ? today : today.subtract(1, 'day');

  // Loop backwards day by day
  // Limit to 365 days max to prevent any runaway loop
  for (let i = 0; i < 365; i++) {
    const checkStr = checkDay.format('YYYY-MM-DD');
    if (isDayFullyCompleted(gridData, checkStr, habits)) {
      streak += 1;
      checkDay = checkDay.subtract(1, 'day');
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculates monthly completion percentage:
 * (total X / (daysInMonth * habits.length)) * 100
 */
export const calculateMonthlyCompletion = (gridData, year, monthIndex, daysInMonth, habits) => {
  if (!habits || habits.length === 0 || !daysInMonth || daysInMonth === 0) return 0;

  let totalX = 0;
  const paddedMonth = String(monthIndex + 1).padStart(2, '0');

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${paddedMonth}-${String(day).padStart(2, '0')}`;
    totalX += getDayScore(gridData, dayStr, habits);
  }

  const maxPossible = daysInMonth * habits.length;
  const percentage = (totalX / maxPossible) * 100;
  return Math.round(percentage * 10) / 10;
};
