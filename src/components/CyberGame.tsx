import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  active?: boolean;
  rotation?: number;
  scale?: number;
  lastDirectionChange?: number;
  originalX?: number;
  phaseOffset?: number;
  targetX?: number;
  moveSpeed?: number;
  powerupType?: 'rapidfire' | 'shield' | 'timeslow';
  duration?: number;
  health?: number;
}

interface Particle extends GameObject {
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  type: 'cube' | 'spark';
}

interface GameState {
  player: GameObject;
  score: number;
  level: number;
  enemiesKilled: number;
  lastTime: number;
  fps: number;
  lastShot: number;
  lastEnemySpawn: number;
  keysPressed: Set<string>;
  accumulator: number;
  screenShake: number;
  particles: Particle[];
  backgroundDrawn: boolean;
  combo: number;
  comboTimer: number;
  powerups: GameObject[];
  activeEffects: {
    rapidfire: number;
    shield: boolean;
    timeslow: number;
  };
  shieldHealth: number;
  lastComboTime: number;
  comboMultiplier: number;
}

// Constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
const MAX_FRAME_TIME = FRAME_TIME * 2;
const MAX_PARTICLES = 30; // Reduced from 50

// Pre-render common game elements
const createOffscreenElements = () => {
  const projectileCanvas = document.createElement('canvas');
  projectileCanvas.width = 6;
  projectileCanvas.height = 14;
  const projectileCtx = projectileCanvas.getContext('2d') as CanvasRenderingContext2D;
  
  projectileCtx.fillStyle = '#00fff9';
  projectileCtx.shadowColor = '#00fff9';
  projectileCtx.shadowBlur = 8;
  projectileCtx.fillRect(1, 1, 4, 12);

  const enemyCanvas = document.createElement('canvas');
  enemyCanvas.width = 32;
  enemyCanvas.height = 32;
  const enemyCtx = enemyCanvas.getContext('2d') as CanvasRenderingContext2D;
  
  enemyCtx.fillStyle = '#ff0066';
  enemyCtx.shadowColor = '#ff0066';
  enemyCtx.shadowBlur = 8;
  
  enemyCtx.beginPath();
  enemyCtx.moveTo(4, 16);
  enemyCtx.lineTo(16, 4);
  enemyCtx.lineTo(28, 16);
  enemyCtx.lineTo(16, 28);
  enemyCtx.closePath();
  enemyCtx.fill();

  enemyCtx.strokeStyle = '#ffffff';
  enemyCtx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const y = 8 + i * 8;
    enemyCtx.beginPath();
    enemyCtx.moveTo(4, y);
    enemyCtx.lineTo(28, y);
    enemyCtx.stroke();
  }

  enemyCtx.fillStyle = '#ffffff';
  enemyCtx.beginPath();
  enemyCtx.arc(16, 16, 3, 0, Math.PI * 2);
  enemyCtx.fill();

  return {
    projectile: projectileCanvas,
    enemy: enemyCanvas
  };
};

// Store pre-rendered elements globally to prevent recreation
let offscreenElements: { projectile: HTMLCanvasElement; enemy: HTMLCanvasElement } | null = null;

// Object pools - keep them small and manageable
const POOL_SIZE = 15; // Reduced from 30
const projectilePool: GameObject[] = [];
const enemyPool: GameObject[] = [];
const particlePool: Particle[] = [];

// Initialize pools only once
const initializePools = () => {
  if (projectilePool.length === 0) {
    for (let i = 0; i < POOL_SIZE; i++) {
      projectilePool.push({
        x: 0, y: 0, width: 4, height: 12, speed: 8, color: '#00fff9', active: false
      });
      enemyPool.push({
        x: 0, y: 0, width: 24, height: 24, speed: 2, color: '#ff0066', active: false,
        rotation: 0, scale: 1, lastDirectionChange: 0,
        originalX: 0, phaseOffset: Math.random() * Math.PI * 2,
        targetX: 0, moveSpeed: 0
      });
    }
  }
  
  if (particlePool.length === 0) {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particlePool.push({
        x: 0, y: 0, width: 4, height: 4, speed: 0, color: '#ff0066',
        dx: 0, dy: 0, life: 0, maxLife: 60, active: false, type: 'cube'
      });
    }
  }
};

