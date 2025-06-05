import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Game constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 240;
const PROJECTILE_SPEED = 320;
const ENEMY_SPEED = 80;
const FIRE_RATE = 200; // ms between shots
const ENEMY_SPAWN_RATE = 1200; // ms between enemy spawns

// Game objects with more properties for cool effects
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
  rotation: number;
  scale: number;
  hue: number;
}

interface Particle extends GameEntity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'explosion' | 'spark' | 'trail';
}

// Game state with screen shake
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

// Object pools
const MAX_PROJECTILES = 15;
const MAX_ENEMIES = 10;
const MAX_PARTICLES = 30;

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
    pool.push({ 
      x: 0, y: 0, width: 24, height: 24, health: 1, active: false,
      rotation: 0, scale: 1, hue: 0
    });
  }
  return pool;
};

const createParticlePool = (): Particle[] => {
  const pool: Particle[] = [];
  for (let i = 0; i < MAX_PARTICLES; i++) {
    pool.push({ 
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 60, active: false,
      size: 2, color: '#ff0066', type: 'explosion'
    });
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
    keys: {},
    screenShake: 0,
    combo: 0,
    comboTimer: 0
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
    state.screenShake = 0;
    state.combo = 0;
    state.comboTimer = 0;
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
          
          // Create muzzle flash particles
          createMuzzleFlash(projectile.x + 2, projectile.y);
        }
      }
    } else {
      state.keys[e.code] = true;
    }
  }, [resetGame]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    gameStateRef.current.keys[e.code] = false;
  }, []);

  // Spawn enemy with cool effects
  const spawnEnemy = useCallback(() => {
    const state = gameStateRef.current;
    const enemy = state.enemies.find(e => !e.active);
    if (enemy) {
      enemy.x = Math.random() * (CANVAS_WIDTH - enemy.width);
      enemy.y = -enemy.height;
      enemy.health = 1;
      enemy.active = true;
      enemy.rotation = Math.random() * Math.PI * 2;
      enemy.scale = 0.8 + Math.random() * 0.4;
      enemy.hue = Math.random() * 60 + 300; // Purple to red range
      
      // Spawn particles on enemy appearance
      createSpawnEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
    }
  }, []);

  // Create muzzle flash effect
  const createMuzzleFlash = useCallback((x: number, y: number) => {
    const state = gameStateRef.current;
    for (let i = 0; i < 3; i++) {
      const particle = state.particles.find(p => !p.active);
      if (!particle) break;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 20;
      
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed - 30;
      particle.life = 8;
      particle.maxLife = 8;
      particle.size = 1 + Math.random() * 2;
      particle.color = '#00fff9';
      particle.type = 'spark';
      particle.active = true;
    }
  }, []);

  // Create spawn effect
  const createSpawnEffect = useCallback((x: number, y: number) => {
    const state = gameStateRef.current;
    for (let i = 0; i < 6; i++) {
      const particle = state.particles.find(p => !p.active);
      if (!particle) break;
      
      const angle = (Math.PI * 2 * i) / 6;
      const speed = 40 + Math.random() * 20;
      
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 20;
      particle.maxLife = 20;
      particle.size = 2 + Math.random() * 2;
      particle.color = '#ff0066';
      particle.type = 'explosion';
      particle.active = true;
    }
  }, []);

  // Create explosion particles
  const createExplosion = useCallback((x: number, y: number, isEnemy: boolean = true) => {
    const state = gameStateRef.current;
    const particleCount = isEnemy ? 12 : 8;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = state.particles.find(p => !p.active);
      if (!particle) break;
      
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 60 + Math.random() * 40;
      
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 40 + Math.random() * 20;
      particle.maxLife = particle.life;
      particle.size = 2 + Math.random() * 3;
      particle.color = isEnemy ? '#ff0066' : '#f07e41';
      particle.type = 'explosion';
      particle.active = true;
    }
    
    // Screen shake
    state.screenShake = isEnemy ? 8 : 12;
  }, []);

  // Game update loop
  const updateGame = useCallback((deltaTime: number) => {
    const state = gameStateRef.current;
    if (!state.gameStarted || state.gameOver) return;
    
    const dt = deltaTime / 1000;
    
    // Reduce screen shake
    if (state.screenShake > 0) {
      state.screenShake *= 0.9;
    }
    
    // Update combo timer
    if (state.comboTimer > 0) {
      state.comboTimer -= deltaTime;
      if (state.comboTimer <= 0) {
        state.combo = 0;
      }
    }
    
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
      
      // Create trail particles
      if (Math.random() < 0.3) {
        const particle = state.particles.find(p => !p.active);
        if (particle) {
          particle.x = projectile.x + 2;
          particle.y = projectile.y + 12;
          particle.vx = (Math.random() - 0.5) * 10;
          particle.vy = 20;
          particle.life = 15;
          particle.maxLife = 15;
          particle.size = 1;
          particle.color = '#00fff9';
          particle.type = 'trail';
          particle.active = true;
        }
      }
    });
    
    // Update enemies with rotation and scale
    state.enemies.forEach(enemy => {
      if (!enemy.active) return;
      enemy.y += ENEMY_SPEED * dt;
      enemy.rotation += dt * 2;
      enemy.scale = 0.9 + Math.sin(performance.now() * 0.005 + enemy.hue) * 0.1;
      
      // Check enemy-player collision
      if (checkCollision(enemy, state.player)) {
        state.gameOver = true;
        createExplosion(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, false);
        return;
      }
      
      // Check if enemy reached bottom
      if (enemy.y > CANVAS_HEIGHT) {
        enemy.active = false;
      }
    });
    
    // Update particles with physics
    state.particles.forEach(particle => {
      if (!particle.active) return;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      
      // Apply gravity to explosion particles
      if (particle.type === 'explosion') {
        particle.vy += 150 * dt;
      }
      
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
          
          // Combo system
          if (state.comboTimer > 0) {
            state.combo++;
          } else {
            state.combo = 1;
          }
          state.comboTimer = 1500; // 1.5 seconds to maintain combo
          
          const points = 100 * Math.max(1, state.combo);
          state.score += points;
          
          createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, true);
          
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
      if (activeEnemies < 4) {
        spawnEnemy();
        state.lastEnemySpawn = now;
      }
    }
  }, [spawnEnemy, createExplosion, createMuzzleFlash, createSpawnEffect]);

  // Enhanced render function with cool effects
  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw enhanced grid with glow
    ctx.strokeStyle = 'rgba(240, 126, 65, 0.2)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#f07e41';
    ctx.beginPath();
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Apply screen shake
    ctx.save();
    if (state.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * state.screenShake;
      const shakeY = (Math.random() - 0.5) * state.screenShake;
      ctx.translate(shakeX, shakeY);
    }
    
    if (state.gameStarted && !state.gameOver) {
      // Draw particles with glow effects
      state.particles.forEach(particle => {
        if (!particle.active) return;
        const alpha = particle.life / particle.maxLife;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = particle.size * 3;
        ctx.shadowColor = particle.color;
        
        if (particle.type === 'spark') {
          // Draw sparks as lines
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.size;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx * 0.1, particle.y - particle.vy * 0.1);
          ctx.stroke();
        } else {
          // Draw explosions and trails as circles
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      // Draw projectiles with glow
      ctx.fillStyle = '#00fff9';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00fff9';
      state.projectiles.forEach(projectile => {
        if (!projectile.active) return;
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
      });
      ctx.shadowBlur = 0;
      
      // Draw enemies with rotation, scaling and glow
      state.enemies.forEach(enemy => {
        if (!enemy.active) return;
        
        ctx.save();
        ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        ctx.rotate(enemy.rotation);
        ctx.scale(enemy.scale, enemy.scale);
        
        // Enemy glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsl(${enemy.hue}, 100%, 50%)`;
        ctx.fillStyle = `hsl(${enemy.hue}, 100%, 50%)`;
        
        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -enemy.height/2);
        ctx.lineTo(enemy.width/2, 0);
        ctx.lineTo(0, enemy.height/2);
        ctx.lineTo(-enemy.width/2, 0);
        ctx.closePath();
        ctx.fill();
        
        // Add inner details
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      
      // Draw player with enhanced effects
      ctx.save();
      ctx.translate(state.player.x + state.player.width/2, state.player.y + state.player.height/2);
      
      // Player glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f07e41';
      ctx.fillStyle = '#f07e41';
      
      // Draw ship shape
      ctx.beginPath();
      ctx.moveTo(0, -state.player.height/2);
      ctx.lineTo(-state.player.width/2, state.player.height/2);
      ctx.lineTo(-state.player.width/4, state.player.height/3);
      ctx.lineTo(state.player.width/4, state.player.height/3);
      ctx.lineTo(state.player.width/2, state.player.height/2);
      ctx.closePath();
      ctx.fill();
      
      // Add engine glow
      ctx.fillStyle = '#00fff9';
      ctx.shadowColor = '#00fff9';
      ctx.fillRect(-6, state.player.height/3, 3, 8);
      ctx.fillRect(3, state.player.height/3, 3, 8);
      
      ctx.restore();
      ctx.shadowBlur = 0;
      
      // Enhanced UI with glow
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 3;
      ctx.shadowColor = '#ffffff';
      ctx.fillText(`Score: ${state.score}`, 10, 25);
      ctx.fillText(`Level: ${state.level}`, 10, 45);
      if (highScore > 0) {
        ctx.fillText(`High: ${highScore}`, 10, 65);
      }
      
      // Combo display
      if (state.combo > 1) {
        ctx.fillStyle = '#f07e41';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#f07e41';
        ctx.shadowBlur = 8;
        ctx.fillText(`${state.combo}x COMBO!`, CANVAS_WIDTH/2, 80);
      }
      
      ctx.shadowBlur = 0;
    }
    
    // Draw game states
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#f07e41';
      ctx.font = '28px monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f07e41';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.font = '18px monospace';
      ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      
      if (state.score > highScore) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.fillText('NEW HIGH SCORE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
      } else if (highScore > 0) {
        ctx.fillStyle = '#888888';
        ctx.shadowBlur = 3;
        ctx.fillText(`High: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
      }
      
      ctx.fillStyle = '#f07e41';
      ctx.shadowColor = '#f07e41';
      ctx.fillText('Press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    } else if (!state.gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#f07e41';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f07e41';
      ctx.fillText('CYBER DEFENDER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.font = '16px monospace';
      ctx.shadowBlur = 6;
      ctx.fillText('Press SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      ctx.fillText('← → to move, SPACE to shoot', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
      
      if (highScore > 0) {
        ctx.fillStyle = '#888888';
        ctx.shadowBlur = 3;
        ctx.fillText(`High Score: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      }
    }
    
    ctx.restore();
    ctx.shadowBlur = 0;
  }, [highScore]);

  // Main game loop
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = Math.min(currentTime - lastTimeRef.current, 33.33);
    lastTimeRef.current = currentTime;
    
    updateGame(deltaTime);
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame]);

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
    
    // Cache the context in a ref to avoid repeated getContext calls
    const ctxRef = useRef(ctx);
    
    // Optimized render function that uses cached context
    const renderFrame = () => {
      render(ctxRef.current);
    };
    
    // Replace the render function in gameLoop to use cached context
    const optimizedGameLoop = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTimeRef.current, 33.33);
      lastTimeRef.current = currentTime;
      
      updateGame(deltaTime);
      renderFrame();
      
      animationRef.current = requestAnimationFrame(optimizedGameLoop);
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Start game loop
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(optimizedGameLoop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, handleKeyDown, handleKeyUp, updateGame, render]);

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