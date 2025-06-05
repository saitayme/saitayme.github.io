import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Optimized game constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 240;
const PROJECTILE_SPEED = 320;
const ENEMY_SPEED = 80;
const FIRE_RATE = 200; // ms between shots
const ENEMY_SPAWN_RATE = 1200; // ms between enemy spawns

// Minimal game objects for performance
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
}

// Game state - keep it minimal for performance
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
}

// Object pools for zero-allocation gaming
const MAX_PROJECTILES = 10;
const MAX_ENEMIES = 8;
const MAX_PARTICLES = 15;

const createProjectilePool = (): Projectile[] => {
  const pool: Projectile[] = [];
  for (let i = 0; i < MAX_PROJECTILES; i++) {
    pool.push({ x: 0, y: 0, width: 4, height: 12, active: false });
  }
  return pool;
};

const createEnemyPool = (): Enemy[] => {
  const pool: Enemy[] = [];
  for (let i = 0; i < MAX_ENEMIES; i++) {
    pool.push({ x: 0, y: 0, width: 20, height: 20, health: 1, active: false });
  }
  return pool;
};

const createParticlePool = (): Particle[] => {
  const pool: Particle[] = [];
  for (let i = 0; i < MAX_PARTICLES; i++) {
    pool.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 30, active: false });
  }
  return pool;
};

// High-performance collision detection
const checkCollision = (a: GameEntity & { width: number; height: number }, b: GameEntity & { width: number; height: number }): boolean => {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
};

// localStorage for high scores
const getHighScore = (): number => {
  try {
    return parseInt(localStorage.getItem('cyberDefender_highScore') || '0', 10);
  } catch {
    return 0;
  }
};

const saveHighScore = (score: number): void => {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem('cyberDefender_highScore', score.toString());
    }
  } catch {
    // Silent fail
  }
};

