import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaGamepad, FaTools } from 'react-icons/fa';

import React from 'react';

interface HomeProps {
  onPlayGame: () => void;
}

const GlitchText = ({ children, delay = 0, initialReveal = false }: { children: string, delay?: number, initialReveal?: boolean }) => {
  const [isRevealed, setIsRevealed] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (initialReveal) {
      timerRef.current = setTimeout(() => {
        setIsRevealed(true);
      }, 4500);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [initialReveal]);

  if (!isRevealed && initialReveal) {
    return (
      <motion.div 
        className="relative inline-block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay }}
      >
        <div className="mega-glitch" data-text={children}>
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative inline-block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: initialReveal ? 0 : delay }}
    >
      <div className="glitch-text" data-text={children}>
        {children}
      </div>
    </motion.div>
  );
};

const StartupSequence = () => {
  const [isComplete, setIsComplete] = React.useState(false);
  const [text, setText] = React.useState('');
  const [showGlitch, setShowGlitch] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const glitchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const mountedRef = React.useRef(true);
  
  // Simplified, faster text for better performance
  const fullText = `> INITIALIZING NEURAL INTERFACE...
> LOADING CORE MODULES...
> ESTABLISHING CONNECTION...
> BYPASSING SECURITY...
> DECRYPTING DATA...
> ACCESSING PROFILE...

[SYSTEM STATUS]
---------------
NEURAL LINK: ACTIVE
CORE SYSTEMS: ONLINE
SECURITY: MAXIMUM

[PROFILE DATA]
-------------
NAME: JULIAN STRUNZ
ROLE: GAME & ENGINE PROGRAMMER
STATUS: ACTIVE

> NEURAL INTERFACE STABILIZED
> INITIATING DISPLAY...
> ACCESS GRANTED_`;

  React.useEffect(() => {
    mountedRef.current = true;
    let currentText = '';
    let currentIndex = 0;

    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      
      if (currentIndex < fullText.length) {
        currentText += fullText[currentIndex];
        setText(currentText);
        currentIndex++;
        
        // Reduced glitch frequency for better performance
        if (Math.random() < 0.03) {
          setShowGlitch(true);
          if (glitchTimeoutRef.current) {
            clearTimeout(glitchTimeoutRef.current);
          }
          glitchTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              setShowGlitch(false);
            }
          }, 80);
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setIsComplete(true);
          }
        }, 800);
      }
    }, 20); // Faster typing for quicker startup

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
      }
    };
  }, []);

  if (isComplete) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-cyber-black z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0, display: 'none' }}
      transition={{ duration: 1.5, delay: 3.5 }} // Much longer delay to see the full intro
    >
      <div className="matrix-rain" />
      <div className="relative max-w-3xl w-full mx-4">
        <pre className={`font-mono text-primary whitespace-pre-wrap startup-text ${showGlitch ? 'startup-glitch' : ''}`}>
          {text}
        </pre>
        <div className="absolute inset-0 pointer-events-none">
          <div className="scanline opacity-40 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

const TerminalText = ({ children, delay = 0 }: { children: string, delay?: number }) => {
  const [text, setText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);
  const [hasStarted, setHasStarted] = React.useState(false);
  const mountedRef = React.useRef(true);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    mountedRef.current = true;
    
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      
      setHasStarted(true);
      let currentText = '';
      let currentIndex = 0;

      intervalRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        
        if (currentIndex < children.length) {
          currentText += children[currentIndex];
          setText(currentText);
          currentIndex++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsComplete(true);
        }
      }, 45); // Slightly faster typing
    }, delay);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [children, delay]);

  // Don't render anything until we've started
  if (!hasStarted) {
    return <div className="font-mono text-primary relative min-h-[1.5em]" />;
  }

  return (
    <div className="font-mono text-primary relative">
      <span className={`${isComplete ? 'after:opacity-0' : 'after:opacity-100'} after:content-['_'] after:animate-pulse after:ml-1`}>
        {text}
      </span>
    </div>
  );
};

const Home = ({ onPlayGame }: HomeProps) => {
  const gameButtonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 1.5,
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black">
      <StartupSequence />
      {/* Scanline Effect */}
      <div className="scanline" />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 5.5 }} // Start after startup sequence
        className="h-screen flex items-center relative overflow-hidden"
      >
        {/* Animated Grid Background */}
        {/* <AnimatedGrid /> */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-black/50 to-cyber-black" />

        <div className="cyber-container relative z-10">
          <motion.div
            className="text-center space-y-12 z-10"
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-8">
              <h1 className="text-6xl md:text-8xl tracking-wider space-y-4">
                <GlitchText delay={3.5} initialReveal={true}>Julian Strunz</GlitchText>
                <div className="h-12" />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-[#fcee0a] font-cyber tracking-[0.2em] text-2xl md:text-4xl min-h-[3rem] flex items-center">
                    <TerminalText delay={6000}>{`> GAME & ENGINE PROGRAMMER_`}</TerminalText>
                  </div>
                </div>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 7.5 }}
              className="text-gray-400 max-w-2xl mx-auto px-4 text-lg font-mono"
            >
              Crafting immersive gameplay experiences and robust engine tools
              for Unity and Unreal Engine.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 8 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mt-8"
            >
              <Link to="/projects">
                <motion.button
                  className="cyber-button primary-button relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">View Projects</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-shimmer" />
                </motion.button>
              </Link>

              <Link to="/contact">
                <motion.button
                  className="cyber-button secondary-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get in Touch
                </motion.button>
              </Link>

              <motion.button
                onClick={onPlayGame}
                className="cyber-button-game group relative"
                variants={gameButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <span className="relative z-10 flex items-center">
                  <span className="mr-2">🎮</span>
                  Play Cyber Defender
                  <span className="ml-2 text-sm opacity-70">[New!]</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-cyber-dark relative overflow-hidden">
        <div className="cyber-container relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="cyber-card group"
            >
              <FaGamepad className="text-4xl text-primary mb-4 neon-flicker" />
              <h2 className="text-2xl font-cyber text-white mb-4 group-hover:text-primary group-hover:neon-text transition-all">
                Gameplay Programming
              </h2>
              <p className="text-gray-400 font-mono">
                Specializing in combat systems, procedural generation, and AI behavior
                implementation for engaging player experiences.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="cyber-card group"
            >
              <FaTools className="text-4xl text-primary mb-4 neon-flicker" />
              <h2 className="text-2xl font-cyber text-white mb-4 group-hover:text-primary group-hover:neon-text transition-all">
                Engine Tools
              </h2>
              <p className="text-gray-400 font-mono">
                Building efficient tools and frameworks for scene management, audio systems,
                and custom editor extensions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 