import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Game constants optimized for performance
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 300;
const PROJECTILE_SPEED = 500;
const ENEMY_SPEED = 150;
const FIRE_RATE = 150;
const ENEMY_SPAWN_RATE = 1000;

// Pre-calculated values for performance
const HALF_CANVAS_WIDTH = CANVAS_WIDTH / 2;
const HALF_CANVAS_HEIGHT = CANVAS_HEIGHT / 2;

interface GameEntity {
  x: number;
  y: number;
  active: boolean;
}

interface Player extends GameEntity {
  width: number;
  height: number;
}

interface Projectile extends GameEntity {
  width: number;
  height: number;
}

interface Enemy extends GameEntity {
  width: number;
  height: number;
  health: number;
}

interface Particle extends GameEntity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  r: number; // Pre-calculated RGB values for performance
  g: number;
  b: number;
}

interface GameState {
  player: Player;
  projectiles: Projectile[];
  enemies: Enemy[];
  particles: Particle[];
  score: number;
  level: number;
  gameStarted: boolean;
  gameOver: boolean;
  lastShot: number;
  lastEnemySpawn: number;
  keys: { [key: string]: boolean };
  screenShake: number;
  combo: number;
  comboTimer: number;
}

// Optimized pools with smaller sizes
const createProjectilePool = (): Projectile[] => {
  return Array.from({ length: 20 }, () => ({ // Reduced from 50
    x: 0, y: 0, width: 4, height: 8, active: false
  }));
};

const createEnemyPool = (): Enemy[] => {
  return Array.from({ length: 10 }, () => ({ // Reduced from 20  
    x: 0, y: 0, width: 30, height: 30, health: 1, active: false
  }));
};

const createParticlePool = (): Particle[] => {
  return Array.from({ length: 50 }, () => ({ // Reduced from 200
    x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, 
    r: 255, g: 255, b: 255, active: false
  }));
};

// Ultra-fast collision detection
const checkCollision = (a: GameEntity & { width: number; height: number }, b: GameEntity & { width: number; height: number }): boolean => {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
};

const getHighScore = (): number => {
  const stored = localStorage.getItem('cyberDefenderHighScore');
  return stored ? parseInt(stored, 10) : 0;
};

const saveHighScore = (score: number): void => {
  localStorage.setItem('cyberDefenderHighScore', score.toString());
};

