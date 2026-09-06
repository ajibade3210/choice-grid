/**
 * Lightweight, zero-dependency frontend analytics utility.
 * Anonymous, privacy-preserving: only tracks event names, counts, and anonymous IDs.
 */
export const trackEvent = (name, props = {}) => {
  console.info(`[Analytics Event: ${name}]`, props);
};

export default trackEvent;
