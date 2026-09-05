import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

/**
 * Singleton fixed viewport canvas for lightweight cell confetti bursts.
 * Emits 12-16 particles from a cell's coordinates over a 200ms lifespan.
 */
export const CellConfettiCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  // Sync canvas dimensions with viewport
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation render loop
  const renderFrame = (timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();
    const activeParticles = [];

    particlesRef.current.forEach((p) => {
      const age = now - p.startTime;
      if (age < p.duration) {
        const progress = age / p.duration;
        const opacity = Math.max(0, 1 - progress);

        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity; // Gravity factor
        p.vx *= 0.96; // Air resistance

        // Draw particle
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.shape === 'circle') {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        } else {
          ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.fill();
        ctx.restore();

        activeParticles.push(p);
      }
    });

    particlesRef.current = activeParticles;

    if (activeParticles.length > 0) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animFrameRef.current = null;
    }
  };

  useImperativeHandle(ref, () => ({
    /**
     * Trigger a 200ms localized burst of 12-16 particles from cell's center
     * @param {DOMRect|Object} domRect - The bounding rect of the tapped cell
     */
    triggerCellBurst(domRect) {
      if (!domRect) return;

      const originX = domRect.left + domRect.width / 2;
      const originY = domRect.top + domRect.height / 2;
      const count = 12 + Math.floor(Math.random() * 5); // 12-16 particles
      const colors = ['#18181b', '#f4f4f5', '#349698', '#e06947', '#a1a1aa', '#71717a'];
      const now = performance.now();

      const newParticles = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.2 + Math.random() * 3.8;
        newParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2, // Slight upward bias
          gravity: 0.15,
          size: 2.5 + Math.random() * 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.5 ? 'circle' : 'rect',
          startTime: now,
          duration: 200, // 200ms lifespan
        });
      }

      particlesRef.current.push(...newParticles);

      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(renderFrame);
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
});

CellConfettiCanvas.displayName = 'CellConfettiCanvas';

export default CellConfettiCanvas;
