import React from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';

const lines = [
  'Julian Strunz',
  'Game Developer & Engine Programmer',
  'Specialties: Unity, Unreal Engine, C#, C++, Audio, Tools',
];

const crtNoise = {
  background: `
    repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 2px),
    linear-gradient(90deg, rgba(240,126,65,0.05) 0%, rgba(0,0,0,0.1) 100%)
  `,
  filter: 'contrast(1.2) brightness(1.1)',
};

const TerminalTypewriter: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full max-w-xl mx-auto p-6 rounded-lg shadow-lg border border-primary bg-black/80 relative overflow-hidden"
      style={crtNoise}
    >
      <div className="font-mono text-lg md:text-xl text-primary-green leading-relaxed" style={{fontFamily: 'monospace'}}>
        {lines.map((line, idx) => (
          <div key={idx} className="h-8">
            <Typewriter
              words={[line]}
              loop={1}
              cursor={false}
              typeSpeed={40}
              deleteSpeed={0}
              delaySpeed={idx * 1200}
            />
            {idx === lines.length - 1 && (
              <span className="animate-blink text-primary">_</span>
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{background: 'url(/assets/crt-noise.png)', opacity: 0.12, mixBlendMode: 'screen'}} />
    </motion.div>
  );
};

export default TerminalTypewriter; 