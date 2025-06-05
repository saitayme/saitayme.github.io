import { useEffect, useRef } from 'react';

const AnimatedGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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
    const MOVE_SPEED = 0.2; // Slower movement
    let offset = 0;
    let time = 0;

    // Animation loop
    const animate = () => {
      if (!ctx) return;

      time += 0.01; // Slower time progression

      // Clear canvas with slight trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update offset
      offset = (offset + MOVE_SPEED) % CELL_SIZE;

      // Draw grid with subtle wave effect
      ctx.beginPath();
      ctx.lineWidth = 1;
      
      // Vertical lines with subtle wave effect
      for (let x = offset; x < canvas.width; x += CELL_SIZE) {
        const waveOffset = Math.sin(time + x * 0.005) * 3; // Reduced wave amplitude and frequency
        ctx.moveTo(x, waveOffset);
        ctx.lineTo(x, canvas.height + waveOffset);
        
        // Add subtle pulsating glow along the lines
        const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
        const alpha = (Math.sin(time + x * 0.01) + 1) * 0.08; // Reduced glow intensity
        gradient.addColorStop(0, `rgba(240, 126, 65, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(240, 126, 65, ${alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(240, 126, 65, ${alpha})`);
        ctx.strokeStyle = gradient;
        ctx.stroke();
        ctx.beginPath();
      }

      // Horizontal lines with subtle wave effect
      for (let y = offset; y < canvas.height; y += CELL_SIZE) {
        const waveOffset = Math.sin(time + y * 0.005) * 3; // Reduced wave amplitude and frequency
        ctx.moveTo(waveOffset, y);
        ctx.lineTo(canvas.width + waveOffset, y);
        
        // Add subtle pulsating glow along the lines
        const gradient = ctx.createLinearGradient(0, y, canvas.width, y);
        const alpha = (Math.sin(time + y * 0.01) + 1) * 0.08; // Reduced glow intensity
        gradient.addColorStop(0, `rgba(240, 126, 65, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(240, 126, 65, ${alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(240, 126, 65, ${alpha})`);
        ctx.strokeStyle = gradient;
        ctx.stroke();
        ctx.beginPath();
      }

      // Add subtle glowing intersection points with gentle ripple effect
      for (let x = offset; x < canvas.width; x += CELL_SIZE) {
        for (let y = offset; y < canvas.height; y += CELL_SIZE) {
          const distanceFromCenter = Math.sqrt(
            Math.pow((canvas.width / 2) - x, 2) + 
            Math.pow((canvas.height / 2) - y, 2)
          );
          
          const rippleEffect = Math.sin(time * 1.5 - distanceFromCenter * 0.005) * 0.5 + 0.5; // Slower ripple
          const glowSize = 1 + rippleEffect; // Smaller glow size
          const glowAlpha = 0.2 + rippleEffect * 0.2; // Reduced glow intensity

          // Draw subtle glowing point
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2);
          gradient.addColorStop(0, `rgba(240, 126, 65, ${glowAlpha})`);
          gradient.addColorStop(1, 'rgba(240, 126, 65, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(x, y, glowSize * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Add smaller center point
          ctx.beginPath();
          ctx.fillStyle = `rgba(240, 126, 65, ${glowAlpha + 0.1})`;
          ctx.arc(x, y, glowSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Add occasional subtle energy pulses (less frequent)
      if (Math.random() < 0.02) { // Reduced frequency
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 30 + Math.random() * 30; // Smaller size
        
        const pulseGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        pulseGradient.addColorStop(0, 'rgba(240, 126, 65, 0.1)'); // Reduced opacity
        pulseGradient.addColorStop(1, 'rgba(240, 126, 65, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = pulseGradient;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }} // Slightly reduced opacity
    />
  );
};

export default AnimatedGrid; 