// Reset all pools
const resetPools = () => {
  projectilePool.forEach(p => {
    p.active = false;
    p.x = 0;
    p.y = 0;
  });
  
  enemyPool.forEach(e => {
    e.active = false;
    e.x = 0;
    e.y = 0;
    e.rotation = 0;
    e.scale = 1;
    e.lastDirectionChange = 0;
    e.originalX = 0;
    e.targetX = 0;
    e.moveSpeed = 0;
  });
  
  particlePool.forEach(p => {
    p.active = false;
    p.life = 0;
  });
};

// Pre-render patterns with caching
let gridPatternCache: HTMLCanvasElement | null = null;

const createGridPattern = (width: number, height: number) => {
  if (gridPatternCache) return gridPatternCache;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!ctx) return null;

  ctx.strokeStyle = 'rgba(240, 126, 65, 0.08)'; // Reduced opacity
  ctx.beginPath();
  for (let x = 0; x < width; x += 40) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y < height; y += 40) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  
  gridPatternCache = canvas;
  return canvas;
};

const POWERUP_COLORS = {
  rapidfire: '#00ff00',
  shield: '#4444ff',
  timeslow: '#ff00ff'
};

// LocalStorage keys
const HIGH_SCORE_KEY = 'cyberDefender_highScore';

const createGameState = (): GameState => ({
  player: {
    x: CANVAS_WIDTH / 2 - 25,
    y: CANVAS_HEIGHT - 60,
    width: 50,
    height: 20,
    speed: 6,
    color: '#f07e41',
    active: true
  },
  score: 0,
  level: 1,
  enemiesKilled: 0,
  lastTime: performance.now(),
  fps: 0,
  lastShot: 0,
  lastEnemySpawn: 0,
  keysPressed: new Set(),
  accumulator: 0,
  screenShake: 0,
  particles: [],
  backgroundDrawn: false,
  combo: 0,
  comboTimer: 0,
  powerups: [],
  activeEffects: {
    rapidfire: 0,
    shield: false,
    timeslow: 0
  },
  shieldHealth: 0,
  lastComboTime: 0,
  comboMultiplier: 1
});

// Save/load high score
const getHighScore = (): number => {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
  } catch {
    return 0;
  }
};