const CyberGame = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [highScore, setHighScore] = useState(0);

  // Initialize game state
  const gameStateRef = useRef<GameState>({
    player: { x: 175, y: 560, width: 50, height: 20, active: true },
    projectiles: createProjectilePool(),
    enemies: createEnemyPool(),
    particles: createParticlePool(),
    score: 0,
    level: 1,
    gameStarted: false,
    gameOver: false,
    lastShot: 0,
    lastEnemySpawn: 0,
    keys: {}
  });

  // Load high score on mount
  useEffect(() => {
    setHighScore(getHighScore());
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    
    // Save high score
    saveHighScore(state.score);
    setHighScore(getHighScore());
    
    // Reset player
    state.player.x = 175;
    state.player.y = 560;
    
    // Clear all entities
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
  }, []);

  // Input handling
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
      
      // Shooting
      const now = performance.now();
      if (now - state.lastShot > FIRE_RATE) {
        const projectile = state.projectiles.find(p => !p.active);
        if (projectile) {
          projectile.x = state.player.x + state.player.width / 2 - 2;
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

  // Spawn enemy
  const spawnEnemy = useCallback(() => {
    const state = gameStateRef.current;
    const enemy = state.enemies.find(e => !e.active);
    if (enemy) {
      enemy.x = Math.random() * (CANVAS_WIDTH - enemy.width);
      enemy.y = -enemy.height;
      enemy.health = 1;
      enemy.active = true;
    }
  }, []);

  // Create explosion particles
  const createExplosion = useCallback((x: number, y: number) => {
    const state = gameStateRef.current;
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = state.particles.find(p => !p.active);
      if (!particle) break;
      
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 60 + Math.random() * 40;
      
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 30;
      particle.maxLife = 30;
      particle.active = true;
    }
  }, []);

  // Game update loop - optimized for 60fps
  const updateGame = useCallback((deltaTime: number) => {
    const state = gameStateRef.current;
    if (!state.gameStarted || state.gameOver) return;
    
    const dt = deltaTime / 1000; // Convert to seconds
    
    // Update player movement
    if (state.keys['ArrowLeft'] && state.player.x > 0) {
      state.player.x -= PLAYER_SPEED * dt;
    }
    if (state.keys['ArrowRight'] && state.player.x < CANVAS_WIDTH - state.player.width) {
      state.player.x += PLAYER_SPEED * dt;
    }
    
    // Update projectiles
    state.projectiles.forEach(projectile => {
      if (!projectile.active) return;
      projectile.y -= PROJECTILE_SPEED * dt;
      if (projectile.y < 0) {
        projectile.active = false;
      }
    });
    
    // Update enemies
    state.enemies.forEach(enemy => {
      if (!enemy.active) return;
      enemy.y += ENEMY_SPEED * dt;
      
      // Check enemy-player collision
      if (checkCollision(enemy, state.player)) {
        state.gameOver = true;
        createExplosion(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2);
        return;
      }
      
      // Check if enemy reached bottom
      if (enemy.y > CANVAS_HEIGHT) {
        enemy.active = false;
      }
    });
    
    // Update particles
    state.particles.forEach(particle => {
      if (!particle.active) return;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life--;
      if (particle.life <= 0) {
        particle.active = false;
      }
    });
    
    // Check projectile-enemy collisions
    state.projectiles.forEach(projectile => {
      if (!projectile.active) return;
      state.enemies.forEach(enemy => {
        if (!enemy.active) return;
        if (checkCollision(projectile, enemy)) {
          projectile.active = false;
          enemy.active = false;
          state.score += 100;
          createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
          
          // Level progression
          if (state.score > 0 && state.score % 1000 === 0) {
            state.level++;
          }
        }
      });
    });
    
    // Spawn enemies
    const now = performance.now();
    const spawnRate = Math.max(ENEMY_SPAWN_RATE - state.level * 100, 400);
    if (now - state.lastEnemySpawn > spawnRate) {
      const activeEnemies = state.enemies.filter(e => e.active).length;
      if (activeEnemies < 3) {
        spawnEnemy();
        state.lastEnemySpawn = now;
      }
    }
  }, [spawnEnemy, createExplosion]);

  // Optimized render function
  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    
    // Clear canvas efficiently
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw simple grid
    ctx.strokeStyle = 'rgba(240, 126, 65, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
    }
    ctx.stroke();
    
    if (state.gameStarted && !state.gameOver) {
      // Draw particles
      ctx.fillStyle = '#ff0066';
      state.particles.forEach(particle => {
        if (!particle.active) return;
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1;
      
      // Draw projectiles
      ctx.fillStyle = '#00fff9';
      state.projectiles.forEach(projectile => {
        if (!projectile.active) return;
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
      });
      
      // Draw enemies
      ctx.fillStyle = '#ff0066';
      state.enemies.forEach(enemy => {
        if (!enemy.active) return;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      });
      
      // Draw player
      ctx.fillStyle = '#f07e41';
      ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
      
      // Draw UI
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${state.score}`, 10, 25);
      ctx.fillText(`Level: ${state.level}`, 10, 45);
      if (highScore > 0) {
        ctx.fillText(`High: ${highScore}`, 10, 65);
      }
    }
    
    // Draw game states
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#f07e41';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.font = '16px monospace';
      ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      
      if (state.score > highScore) {
        ctx.fillStyle = '#00ff00';
        ctx.fillText('NEW HIGH SCORE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
      } else if (highScore > 0) {
        ctx.fillStyle = '#888888';
        ctx.fillText(`High: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
      }
      
      ctx.fillStyle = '#f07e41';
      ctx.fillText('Press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    } else if (!state.gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#f07e41';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CYBER DEFENDER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.font = '16px monospace';
      ctx.fillText('Press SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      ctx.fillText('← → to move, SPACE to shoot', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
      
      if (highScore > 0) {
        ctx.fillStyle = '#888888';
        ctx.fillText(`High Score: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      }
    }
  }, [highScore]);

  // Main game loop
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = Math.min(currentTime - lastTimeRef.current, 33.33); // Cap at ~30fps minimum
    lastTimeRef.current = currentTime;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    updateGame(deltaTime);
    render(ctx);
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, render]);

  // Setup and cleanup
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
    
    // Optimize context
    ctx.imageSmoothingEnabled = false;
    
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
                imageRendering: 'pixelated'
              }}
              tabIndex={0}
            />
            
            <div className="mt-4 text-center text-gray-400 text-sm font-mono">
              Optimized • 60 FPS • Zero Allocation
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CyberGame; 