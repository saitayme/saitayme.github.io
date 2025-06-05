import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExperienceCardProps {
  title: string;
  company: string;
  date: string;
  description: string;
  details?: string;
  highlight?: boolean;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ title, company, date, description, details, highlight }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`relative mb-8 p-5 rounded-lg border ${highlight ? 'border-primary shadow-[0_0_24px_#f07e41]' : 'border-primary/30'} bg-black/80 transition-all duration-200 cursor-pointer group`}
      whileHover={{ scale: 1.03, boxShadow: highlight ? '0 0 32px #f07e41, 0 0 64px #f07e41' : '0 0 16px #f07e41' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-primary font-cyber text-lg">{title}</span>
        <span className="text-gray-300 text-sm">{company}</span>
        <span className="text-primary text-xs font-mono">{date}</span>
        <span className="text-gray-400 text-sm mt-2">{description}</span>
      </div>
      <AnimatePresence>
        {hovered && details && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 top-full mt-2 z-20 bg-black/95 border border-primary text-gray-200 text-xs p-3 rounded shadow-lg w-max max-w-xs pointer-events-none"
          >
            {details}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExperienceCard; 