import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { playWin } from '../utils/soundHelper';

export const ConfettiCelebration = ({ celebrationState, onResetCelebration }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!celebrationState) return;

    const streak = celebrationState.currentStreak || celebrationState.newStreak || 1;

    // 1. Play sound at volume 0.5 (soundHelper respects soundMuted)
    playWin(0.5);

    // 2. Show celebratory toast
    if (celebrationState.isNewRecord) {
      toast.success(`New Record! ${streak} Day Streak!`, {
        duration: 4000,
        icon: '🏆',
        style: {
          background: '#18181b',
          color: '#f4f4f5',
          border: '1px solid #27272a',
          fontWeight: 'bold',
          fontSize: '14px',
        },
      });
    } else {
      toast.success(
        `All ${celebrationState.totalTasks || ''} habits completed for the day! 🎉`,
        {
          duration: 4000,
          icon: '🏆',
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #27272a',
            fontWeight: 'bold',
            fontSize: '14px',
          },
        }
      );
    }

    // 3. Exactly 4 seconds confetti timer
    const timer = setTimeout(() => {
      if (onResetCelebration) {
        onResetCelebration();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [celebrationState, onResetCelebration]);

  if (!celebrationState) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        recycle={false}
        numberOfPieces={250}
        gravity={0.25}
        colors={['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#27272a', '#09090b']}
      />
    </div>
  );
};

export default ConfettiCelebration;
