import { useEffect, useRef } from 'react';

const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, clicked: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseDown = () => {
      mouseRef.current.clicked = true;
      // Create ripple effect
      for (let i = 0; i < 10; i++) {
        particles.push(new Particle(mouseRef.current.x, mouseRef.current.y, true));
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.clicked = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Matrix-like particles with glitch effect
    class Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      color: string;
      glitchOffset: number;
      isRipple: boolean;
      rippleSize: number;
      originalX: number;
      originalY: number;

      constructor(x?: number, y?: number, isRipple = false) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.originalX = this.x;
        this.originalY = this.y;
        this.speed = 1 + Math.random() * 2;
        this.size = 1 + Math.random() * 2;
        this.color = `rgba(240, 126, 65, ${0.1 + Math.random() * 0.3})`;
        this.glitchOffset = 0;
        this.isRipple = isRipple;
        this.rippleSize = 0;
      }

      update() {
        if (this.isRipple) {
          this.rippleSize += 5;
          this.color = `rgba(240, 126, 65, ${Math.max(0, 0.5 - this.rippleSize / 200)})`;
          return;
        }

        // Normal particle movement
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }

        // Glitch effect
        if (Math.random() < 0.01) {
          this.glitchOffset = (Math.random() - 0.5) * 10;
        } else {
          this.glitchOffset *= 0.95;
        }

        // Mouse interaction
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 100;
          this.x -= Math.cos(angle) * force * 2;
          this.y -= Math.sin(angle) * force * 2;
        }
      }

      draw() {
        if (!ctx) return;

        if (this.isRipple) {
          ctx.beginPath();
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 2;
          ctx.arc(this.x, this.y, this.rippleSize, 0, Math.PI * 2);
          ctx.stroke();
          return;
        }

        // Draw main particle
        ctx.fillStyle = this.color;
        ctx.fillRect(
          this.x + this.glitchOffset,
          this.y,
          this.size,
          this.size * 3
        );

        // Draw glitch echo
        if (Math.abs(this.glitchOffset) > 0.5) {
          ctx.fillStyle = `rgba(240, 126, 65, 0.1)`;
          ctx.fillRect(
            this.x - this.glitchOffset,
            this.y,
            this.size,
            this.size * 3
          );
        }
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    // Grid pattern with glitch
    const drawGrid = () => {
      if (!ctx) return;
      
      // Regular grid
      ctx.strokeStyle = 'rgba(240, 126, 65, 0.1)';
      ctx.lineWidth = 0.5;

      // Add random glitch segments
      const glitchCount = Math.floor(Math.random() * 3);
      for (let i = 0; i < glitchCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const width = 50 + Math.random() * 100;
        const height = 2 + Math.random() * 10;
        
        ctx.fillStyle = `rgba(240, 126, 65, ${0.1 + Math.random() * 0.2})`;
        ctx.fillRect(x, y, width, height);
      }
      
      // Draw grid lines
      for (let x = 0; x < canvas.width; x += 30) {
        const offset = Math.random() < 0.01 ? (Math.random() - 0.5) * 10 : 0;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x - offset, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += 30) {
        const offset = Math.random() < 0.01 ? (Math.random() - 0.5) * 10 : 0;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y - offset);
        ctx.stroke();
      }
    };

    // Animation loop
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      drawGrid();

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();

        // Remove finished ripples
        if (particle.isRipple && particle.rippleSize > 200) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ opacity: 0.8 }}
    />
  );
};

export default BackgroundAnimation; 