const saveHighScore = (score: number): void => {
  try {
    const currentHigh = getHighScore();
    if (score > currentHigh) {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  } catch {
    // Ignore storage errors
  }
};

const CyberGame = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const gameStateRef = useRef<GameState>(createGameState());
  const frameIdRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  // Time-based movement constants
  const BASE_SPEED = 240; // pixels per second
  const PROJECTILE_SPEED = 480; // pixels per second
  const ENEMY_BASE_SPEED = 120; // pixels per second

  // Initialize everything only once
  useEffect(() => {
    if (!isInitializedRef.current) {
      initializePools();
      if (!offscreenElements) {
        offscreenElements = createOffscreenElements();
      }
      setHighScore(getHighScore());
      isInitializedRef.current = true;
    }
  }, []);

  const resetGame = useCallback(() => {
    console.log('Resetting game...');
    
    // Save high score if needed
    const currentScore = gameStateRef.current.score;
    saveHighScore(currentScore);
    setHighScore(getHighScore());
    
    // Clean up old state
    resetPools();
    
    // Create fresh game state
    gameStateRef.current = createGameState();
    
    setGameOver(false);
    setGameStarted(true);
    
    console.log('Game reset complete');
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      
      if (gameOver) {
        resetGame();
        return;
      }
      
      if (!gameStarted) {
        setGameStarted(true);
        return;
      }

      // Shooting logic
      const state = gameStateRef.current;
      if (!gameOver && performance.now() - state.lastShot > (state.activeEffects.rapidfire > 0 ? 125 : 250)) {
        const projectile = projectilePool.find(p => !p.active);
        if (projectile) {
          projectile.x = state.player.x + state.player.width/2 - projectile.width/2;
          projectile.y = state.player.y;
          projectile.active = true;
          state.lastShot = performance.now();
        }
      }
    }

    // Movement keys
    if (!gameOver && gameStarted) {
      gameStateRef.current.keysPressed.add(e.code);
    }
  }, [gameStarted, gameOver, resetGame]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    gameStateRef.current.keysPressed.delete(e.code);
  }, []);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    console.log('Initializing game component...');
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
      powerPreference: 'high-performance'
    }) as CanvasRenderingContext2D;
    
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.focus();

    const gridPattern = createGridPattern(CANVAS_WIDTH, CANVAS_HEIGHT);

    const updatePhysics = (deltaTime: number) => {
      const state = gameStateRef.current;
      const timeStep = deltaTime / 1000;
      
      if (state.screenShake > 0) {
        state.screenShake *= 0.9;
      }
      
      const moveSpeed = BASE_SPEED * timeStep;
      if (state.keysPressed.has('ArrowLeft') && state.player.x > 0) {
        state.player.x -= moveSpeed;
      }
      if (state.keysPressed.has('ArrowRight') && state.player.x < CANVAS_WIDTH - state.player.width) {
        state.player.x += moveSpeed;
      }

      const projectileSpeed = PROJECTILE_SPEED * timeStep;
      projectilePool.forEach(projectile => {
        if (!projectile.active) return;
        projectile.y -= projectileSpeed;
        if (projectile.y < 0) projectile.active = false;
      });

      // Update active particles only
      const activeParticles = particlePool.filter(p => p.active);
      activeParticles.forEach(particle => {
        particle.x += particle.dx * timeStep * 60;
        particle.y += particle.dy * timeStep * 60;
        particle.life--;
        if (particle.type === 'cube') {
          particle.dy += 9.8 * timeStep;
        }
        if (particle.life <= 0) {
          particle.active = false;
        }
      });

      // Update active enemies only
      const activeEnemies = enemyPool.filter(e => e.active);
      activeEnemies.forEach(enemy => {
        if (enemy.originalX === undefined) {
          enemy.originalX = enemy.x;
          enemy.targetX = enemy.x;
          enemy.moveSpeed = 0;
        }

        const timeScale = state.activeEffects.timeslow > 0 ? 0.5 : 1;
        enemy.y += enemy.speed * timeScale * (1 + Math.sin(timeStep * 2 + enemy.phaseOffset!) * 0.1);

        if (timeStep - (enemy.lastDirectionChange || 0) > 1.5 + Math.random()) {
          const playerX = state.player.x + state.player.width / 2;
          enemy.targetX = Math.max(20, Math.min(CANVAS_WIDTH - 20, 
            playerX + (Math.random() - 0.5) * 100));
          enemy.lastDirectionChange = timeStep;
        }

        const dx = (enemy.targetX ?? 0) - enemy.x;
        const targetSpeed = Math.sign(dx) * Math.min(Math.abs(dx), 2) * 60;
        enemy.moveSpeed = (enemy.moveSpeed ?? 0) * 0.9 + targetSpeed * 0.1;
        enemy.x += enemy.moveSpeed * timeStep;

        enemy.x = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, enemy.x));

        const rotationTarget = enemy.moveSpeed * 0.01;
        enemy.rotation = (enemy.rotation || 0) * 0.9 + rotationTarget * 0.1;
        
        const scaleFreq = 4;
        const scaleAmp = 0.1;
        enemy.scale = 1 + Math.sin(timeStep * scaleFreq + (enemy.phaseOffset || 0)) * scaleAmp;

        // Check collisions with active projectiles only
        const activeProjectiles = projectilePool.filter(p => p.active);
        activeProjectiles.forEach(projectile => {
          if (checkCollision(projectile, enemy)) {
            projectile.active = false;
            enemy.active = false;
            state.enemiesKilled++;
            state.score += 100;
            handleEnemyDeath(enemy);
            if (state.enemiesKilled >= 5) {
              state.level++;
              state.enemiesKilled = 0;
            }
          }
        });

        if (checkCollision(state.player, enemy)) {
          setGameOver(true);
          createExplosion(state.player.x + state.player.width/2, state.player.y + state.player.height/2, state.player.color);
          return;
        }

        if (enemy.y > CANVAS_HEIGHT) {
          enemy.active = false;
          setGameOver(true);
          createExplosion(enemy.x + enemy.width/2, CANVAS_HEIGHT, enemy.color);
          return;
        }
      });

      // Spawn enemies with throttling
      const spawnInterval = Math.max(1000 - state.level * 50, 400);
      const activeEnemyCount = enemyPool.filter(e => e.active).length;
      if (activeEnemyCount < 3 && performance.now() - state.lastEnemySpawn > spawnInterval) {
        const enemy = enemyPool.find(e => !e.active);
        if (enemy) {
          enemy.active = true;
          enemy.x = Math.random() * (CANVAS_WIDTH - enemy.width);
          enemy.y = -enemy.height;
          enemy.speed = ENEMY_BASE_SPEED / 60 + state.level * 0.2;
          enemy.health = Math.min(1 + Math.floor(state.level / 3), 3);
          enemy.rotation = 0;
          enemy.scale = 1;
          state.lastEnemySpawn = performance.now();
        }
      }

      // Update timers
      if (state.combo > 0) {
        state.comboTimer -= deltaTime;
        if (state.comboTimer <= 0) {
          state.combo = 0;
          state.comboMultiplier = 1;
        }
      }

      if (state.activeEffects.rapidfire > 0) {
        state.activeEffects.rapidfire -= deltaTime;
      }
      if (state.activeEffects.timeslow > 0) {
        state.activeEffects.timeslow -= deltaTime;
      }

      // Update active powerups only
      state.powerups = state.powerups.filter(powerup => {
        if (!powerup.active) return false;
        
        powerup.y += 100 * timeStep;
        powerup.rotation = (powerup.rotation || 0) + 2 * timeStep;
        
        if (checkCollision(state.player, powerup)) {
          powerup.active = false;
          activatePowerup(powerup.powerupType!);
          createPowerupEffect(powerup.x, powerup.y, powerup.color);
          return false;
        }

        if (powerup.y > CANVAS_HEIGHT) {
          powerup.active = false;
          return false;
        }
        
        return true;
      });
    };

    const render = () => {
      const state = gameStateRef.current;

      // Simple background clear
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (gridPattern) {
        ctx.globalAlpha = 0.08; // Reduced opacity
        ctx.drawImage(gridPattern, 0, 0);
        ctx.globalAlpha = 1;
      }

      ctx.save();
      if (state.screenShake > 0 && !gameOver) {
        const shake = state.screenShake * 2;
        ctx.translate(
          Math.random() * shake - shake/2,
          Math.random() * shake - shake/2
        );
      }

      if (gameStarted) {
        // Render active particles only
        const activeParticles = particlePool.filter(p => p.active);
        renderParticles(ctx, activeParticles);

        // Draw active projectiles only
        ctx.shadowBlur = 8;
        const activeProjectiles = projectilePool.filter(p => p.active);
        activeProjectiles.forEach(projectile => {
          ctx.shadowColor = '#00fff9';
          if (offscreenElements) {
            ctx.drawImage(
              offscreenElements.projectile,
              Math.floor(projectile.x),
              Math.floor(projectile.y)
            );
          }
        });

        // Draw active enemies only
        const activeEnemies = enemyPool.filter(e => e.active);
        activeEnemies.forEach(enemy => {
          ctx.save();
          ctx.translate(
            Math.floor(enemy.x + enemy.width/2),
            Math.floor(enemy.y + enemy.height/2)
          );
          ctx.rotate(enemy.rotation || 0);
          ctx.scale(enemy.scale || 1, enemy.scale || 1);
          
          ctx.shadowColor = '#ff0066';
          ctx.shadowBlur = 10;
          
          if (offscreenElements) {
            ctx.drawImage(
              offscreenElements.enemy,
              -enemy.width/2,
              -enemy.height/2
            );
          }
          ctx.restore();
        });

        // Draw player
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = state.player.color;
        ctx.fillStyle = state.player.color;
        
        // Simple player shape
        const px = Math.floor(state.player.x);
        const py = Math.floor(state.player.y);
        
        ctx.beginPath();
        ctx.moveTo(px + state.player.width/2, py);
        ctx.lineTo(px, py + state.player.height);
        ctx.lineTo(px + state.player.width, py + state.player.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();

        // UI elements
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${state.score}`, 10, 30);
        ctx.fillText(`Level: ${state.level}`, 10, 60);
        
        // High score
        if (highScore > 0) {
          ctx.fillText(`High: ${highScore}`, 10, 90);
        }

        // Draw active powerups
        state.powerups.forEach(powerup => {
          if (!powerup.active) return;
          
          ctx.save();
          ctx.translate(
            Math.floor(powerup.x + powerup.width/2),
            Math.floor(powerup.y + powerup.height/2)
          );
          ctx.rotate(powerup.rotation || 0);
          
          ctx.shadowColor = powerup.color;
          ctx.shadowBlur = 15;
          ctx.fillStyle = powerup.color;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 8;
          
          switch (powerup.powerupType) {
            case 'rapidfire':
              ctx.beginPath();
              ctx.moveTo(-5, -8);
              ctx.lineTo(2, -2);
              ctx.lineTo(-2, 2);
              ctx.lineTo(5, 8);
              ctx.stroke();
              break;
            case 'shield':
              ctx.beginPath();
              ctx.arc(0, 0, 8, 0, Math.PI * 2);
              ctx.stroke();
              break;
            case 'timeslow':
              ctx.beginPath();
              ctx.arc(0, 0, 8, 0, Math.PI * 2);
              ctx.moveTo(0, 0);
              ctx.lineTo(0, -6);
              ctx.moveTo(0, 0);
              ctx.lineTo(4, 2);
              ctx.stroke();
              break;
          }
          
          ctx.restore();
        });

        // Draw active effects (simplified)
        if (state.activeEffects.shield) {
          ctx.save();
          ctx.strokeStyle = POWERUP_COLORS.shield;
          ctx.lineWidth = 2;
          ctx.shadowColor = POWERUP_COLORS.shield;
          ctx.shadowBlur = 10;
          
          const radius = 30;
          ctx.beginPath();
          ctx.arc(
            state.player.x + state.player.width/2,
            state.player.y + state.player.height/2,
            radius,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.restore();
        }

        if (state.activeEffects.rapidfire > 0) {
          ctx.save();
          ctx.strokeStyle = POWERUP_COLORS.rapidfire;
          ctx.shadowColor = POWERUP_COLORS.rapidfire;
          ctx.shadowBlur = 10;
          ctx.lineWidth = 2;
          
          for (let i = 0; i < 2; i++) {
            const offset = Math.sin(performance.now() * 5 + i * Math.PI) * 3;
            ctx.beginPath();
            ctx.moveTo(state.player.x - 5 + i * 30, state.player.y - 5 + offset);
            ctx.lineTo(state.player.x + 5 + i * 20, state.player.y - 15 + offset);
            ctx.stroke();
          }
          ctx.restore();
        }

        if (state.combo > 1) {
          ctx.save();
          ctx.fillStyle = '#f07e41';
          ctx.shadowColor = '#f07e41';
          ctx.shadowBlur = 10;
          ctx.font = '24px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${state.combo}x COMBO!`, CANVAS_WIDTH/2, 100);
          ctx.restore();
        }
      }

      // Draw overlay screens
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#f07e41';
        ctx.fillStyle = '#f07e41';
        ctx.font = '30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 40);
        ctx.font = '20px monospace';
        ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        
        if (state.score > highScore) {
          ctx.fillStyle = '#00ff00';
          ctx.fillText('NEW HIGH SCORE!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 30);
        } else if (highScore > 0) {
          ctx.fillStyle = '#888';
          ctx.fillText(`High: ${highScore}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 30);
        }
        
        ctx.fillStyle = '#f07e41';
        ctx.fillText('Press SPACE to restart', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 70);
      } else if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#f07e41';
        ctx.fillStyle = '#f07e41';
        ctx.font = '30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 30);
        ctx.font = '20px monospace';
        ctx.fillText('← → to move', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 10);
        ctx.fillText('SPACE to shoot', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 40);
        
        if (highScore > 0) {
          ctx.fillStyle = '#888';
          ctx.fillText(`High Score: ${highScore}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 80);
        }
      }

      ctx.restore();
    };

    const renderParticles = (ctx: CanvasRenderingContext2D, activeParticles: Particle[]) => {
      if (activeParticles.length === 0) return;
      
      ctx.shadowBlur = 8;
      activeParticles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        
        if (particle.type === 'cube') {
          ctx.fillRect(
            Math.floor(particle.x),
            Math.floor(particle.y),
            particle.width,
            particle.height
          );
        } else {
          ctx.beginPath();
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 2;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(
            particle.x - particle.dx * 2,
            particle.y - particle.dy * 2
          );
          ctx.stroke();
        }
      });
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - gameStateRef.current.lastTime, MAX_FRAME_TIME);
      gameStateRef.current.lastTime = currentTime;

      gameStateRef.current.fps = 1000 / deltaTime;

      if (gameStarted && !gameOver) {
        gameStateRef.current.accumulator += deltaTime;
        
        let updates = 0;
        const maxUpdates = 2; // Reduced from 3
        
        while (gameStateRef.current.accumulator >= FRAME_TIME && updates < maxUpdates) {
          updatePhysics(FRAME_TIME);
          gameStateRef.current.accumulator -= FRAME_TIME;
          updates++;
        }
        
        if (updates === maxUpdates) {
          gameStateRef.current.accumulator = 0;
        }
      }

      render();
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    frameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      console.log('Cleaning up game component...');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      // Clean up pools when component unmounts
      resetPools();
    };
  }, [isVisible, handleKeyDown, handleKeyUp, gameStarted, gameOver]);

  const createExplosion = (x: number, y: number, color: string) => {
    const state = gameStateRef.current;
    if (gameOver) return;
    
    // Create fewer particles for better performance
    for (let i = 0; i < 8; i++) { // Reduced from 12
      const particle = particlePool.find(p => !p.active);
      if (!particle) continue;

      const angle = (Math.PI * 2 * i) / 8;
      const speed = 5 + Math.random() * 3;
      
      particle.x = x - 3;
      particle.y = y - 3;
      particle.dx = Math.cos(angle) * speed;
      particle.dy = Math.sin(angle) * speed - 6;
      particle.color = color;
      particle.life = 60; // Reduced from 90
      particle.maxLife = 60;
      particle.active = true;
      particle.type = 'cube';
      particle.width = 6;
      particle.height = 6;
    }

    state.screenShake = 6; // Reduced from 8
  };

  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };

  const handleEnemyDeath = (enemy: GameObject) => {
    const state = gameStateRef.current;
    const now = performance.now();
    
    if (now - state.lastComboTime < 1000) {
      state.combo++;
      state.comboMultiplier = 1 + Math.floor(state.combo / 3) * 0.5;
    } else {
      state.combo = 1;
      state.comboMultiplier = 1;
    }
    state.lastComboTime = now;
    state.comboTimer = 1000;

    state.score += Math.floor(100 * state.comboMultiplier);
    
    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color);
    
    spawnPowerup();
  };

  const activatePowerup = (type: string) => {
    const state = gameStateRef.current;
    switch (type) {
      case 'rapidfire':
        state.activeEffects.rapidfire = 5000;
        break;
      case 'shield':
        state.activeEffects.shield = true;
        state.shieldHealth = 2;
        break;
      case 'timeslow':
        state.activeEffects.timeslow = 3000;
        break;
    }
  };

  const createPowerupEffect = (x: number, y: number, color: string) => {
    // Create fewer particles
    for (let i = 0; i < 10; i++) { // Reduced from 20
      const particle = particlePool.find(p => !p.active);
      if (!particle) continue;

      const angle = (Math.PI * 2 * i) / 10;
      const speed = 4;
      
      particle.x = x;
      particle.y = y;
      particle.dx = Math.cos(angle) * speed;
      particle.dy = Math.sin(angle) * speed;
      particle.color = color;
      particle.life = 30;
      particle.maxLife = 30;
      particle.active = true;
      particle.type = 'spark';
    }
  };

  const spawnPowerup = () => {
    const state = gameStateRef.current;
    if (Math.random() > 0.15) return; // Increased chance to 15%

    const powerup = {
      x: Math.random() * (CANVAS_WIDTH - 20),
      y: -20,
      width: 20,
      height: 20,
      speed: 2,
      color: '#ffffff',
      active: true,
      rotation: 0,
      powerupType: ['rapidfire', 'shield', 'timeslow'][Math.floor(Math.random() * 3)] as 'rapidfire' | 'shield' | 'timeslow',
    };

    powerup.color = POWERUP_COLORS[powerup.powerupType];
    state.powerups.push(powerup);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="relative bg-cyber-black p-8 rounded-lg border-2 border-primary">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-primary"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-cyber text-primary mb-4 neon-text">Cyber Defender</h2>
            
            <canvas
              ref={canvasRef}
              className="border-2 border-primary rounded-lg focus:outline-none"
              style={{ 
                width: `${CANVAS_WIDTH}px`, 
                height: `${CANVAS_HEIGHT}px`,
                imageRendering: 'pixelated'
              }}
              tabIndex={0}
              onBlur={(e) => e.currentTarget.focus()}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CyberGame; 