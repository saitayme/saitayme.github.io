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
const MAX_PARTICLES = 50;

// Pre-render common game elements
const createOffscreenElements = () => {
  // Pre-render projectile with simple glow
  const projectileCanvas = document.createElement('canvas');
  projectileCanvas.width = 6;
  projectileCanvas.height = 14;
  const projectileCtx = projectileCanvas.getContext('2d') as CanvasRenderingContext2D;
  
  projectileCtx.fillStyle = '#00fff9';
  projectileCtx.shadowColor = '#00fff9';
  projectileCtx.shadowBlur = 8;
  projectileCtx.fillRect(1, 1, 4, 12);

  // Pre-render enemy with glitchy, unsettling style
  const enemyCanvas = document.createElement('canvas');
  enemyCanvas.width = 32;
  enemyCanvas.height = 32;
  const enemyCtx = enemyCanvas.getContext('2d') as CanvasRenderingContext2D;
  
  // Draw glitchy base
  enemyCtx.fillStyle = '#ff0066';
  enemyCtx.shadowColor = '#ff0066';
  enemyCtx.shadowBlur = 8;
  
  // Draw distorted shape
  enemyCtx.beginPath();
  enemyCtx.moveTo(4, 16);
  enemyCtx.lineTo(16, 4);
  enemyCtx.lineTo(28, 16);
  enemyCtx.lineTo(16, 28);
  enemyCtx.closePath();
  enemyCtx.fill();

  // Add glitch lines
  enemyCtx.strokeStyle = '#ffffff';
  enemyCtx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const y = 8 + i * 8;
    enemyCtx.beginPath();
    enemyCtx.moveTo(4, y);
    enemyCtx.lineTo(28, y);
    enemyCtx.stroke();
  }

  // Add "eye" effect
  enemyCtx.fillStyle = '#ffffff';
  enemyCtx.beginPath();
  enemyCtx.arc(16, 16, 3, 0, Math.PI * 2);
  enemyCtx.fill();

  return {
    projectile: projectileCanvas,
    enemy: enemyCanvas
  };
};

// Store pre-rendered elements
const offscreenElements = createOffscreenElements();

// Pre-allocate object pools
const POOL_SIZE = 30;
const projectilePool: GameObject[] = Array(POOL_SIZE).fill(null).map(() => ({
  x: 0, y: 0, width: 4, height: 12, speed: 8, color: '#00fff9', active: false
}));

const enemyPool: GameObject[] = Array(POOL_SIZE).fill(null).map(() => ({
  x: 0, y: 0, width: 24, height: 24, speed: 2, color: '#ff0066', active: false,
  rotation: 0, scale: 1, lastDirectionChange: 0,
  originalX: 0, phaseOffset: Math.random() * Math.PI * 2,
  targetX: 0,
  moveSpeed: 0
}));

// Particle pool
const particlePool: Particle[] = Array(MAX_PARTICLES).fill(null).map(() => ({
  x: 0, y: 0, width: 4, height: 4, speed: 0, color: '#ff0066',
  dx: 0, dy: 0, life: 0, maxLife: 60, active: false, type: 'cube'
}));

// Spatial grid for faster collision detection
const GRID_CELL_SIZE = 50;
const spatialGrid = new Map<string, Set<GameObject>>();

const getGridKey = (x: number, y: number) => `${Math.floor(x / GRID_CELL_SIZE)},${Math.floor(y / GRID_CELL_SIZE)}`;

const updateSpatialGrid = (obj: GameObject) => {
  const key = getGridKey(obj.x, obj.y);
  let cell = spatialGrid.get(key);
  if (!cell) {
    cell = new Set();
    spatialGrid.set(key, cell);
  }
  cell.add(obj);
};

const clearSpatialGrid = () => {
  spatialGrid.clear();
};

const getPotentialCollisions = (obj: GameObject): GameObject[] => {
  const key = getGridKey(obj.x, obj.y);
  const cell = spatialGrid.get(key);
  return cell ? Array.from(cell) : [];
};

// Pre-render patterns
const createGridPattern = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!ctx) return null;

  ctx.strokeStyle = 'rgba(240, 126, 65, 0.1)';
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
  return canvas;
};

