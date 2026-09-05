/**
 * Device vibration haptics utility safely guarded for iOS and unsupported browsers
 */

export const hapticCellToggle = () => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(20);
    } catch {
      // Ignore vibration errors
    }
  }
};

export const hapticCelebrate = () => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(100);
    } catch {
      // Ignore vibration errors
    }
  }
};

export default {
  hapticCellToggle,
  hapticCelebrate,
};
