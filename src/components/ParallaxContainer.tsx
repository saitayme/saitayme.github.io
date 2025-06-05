import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ParallaxContainerProps {
  children: React.ReactNode;
  intensity?: number;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  intensity = 20,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="parallax-container"
      style={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px)',
      }}
      animate={{
        rotateY: mousePosition.x * intensity,
        rotateX: -mousePosition.y * intensity,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
    >
      <motion.div
        className="parallax-element"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ParallaxContainer; 