const POWERUP_COLORS = {
  rapidfire: '#00ff00',
  shield: '#4444ff',
  timeslow: '#ff00ff'
};

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

const CyberGame = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef<GameState>(createGameState());

  // Time-based movement constants
  const BASE_SPEED = 240; // pixels per second
  const PROJECTILE_SPEED = 480; // pixels per second
  const ENEMY_BASE_SPEED = 120; // pixels per second

  const resetGame = useCallback(() => {
    console.log('Resetting game...');
    // Create a completely fresh game state
    gameStateRef.current = createGameState();
    
    // Reset game stats
    setGameOver(false);
    setGameStarted(true);
    
    console.log('Game reset complete');
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    console.log('Key pressed:', e.code, 'gameStarted:', gameStarted, 'gameOver:', gameOver);
    
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

    // Enable image smoothing for better visual quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.focus();

    const gridPattern = createGridPattern(CANVAS_WIDTH, CANVAS_HEIGHT);
    let frameId: number;
    let lastFrameTime = performance.now();

    const updatePhysics = (deltaTime: number) => {
      const state = gameStateRef.current;
      const timeStep = deltaTime / 1000; // Convert to seconds
      
      // Update screen shake
      if (state.screenShake > 0) {
        state.screenShake *= 0.9;
      }
      
      // Move player with time-based movement
      const moveSpeed = BASE_SPEED * timeStep;
      if (state.keysPressed.has('ArrowLeft') && state.player.x > 0) {
        state.player.x -= moveSpeed;
      }
      if (state.keysPressed.has('ArrowRight') && state.player.x < CANVAS_WIDTH - state.player.width) {
        state.player.x += moveSpeed;
      }

      // Update projectiles with time-based movement
      const projectileSpeed = PROJECTILE_SPEED * timeStep;
      projectilePool.forEach(projectile => {
        if (!projectile.active) return;
        projectile.y -= projectileSpeed;
        if (projectile.y < 0) projectile.active = false;
      });

      // Update particles with time-based movement
      particlePool.forEach(particle => {
        if (!particle.active) return;
        particle.x += particle.dx * timeStep * 60;
        particle.y += particle.dy * timeStep * 60;
        particle.life--;
        if (particle.type === 'cube') {
          particle.dy += 9.8 * timeStep; // Gravity in pixels/second²
        }
        if (particle.life <= 0) {
          particle.active = false;
        }
      });

      // Update enemies with time-based movement
      enemyPool.forEach(enemy => {
        if (!enemy.active) return;
        const time = performance.now() / 1000;
        const enemySpeed = (ENEMY_BASE_SPEED + state.level * 10) * timeStep;
        
        // Initialize enemy properties when spawning
        if (enemy.originalX === undefined) {
          enemy.originalX = enemy.x;
          enemy.targetX = enemy.x;
          enemy.moveSpeed = 0;
        }

        // Vertical movement with slight wavering
        const timeScale = state.activeEffects.timeslow > 0 ? 0.5 : 1;
        enemy.y += enemySpeed * timeScale * (1 + Math.sin(time * 2 + enemy.phaseOffset!) * 0.1);

        // Occasionally pick new target position
        if (time - (enemy.lastDirectionChange || 0) > 1.5 + Math.random()) {
          // Target player's x position with some randomness
          const playerX = state.player.x + state.player.width / 2;
          enemy.targetX = Math.max(20, Math.min(CANVAS_WIDTH - 20, 
            playerX + (Math.random() - 0.5) * 100));
          enemy.lastDirectionChange = time;
        }

        // Smooth movement towards target
        const dx = enemy.targetX - enemy.x;
        const targetSpeed = Math.sign(dx) * Math.min(Math.abs(dx), 2) * 60; // Speed proportional to distance
        enemy.moveSpeed = enemy.moveSpeed * 0.9 + targetSpeed * 0.1; // Smooth acceleration
        enemy.x += enemy.moveSpeed * timeStep;

        // Keep within bounds
        enemy.x = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, enemy.x));

        // Creepy rotation based on movement
        const rotationTarget = enemy.moveSpeed * 0.01; // Tilt based on movement direction
        enemy.rotation = (enemy.rotation || 0) * 0.9 + rotationTarget * 0.1;
        
        // Unsettling scale pulsing
        const scaleFreq = 4;
        const scaleAmp = 0.1;
        enemy.scale = 1 + Math.sin(time * scaleFreq + (enemy.phaseOffset || 0)) * scaleAmp;

        // Check collisions with projectiles
        projectilePool.forEach(projectile => {
          if (!projectile.active) return;
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

        // Check collision with player
        if (checkCollision(state.player, enemy)) {
          setGameOver(true);
          createExplosion(state.player.x + state.player.width/2, state.player.y + state.player.height/2, state.player.color);
          return;
        }

        // Check if enemy passed the bottom
        if (enemy.y > CANVAS_HEIGHT) {
          enemy.active = false;
          setGameOver(true);
          createExplosion(enemy.x + enemy.width/2, CANVAS_HEIGHT, enemy.color);
          return;
        }
      });

      // Spawn enemies with time-based intervals
      const spawnInterval = Math.max(1000 - state.level * 50, 400);
      if (enemyPool.filter(e => e.active).length < 3 && 
          performance.now() - state.lastEnemySpawn > spawnInterval) {
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

      // Update combo timer
      if (state.combo > 0) {
        state.comboTimer -= deltaTime;
        if (state.comboTimer <= 0) {
          state.combo = 0;
          state.comboMultiplier = 1;
        }
      }

      // Update power-up effects
      if (state.activeEffects.rapidfire > 0) {
        state.activeEffects.rapidfire -= deltaTime;
      }
      if (state.activeEffects.timeslow > 0) {
        state.activeEffects.timeslow -= deltaTime;
      }

      // Update power-ups
      state.powerups.forEach(powerup => {
        if (!powerup.active) return;
        powerup.y += 100 * timeStep;
        powerup.rotation = (powerup.rotation || 0) + 2 * timeStep;
        
        // Check collision with player
        if (checkCollision(state.player, powerup)) {
          powerup.active = false;
          activatePowerup(powerup.powerupType!);
          createPowerupEffect(powerup.x, powerup.y, powerup.color);
        }

        if (powerup.y > CANVAS_HEIGHT) {
          powerup.active = false;
        }
      });
    };

    // Pre-allocate arrays for active particles
    const activeParticles = {
      cubes: [] as Particle[],
      sparks: [] as Particle[]
    };

    const updateParticles = (timeStep: number) => {
      // Clear active particle arrays
      activeParticles.cubes.length = 0;
      activeParticles.sparks.length = 0;
      
      // Update and sort particles into active arrays
      particlePool.forEach(particle => {
        if (!particle.active) return;
        
        // Update particle position and life
        particle.x += particle.dx * timeStep * 60;
        particle.y += particle.dy * timeStep * 60;
        particle.life--;
        
        if (particle.type === 'cube') {
          // Add gravity and bounce effect
          particle.dy += 20 * timeStep; // Increased gravity for snappier bounces
          
          // Ground bounce
          if (particle.y > CANVAS_HEIGHT - particle.height) {
            particle.y = CANVAS_HEIGHT - particle.height;
            particle.dy = -particle.dy * 0.5; // More energy loss for quicker settling
            particle.dx *= 0.75; // More friction
          }
          
          // Wall bounce
          if (particle.x < 0) {
            particle.x = 0;
            particle.dx = -particle.dx * 0.5;
          } else if (particle.x > CANVAS_WIDTH - particle.width) {
            particle.x = CANVAS_WIDTH - particle.width;
            particle.dx = -particle.dx * 0.5;
          }
          
          if (particle.active) {
            activeParticles.cubes.push(particle);
          }
        } else if (particle.type === 'spark') {
          if (particle.active) {
            activeParticles.sparks.push(particle);
          }
        }
        
        if (particle.life <= 0) {
          particle.active = false;
        }
      });
    };

    const renderParticles = (ctx: CanvasRenderingContext2D) => {
      // Batch render cube particles
      if (activeParticles.cubes.length > 0) {
        ctx.shadowBlur = 8;
        activeParticles.cubes.forEach(particle => {
          const alpha = particle.life / particle.maxLife;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = particle.color;
          ctx.fillStyle = particle.color;
          ctx.fillRect(
            Math.floor(particle.x),
            Math.floor(particle.y),
            particle.width,
            particle.height
          );
        });
      }
      
      // Batch render spark particles
      if (activeParticles.sparks.length > 0) {
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        activeParticles.sparks.forEach(particle => {
          const alpha = particle.life / particle.maxLife;
          ctx.globalAlpha = alpha;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(
            particle.x - particle.dx * 2,
            particle.y - particle.dy * 2
          );
        });
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const render = () => {
      const state = gameStateRef.current;

      // Simple background clear
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (gridPattern) {
        ctx.globalAlpha = 0.1;
        ctx.drawImage(gridPattern, 0, 0);
        ctx.globalAlpha = 1;
      }

      // Apply screen shake only during gameplay
      ctx.save();
      if (state.screenShake > 0 && !gameOver) {
        const shake = state.screenShake * 2;
        ctx.translate(
          Math.random() * shake - shake/2,
          Math.random() * shake - shake/2
        );
      }

      // Draw game elements
      if (gameStarted) {
        // Render particles
        renderParticles(ctx);

        // Draw projectiles
        ctx.shadowBlur = 8;
        projectilePool.forEach(projectile => {
          if (!projectile.active) return;
          ctx.shadowColor = '#00fff9';
          ctx.drawImage(
            offscreenElements.projectile,
            Math.floor(projectile.x),
            Math.floor(projectile.y)
          );
        });

        // Draw enemies with glitch effect
        enemyPool.forEach(enemy => {
          if (!enemy.active) return;
          
          ctx.save();
          ctx.translate(
            Math.floor(enemy.x + enemy.width/2), 
            Math.floor(enemy.y + enemy.height/2)
          );
          
          // Add subtle glitch effect
          const time = performance.now() / 1000;
          if (Math.random() < 0.05) { // Reduced frequency of position glitches
            ctx.translate(
              (Math.random() * 2 - 1), // Reduced glitch amplitude
              (Math.random() * 2 - 1)
            );
          }
          
          ctx.rotate(enemy.rotation || 0);
          ctx.scale(enemy.scale || 1, enemy.scale || 1);
          
          // Draw with chromatic aberration effect
          if (Math.random() < 0.05) { // Keep rare strong glitch
            ctx.globalAlpha = 0.3;
            ctx.translate(2, 0);
            ctx.drawImage(
              offscreenElements.enemy,
              -enemy.width/2,
              -enemy.height/2
            );
            ctx.translate(-4, 0);
            ctx.drawImage(
              offscreenElements.enemy,
              -enemy.width/2,
              -enemy.height/2
            );
            ctx.globalAlpha = 1;
          }
          
          ctx.drawImage(
            offscreenElements.enemy,
            -enemy.width/2,
            -enemy.height/2
          );
          
          ctx.restore();
        });

        // Draw player
        if (!gameOver) {
          ctx.shadowColor = state.player.color;
          ctx.shadowBlur = 12;
          ctx.fillStyle = state.player.color;
          ctx.fillRect(
            Math.floor(state.player.x), 
            Math.floor(state.player.y), 
            state.player.width, 
            state.player.height
          );
        }

        // Draw HUD
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f07e41';
        ctx.fillStyle = '#f07e41';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${state.score}`, 10, 30);
        ctx.fillText(`Level: ${state.level}`, 10, 60);

        // Draw power-ups with improved visibility
        state.powerups.forEach(powerup => {
          if (!powerup.active) return;
          
          ctx.save();
          ctx.translate(
            Math.floor(powerup.x + powerup.width/2),
            Math.floor(powerup.y + powerup.height/2)
          );
          ctx.rotate(powerup.rotation || 0);
          
          // Draw power-up background glow
          ctx.shadowColor = powerup.color;
          ctx.shadowBlur = 15;
          ctx.fillStyle = powerup.color;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw power-up symbol
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 8;
          
          switch (powerup.powerupType) {
            case 'rapidfire':
              // Draw lightning bolt
              ctx.beginPath();
              ctx.moveTo(-5, -8);
              ctx.lineTo(2, -2);
              ctx.lineTo(-2, 2);
              ctx.lineTo(5, 8);
              ctx.stroke();
              // Add extra detail
              ctx.beginPath();
              ctx.moveTo(-3, -6);
              ctx.lineTo(0, -4);
              ctx.stroke();
              break;
            case 'shield':
              // Draw shield with inner detail
              ctx.beginPath();
              ctx.arc(0, 0, 8, 0, Math.PI * 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(0, 0, 4, 0, Math.PI * 2);
              ctx.stroke();
              break;
            case 'timeslow':
              // Draw clock with more detail
              ctx.beginPath();
              ctx.arc(0, 0, 8, 0, Math.PI * 2);
              ctx.moveTo(0, 0);
              ctx.lineTo(0, -6);
              ctx.moveTo(0, 0);
              ctx.lineTo(4, 2);
              ctx.stroke();
              break;
          }
          
          // Add pulsing effect
          const pulseScale = 1 + Math.sin(performance.now() / 200) * 0.1;
          ctx.scale(pulseScale, pulseScale);
          
          ctx.restore();
        });

        // Draw active effects with improved visibility
        if (state.activeEffects.shield) {
          ctx.save();
          ctx.strokeStyle = POWERUP_COLORS.shield;
          ctx.lineWidth = 2;
          ctx.shadowColor = POWERUP_COLORS.shield;
          ctx.shadowBlur = 15;
          
          // Draw double shield rings
          const pulseScale = 1 + Math.sin(performance.now() / 200) * 0.1;
          const radius = 30 * pulseScale;
          
          ctx.beginPath();
          ctx.arc(
            state.player.x + state.player.width/2,
            state.player.y + state.player.height/2,
            radius,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(
            state.player.x + state.player.width/2,
            state.player.y + state.player.height/2,
            radius - 5,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.restore();
        }

        // Visual indicator for rapid fire
        if (state.activeEffects.rapidfire > 0) {
          ctx.save();
          ctx.strokeStyle = POWERUP_COLORS.rapidfire;
          ctx.shadowColor = POWERUP_COLORS.rapidfire;
          ctx.shadowBlur = 15;
          ctx.lineWidth = 2;
          
          // Draw energy lines around player
          const time = performance.now() / 1000;
          for (let i = 0; i < 3; i++) {
            const offset = Math.sin(time * 5 + i * Math.PI / 1.5) * 5;
            ctx.beginPath();
            ctx.moveTo(state.player.x - 5 + i * 25, state.player.y - 5 + offset);
            ctx.lineTo(state.player.x + 5 + i * 15, state.player.y - 15 + offset);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Visual indicator for time slow
        if (state.activeEffects.timeslow > 0) {
          ctx.save();
          ctx.strokeStyle = POWERUP_COLORS.timeslow;
          ctx.shadowColor = POWERUP_COLORS.timeslow;
          ctx.shadowBlur = 15;
          ctx.lineWidth = 1;
          
          // Draw time slow waves
          const time = performance.now() / 1000;
          for (let i = 0; i < 3; i++) {
            const scale = 1 + (i * 0.5) + Math.sin(time * 2) * 0.2;
            ctx.beginPath();
            ctx.arc(
              state.player.x + state.player.width/2,
              state.player.y + state.player.height/2,
              40 * scale,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw combo
        if (state.combo > 1) {
          ctx.save();
          ctx.fillStyle = '#f07e41';
          ctx.shadowColor = '#f07e41';
          ctx.shadowBlur = 10;
          ctx.font = '24px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${state.combo}x COMBO!`, CANVAS_WIDTH/2, 100);
          
          // Draw combo timer bar
          const barWidth = 100;
          const remainingWidth = (state.comboTimer / 1000) * barWidth;
          ctx.fillRect(CANVAS_WIDTH/2 - barWidth/2, 110, remainingWidth, 4);
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
        ctx.fillText('GAME OVER', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
        ctx.font = '20px monospace';
        ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 20);
        ctx.fillText('Press SPACE to restart', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 60);
      } else if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#f07e41';
        ctx.fillStyle = '#f07e41';
        ctx.font = '30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
        ctx.font = '20px monospace';
        ctx.fillText('← → to move', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 20);
        ctx.fillText('SPACE to shoot', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 50);
        ctx.fillText('Don\'t let enemies reach the bottom!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 90);
      }

      ctx.restore();
    };

    const gameLoop = (currentTime: number) => {
      // Performance optimization: Use requestAnimationFrame's timestamp
      const deltaTime = Math.min(currentTime - gameStateRef.current.lastTime, MAX_FRAME_TIME);
      gameStateRef.current.lastTime = currentTime;

      // Calculate FPS
      gameStateRef.current.fps = 1000 / deltaTime;

      // Update physics if game is running
      if (gameStarted && !gameOver) {
        gameStateRef.current.accumulator += deltaTime;
        
        // Performance optimization: Limit physics updates per frame
        let updates = 0;
        const maxUpdates = 3;
        
        while (gameStateRef.current.accumulator >= FRAME_TIME && updates < maxUpdates) {
          updatePhysics(FRAME_TIME);
          updateParticles(FRAME_TIME / 1000); // Add particle updates to physics loop
          gameStateRef.current.accumulator -= FRAME_TIME;
          updates++;
        }
        
        // If we're falling behind, just discard the remaining time
        if (updates === maxUpdates) {
          gameStateRef.current.accumulator = 0;
        }
      } else {
        // Even when game is over, continue updating particles for death animations
        updateParticles(deltaTime / 1000);
      }

      render();
      frameId = requestAnimationFrame(gameLoop);
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start game loop
    frameId = requestAnimationFrame(gameLoop);

    return () => {
      console.log('Cleaning up game component...');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId);
    };
  }, [isVisible, handleKeyDown, handleKeyUp, gameStarted, gameOver]);

  // Log state changes
  useEffect(() => {
    console.log('Game state changed - gameStarted:', gameStarted, 'gameOver:', gameOver);
  }, [gameStarted, gameOver]);

  const createExplosion = (x: number, y: number, color: string) => {
    const state = gameStateRef.current;
    if (gameOver) return; // Don't create explosions if game is over
    
    // Create bouncing cube particles
    for (let i = 0; i < 12; i++) { // Increased number of particles
      const particle = particlePool.find(p => !p.active);
      if (!particle) continue;

      const angle = (Math.PI * 2 * i) / 12;
      const speed = 5 + Math.random() * 3; // Increased speed
      
      particle.x = x - 3; // Center the explosion
      particle.y = y - 3;
      particle.dx = Math.cos(angle) * speed;
      particle.dy = Math.sin(angle) * speed - 6; // Stronger initial upward velocity
      particle.color = color;
      particle.life = 90; // Longer life for full bounce animation
      particle.maxLife = 90;
      particle.active = true;
      particle.type = 'cube';
      particle.width = 6;
      particle.height = 6;
    }

    // Add flash particles
    for (let i = 0; i < 8; i++) {
      const particle = particlePool.find(p => !p.active);
      if (!particle) continue;

      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 3;
      
      particle.x = x;
      particle.y = y;
      particle.dx = Math.cos(angle) * speed;
      particle.dy = Math.sin(angle) * speed;
      particle.color = '#fff';
      particle.life = 20;
      particle.maxLife = 20;
      particle.active = true;
      particle.type = 'spark';
    }

    state.screenShake = 8;
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
    
    // Update combo
    if (now - state.lastComboTime < 1000) {
      state.combo++;
      state.comboMultiplier = 1 + Math.floor(state.combo / 3) * 0.5;
    } else {
      state.combo = 1;
      state.comboMultiplier = 1;
    }
    state.lastComboTime = now;
    state.comboTimer = 1000;

    // Calculate score with combo
    state.score += Math.floor(100 * state.comboMultiplier);
    
    // Create explosion
    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color);
    
    // Chance to spawn power-up
    spawnPowerup();
  };

  const activatePowerup = (type: string) => {
    const state = gameStateRef.current;
    switch (type) {
      case 'rapidfire':
        state.activeEffects.rapidfire = 5000; // 5 seconds
        break;
      case 'shield':
        state.activeEffects.shield = true;
        state.shieldHealth = 2;
        break;
      case 'timeslow':
        state.activeEffects.timeslow = 3000; // 3 seconds
        break;
    }
  };

  const createPowerupEffect = (x: number, y: number, color: string) => {
    // Create expanding ring effect
    for (let i = 0; i < 20; i++) {
      const particle = particlePool.find(p => !p.active);
      if (!particle) continue;

      const angle = (Math.PI * 2 * i) / 20;
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
    if (Math.random() > 0.1) return; // 10% chance on enemy death

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