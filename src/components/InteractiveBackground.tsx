import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface InteractiveBackgroundProps {
  variant?: 'grid' | 'particles' | 'waves';
  intensity?: 'subtle' | 'medium' | 'high';
  color?: string;
}

const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ 
  variant = 'grid',
  intensity = 'subtle',
  color = '#f07e41'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const intensityMap = {
    subtle: 0.08,
    medium: 0.15,
    high: 0.25
  };

  const opacity = intensityMap[intensity];

  if (variant === 'grid') {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Cyberpunk Grid */}
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{
            backgroundImage: `
              linear-gradient(${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px),
              linear-gradient(90deg, ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: `translate(${mousePos.x * 8 - 4}px, ${mousePos.y * 8 - 4}px)`,
            filter: isHovering ? 'blur(0.5px)' : 'none'
          }}
        />
        
        {/* Glitch Effect Overlay */}
        {isHovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${color}20 0%, transparent 40%)`,
              animation: 'digitalGlitch 0.5s infinite'
            }}
          />
        )}

        {/* Scanning Lines */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(transparent 50%, ${color}08 50%)`,
            backgroundSize: '100% 4px',
            animation: 'scanlines 12s linear infinite'
          }}
        />
      </div>
    );
  }

  if (variant === 'particles') {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: -1 }}
      >
        {/* Grid Background - Same as About Page */}
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{
            backgroundImage: `
              linear-gradient(${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px),
              linear-gradient(90deg, ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePos.x * 8 - 4}px, ${mousePos.y * 8 - 4}px)`,
            filter: isHovering ? 'blur(0.5px)' : 'none'
          }}
        />

        {/* Bigger Glowing Pixels */}
        {Array.from({ length: 80 }).map((_, i) => {
          const baseX = (i * 37 + 15) % 100;
          const baseY = (i * 47 + 25) % 100;
          
          // Calculate distance from mouse for repulsion effect
          const mouseInfluence = 120; // pixels of influence - increased
          const containerWidth = containerRef.current?.clientWidth || 0;
          const containerHeight = containerRef.current?.clientHeight || 0;
          const distanceX = (mousePos.x * containerWidth) - (baseX / 100 * containerWidth);
          const distanceY = (mousePos.y * containerHeight) - (baseY / 100 * containerHeight);
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          let pushX = 0;
          let pushY = 0;
          
          if (isHovering && distance < mouseInfluence && distance > 0) {
            const force = (mouseInfluence - distance) / mouseInfluence;
            pushX = (distanceX / distance) * force * -45; // Push away from mouse - increased
            pushY = (distanceY / distance) * force * -45;
          }
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
                width: '2.5px',
                height: '2.5px',
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}, 0 0 16px ${color}90, 0 0 24px ${color}60`,
                opacity: 0.9
              }}
              animate={{
                // Natural floating motion
                x: [0, Math.sin(i) * 15, 0, Math.cos(i) * 10, 0].map(val => val + pushX),
                y: [0, Math.cos(i) * 12, 0, Math.sin(i) * 8, 0].map(val => val + pushY),
                // Strong pulsing glow effect
                scale: [1, 1.8, 1, 1.4, 1],
                opacity: [0.7, 1, 0.5, 1, 0.7],
                boxShadow: [
                  `0 0 8px ${color}, 0 0 16px ${color}90, 0 0 24px ${color}60`,
                  `0 0 12px ${color}, 0 0 24px ${color}, 0 0 36px ${color}80`,
                  `0 0 8px ${color}, 0 0 16px ${color}90, 0 0 24px ${color}60`,
                  `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}70`,
                  `0 0 8px ${color}, 0 0 16px ${color}90, 0 0 24px ${color}60`
                ]
              }}
              transition={{
                duration: 3 + (i % 5) * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 10) * 0.15
              }}
            />
          );
        })}

        {/* Even Tinier Ambient Pixels */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`tiny-${i}`}
            className="absolute"
            style={{
              left: `${(i * 13 + 8) % 95}%`,
              top: `${(i * 19 + 12) % 90}%`,
              width: '0.5px',
              height: '0.5px',
              backgroundColor: color,
              boxShadow: `0 0 1px ${color}`,
              opacity: 0.5
            }}
            animate={{
              x: [0, Math.sin(i * 0.3) * 20, 0],
              y: [0, Math.cos(i * 0.3) * 15, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 8 + (i % 4) * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
          />
        ))}

        {/* Glitch Effect Overlay */}
        {isHovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${color}15 0%, transparent 50%)`,
              animation: 'digitalGlitch 0.5s infinite'
            }}
          />
        )}

        {/* Scanning Lines */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(transparent 50%, ${color}08 50%)`,
            backgroundSize: '100% 4px',
            animation: 'scanlines 12s linear infinite'
          }}
        />
      </div>
    );
  }

  if (variant === 'waves') {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: -1 }}
      >
        {/* Circuit Board Base Pattern */}
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{
            backgroundImage: `
              linear-gradient(45deg, ${color}15 1px, transparent 1px),
              linear-gradient(-45deg, ${color}15 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            transform: `translate(${mousePos.x * 4 - 2}px, ${mousePos.y * 4 - 2}px)`,
            opacity: 0.3
          }}
        />

        {/* Animated Circuit Traces */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Horizontal Circuit Lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.line
              key={`h-${i}`}
              x1="0%"
              y1={`${15 + i * 12}%`}
              x2="100%"
              y2={`${15 + i * 12}%`}
              stroke={color}
              strokeWidth="1.5"
              strokeOpacity="0"
              strokeDasharray="10 5"
              animate={{
                strokeOpacity: [0, 0.8, 0, 0.6, 0],
                strokeDashoffset: [0, -50, -100, -150, -200]
              }}
              transition={{
                duration: 4 + i * 0.3,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5
              }}
            />
          ))}
          
          {/* Vertical Circuit Lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.line
              key={`v-${i}`}
              x1={`${20 + i * 15}%`}
              y1="0%"
              x2={`${20 + i * 15}%`}
              y2="100%"
              stroke={color}
              strokeWidth="1.5"
              strokeOpacity="0"
              strokeDasharray="8 4"
              animate={{
                strokeOpacity: [0, 0.7, 0, 0.5, 0],
                strokeDashoffset: [0, -40, -80, -120, -160]
              }}
              transition={{
                duration: 5 + i * 0.4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.7
              }}
            />
          ))}
          
          {/* Circuit Nodes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.circle
              key={`node-${i}`}
              cx={`${25 + (i * 13) % 60}%`}
              cy={`${20 + (i * 17) % 60}%`}
              r="2"
              fill={color}
              opacity="0"
              animate={{
                opacity: [0, 1, 0.3, 1, 0],
                r: [2, 4, 2, 3, 2]
              }}
              transition={{
                duration: 3 + (i % 4) * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          ))}
        </svg>

        {/* Data Stream Particles */}
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={`data-${i}`}
            className="absolute"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 11) % 100}%`,
              width: '3px',
              height: '8px',
              backgroundColor: color,
              borderRadius: '1px',
              boxShadow: `0 0 6px ${color}, 0 0 12px ${color}70`,
              opacity: 0
            }}
            animate={{
              x: [0, Math.cos(i) * 120, Math.sin(i) * 80, 0],
              y: [0, Math.sin(i) * 100, Math.cos(i) * 60, 0],
              opacity: [0, 0.8, 0.4, 0.9, 0],
              scaleY: [1, 2, 1, 1.5, 1]
            }}
            transition={{
              duration: 6 + (i % 6) * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}

        {/* Mouse Interaction - Circuit Activation */}
        {isHovering && (
          <>
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${mousePos.x * 100}%`,
                top: `${mousePos.y * 100}%`,
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${color}20 0%, ${color}10 40%, transparent 70%)`,
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Electromagnetic Pulse Effect */}
            <motion.div
              className="absolute rounded-full pointer-events-none border-2"
              style={{
                left: `${mousePos.x * 100}%`,
                top: `${mousePos.y * 100}%`,
                width: '100px',
                height: '100px',
                borderColor: color,
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [1, 3, 1],
                opacity: [0.8, 0, 0.8],
                borderWidth: ['2px', '1px', '2px']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </>
        )}

        {/* Glitch Data Corruption Effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 48%, ${color}08 50%, transparent 52%)`,
            backgroundSize: '20px 100%'
          }}
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    );
  }

  return null;
};

export default InteractiveBackground; 