const CyberGame = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const backgroundGridRef = useRef<HTMLCanvasElement | null>(null);
  const highScoreRef = useRef<number>(0); // Cache high score in ref

  // Initialize game state with optimized defaults
  const gameStateRef = useRef<GameState>({
    player: { x: 385, y: 560, width: 30, height: 30, active: true },
    projectiles: createProjectilePool(),
    enemies: createEnemyPool(),
    particles: createParticlePool(),
    score: 0,
    level: 1,
    gameStarted: false,
    gameOver: false,
    lastShot: 0,
    lastEnemySpawn: 0,
    keys: {},
    screenShake: 0,
    combo: 0,
    comboTimer: 0,
  });

  // Load high score once on mount
  useEffect(() => {
    highScoreRef.current = getHighScore();
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    
    // Save and update high score if needed
    if (state.score > highScoreRef.current) {
      saveHighScore(state.score);
      highScoreRef.current = state.score;
    }
    
    // Reset player
    state.player.x = 385;
    state.player.y = 560;
    
    // Clear all entities efficiently
    state.projectiles.forEach(p => p.active = false);
    state.enemies.forEach(e => e.active = false);
    state.particles.forEach(p => p.active = false);
    
    // Reset game state
    state.score = 0;
    state.level = 1;
    state.gameStarted = true;
    state.gameOver = false;
    state.lastShot = 0;
    state.lastEnemySpawn = 0;
    state.screenShake = 0;
    state.combo = 0;
    state.comboTimer = 0;
  }, []);

  // Optimized input handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const state = gameStateRef.current;
    
    if (e.code === 'Space') {
      e.preventDefault();
      
      if (state.gameOver) {
        resetGame();
        return;
      }
      
      if (!state.gameStarted) {
        state.gameStarted = true;
        return;
      }
      
      // Optimized shooting
      const now = performance.now();
      if (now - state.lastShot > FIRE_RATE) {
        const projectile = state.projectiles.find(p => !p.active);
        if (projectile) {
          projectile.x = state.player.x + 13; // Center projectile
          projectile.y = state.player.y;
          projectile.active = true;
          state.lastShot = now;
        }
      }
    } else {
      state.keys[e.code] = true;
    }
  }, [resetGame]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    gameStateRef.current.keys[e.code] = false;
  }, []);

  // Pre-render grid once
  useEffect(() => {
    if (!backgroundGridRef.current) {
      backgroundGridRef.current = document.createElement('canvas');
      backgroundGridRef.current.width = CANVAS_WIDTH;
      backgroundGridRef.current.height = CANVAS_HEIGHT;
      
      const bgCtx = backgroundGridRef.current.getContext('2d');
      if (bgCtx) {
        bgCtx.fillStyle = '#0a0a0a';
        bgCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Minimal grid for performance
        bgCtx.strokeStyle = 'rgba(240, 126, 65, 0.05)'; // Very subtle
        bgCtx.lineWidth = 1;
        bgCtx.beginPath();
        
        for (let x = 0; x < CANVAS_WIDTH; x += 100) {
          bgCtx.moveTo(x, 0);
          bgCtx.lineTo(x, CANVAS_HEIGHT);
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 100) {
          bgCtx.moveTo(0, y);
          bgCtx.lineTo(CANVAS_WIDTH, y);
        }
        bgCtx.stroke();
      }
    }
  }, []);

  // ULTRA-OPTIMIZED UPDATE FUNCTION
  const updateGame = useCallback((deltaTime: number) => {
    const state = gameStateRef.current;
    if (!state.gameStarted || state.gameOver) return;
    
    const dt = deltaTime * 0.001; // Convert to seconds
    
    // Reduce screen shake
    if (state.screenShake > 0) {
      state.screenShake *= 0.85;
    }
    
    // Update combo timer
    if (state.comboTimer > 0) {
      state.comboTimer -= deltaTime;
      if (state.comboTimer <= 0) {
        state.combo = 0;
      }
    }
    
    // Player movement
    if (state.keys['ArrowLeft'] && state.player.x > 0) {
      state.player.x -= PLAYER_SPEED * dt;
    }
    if (state.keys['ArrowRight'] && state.player.x < CANVAS_WIDTH - state.player.width) {
      state.player.x += PLAYER_SPEED * dt;
    }
    
    // Update projectiles
    for (let i = 0; i < state.projectiles.length; i++) {
      const projectile = state.projectiles[i];
      if (!projectile.active) continue;
      
      projectile.y -= PROJECTILE_SPEED * dt;
      if (projectile.y < -projectile.height) {
        projectile.active = false;
      }
    }
    
    // Update enemies
    for (let i = 0; i < state.enemies.length; i++) {
      const enemy = state.enemies[i];
      if (!enemy.active) continue;
      
      enemy.y += ENEMY_SPEED * dt;
      
      // Player collision check
      if (checkCollision(enemy, state.player)) {
        state.gameOver = true;
        state.screenShake = 15;
        return;
      }
      
      if (enemy.y > CANVAS_HEIGHT) {
        enemy.active = false;
      }
    }
    
    // Update particles (minimal)
    for (let i = 0; i < state.particles.length; i++) {
      const particle = state.particles[i];
      if (!particle.active) continue;
      
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life--;
      
      if (particle.life <= 0) {
        particle.active = false;
      }
    }
    
    // OPTIMIZED COLLISION DETECTION - Single pass
    for (let p = 0; p < state.projectiles.length; p++) {
      const projectile = state.projectiles[p];
      if (!projectile.active) continue;
      
      for (let e = 0; e < state.enemies.length; e++) {
        const enemy = state.enemies[e];
        if (!enemy.active) continue;
        
        if (checkCollision(projectile, enemy)) {
          projectile.active = false;
          enemy.active = false;
          
          // Combo system
          if (state.comboTimer > 0) {
            state.combo++;
          } else {
            state.combo = 1;
          }
          state.comboTimer = 1500;
          
          state.score += 100 * Math.max(1, state.combo);
          state.screenShake = 3;
          
          // Minimal explosion effect
          const particle = state.particles.find(p => !p.active);
          if (particle) {
            particle.x = enemy.x + 15;
            particle.y = enemy.y + 15;
            particle.vx = 0;
            particle.vy = 0;
            particle.life = 20;
            particle.maxLife = 20;
            particle.size = 8;
            particle.r = 240;
            particle.g = 126;
            particle.b = 65;
            particle.active = true;
          }
          
          // Level progression
          if (state.score > 0 && state.score % 1000 === 0) {
            state.level++;
          }
          
          break; // Exit inner loop
        }
      }
    }
    
    // Spawn enemies
    const now = performance.now();
    const spawnRate = Math.max(ENEMY_SPAWN_RATE - state.level * 100, 400);
    if (now - state.lastEnemySpawn > spawnRate) {
      const activeEnemies = state.enemies.filter(e => e.active).length;
      if (activeEnemies < 3) { // Reduced max enemies
        const enemy = state.enemies.find(e => !e.active);
        if (enemy) {
          enemy.x = Math.random() * (CANVAS_WIDTH - 30);
          enemy.y = -30;
          enemy.active = true;
        }
        state.lastEnemySpawn = now;
      }
    }
  }, []);

  // ULTRA-OPTIMIZED RENDER FUNCTION
  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    
    // Use pre-rendered background
    const bgGrid = backgroundGridRef.current;
    if (bgGrid) {
      ctx.drawImage(bgGrid, 0, 0);
    } else {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    // Minimal screen shake
    ctx.save();
    if (state.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * state.screenShake;
      const shakeY = (Math.random() - 0.5) * state.screenShake;
      ctx.translate(shakeX, shakeY);
    }
    
    if (state.gameStarted && !state.gameOver) {
      // Draw particles (minimal, no glow)
      for (let i = 0; i < state.particles.length; i++) {
        const particle = state.particles[i];
        if (!particle.active) continue;
        
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${alpha})`;
        ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
      }
      
      // Draw projectiles (simple rectangles)
      ctx.fillStyle = '#00fff9';
      for (let i = 0; i < state.projectiles.length; i++) {
        const projectile = state.projectiles[i];
        if (!projectile.active) continue;
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
      }
      
      // Draw enemies (simple rectangles)
      ctx.fillStyle = '#ff4444';
      for (let i = 0; i < state.enemies.length; i++) {
        const enemy = state.enemies[i];
        if (!enemy.active) continue;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
      
      // Draw player (simple rectangle)
      ctx.fillStyle = '#f07e41';
      ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
      
      // UI (minimal)
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${state.score}`, 10, 25);
      ctx.fillText(`Level: ${state.level}`, 10, 45);
      
      if (highScoreRef.current > 0) {
        ctx.fillText(`High: ${highScoreRef.current}`, 10, 65);
      }
      
      if (state.combo > 1) {
        ctx.fillStyle = '#f07e41';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${state.combo}x COMBO!`, HALF_CANVAS_WIDTH, 80);
      }
    }
    
    // Game states (minimal)
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#f07e41';
      ctx.font = '28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 40);
      ctx.font = '18px monospace';
      ctx.fillText(`Score: ${state.score}`, HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 10);
      
      if (state.score > highScoreRef.current) {
        ctx.fillStyle = '#00ff00';
        ctx.fillText('NEW HIGH SCORE!', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 15);
      } else if (highScoreRef.current > 0) {
        ctx.fillStyle = '#888888';
        ctx.fillText(`High: ${highScoreRef.current}`, HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 15);
      }
      
      ctx.fillStyle = '#f07e41';
      ctx.fillText('Press SPACE to restart', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 50);
    } else if (!state.gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#f07e41';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CYBER DEFENDER', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 40);
      ctx.font = '16px monospace';
      ctx.fillText('Press SPACE to start', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 10);
      ctx.fillText('← → to move, SPACE to shoot', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 15);
      
      if (highScoreRef.current > 0) {
        ctx.fillStyle = '#888888';
        ctx.fillText(`High Score: ${highScoreRef.current}`, HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 50);
      }
    }
    
    ctx.restore();
  }, []);

  // OPTIMIZED GAME LOOP
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = Math.min(currentTime - lastTimeRef.current, 33.33);
    lastTimeRef.current = currentTime;
    
    updateGame(deltaTime);
    
    if (contextRef.current) {
      render(contextRef.current);
    }
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, render]);

  // Setup and cleanup - CRITICAL: only one game loop per instance
  useEffect(() => {
    if (!isVisible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Setup canvas
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.focus();
    
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });
    
    if (!ctx) return;
    
    // Cache the context in component-level ref
    contextRef.current = ctx;
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Start game loop
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear cached context on cleanup
      contextRef.current = null;
    };
  }, [isVisible, handleKeyDown, handleKeyUp, gameLoop]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="relative bg-cyber-black p-6 rounded-lg border-2 border-primary">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-primary text-xl"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-cyber text-primary mb-4 neon-text">Cyber Defender</h2>
            
            <canvas
              ref={canvasRef}
              className="border-2 border-primary rounded-lg focus:outline-none bg-black"
              style={{ 
                width: `${CANVAS_WIDTH}px`, 
                height: `${CANVAS_HEIGHT}px`,
                imageRendering: 'auto'
              }}
              tabIndex={0}
            />
            
            <div className="mt-4 text-center text-gray-400 text-sm font-mono">
              Enhanced • Screen Shake • Glow Effects • Combo System
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CyberGame; 