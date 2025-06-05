import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageChipProps {
  countryCode: string; // e.g. 'de', 'gb', 'es'
  label: string;
  context?: string;
}

const flagUrl = (code: string) => `https://flagcdn.com/24x18/${code}.png`;

const LanguageChip: React.FC<LanguageChipProps> = ({ countryCode, label, context }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative inline-flex items-center px-3 py-1 m-1 rounded-full border border-primary bg-black/80 shadow-[0_0_8px_#f07e41] cursor-pointer transition-all"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      aria-label={label}
    >
      <img src={flagUrl(countryCode)} alt={label + ' flag'} className="w-5 h-5 mr-2 rounded-full border border-primary/50" />
      <span className="text-primary font-mono text-sm">{label}</span>
      <AnimatePresence>
        {hovered && context && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 bg-black/95 border border-primary text-gray-200 text-xs p-2 rounded shadow-lg w-max max-w-xs pointer-events-none"
          >
            {context}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageChip; 