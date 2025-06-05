import React, { useState, useEffect } from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';

interface SteckbriefTypewriterProps {
  portraitUrl: string;
  name: string;
  profession: string;
  level: string;
  levelProgress: number;
  specialMoves: string[];
  origin: string;
  languages: string[];
  quirk: string;
}

const fields = (props: SteckbriefTypewriterProps) => [
  `NAME: ${props.name}`,
  `CLASS: ${props.profession}`,
  `LEVEL: ${props.level}`,
  `SPECIAL MOVES:`,
  ...props.specialMoves.map(move => `  • ${move}`),
  `ORIGIN: ${props.origin}`,
  `LANGUAGES: ${props.languages.join(', ')}`,
  `QUIRK: ${props.quirk}`,
];

const SteckbriefTypewriter: React.FC<SteckbriefTypewriterProps> = (props) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [done, setDone] = useState(false);
  const lines = fields(props);

  useEffect(() => {
    if (currentLine < lines.length && !done) {
      const timeout = setTimeout(() => setCurrentLine(currentLine + 1), 800 + lines[currentLine].length * 15);
      return () => clearTimeout(timeout);
    } else if (currentLine === lines.length) {
      setDone(true);
    }
  }, [currentLine, done, lines]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full max-w-xl mx-auto p-6 rounded-xl shadow-lg border-2 border-primary bg-black/80 relative overflow-hidden flex flex-col items-center gap-4"
      style={{
        background:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 2px), linear-gradient(90deg, rgba(240,126,65,0.05) 0%, rgba(0,0,0,0.1) 100%)',
        filter: 'contrast(1.2) brightness(1.1)',
        boxShadow: '0 0 32px #f07e41, 0 0 64px #18181b inset',
      }}
    >
      <div className="flex flex-col items-center">
        <img
          src={props.portraitUrl}
          alt="Portrait"
          className="w-32 h-32 rounded-lg border-4 border-primary shadow-[0_0_24px_#f07e41] object-cover bg-cyber-dark mb-2"
          style={{ minWidth: 96, minHeight: 96 }}
        />
        <span className="text-xs text-primary font-mono mt-1 opacity-80">Player Profile</span>
      </div>
      <div className="w-full font-mono text-base md:text-lg text-primary-green leading-relaxed whitespace-pre-line break-words text-center" style={{fontFamily: 'monospace', lineHeight: '1.7'}}>
        {lines.slice(0, currentLine + 1).map((line, idx) => (
          <div key={idx} className="min-h-[2.2em] py-1">
            {idx === currentLine && !done ? (
              <Typewriter
                words={[line]}
                loop={1}
                cursor={false}
                typeSpeed={20}
                deleteSpeed={0}
                delaySpeed={0}
              />
            ) : (
              <span>{line}</span>
            )}
            {idx === 2 && line.includes('LEVEL') && (
              <div className="mt-1 mb-2">
                <div className="h-1.5 bg-cyber-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${props.levelProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-primary mt-0.5">{props.levelProgress}%</span>
                </div>
              </div>
            )}
            {idx === lines.length - 1 && done && (
              <motion.span 
                className="text-primary"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >_</motion.span>
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{background: 'url(/assets/crt-noise.png)', opacity: 0.12, mixBlendMode: 'screen'}} />
    </motion.div>
  );
};

export default SteckbriefTypewriter; 