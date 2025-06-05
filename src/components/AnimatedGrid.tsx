import { useEffect, useRef } from 'react';

const AnimatedGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      powerPreference: 'low-power'
    });
    if (!ctx) return;

    // Set canvas size to match viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid properties
    const CELL_SIZE = 40;
    const MOVE_SPEED = 0.2;
    let offset = 0;
    let time = 0;
    let lastTime = 0;

    // Pre-create gradients to avoid recreation on every frame
    const gradientCache = new Map<string, CanvasGradient>();
    
    const getOrCreateGradient = (key: string, createFn: () => CanvasGradient) => {
      if (!gradientCache.has(key)) {
        gradientCache.set(key, createFn());
      }
      return gradientCache.get(key)!;
    };

    // Throttle animation to 30fps for background element
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    // Animation loop with performance optimizations
    const animate = (currentTime: number) => {
      if (!ctx || !canvas) return;

      // Throttle to 30fps
      if (currentTime - lastTime < FRAME_INTERVAL) {
        frameIdRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      time += 0.008; // Slower time progression
      offset = (offset + MOVE_SPEED) % CELL_SIZE;

      // Clear with trail effect (reduced opacity for better performance)
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Batch draw operations
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;

      // Draw fewer grid lines for better performance
      const stepSize = CELL_SIZE;
      
      // Vertical lines
      ctx.beginPath();
      for (let x = offset; x < canvas.width; x += stepSize) {
        const waveOffset = Math.sin(time + x * 0.005) * 2;
        ctx.moveTo(x, waveOffset);
        ctx.lineTo(x, canvas.height + waveOffset);
      }
      
      // Use cached gradient for vertical lines
      const verticalGradient = getOrCreateGradient('vertical', () => {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, 'rgba(240, 126, 65, 0.1)');
        grad.addColorStop(0.5, 'rgba(240, 126, 65, 0.05)');
        grad.addColorStop(1, 'rgba(240, 126, 65, 0.1)');
        return grad;
      });
      ctx.strokeStyle = verticalGradient;
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      for (let y = offset; y < canvas.height; y += stepSize) {
        const waveOffset = Math.sin(time + y * 0.005) * 2;
        ctx.moveTo(waveOffset, y);
        ctx.lineTo(canvas.width + waveOffset, y);
      }
      
      // Use cached gradient for horizontal lines
      const horizontalGradient = getOrCreateGradient('horizontal', () => {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, 'rgba(240, 126, 65, 0.1)');
        grad.addColorStop(0.5, 'rgba(240, 126, 65, 0.05)');
        grad.addColorStop(1, 'rgba(240, 126, 65, 0.1)');
        return grad;
      });
      ctx.strokeStyle = horizontalGradient;
      ctx.stroke();

      // Reduce intersection points for performance
      const intersectionStep = stepSize * 2;
      for (let x = offset; x < canvas.width; x += intersectionStep) {
        for (let y = offset; y < canvas.height; y += intersectionStep) {
          const distanceFromCenter = Math.sqrt(
            Math.pow((canvas.width / 2) - x, 2) + 
            Math.pow((canvas.height / 2) - y, 2)
          );
          
          const rippleEffect = Math.sin(time * 1.2 - distanceFromCenter * 0.004) * 0.3 + 0.7;
          const glowSize = 0.8 + rippleEffect * 0.4;
          
          // Simple circle instead of gradient for performance
          ctx.beginPath();
          ctx.fillStyle = `rgba(240, 126, 65, ${0.15 * rippleEffect})`;
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Reduce energy pulse frequency
      if (Math.random() < 0.005) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 20 + Math.random() * 20;
        
        ctx.beginPath();
        ctx.fillStyle = 'rgba(240, 126, 65, 0.08)';
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      // Clear gradient cache
      gradientCache.clear();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
};

export default AnimatedGrid; 