import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SkillBarProps {
  name: string;
  level: number; // 0-100
  description?: string;
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level, description }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative mb-6">
      <div className="flex items-center justify-between mb-1">
        <span className="text-primary font-cyber text-base">{name}</span>
        <span className="text-primary font-mono text-xs">{level}%</span>
      </div>
      <motion.div
        className="w-full h-3 bg-cyber-dark rounded-full overflow-hidden border border-primary/30 shadow-[0_0_8px_#f07e41]"
        initial={{ backgroundColor: '#18181b' }}
        whileHover={{ boxShadow: '0 0 16px #f07e41, 0 0 32px #f07e41' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          className="h-full bg-primary"
          style={{ boxShadow: '0 0 12px #f07e41, 0 0 24px #f07e41' }}
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </motion.div>
      {description && hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute left-0 top-8 z-10 bg-black/90 border border-primary text-gray-200 text-xs p-2 rounded shadow-lg w-max max-w-xs pointer-events-none"
        >
          {description}
        </motion.div>
      )}
    </div>
  );
};

export default SkillBar; 