// Enhanced Cyberpunk Game with Boss Fights and Power-ups
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const HALF_CANVAS_WIDTH = CANVAS_WIDTH / 2;
const HALF_CANVAS_HEIGHT = CANVAS_HEIGHT / 2;
const PLAYER_SPEED = 8;
const PROJECTILE_SPEED = 12;
const ENEMY_SPEED = 2; // Slower enemies
const SHOT_COOLDOWN = 150;
const ENEMY_SPAWN_INTERVAL = 2500; // Much slower spawn rate - was way too fast
const BOSS_SPAWN_LEVEL = 5;

// Enhanced interfaces
interface GameEntity {
  x: number;
  y: number;
  active: boolean;
}

interface Player extends GameEntity {
  width: number;
  height: number;
  lives: number;
  invulnerable: number;
}

interface Projectile extends GameEntity {
  width: number;
  height: number;
  damage: number;
  speed: number;
}

interface Enemy extends GameEntity {
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  rotation: number;
  scale: number;
  hue: number;
  type: 'normal' | 'fast' | 'tank' | 'boss';
  movementPattern: 'straight' | 'sine' | 'dive' | 'spiral';
  movementTimer: number;
  originalX: number;
  speed: number;
  vx?: number;
  vy?: number;
  // Boss-specific properties
  phase?: number;
  lastAttack?: number;
  attackCooldown?: number;
  moveTime?: number;
}

interface Particle extends GameEntity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'explosion' | 'spark' | 'trail' | 'text';
  text?: string;
}

interface PowerUp extends GameEntity {
  width: number;
  height: number;
  type: 'multishot' | 'shield' | 'slowtime' | 'rapid' | 'health';
  duration: number;
  rotation: number;
}

interface GameState {
  player: Player;
  projectiles: Projectile[];
  enemyProjectiles: Projectile[];
  enemies: Enemy[];
  particles: Particle[];
  powerups: PowerUp[];
  score: number;
  level: number;
  gameStarted: boolean;
  gameOver: boolean;
  gameWon: boolean;
  lastShot: number;
  lastEnemySpawn: number;
  lastPowerupSpawn: number;
  keys: { [key: string]: boolean };
  screenShake: number;
  combo: number;
  comboTimer: number;
  multiplier: number;
  bossActive: boolean;
  powerupEffects: {
    multishot: number;
    shield: number;
    slowtime: number;
    rapid: number;
  };
}

// Enhanced pools for better performance
const createProjectilePool = (): Projectile[] => {
  return Array.from({ length: 50 }, () => ({
    x: 0, y: 0, active: false, width: 4, height: 8, damage: 1, speed: PROJECTILE_SPEED
  }));
};

const createEnemyPool = (): Enemy[] => {
  return Array.from({ length: 30 }, () => ({
    x: 0, y: 0, active: false, width: 30, height: 30, health: 1, maxHealth: 1,
    rotation: 0, scale: 1, hue: 0, type: 'normal', movementPattern: 'straight',
    movementTimer: 0, originalX: 0, speed: ENEMY_SPEED
  }));
};

const createParticlePool = (): Particle[] => {
  return Array.from({ length: 200 }, () => ({
    x: 0, y: 0, active: false, vx: 0, vy: 0, life: 0, maxLife: 1,
    size: 2, color: '#ffffff', type: 'explosion'
  }));
};

const createPowerUpPool = (): PowerUp[] => {
  return Array.from({ length: 10 }, () => ({
    x: 0, y: 0, active: false, width: 18, height: 18, // Much smaller
    type: 'multishot', duration: 0, rotation: 0
  }));
};

const checkCollision = (a: GameEntity & { width: number; height: number }, b: GameEntity & { width: number; height: number }): boolean => {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
};

const getHighScore = (): number => {
  return parseInt(localStorage.getItem('cyberDefenderHighScore') || '0');
};

const saveHighScore = (score: number): void => {
  localStorage.setItem('cyberDefenderHighScore', score.toString());
};

const CyberGame = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const highScoreRef = useRef<number>(0);
  const stateRef = useRef<GameState | null>(null);

  // Enhanced pools
  const projectilePoolRef = useRef<Projectile[]>(createProjectilePool());
  const enemyPoolRef = useRef<Enemy[]>(createEnemyPool());
  const particlePoolRef = useRef<Particle[]>(createParticlePool());
  const powerupPoolRef = useRef<PowerUp[]>(createPowerUpPool());

  // Enhanced game state
  const [state, setState] = useState<GameState>({
  player: {
      x: HALF_CANVAS_WIDTH - 15, y: CANVAS_HEIGHT - 50, active: true, 
      width: 30, height: 30, lives: 3, invulnerable: 0 
    },
    projectiles: [],
    enemyProjectiles: [],
    enemies: [],
    particles: [],
    powerups: [],
  score: 0,
  level: 1,
    gameStarted: false,
    gameOver: false,
    gameWon: false,
  lastShot: 0,
  lastEnemySpawn: 0,
    lastPowerupSpawn: 0,
    keys: {},
  screenShake: 0,
  combo: 0,
  comboTimer: 0,
    multiplier: 1,
    bossActive: false,
    powerupEffects: {
      multishot: 0,
      shield: 0,
      slowtime: 0,
      rapid: 0
    }
  });

  // Load high score
  useEffect(() => {
    highScoreRef.current = getHighScore();
  }, []);

  // Update state ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Boss attack patterns
  const createBossAttack = useCallback((boss: Enemy) => {
    const currentState = stateRef.current;
    if (!currentState) return;
    
    const phase = boss.phase || 1;
    const attackType = Math.floor(Math.random() * 3);
    
    // Phase 1: Basic projectile spray
    if (phase === 1) {
      // Spray pattern - 5 projectiles in a spread
      for (let i = 0; i < 5; i++) {
        const angle = (i - 2) * 0.3; // -0.6 to 0.6 radians
        const projectile = projectilePoolRef.current.find(p => !p.active);
        if (projectile) {
          projectile.active = true;
          projectile.x = boss.x + boss.width / 2;
          projectile.y = boss.y + boss.height;
          projectile.damage = 1;
          projectile.speed = 3;
          // Store angle in unused width/height for enemy projectiles
          projectile.width = Math.sin(angle) * projectile.speed;
          projectile.height = Math.cos(angle) * projectile.speed;
        }
      }
    }
    // Phase 2: Homing missiles + laser sweep
    else if (phase === 2) {
      if (attackType === 0) {
        // Homing missiles - 3 projectiles that track player
        for (let i = 0; i < 3; i++) {
          const projectile = projectilePoolRef.current.find(p => !p.active);
          if (projectile) {
            projectile.active = true;
            projectile.x = boss.x + boss.width / 2 + (i - 1) * 30;
            projectile.y = boss.y + boss.height;
            projectile.damage = 1;
            projectile.speed = 2;
            // Mark as homing
            projectile.width = -999; // Special flag for homing
            projectile.height = 2;
          }
        }
      } else {
        // Laser sweep - line of projectiles across screen
        for (let x = 50; x < CANVAS_WIDTH - 50; x += 40) {
          const projectile = projectilePoolRef.current.find(p => !p.active);
          if (projectile) {
            projectile.active = true;
            projectile.x = x;
            projectile.y = boss.y + boss.height + 20;
            projectile.damage = 1;
            projectile.speed = 4;
            projectile.width = 0;
            projectile.height = projectile.speed;
          }
        }
      }
    }
    // Phase 3: Chaos mode - multiple attack types
    else {
      if (attackType === 0) {
        // Spiral attack
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const projectile = projectilePoolRef.current.find(p => !p.active);
          if (projectile) {
            projectile.active = true;
            projectile.x = boss.x + boss.width / 2;
            projectile.y = boss.y + boss.height;
            projectile.damage = 1;
            projectile.speed = 2.5;
            projectile.width = Math.cos(angle) * projectile.speed;
            projectile.height = Math.sin(angle) * projectile.speed;
          }
        }
      } else if (attackType === 1) {
        // Rain of projectiles
        for (let i = 0; i < 6; i++) {
          const projectile = projectilePoolRef.current.find(p => !p.active);
          if (projectile) {
            projectile.active = true;
            projectile.x = Math.random() * (CANVAS_WIDTH - 100) + 50;
            projectile.y = boss.y;
            projectile.damage = 1;
            projectile.speed = 3 + Math.random() * 2;
            projectile.width = (Math.random() - 0.5) * 2;
            projectile.height = projectile.speed;
          }
        }
      } else {
        // Targeted burst at player
        const playerX = currentState.player.x + currentState.player.width / 2;
        const playerY = currentState.player.y + currentState.player.height / 2;
        const dx = playerX - (boss.x + boss.width / 2);
        const dy = playerY - (boss.y + boss.height);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        for (let i = 0; i < 4; i++) {
          const projectile = projectilePoolRef.current.find(p => !p.active);
          if (projectile) {
            projectile.active = true;
            projectile.x = boss.x + boss.width / 2 + (i - 1.5) * 20;
            projectile.y = boss.y + boss.height;
            projectile.damage = 1;
            projectile.speed = 3.5;
            projectile.width = (dx / distance) * projectile.speed;
            projectile.height = (dy / distance) * projectile.speed;
          }
        }
      }
    }
    
    // Screen shake for boss attacks
    setState(prev => ({ ...prev, screenShake: Math.min(prev.screenShake + 3, 10) }));
    
  }, []);

  // Enemy-type specific movement patterns
  const updateEnemyMovement = useCallback((enemy: Enemy, deltaTime: number) => {
    enemy.movementTimer += deltaTime;
    enemy.moveTime = (enemy.moveTime || 0) + deltaTime * 0.001;

    if (enemy.type === 'boss') {
      // Boss stays at top and moves side to side
      const amplitude = 120;
      const baseX = CANVAS_WIDTH / 2 - enemy.width / 2;
      enemy.x = baseX + Math.sin(enemy.moveTime * 1.5) * amplitude;
      enemy.y = Math.max(30, Math.min(enemy.y, 80)); // Keep at top
      
      // Boss attacks
      const currentTime = performance.now();
      enemy.lastAttack = enemy.lastAttack || 0;
      enemy.attackCooldown = enemy.attackCooldown || 2000;
      
      if (currentTime - enemy.lastAttack > enemy.attackCooldown) {
        createBossAttack(enemy);
        enemy.lastAttack = currentTime;
        // Vary attack cooldown based on phase
        const phase = Math.floor((1 - enemy.health / enemy.maxHealth) * 3) + 1;
        enemy.phase = phase;
        enemy.attackCooldown = Math.max(800, 2500 - (phase * 300)); // Faster attacks in later phases
      }
      
    } else if (enemy.type === 'fast') {
      // Cyber Spider - erratic scuttling with sudden direction changes
      enemy.vx = enemy.vx || (Math.random() - 0.5) * 2;
      enemy.vy = enemy.vy || 1.2;
      
      // Random direction changes (less frequent)
      if (Math.random() < 0.01) {
        enemy.vx = (Math.random() - 0.5) * 2;
      }
      
      // Zigzag pattern with controlled movement
      enemy.x += Math.sin(enemy.moveTime * 6) * 1.5 + enemy.vx * 0.5;
      enemy.y += enemy.vy;
      
      // Keep on screen
      if (enemy.x <= 0) {
        enemy.x = 0;
        enemy.vx = Math.abs(enemy.vx);
      }
      if (enemy.x >= CANVAS_WIDTH - enemy.width) {
        enemy.x = CANVAS_WIDTH - enemy.width;
        enemy.vx = -Math.abs(enemy.vx);
      }
      
    } else if (enemy.type === 'tank') {
      // Neural Horror - slow, methodical, intimidating approach
      enemy.vy = enemy.vy || 0.6;
      enemy.x += Math.sin(enemy.moveTime * 0.8) * 1.0;
      enemy.y += enemy.vy;
      // Slight weaving motion
      enemy.x += Math.cos(enemy.moveTime * 0.3) * 0.5;
      
      // Keep on screen
      enemy.x = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, enemy.x));
      
    } else {
      // Glitch Parasite - glitchy stuttering movement
      enemy.vy = enemy.vy || 1.0;
      
      // Glitch teleportation effect (less aggressive)
      if (Math.random() < 0.02) {
        enemy.x += (Math.random() - 0.5) * 15; // Smaller glitch jumps
      }
      
      // Stuttering descent
      const glitchCycle = Math.sin(enemy.moveTime * 10);
      if (glitchCycle > 0.7) {
        enemy.y += enemy.vy * 1.8; // Fast bursts
      } else if (glitchCycle < -0.7) {
        enemy.y += enemy.vy * 0.1; // Slow crawl
      } else {
        enemy.y += enemy.vy * 0.8; // Normal speed
      }
      
      // Horizontal glitch drift (controlled)
      enemy.x += Math.sin(enemy.moveTime * 3) * 0.8;
      
      // Keep on screen
      enemy.x = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, enemy.x));
    }
  }, [createBossAttack]);

  // Enhanced particle creation with text support
  const createParticle = useCallback((x: number, y: number, type: 'explosion' | 'spark' | 'trail' | 'text', color = '#f07e41', text?: string) => {
    const particle = particlePoolRef.current.find(p => !p.active);
    if (!particle) return;

    particle.active = true;
    particle.x = x;
    particle.y = y;
    particle.type = type;
    particle.color = color;
    particle.text = text;
    particle.life = particle.maxLife = type === 'text' ? 2000 : 1000;
    particle.size = type === 'text' ? 24 : Math.random() * 6 + 2;
    
    if (type === 'text') {
      particle.vx = 0;
      particle.vy = -0.5;
    } else {
      particle.vx = (Math.random() - 0.5) * 8;
      particle.vy = (Math.random() - 0.5) * 8;
    }
  }, []);

  // Enhanced enemy spawning by type
  const spawnEnemy = useCallback(() => {
    const enemy = enemyPoolRef.current.find(e => !e.active);
    if (!enemy) return;

    const types = ['normal', 'fast', 'tank'] as const;
    
    enemy.active = true;
    enemy.x = Math.random() * (CANVAS_WIDTH - 30);
    enemy.originalX = enemy.x;
    enemy.y = -30;
    enemy.movementTimer = 0;
    enemy.type = types[Math.floor(Math.random() * types.length)];
    enemy.rotation = 0;
    enemy.scale = 1;
    enemy.hue = Math.random() * 360;
    enemy.moveTime = 0;

    // Type-specific properties and movement initialization
    switch (enemy.type) {
      case 'fast': // Cyber Spider
        enemy.health = enemy.maxHealth = 1;
        enemy.speed = ENEMY_SPEED * 1.2;
        enemy.width = enemy.height = 35;
        enemy.vx = (Math.random() - 0.5) * 2;
        enemy.vy = 1.2;
        break;
        
      case 'tank': // Neural Horror
        enemy.health = enemy.maxHealth = 2;
        enemy.speed = ENEMY_SPEED * 0.8;
        enemy.width = enemy.height = 45;
        enemy.vx = 0;
        enemy.vy = 0.6;
        break;
        
      default: // Glitch Parasite (normal)
        enemy.health = enemy.maxHealth = 1;
        enemy.speed = ENEMY_SPEED;
        enemy.width = enemy.height = 40;
        enemy.vx = 0;
        enemy.vy = 1.0;
        break;
    }
  }, []);

  // Spawn boss enemy with proper initialization
  const spawnBoss = useCallback(() => {
    const boss = enemyPoolRef.current.find(e => !e.active);
    if (!boss) return;

    boss.active = true;
    boss.type = 'boss';
    boss.x = HALF_CANVAS_WIDTH - 50;
    boss.originalX = boss.x;
    boss.y = 50;
    boss.width = boss.height = 100;
    boss.health = boss.maxHealth = 30; // Balanced boss health
    boss.speed = ENEMY_SPEED * 0.5;
    boss.movementTimer = 0;
    boss.moveTime = 0;
    boss.hue = 0; // Red boss
    boss.scale = 1.5;
    boss.phase = 1;
    boss.lastAttack = 0;
    boss.attackCooldown = 2000;
    boss.vx = 0;
    boss.vy = 0;
    
    createParticle(boss.x + boss.width/2, boss.y + boss.height/2, 'text', '#ff0000', 'NIGHTMARE AWAKENS!');
  }, [createParticle]);

  // Power-up spawning
  const spawnPowerUp = useCallback(() => {
    const powerup = powerupPoolRef.current.find(p => !p.active);
    if (!powerup) return;

    const types = ['multishot', 'shield', 'slowtime', 'rapid', 'health'] as const;
    powerup.active = true;
    powerup.type = types[Math.floor(Math.random() * types.length)];
    powerup.x = Math.random() * (CANVAS_WIDTH - 18);
    powerup.y = -18;
    powerup.rotation = 0;
    powerup.duration = 5000; // 5 seconds
  }, []);

  // Enhanced shooting with power-ups
  const shoot = useCallback((currentTime: number) => {
    const currentState = stateRef.current;
    if (!currentState) return;
    
    if (currentTime - currentState.lastShot < (currentState.powerupEffects.rapid > 0 ? SHOT_COOLDOWN / 2 : SHOT_COOLDOWN)) return;

    const projectileCount = currentState.powerupEffects.multishot > 0 ? 3 : 1;
    const angles = projectileCount === 3 ? [-0.3, 0, 0.3] : [0];

    for (let i = 0; i < projectileCount; i++) {
      const projectile = projectilePoolRef.current.find(p => !p.active);
      if (!projectile) continue;

      projectile.active = true;
      projectile.x = currentState.player.x + currentState.player.width / 2 - 2;
      projectile.y = currentState.player.y;
      projectile.width = 4;  // Standard player projectile width
      projectile.height = 10; // Standard player projectile height
      projectile.damage = 1;
      projectile.speed = PROJECTILE_SPEED + (angles[i] * 2); // Slight speed variation for spread
    }

    setState(prev => ({ ...prev, lastShot: currentTime }));
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    // Clear all pools
    projectilePoolRef.current.forEach(p => p.active = false);
    enemyPoolRef.current.forEach(e => e.active = false);
    particlePoolRef.current.forEach(p => p.active = false);
    powerupPoolRef.current.forEach(p => p.active = false);

    setState({
      player: { 
        x: HALF_CANVAS_WIDTH - 15, y: CANVAS_HEIGHT - 50, active: true, 
        width: 30, height: 30, lives: 3, invulnerable: 0 
      },
      projectiles: [],
      enemyProjectiles: [],
      enemies: [],
      particles: [],
      powerups: [],
      score: 0,
      level: 1,
      gameStarted: false, // This was the bug - should be false so it can be restarted
      gameOver: false,
      gameWon: false,
      lastShot: 0,
      lastEnemySpawn: 0,
      lastPowerupSpawn: 0,
      keys: {},
      screenShake: 0,
      combo: 0,
      comboTimer: 0,
      multiplier: 1,
      bossActive: false,
      powerupEffects: {
        multishot: 0,
        shield: 0,
        slowtime: 0,
        rapid: 0
      }
    });
  }, []);

  // Enhanced game update with all new features
  const updateGame = useCallback((deltaTime: number) => {
    setState(prevState => {
      if (!prevState.gameStarted || prevState.gameOver || prevState.gameWon) return prevState;

      const currentTime = performance.now();
      const timeMultiplier = prevState.powerupEffects.slowtime > 0 ? 0.3 : 1;

      const newState = { ...prevState };

      // Update power-up effects
      Object.keys(newState.powerupEffects).forEach(key => {
        const effectKey = key as keyof typeof newState.powerupEffects;
        if (newState.powerupEffects[effectKey] > 0) {
          newState.powerupEffects[effectKey] -= deltaTime;
        }
      });

      // Update player invulnerability
      if (newState.player.invulnerable > 0) {
        newState.player.invulnerable -= deltaTime;
      }

      // Update combo timer
      if (newState.comboTimer > 0) {
        newState.comboTimer -= deltaTime;
        if (newState.comboTimer <= 0) {
          newState.combo = 0;
        }
      }

      // Screen shake decay
      if (newState.screenShake > 0) {
        newState.screenShake -= deltaTime * 0.01;
      }

      // Update projectiles - separate player and enemy projectiles
      projectilePoolRef.current.forEach(projectile => {
        if (!projectile.active) return;
        
        // Check if this is an enemy projectile (using width/height as velocity storage)
        if (projectile.damage === 1 && (projectile.width !== 4 || projectile.height !== 10)) {
          // ENEMY PROJECTILES - special movement patterns
          
          // Homing projectiles
          if (projectile.width === -999) {
            const dx = newState.player.x + newState.player.width/2 - projectile.x;
            const dy = newState.player.y + newState.player.height/2 - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const homingStrength = 0.5;
            
            if (distance > 0) {
              projectile.x += (dx / distance) * projectile.height * deltaTime * 0.02;
              projectile.y += (dy / distance) * projectile.height * deltaTime * 0.02 + homingStrength;
            }
          } else {
            // Normal enemy projectiles with stored velocity
            projectile.x += projectile.width * deltaTime * 0.02;
            projectile.y += projectile.height * deltaTime * 0.02;
          }
          
          // Remove if off screen
          if (projectile.y > CANVAS_HEIGHT + 50 || projectile.x < -50 || projectile.x > CANVAS_WIDTH + 50) {
            projectile.active = false;
          }
        } else {
          // PLAYER PROJECTILES - normal upward movement
          projectile.y -= projectile.speed * deltaTime * 0.02;
          if (projectile.y < -10) projectile.active = false;
        }
      });

      // Update enemies with enhanced movement
      enemyPoolRef.current.forEach(enemy => {
        if (!enemy.active) return;
        
        updateEnemyMovement(enemy, deltaTime * timeMultiplier);
        
        // Check if enemy reached bottom (player dies!)
        if (enemy.y > CANVAS_HEIGHT) {
          enemy.active = false;
          if (newState.player.invulnerable <= 0) {
            newState.player.lives--;
            newState.player.invulnerable = 2000; // 2 seconds invulnerability
            newState.screenShake = 20;
            
            if (newState.player.lives <= 0) {
              newState.gameOver = true;
              if (newState.score > highScoreRef.current) {
                saveHighScore(newState.score);
                highScoreRef.current = newState.score;
              }
            }
          }
        }
      });

      // Update power-ups
      powerupPoolRef.current.forEach(powerup => {
        if (!powerup.active) return;
        powerup.y += 2 * deltaTime * 0.02;
        powerup.rotation += deltaTime * 0.003;
        if (powerup.y > CANVAS_HEIGHT + 25) powerup.active = false;
      });

      // Update particles
      particlePoolRef.current.forEach(particle => {
        if (!particle.active) return;
        particle.x += particle.vx * deltaTime * 0.02;
        particle.y += particle.vy * deltaTime * 0.02;
        particle.life -= deltaTime;
        if (particle.life <= 0) particle.active = false;
      });

      // Collision: Projectiles vs Enemies
      projectilePoolRef.current.forEach(projectile => {
        if (!projectile.active) return;
        
        enemyPoolRef.current.forEach(enemy => {
          if (!enemy.active) return;
          
          if (checkCollision(projectile, enemy)) {
            projectile.active = false;
            enemy.health -= projectile.damage;
            
            // Create hit particles
            for (let i = 0; i < 5; i++) {
              createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'spark', '#f07e41');
            }
            
            if (enemy.health <= 0) {
            enemy.active = false;
              
              // Score with combo system
              let points = enemy.type === 'boss' ? 1000 : 
                          enemy.type === 'tank' ? 30 : 
                          enemy.type === 'fast' ? 20 : 10;
              
              newState.combo++;
              newState.comboTimer = 3000; // 3 seconds to keep combo
              
              if (newState.combo > 5) {
                newState.multiplier = Math.min(5, Math.floor(newState.combo / 5) + 1);
                points *= newState.multiplier;
                
                // Create combo text
                createParticle(
                  enemy.x + enemy.width/2, 
                  enemy.y, 
                  'text', 
                  '#00ff00', 
                  `${newState.combo}x COMBO!`
                );
              }
              
              newState.score += points;
              
              // WILD DEATH EXPLOSION with screen shake
              const explosionCount = enemy.type === 'boss' ? 40 : 16; // More particles
              for (let i = 0; i < explosionCount; i++) {
                createParticle(
                  enemy.x + enemy.width/2 + (Math.random() - 0.5) * enemy.width, 
                  enemy.y + enemy.height/2 + (Math.random() - 0.5) * enemy.height, 
                  'explosion', 
                  enemy.type === 'boss' ? '#ff0000' : '#cc0000'
                );
              }
              
              // Add screen shake for all enemy deaths
              newState.screenShake = enemy.type === 'boss' ? 30 : 8;
              
              // Screen shake for boss
              if (enemy.type === 'boss') {
                newState.screenShake = 30;
                newState.bossActive = false;
                newState.gameWon = true; // Win condition!
                
                // Secret win message
                createParticle(
                  HALF_CANVAS_WIDTH, 
                  HALF_CANVAS_HEIGHT, 
                  'text', 
                  '#00ff00', 
                  'CYBER GUARDIAN ACTIVATED!'
                );
              }
            }
          }
        });
      });

      // Collision: Player vs Enemies
      if (newState.player.invulnerable <= 0) {
        enemyPoolRef.current.forEach(enemy => {
          if (!enemy.active) return;
          
          if (checkCollision(newState.player, enemy)) {
          enemy.active = false;
            
            if (newState.powerupEffects.shield <= 0) {
              newState.player.lives--;
              newState.player.invulnerable = 2000;
              newState.screenShake = 20;
              
              if (newState.player.lives <= 0) {
                newState.gameOver = true;
                if (newState.score > highScoreRef.current) {
                  saveHighScore(newState.score);
                  highScoreRef.current = newState.score;
                }
              }
            }
            
            // Explosion
            for (let i = 0; i < 10; i++) {
              createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'explosion', '#ff0000');
            }
          }
        });
      }

      // Collision: Player vs Enemy Projectiles
      if (newState.player.invulnerable <= 0) {
        projectilePoolRef.current.forEach(projectile => {
          if (!projectile.active) return;
          // Check if this is an enemy projectile
          if (projectile.damage === 1 && (projectile.width !== 4 || projectile.height !== 10)) {
            
            // Simple collision check (projectiles are small)
            const collision = projectile.x < newState.player.x + newState.player.width &&
                            projectile.x + 6 > newState.player.x &&
                            projectile.y < newState.player.y + newState.player.height &&
                            projectile.y + 6 > newState.player.y;
                            
            if (collision) {
              projectile.active = false;
              
              if (newState.powerupEffects.shield <= 0) {
                newState.player.lives--;
                newState.player.invulnerable = 2000;
                newState.screenShake = 15;
                
                if (newState.player.lives <= 0) {
                  newState.gameOver = true;
                  if (newState.score > highScoreRef.current) {
                    saveHighScore(newState.score);
                    highScoreRef.current = newState.score;
                  }
                }
              } else {
                // Shield blocked the hit - show feedback
                createParticle(projectile.x, projectile.y, 'spark', '#0088ff');
              }
              
              // Impact particles
              for (let i = 0; i < 6; i++) {
                createParticle(projectile.x, projectile.y, 'spark', '#ff4444');
              }
            }
          }
        });
      }

      // Collision: Player vs Power-ups
      powerupPoolRef.current.forEach(powerup => {
        if (!powerup.active) return;
        
        if (checkCollision(newState.player, powerup)) {
          powerup.active = false;
          
          switch (powerup.type) {
            case 'multishot':
              newState.powerupEffects.multishot = 10000; // 10 seconds
              createParticle(powerup.x, powerup.y, 'text', '#00ff00', 'MULTISHOT!');
              break;
            case 'shield':
              newState.powerupEffects.shield = 8000; // 8 seconds
              createParticle(powerup.x, powerup.y, 'text', '#0088ff', 'SHIELD!');
              break;
            case 'slowtime':
              newState.powerupEffects.slowtime = 6000; // 6 seconds
              createParticle(powerup.x, powerup.y, 'text', '#ff00ff', 'SLOW TIME!');
              break;
            case 'rapid':
              newState.powerupEffects.rapid = 8000; // 8 seconds
              createParticle(powerup.x, powerup.y, 'text', '#ffff00', 'RAPID FIRE!');
              break;
            case 'health':
              newState.player.lives = Math.min(5, newState.player.lives + 1);
              createParticle(powerup.x, powerup.y, 'text', '#ff0088', '+1 LIFE!');
              break;
          }
        }
      });

      // Spawning logic - much more balanced progression
      const spawnRate = Math.max(1500, ENEMY_SPAWN_INTERVAL - (newState.level * 200)); // Slower progression
      if (currentTime - newState.lastEnemySpawn > spawnRate) {
        // Check for boss spawn
        if (newState.level >= BOSS_SPAWN_LEVEL && !newState.bossActive && 
            enemyPoolRef.current.filter(e => e.active).length === 0) {
          spawnBoss();
          newState.bossActive = true;
          newState.lastEnemySpawn = currentTime;
        } else if (!newState.bossActive) {
          // Only spawn regular enemies when boss is NOT active
          spawnEnemy();
          newState.lastEnemySpawn = currentTime;
        }
        // Don't update lastEnemySpawn if boss is active to prevent any spawning
      }

      // Power-up spawning
      if (currentTime - newState.lastPowerupSpawn > 8000) { // Every 8 seconds
        spawnPowerUp();
        newState.lastPowerupSpawn = currentTime;
      }

      // Level progression
      if (newState.score > newState.level * 200) {
        newState.level++;
        createParticle(HALF_CANVAS_WIDTH, 100, 'text', '#f07e41', `LEVEL ${newState.level}!`);
      }

      return newState;
    });
  }, [updateEnemyMovement, spawnEnemy, spawnBoss, spawnPowerUp, createParticle]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      
      // Check state first to decide what to do
      const currentState = stateRef.current;
      if (!currentState) return;
      
      if (!currentState.gameStarted && !currentState.gameOver && !currentState.gameWon) {
        // Start game
        setState(prev => ({ ...prev, gameStarted: true, keys: { ...prev.keys, [e.code]: true } }));
      } else if (currentState.gameOver || currentState.gameWon) {
        // Restart game - call resetGame outside of setState
        resetGame();
      } else {
        // Shoot during game
        shoot(performance.now());
        setState(prev => ({ ...prev, keys: { ...prev.keys, [e.code]: true } }));
      }
    } else {
      setState(prev => ({
        ...prev,
        keys: { ...prev.keys, [e.code]: true }
      }));
    }
  }, [shoot, resetGame]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setState(prev => ({
      ...prev,
      keys: { ...prev.keys, [e.code]: false }
    }));
  }, []);

  // Mobile touch controls
  const [mobileControls, setMobileControls] = useState({
    moveLeft: false,
    moveRight: false,
    shoot: false
  });

  const handleMobileAction = useCallback((action: 'start' | 'restart' | 'moveLeft' | 'moveRight' | 'shoot') => {
    switch (action) {
      case 'start':
      case 'restart':
        setState(prev => {
          if (!prev.gameStarted && !prev.gameOver && !prev.gameWon) {
            return { ...prev, gameStarted: true };
          } else if (prev.gameOver || prev.gameWon) {
            resetGame();
            return { ...prev, gameStarted: true, gameOver: false, gameWon: false };
          }
          return prev;
        });
        break;
      case 'moveLeft':
        setMobileControls(prev => ({ ...prev, moveLeft: !prev.moveLeft }));
        break;
      case 'moveRight':
        setMobileControls(prev => ({ ...prev, moveRight: !prev.moveRight }));
        break;
      case 'shoot':
        shoot(performance.now());
        break;
    }
  }, [shoot, resetGame]);

  // Player movement and auto-firing
  useEffect(() => {
    if (!state.gameStarted || state.gameOver || state.gameWon) return;

    const movePlayer = () => {
      setState(prev => {
        let newX = prev.player.x;
        
        // Keyboard controls
        if (prev.keys['ArrowLeft'] || prev.keys['KeyA']) {
          newX -= PLAYER_SPEED;
        }
        if (prev.keys['ArrowRight'] || prev.keys['KeyD']) {
          newX += PLAYER_SPEED;
        }
        
        // Mobile controls
        if (mobileControls.moveLeft) {
          newX -= PLAYER_SPEED;
        }
        if (mobileControls.moveRight) {
          newX += PLAYER_SPEED;
        }
        
        // Keep player on screen
        newX = Math.max(0, Math.min(CANVAS_WIDTH - prev.player.width, newX));
        
        return {
          ...prev,
          player: { ...prev.player, x: newX }
        };
      });
    };

    const interval = setInterval(movePlayer, 16); // 60 FPS movement
    return () => clearInterval(interval);
  }, [state.keys, state.gameStarted, state.gameOver, state.gameWon, mobileControls]);

  // Auto-firing for rapid fire mode
  useEffect(() => {
    const checkAndFire = () => {
      const currentState = stateRef.current;
      if (!currentState || !currentState.gameStarted || currentState.gameOver || currentState.gameWon) return;
      
      // Only auto-fire if rapid fire is active
      if (currentState.powerupEffects.rapid > 0) {
        shoot(performance.now());
      }
    };

    // Check every 80ms for rapid fire
    const interval = setInterval(checkAndFire, 80);
    return () => clearInterval(interval);
  }, [shoot]);



  // ENHANCED RENDER FUNCTION with cyberpunk effects
  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const currentState = stateRef.current;
    if (!currentState) return;
    
    // HARDCORE CYBERPUNK BACKGROUND - dark, edgy, glitchy
    const time = performance.now() * 0.001;
    
    // Deep black background with subtle red undertones
    ctx.fillStyle = '#0a0508';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Glitch effect with random digital corruption
    const glitchIntensity = currentState.screenShake > 0 ? 8 : 2;
    for (let i = 0; i < 12; i++) {
      const glitchY = Math.random() * CANVAS_HEIGHT;
      const glitchHeight = Math.random() * 4 + 1;
      const glitchOffset = (Math.sin(time * 20 + i) * glitchIntensity);
      
      // RGB channel separation for glitch effect
      ctx.fillStyle = `rgba(255, 0, 100, ${0.03 + Math.random() * 0.02})`;
      ctx.fillRect(glitchOffset, glitchY, CANVAS_WIDTH, glitchHeight);
      ctx.fillStyle = `rgba(0, 255, 255, ${0.02 + Math.random() * 0.01})`;
      ctx.fillRect(-glitchOffset * 0.5, glitchY + 1, CANVAS_WIDTH, glitchHeight);
    }
    
    // Hostile cyberpunk grid with neon colors
    const gridGlitch = Math.sin(time * 15) * 3;
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.08 + Math.sin(time * 2) * 0.02})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      const jitter = Math.sin(time * 8 + x * 0.01) * 1;
      ctx.moveTo(x + gridGlitch + jitter, 0);
      ctx.lineTo(x + gridGlitch + jitter, CANVAS_HEIGHT);
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      const jitter = Math.sin(time * 6 + y * 0.01) * 1;
      ctx.moveTo(0, y + gridGlitch + jitter);
      ctx.lineTo(CANVAS_WIDTH, y + gridGlitch + jitter);
    }
    ctx.stroke();
    
    // Aggressive scanning lines with digital noise
    const scanLines = 5;
    for (let i = 0; i < scanLines; i++) {
      const scanY = ((time * 180 + i * 100) % CANVAS_HEIGHT);
      const intensity = Math.sin(time * 12 + i) * 0.03 + 0.02;
      ctx.strokeStyle = `rgba(255, 0, 150, ${intensity})`;
      ctx.lineWidth = 1 + Math.sin(time * 20 + i) * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(CANVAS_WIDTH, scanY);
      ctx.stroke();
    }
    
    // Digital noise lines for extra edge
    for (let i = 0; i < 8; i++) {
      if (Math.random() < 0.3) {
        const noiseX = Math.random() * CANVAS_WIDTH;
        const noiseY = Math.random() * CANVAS_HEIGHT;
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
        ctx.lineWidth = Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(noiseX, noiseY);
        ctx.lineTo(noiseX + Math.random() * 20 - 10, noiseY + Math.random() * 20 - 10);
        ctx.stroke();
      }
    }
    
    // Screen shake effects
    ctx.save();
    if (currentState.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * currentState.screenShake;
      const shakeY = (Math.random() - 0.5) * currentState.screenShake;
      ctx.translate(shakeX, shakeY);
    }
    
    if (currentState.gameStarted && !currentState.gameOver && !currentState.gameWon) {
      // Draw particles with enhanced effects including text
      particlePoolRef.current.forEach(particle => {
        if (!particle.active) return;
          const alpha = particle.life / particle.maxLife;
        
          ctx.globalAlpha = alpha;
        
        if (particle.type === 'text' && particle.text) {
          // Draw animated text particles
          ctx.fillStyle = particle.color;
          ctx.font = `${particle.size}px monospace`;
          ctx.textAlign = 'center';
          ctx.shadowBlur = 6;
          ctx.shadowColor = particle.color;
          ctx.fillText(particle.text, particle.x, particle.y);
        } else {
          ctx.fillStyle = particle.color;
          if (alpha > 0.3) {
            ctx.shadowBlur = particle.size * 2;
            ctx.shadowColor = particle.color;
          }
          
          if (particle.type === 'spark') {
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.size;
        ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x - particle.vx * 3, particle.y - particle.vy * 3);
        ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
      }
        }
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      // Draw CYBERPUNK PROJECTILES - deadly laser beams
      projectilePoolRef.current.forEach(projectile => {
        if (!projectile.active) return;
        
        ctx.save();
        
        // Check if this is an enemy projectile
        const isEnemyProjectile = projectile.damage === 1 && (projectile.width !== 4 || projectile.height !== 10);
        
        if (isEnemyProjectile) {
          // ENEMY PROJECTILES - dangerous red energy
          const enemyColor = '#ff3333';
          const pulseIntensity = Math.sin(time * 20) * 0.3 + 0.7;
          
          ctx.fillStyle = enemyColor;
          ctx.shadowBlur = 12;
          ctx.shadowColor = enemyColor;
          ctx.globalAlpha = pulseIntensity;
          
          // Draw menacing enemy projectile
          ctx.fillRect(projectile.x - 2, projectile.y - 2, 8, 8);
          
          // Evil glow effect
          ctx.shadowBlur = 20;
          ctx.globalAlpha = pulseIntensity * 0.5;
          ctx.fillRect(projectile.x - 1, projectile.y - 1, 6, 6);
          
        } else {
          // PLAYER PROJECTILES - heroic cyan/yellow laser beams
          const rapidMode = currentState.powerupEffects.rapid > 0;
          const baseColor = rapidMode ? '#ffff00' : '#00ffff';
          const coreColor = rapidMode ? '#ffffff' : '#ffffff';
          
          // Core laser beam
          ctx.fillStyle = baseColor;
          ctx.shadowBlur = 15;
          ctx.shadowColor = baseColor;
          ctx.fillRect(projectile.x - 1, projectile.y, projectile.width + 2, projectile.height + 4);
          
          // Inner bright core
          ctx.fillStyle = coreColor;
          ctx.shadowBlur = 8;
          ctx.shadowColor = coreColor;
          ctx.fillRect(projectile.x, projectile.y + 1, projectile.width, projectile.height + 2);
          
          // Trailing particles
          for (let i = 0; i < 3; i++) {
            const trailY = projectile.y + (i + 1) * 8;
            const alpha = (3 - i) / 3;
            const [r, g, b] = rapidMode ? [255, 255, 0] : [0, 255, 255];
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`;
            ctx.shadowBlur = 5;
            ctx.fillRect(projectile.x, trailY, projectile.width, 2);
          }
        }
        
        ctx.restore();
      });
      ctx.shadowBlur = 0;
      
      // Draw CYBERPUNK POWER-UPS - edgy hacker tech
      powerupPoolRef.current.forEach(powerup => {
        if (!powerup.active) return;
        
      ctx.save();
        ctx.translate(powerup.x + powerup.width/2, powerup.y + powerup.height/2);
        
        const hack_pulse = Math.sin(time * 12) * 0.2 + 1;
        const glitch_rotation = Math.sin(time * 20) * 0.05;
        ctx.scale(hack_pulse, hack_pulse);
        ctx.rotate(glitch_rotation);
        
        const colors = {
          multishot: '#00ff41', // Matrix green
          shield: '#0099ff',    // Cyber blue
          slowtime: '#ff0099',  // Hot pink
          rapid: '#ffff00',     // Electric yellow
          health: '#ff3333'     // Danger red
        };
        
        // Edgy hexagonal container with glitch effect
        ctx.strokeStyle = colors[powerup.type];
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors[powerup.type];
        
        // Draw glitched hexagon (smaller)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const glitchOffset = Math.sin(time * 25 + i) * 0.5;
          const radius = 8 + glitchOffset; // Smaller radius
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Fill with semi-transparent color
        ctx.fillStyle = colors[powerup.type] + '33';
        ctx.fill();
        
        // Digital noise overlay (smaller)
        for (let i = 0; i < 6; i++) {
          if (Math.random() < 0.4) {
            ctx.fillStyle = colors[powerup.type] + '66';
            ctx.fillRect(
              (Math.random() - 0.5) * 14,
              (Math.random() - 0.5) * 14,
              Math.random() * 1.5,
              Math.random() * 1.5
            );
          }
        }
        
        // Cyberpunk symbols with glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = colors[powerup.type];
        ctx.fillStyle = colors[powerup.type];
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        
        if (powerup.type === 'multishot') {
          ctx.fillText('▸▸▸', 0, 5);
        } else if (powerup.type === 'shield') {
          ctx.fillText('◇◆◇', 0, 5);
        } else if (powerup.type === 'slowtime') {
          ctx.fillText('⟪⟫', 0, 5);
        } else if (powerup.type === 'rapid') {
          ctx.fillText('≡≡', 0, 5);
        } else if (powerup.type === 'health') {
          ctx.fillText('◢◤', 0, 5);
        }
        
        ctx.restore();
      });
      ctx.shadowBlur = 0;
      
      // Draw CYBERPUNK HORROR ENTITIES - disturbing, uncanny, nightmare fuel
      enemyPoolRef.current.forEach(enemy => {
          if (!enemy.active) return;
          
          ctx.save();
        ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        
        const enemyColors = {
          normal: '#cc0000',   // Blood red
          fast: '#990066',     // Dark crimson  
          tank: '#440044',     // Deep shadow purple
          boss: '#880000'      // Dark blood red
        };
        
        // Uncanny disturbing animations
        const horror_pulse = Math.sin(time * 8 + enemy.x * 0.03) * 0.2 + 1;
        const unsettling_twitch = Math.sin(time * 25 + enemy.y * 0.02) * 0.08;
        // const corruption_flicker = Math.sin(time * 40 + enemy.x) * 2;
        
        ctx.rotate(enemy.rotation + unsettling_twitch);
        ctx.scale(enemy.scale * horror_pulse, enemy.scale * horror_pulse);
        
        if (enemy.type === 'boss') {
          // NIGHTMARE AMALGAMATION - horrifying digital demon
          const nightmare_pulse = Math.sin(time * 3) * 0.3 + 1;
          const breathing = Math.sin(time * 2) * 0.1 + 1;
          ctx.scale(nightmare_pulse * breathing, nightmare_pulse * breathing);
          
          // Pulsating organic-digital hybrid core
          ctx.fillStyle = enemyColors[enemy.type];
          ctx.shadowBlur = 40;
          ctx.shadowColor = enemyColors[enemy.type];
          
          // Disturbing asymmetrical core
          ctx.beginPath();
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distortion = Math.sin(time * 6 + i * 0.7) * 8;
            const radius = (enemy.width/2) + distortion + Math.sin(time * 3 + i) * 6;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          
          // Writhing digital tentacles/veins
          for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const tentacle_length = 40 + Math.sin(time * 4 + i) * 15;
            const writhing = Math.sin(time * 8 + i * 0.5) * 8;
            const twitching = Math.sin(time * 20 + i) * 3;
            
            ctx.strokeStyle = enemyColors[enemy.type];
            ctx.lineWidth = 4 + Math.sin(time * 12 + i) * 2;
            ctx.shadowBlur = 20;
            ctx.shadowColor = enemyColors[enemy.type];
            
            ctx.beginPath();
            const baseX = Math.cos(angle) * (enemy.width/2 - 8);
            const baseY = Math.sin(angle) * (enemy.width/2 - 8);
            const endX = Math.cos(angle) * tentacle_length + writhing + twitching;
            const endY = Math.sin(angle) * tentacle_length + writhing + twitching;
            
            // Curved tentacle
            ctx.moveTo(baseX, baseY);
            ctx.quadraticCurveTo(
              baseX + (endX - baseX) * 0.5 + writhing, 
              baseY + (endY - baseY) * 0.5 + writhing,
              endX, endY
            );
            ctx.stroke();
          }
          
          // Multiple disturbing eyes scattered across body
          for (let i = 0; i < 8; i++) {
            const eyeAngle = (i / 8) * Math.PI * 2 + time * 0.5;
            const eyeDistance = 15 + Math.sin(time * 4 + i) * 8;
            const eyeX = Math.cos(eyeAngle) * eyeDistance + Math.sin(time * 15 + i) * 3;
            const eyeY = Math.sin(eyeAngle) * eyeDistance + Math.sin(time * 18 + i) * 3;
            
            // Eye socket
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#000000';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Glowing iris
            ctx.fillStyle = '#ff0000';
          ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(eyeX + Math.sin(time * 10 + i), eyeY + Math.cos(time * 12 + i), 3, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // EPIC BOSS PARTICLE EFFECTS
          // Dark energy aura
          for (let i = 0; i < 20; i++) {
            const particleAngle = Math.random() * Math.PI * 2;
            const particleDistance = enemy.width/2 + 30 + Math.random() * 40;
            const particleX = Math.cos(particleAngle) * particleDistance;
            const particleY = Math.sin(particleAngle) * particleDistance;
            
            ctx.fillStyle = '#880000';
            ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        ctx.shadowBlur = 8;
            ctx.shadowColor = '#880000';
            ctx.beginPath();
            ctx.arc(particleX, particleY, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          
          // Digital corruption field
          for (let i = 0; i < 30; i++) {
            if (Math.random() < 0.6) {
              const corruptX = (Math.random() - 0.5) * (enemy.width + 80);
              const corruptY = (Math.random() - 0.5) * (enemy.height + 80);
              const corruptSize = Math.random() * 4 + 1;
              
              ctx.fillStyle = Math.random() < 0.5 ? '#ff0000' : '#000000';
              ctx.globalAlpha = 0.7;
              ctx.fillRect(corruptX, corruptY, corruptSize, corruptSize);
            }
          }
          ctx.globalAlpha = 1;
          
          // Energy discharge effects
          for (let i = 0; i < 12; i++) {
            const dischargeAngle = (i / 12) * Math.PI * 2 + time * 2;
            const dischargeLength = 60 + Math.sin(time * 8 + i) * 20;
            const electricFork = Math.sin(time * 25 + i) * 8;
            
            ctx.strokeStyle = '#ff0080';
            ctx.lineWidth = 2 + Math.sin(time * 15 + i) * 1;
          ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0080';
            ctx.globalAlpha = 0.7;
            
          ctx.beginPath();
            ctx.moveTo(Math.cos(dischargeAngle) * enemy.width/2, Math.sin(dischargeAngle) * enemy.width/2);
            ctx.lineTo(
              Math.cos(dischargeAngle) * dischargeLength + electricFork,
              Math.sin(dischargeAngle) * dischargeLength + electricFork
            );
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          
          ctx.shadowBlur = 0;
          
          // Boss health bar
          ctx.restore();
          const healthPercent = enemy.health / enemy.maxHealth;
          
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.fillRect(enemy.x - 20, enemy.y - 25, enemy.width + 40, 10);
          
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ff0000';
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(enemy.x - 20, enemy.y - 25, (enemy.width + 40) * healthPercent, 10);
          
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(enemy.x - 20, enemy.y - 25, enemy.width + 40, 10);
          
          ctx.save();
          ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
          ctx.rotate(enemy.rotation + unsettling_twitch);
          ctx.scale(enemy.scale * horror_pulse * nightmare_pulse, enemy.scale * horror_pulse * nightmare_pulse);
        } else {
          // CYBERPUNK HORROR ABOMINATIONS - unsettling digital nightmares
          ctx.shadowBlur = 25;
          ctx.shadowColor = enemyColors[enemy.type];
          
          if (enemy.type === 'fast') {
            // CYBER SPIDER - awkward spider-like horror
            ctx.fillStyle = enemyColors[enemy.type];
            
            // Central spider body (thorax)
            ctx.shadowBlur = 20;
            ctx.shadowColor = enemyColors[enemy.type];
              ctx.beginPath();
            ctx.ellipse(0, 0, enemy.width/3, enemy.height/4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Abdomen
              ctx.beginPath();
            ctx.ellipse(0, enemy.height/6, enemy.width/4, enemy.height/3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // AWKWARD SPIDER LEGS - 8 disgusting legs walking downward
            for (let i = 0; i < 8; i++) {
              const side = i < 4 ? -1 : 1; // Left or right side
              const legIndex = i % 4;
              // Adjust angles to point more downward
              const legAngle = side * (Math.PI/3 + (legIndex - 1.5) * 0.3) + Math.PI/6;
              
              // Awkward leg movement - each leg moves differently for walking down
              const walkCycle = time * 4 + i * 0.6;
              const awkwardBend = Math.sin(walkCycle) * 0.4;
              const twitch = Math.sin(time * 20 + i * 1.5) * 0.15;
              
              ctx.strokeStyle = enemyColors[enemy.type];
              ctx.lineWidth = 3;
              ctx.shadowBlur = 12;
              ctx.shadowColor = enemyColors[enemy.type];
              
              // Leg segment 1 (thigh)
              const seg1Length = 12;
              const seg1Angle = legAngle + awkwardBend + twitch;
              const seg1EndX = Math.cos(seg1Angle) * seg1Length;
              const seg1EndY = Math.sin(seg1Angle) * seg1Length;
              
              ctx.beginPath();
              ctx.moveTo(side * enemy.width/6, 0);
              ctx.lineTo(seg1EndX, seg1EndY);
              ctx.stroke();
              
              // Leg segment 2 (shin) - awkward bend
              const seg2Length = 15;
              const seg2Angle = seg1Angle + awkwardBend * 2 + Math.sin(walkCycle * 1.5 + i) * 0.5;
              const seg2EndX = seg1EndX + Math.cos(seg2Angle) * seg2Length;
              const seg2EndY = seg1EndY + Math.sin(seg2Angle) * seg2Length;
              
              ctx.beginPath();
              ctx.moveTo(seg1EndX, seg1EndY);
              ctx.lineTo(seg2EndX, seg2EndY);
              ctx.stroke();
              
              // Leg segment 3 (foot) - more awkward movement
              const seg3Length = 8;
              const seg3Angle = seg2Angle + awkwardBend + Math.sin(walkCycle * 2 + i) * 0.4;
              const seg3EndX = seg2EndX + Math.cos(seg3Angle) * seg3Length;
              const seg3EndY = seg2EndY + Math.sin(seg3Angle) * seg3Length;
              
              ctx.beginPath();
              ctx.moveTo(seg2EndX, seg2EndY);
              ctx.lineTo(seg3EndX, seg3EndY);
              ctx.stroke();
              
              // Creepy foot/claw
              ctx.fillStyle = enemyColors[enemy.type];
              ctx.beginPath();
              ctx.arc(seg3EndX, seg3EndY, 2, 0, Math.PI * 2);
              ctx.fill();
            }
            
            // Multiple spider eyes - disturbing cluster
            const eyePositions = [
              {x: -4, y: -6}, {x: 4, y: -6}, // Main eyes
              {x: -8, y: -4}, {x: 8, y: -4}, // Secondary eyes
              {x: -6, y: -2}, {x: 6, y: -2}, // Tertiary eyes
              {x: -2, y: -8}, {x: 2, y: -8}  // Top eyes
            ];
            
            eyePositions.forEach((pos, i) => {
              // Eye socket
              ctx.fillStyle = '#000000';
              ctx.shadowBlur = 8;
              ctx.shadowColor = '#000000';
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
              ctx.fill();
              
              // Glowing red iris
              ctx.fillStyle = '#ff0000';
              ctx.shadowBlur = 6;
              ctx.shadowColor = '#ff0000';
              ctx.beginPath();
              ctx.arc(
                pos.x + Math.sin(time * 8 + i) * 0.5, 
                pos.y + Math.cos(time * 6 + i) * 0.5, 
                1.5, 0, Math.PI * 2
              );
              ctx.fill();
            });
            
          } else if (enemy.type === 'tank') {
            // NEURAL HORROR - grotesque brain-machine hybrid
            ctx.fillStyle = enemyColors[enemy.type];
            
            // Central brain-like mass with disturbing folds
            ctx.shadowBlur = 25;
            ctx.shadowColor = enemyColors[enemy.type];
            ctx.beginPath();
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2;
              const brainFold = Math.sin(time * 4 + i * 0.8) * 6;
              const radius = (enemy.width/2) + brainFold;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Pulsating neural pathways - like exposed brain tissue
            for (let i = 0; i < 16; i++) {
              const pathAngle = (i / 16) * Math.PI * 2;
              const pathLength = 15 + Math.sin(time * 6 + i) * 8;
              const pulse = Math.sin(time * 8 + i * 0.3) * 3;
              
              ctx.strokeStyle = '#440044';
              ctx.lineWidth = 3 + pulse;
              ctx.shadowBlur = 12;
              ctx.shadowColor = '#440044';
              
              // Draw brain-like pathways
          ctx.beginPath();
              const startX = Math.cos(pathAngle) * 8;
              const startY = Math.sin(pathAngle) * 8;
              const endX = Math.cos(pathAngle) * pathLength;
              const endY = Math.sin(pathAngle) * pathLength;
              
              // Curved neural pathway
              ctx.moveTo(startX, startY);
              ctx.quadraticCurveTo(
                startX + (endX - startX) * 0.5 + Math.sin(time * 10 + i) * 4,
                startY + (endY - startY) * 0.5 + Math.cos(time * 12 + i) * 4,
                endX, endY
          );
          ctx.stroke();
          
              // Neural synapses - glowing dots
              ctx.fillStyle = '#ff0080';
              ctx.shadowBlur = 8;
              ctx.shadowColor = '#ff0080';
          ctx.beginPath();
              ctx.arc(endX, endY, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
            
            // Central exposed brain with gyri and sulci
            ctx.strokeStyle = '#220022';
          ctx.lineWidth = 2;
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#220022';
            
            // Draw brain folds
            for (let fold = 0; fold < 6; fold++) {
              const foldY = -enemy.height/3 + (fold * enemy.height/8);
              const waveOffset = Math.sin(time * 3 + fold) * 3;
              
            ctx.beginPath();
              ctx.moveTo(-enemy.width/3, foldY + waveOffset);
              for (let x = -enemy.width/3; x < enemy.width/3; x += 4) {
                const y = foldY + Math.sin((x + time * 20) * 0.1) * 2 + waveOffset;
                ctx.lineTo(x, y);
              }
            ctx.stroke();
            }
            
            // Multiple unblinking eyes embedded in the brain tissue
            const eyePositions = [
              {x: -8, y: -6}, {x: 8, y: -6}, {x: 0, y: 0},
              {x: -12, y: 4}, {x: 12, y: 4}
            ];
            
            eyePositions.forEach((pos, i) => {
              // JITTERY EYE GLITCHING - eyes shake and move erratically
              const eyeJitterX = Math.sin(time * 30 + i * 2.5) * 3 + Math.sin(time * 50 + i) * 2 + (Math.random() - 0.5) * 4;
              const eyeJitterY = Math.cos(time * 35 + i * 1.8) * 3 + Math.cos(time * 45 + i) * 2 + (Math.random() - 0.5) * 4;
              const eyeShakeX = Math.sin(time * 80 + i * 3) * 1.5;
              const eyeShakeY = Math.cos(time * 75 + i * 2.2) * 1.5;
              
              // Final eye position with erratic movement
              const finalEyeX = pos.x + eyeJitterX + eyeShakeX;
              const finalEyeY = pos.y + eyeJitterY + eyeShakeY;
              
              // Embedded eye socket (stays in original position)
              ctx.fillStyle = '#000000';
          ctx.shadowBlur = 15;
              ctx.shadowColor = '#000000';
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
              ctx.fill();
              
              // Bloodshot iris that jitters around the socket
              ctx.fillStyle = '#ff0000';
              ctx.shadowBlur = 10;
              ctx.shadowColor = '#ff0000';
              ctx.beginPath();
              ctx.arc(finalEyeX, finalEyeY, 3, 0, Math.PI * 2);
              ctx.fill();
              
              // Pupil that also jitters with additional chaos
              const pupilJitterX = Math.sin(time * 60 + i * 4) * 1;
              const pupilJitterY = Math.cos(time * 65 + i * 3.5) * 1;
              
              ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(
                finalEyeX + pupilJitterX, 
                finalEyeY + pupilJitterY, 
                1, 0, Math.PI * 2
              );
              ctx.fill();
            });
            
          } else {
            // GLITCH PARASITE - disgusting pixel tentacle horror
            ctx.fillStyle = enemyColors[enemy.type];
            
            // Central corrupted mass
            ctx.shadowBlur = 20;
            ctx.shadowColor = enemyColors[enemy.type];
            ctx.beginPath();
            ctx.arc(0, 0, enemy.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            // DISGUSTING GLITCHY PIXEL TENTACLES
            for (let i = 0; i < 8; i++) {
              const baseAngle = (i / 8) * Math.PI * 2;
              const tentacleLength = 25 + Math.sin(time * 5 + i) * 8;
              const segments = 8; // Pixelated segments
              
              ctx.fillStyle = enemyColors[enemy.type];
              ctx.shadowBlur = 12;
              ctx.shadowColor = enemyColors[enemy.type];
              
              // Draw pixelated tentacle segments
              for (let seg = 0; seg < segments; seg++) {
                const progress = seg / segments;
                // const nextProgress = (seg + 1) / segments;
                
                // Disgusting writhing motion
                const wiggle1 = Math.sin(time * 8 + i + seg * 0.5) * 4;
                // const wiggle2 = Math.sin(time * 10 + i + seg * 0.3) * 3;
                const glitchOffset = Math.sin(time * 30 + i + seg) * 2;
                
                const x1 = Math.cos(baseAngle) * (tentacleLength * progress) + wiggle1 + glitchOffset;
                const y1 = Math.sin(baseAngle) * (tentacleLength * progress) + wiggle1 + glitchOffset;
                // const x2 = Math.cos(baseAngle) * (tentacleLength * nextProgress) + wiggle2 + glitchOffset;
                // const y2 = Math.sin(baseAngle) * (tentacleLength * nextProgress) + wiggle2 + glitchOffset;
                
                // Pixel corruption effect
                if (Math.random() < 0.3) {
                  ctx.fillStyle = '#000000';
                } else {
                  ctx.fillStyle = enemyColors[enemy.type];
                }
                
                // Draw pixelated segment
                const segmentSize = 3 + Math.sin(time * 15 + seg) * 1;
                ctx.fillRect(x1 - segmentSize/2, y1 - segmentSize/2, segmentSize, segmentSize);
                
                // Glitch artifacts
                if (Math.random() < 0.2) {
                  ctx.fillStyle = '#ff0000';
                  ctx.fillRect(x1 + Math.random() * 4 - 2, y1 + Math.random() * 4 - 2, 2, 2);
                }
              }
            }
            
            // Central corrupted eye with digital artifacts
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#000000';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Glitched iris
            const eyeGlitch = Math.sin(time * 20) * 2;
            ctx.fillStyle = '#ff0000';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(eyeGlitch, Math.sin(time * 12) * 1, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Digital corruption pixels around eye
            for (let i = 0; i < 12; i++) {
              if (Math.random() < 0.4) {
                const pixelX = (Math.random() - 0.5) * 20;
                const pixelY = (Math.random() - 0.5) * 20;
                ctx.fillStyle = '#ff0000';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(pixelX, pixelY, 2, 2);
              }
            }
            ctx.globalAlpha = 1;
          }
          
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      });
      ctx.shadowBlur = 0;
      
      // Draw CYBERPUNK FIGHTER - edgy hacker ship
          ctx.save();
      ctx.translate(currentState.player.x + currentState.player.width/2, currentState.player.y + currentState.player.height/2);
      
      if (currentState.player.invulnerable > 0) {
        ctx.globalAlpha = Math.sin(currentState.player.invulnerable * 0.02) * 0.5 + 0.5;
      }
      
      const shipColor = currentState.powerupEffects.shield > 0 ? '#0099ff' : '#00ff41';
      const ship_pulse = Math.sin(time * 10) * 0.1 + 1;
      ctx.scale(ship_pulse, ship_pulse);
      
      // Ship glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = shipColor;
      ctx.fillStyle = shipColor;
      
      // Main ship body - angular cyberpunk design
      ctx.beginPath();
      ctx.moveTo(0, -currentState.player.height/2);              // Top point
      ctx.lineTo(-currentState.player.width/3, -currentState.player.height/4); // Left upper
      ctx.lineTo(-currentState.player.width/2, currentState.player.height/2);  // Left bottom
      ctx.lineTo(-currentState.player.width/4, currentState.player.height/3);  // Left inner
      ctx.lineTo(0, currentState.player.height/4);                            // Center notch
      ctx.lineTo(currentState.player.width/4, currentState.player.height/3);   // Right inner
      ctx.lineTo(currentState.player.width/2, currentState.player.height/2);   // Right bottom
      ctx.lineTo(currentState.player.width/3, -currentState.player.height/4);  // Right upper
      ctx.closePath();
      ctx.fill();
      
      // Inner core with brighter glow
          ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -currentState.player.height/3);
      ctx.lineTo(-currentState.player.width/4, 0);
      ctx.lineTo(0, currentState.player.height/6);
      ctx.lineTo(currentState.player.width/4, 0);
      ctx.closePath();
      ctx.fill();
      
      // Engine thrusters
      ctx.fillStyle = shipColor;
      ctx.shadowBlur = 15;
      for (let i = 0; i < 3; i++) {
        const thrusterY = currentState.player.height/2 + i * 8;
        const thrusterWidth = 6 - i * 1.5;
        ctx.fillRect(-thrusterWidth/2, thrusterY, thrusterWidth, 4);
      }
      
      // Side weapons (if multishot)
      if (currentState.powerupEffects.multishot > 0) {
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 8;
        ctx.fillRect(-currentState.player.width/2 - 3, -currentState.player.height/4, 6, 3);
        ctx.fillRect(currentState.player.width/2 - 3, -currentState.player.height/4, 6, 3);
      }
      
          ctx.restore();
      
      // SHIELD VISUAL EFFECT
      if (currentState.powerupEffects.shield > 0) {
        ctx.save();
        ctx.translate(currentState.player.x + currentState.player.width/2, currentState.player.y + currentState.player.height/2);
        
        const shieldPulse = Math.sin(time * 8) * 0.3 + 0.7;
        const shieldRadius = 25;
        
        // Shield barrier effect
        ctx.strokeStyle = '#0099ff';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0099ff';
        ctx.globalAlpha = shieldPulse;
        
        // Draw hexagonal shield
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * shieldRadius;
          const y = Math.sin(angle) * shieldRadius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
        ctx.globalAlpha = 1;
      }
      
      ctx.shadowBlur = 0;
      
      // HARDCORE CYBERPUNK HUD - glitchy and edgy
      const hudGlitch = currentState.screenShake > 0 ? Math.sin(time * 30) * 2 : 0;
      const textGlitch = Math.sin(time * 25) * 1;
      
      // HUD background corruption
      ctx.fillStyle = 'rgba(255, 0, 100, 0.05)';
      ctx.fillRect(0, 0, 200, 90);
      
      ctx.fillStyle = '#00ff41';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';
        ctx.shadowBlur = 12;
      ctx.shadowColor = '#00ff41';
      ctx.fillText(`[SCORE]${currentState.score}`, 10 + hudGlitch + textGlitch, 25);
      ctx.fillText(`[LVL]${currentState.level}`, 10 + hudGlitch + textGlitch, 45);
      
      // Lives with dangerous symbols
      ctx.fillStyle = '#ff0099';
      ctx.shadowColor = '#ff0099';
      let livesStr = '[HP]';
      for (let i = 0; i < currentState.player.lives; i++) {
        livesStr += '◆';
      }
      ctx.fillText(livesStr, 10 + hudGlitch + textGlitch, 65);
      
      if (highScoreRef.current > 0) {
        ctx.fillText(`High: ${highScoreRef.current}`, 10, 85);
      }
      
      // Power-up status indicators
      let powerupY = 25;
      if (currentState.powerupEffects.multishot > 0) {
        ctx.fillStyle = '#00ff00';
        ctx.fillText('MULTISHOT', CANVAS_WIDTH - 120, powerupY);
        powerupY += 20;
      }
      if (currentState.powerupEffects.shield > 0) {
        ctx.fillStyle = '#0088ff';
        ctx.fillText('SHIELD', CANVAS_WIDTH - 120, powerupY);
        powerupY += 20;
      }
      if (currentState.powerupEffects.slowtime > 0) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillText('SLOW TIME', CANVAS_WIDTH - 120, powerupY);
        powerupY += 20;
      }
      if (currentState.powerupEffects.rapid > 0) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('RAPID FIRE', CANVAS_WIDTH - 120, powerupY);
        powerupY += 20;
      }
      
      // Combo display with epic glow
      if (currentState.combo > 1) {
        ctx.fillStyle = '#f07e41';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#f07e41';
        ctx.shadowBlur = 8;
        ctx.fillText(`${currentState.combo}x COMBO!`, HALF_CANVAS_WIDTH, 80);
        
        if (currentState.multiplier > 1) {
          ctx.fillStyle = '#00ff00';
          ctx.fillText(`${currentState.multiplier}x MULTIPLIER!`, HALF_CANVAS_WIDTH, 110);
        }
      }
      
      ctx.shadowBlur = 0;
    }
    
    // Game states with epic glow
    if (currentState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
      ctx.fillStyle = '#f07e41';
      ctx.font = '28px monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
        ctx.shadowColor = '#f07e41';
      ctx.fillText('GAME OVER', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 40);
      ctx.font = '18px monospace';
      ctx.fillText(`Score: ${currentState.score}`, HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 10);
      
      if (currentState.score > highScoreRef.current) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.fillText('NEW HIGH SCORE!', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 15);
      } else if (highScoreRef.current > 0) {
        ctx.fillStyle = '#888888';
        ctx.shadowBlur = 3;
        ctx.fillText(`High: ${highScoreRef.current}`, HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 15);
      }
      
        ctx.fillStyle = '#f07e41';
      ctx.shadowColor = '#f07e41';
      ctx.fillText('Press SPACE to restart', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 50);
    } else if (currentState.gameWon) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '32px monospace';
        ctx.textAlign = 'center';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff00';
      ctx.fillText('VICTORY!', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 60);
      
      ctx.fillStyle = '#f07e41';
        ctx.font = '20px monospace';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f07e41';
      ctx.fillText('CYBER GUARDIAN ACTIVATED!', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 30);
      
      ctx.font = '18px monospace';
      ctx.fillText(`Final Score: ${currentState.score}`, HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT);
      
      if (currentState.score > highScoreRef.current) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.fillText('NEW HIGH SCORE!', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 25);
      }
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.shadowBlur = 3;
      ctx.fillText('The city is safe. You are the ultimate defender.', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 60);
      ctx.fillText('Press SPACE to play again', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 85);
    } else if (!currentState.gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#f07e41';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f07e41';
      ctx.fillText('CYBER DEFENDER', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 60);
      ctx.font = '16px monospace';
      ctx.shadowBlur = 6;
      ctx.fillText('Press SPACE to start', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 30);
      ctx.fillText('← → / A D to move, SPACE to shoot', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT - 10);
      
      ctx.fillStyle = '#888888';
      ctx.shadowBlur = 3;
      ctx.fillText('Collect power-ups • Defeat the boss on level 5', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 20);
      ctx.fillText('Power-ups: Multishot • Shield • Slow Time • Rapid Fire • Health', HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 40);
      
      if (highScoreRef.current > 0) {
        ctx.fillStyle = '#f07e41';
        ctx.shadowColor = '#f07e41';
        ctx.fillText(`High Score: ${highScoreRef.current}`, HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT + 70);
      }
    }
    
    // Final cyberpunk glitch effects
    if (currentState.screenShake > 0) {
      // RGB shift effect
      const shift = Math.sin(time * 50) * 3;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgba(255, 0, 0, 0.1)`;
      ctx.fillRect(-shift, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = `rgba(0, 255, 0, 0.1)`;
      ctx.fillRect(shift, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalCompositeOperation = 'source-over';
      
      // Digital noise lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = Math.random() * CANVAS_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.shadowBlur = 0;
  }, []);

  // ULTRA-OPTIMIZED UPDATE FUNCTION
  const updateGameLoop = useCallback((currentTime: number) => {
    const deltaTime = Math.min(currentTime - lastTimeRef.current, 33.33);
    lastTimeRef.current = currentTime;
    
    // Performance debugging
    const startTime = performance.now();
    
    updateGame(deltaTime);
    
    if (contextRef.current) {
      render(contextRef.current);
    }
    
    // Log performance if it's bad
    const frameTime = performance.now() - startTime;
    if (frameTime > 16) { // Over 60 FPS budget
      console.warn(`Slow frame: ${frameTime.toFixed(2)}ms (should be <16ms for 60fps)`);
    }
    
    animationRef.current = requestAnimationFrame(updateGameLoop);
  }, [updateGame, render]);

  // Setup and cleanup - CRITICAL: Fix device pixel ratio performance issue
  useEffect(() => {
    if (!isVisible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // CRITICAL FIX: Handle device pixel ratio properly for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
    const displayWidth = CANVAS_WIDTH;
    const displayHeight = CANVAS_HEIGHT;
    
    // Set actual canvas size in memory (scaled for DPI)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // Set CSS size (what user sees)
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Canvas setup complete
    
    canvas.focus();
    
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });
    
    if (!ctx) return;
    
    // Scale the drawing context so everything draws at the right size
    ctx.scale(dpr, dpr);
    
    // Cache the context in component-level ref
    contextRef.current = ctx;
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Start game loop
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(updateGameLoop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear cached context on cleanup
      contextRef.current = null;
    };
  }, [isVisible, handleKeyDown, handleKeyUp, updateGameLoop]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        >
          <div className="relative bg-cyber-black p-6 rounded-lg border-2 border-primary max-w-fit max-h-fit">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-primary text-xl"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-cyber text-primary mb-4 neon-text">Cyber Defender</h2>
            
            <canvas
              ref={canvasRef}
              className="border-2 border-primary rounded-lg focus:outline-none bg-black block"
              style={{ 
                width: '800px',
                height: '600px',
                imageRendering: 'pixelated',
                display: 'block',
                margin: '0 auto'
              }}
              tabIndex={0}
            />
            
            {/* Mobile Controls */}
            <div className="block md:hidden mt-4">
              {/* Game Control Buttons */}
              <div className="flex justify-center gap-4 mb-4">
                {(!state.gameStarted && !state.gameOver && !state.gameWon) && (
                  <button
                    onTouchStart={(e) => { e.preventDefault(); handleMobileAction('start'); }}
                    onClick={() => handleMobileAction('start')}
                    className="px-6 py-3 bg-primary text-black font-bold rounded-lg border-2 border-primary hover:bg-primary/80 transition-colors font-cyber"
                  >
                    START GAME
                  </button>
                )}
                
                {(state.gameOver || state.gameWon) && (
                  <button
                    onTouchStart={(e) => { e.preventDefault(); handleMobileAction('restart'); }}
                    onClick={() => handleMobileAction('restart')}
                    className="px-6 py-3 bg-primary text-black font-bold rounded-lg border-2 border-primary hover:bg-primary/80 transition-colors font-cyber"
                  >
                    RESTART
                  </button>
                )}
              </div>
              
              {/* Movement and Shooting Controls */}
              {state.gameStarted && !state.gameOver && !state.gameWon && (
                <div className="flex justify-between items-center max-w-md mx-auto">
                  {/* Movement Buttons */}
                  <div className="flex gap-2">
                    <button
                      onTouchStart={(e) => { 
                        e.preventDefault(); 
                        setMobileControls(prev => ({ ...prev, moveLeft: true }));
                      }}
                      onTouchEnd={(e) => { 
                        e.preventDefault(); 
                        setMobileControls(prev => ({ ...prev, moveLeft: false }));
                      }}
                      onMouseDown={() => setMobileControls(prev => ({ ...prev, moveLeft: true }))}
                      onMouseUp={() => setMobileControls(prev => ({ ...prev, moveLeft: false }))}
                      onMouseLeave={() => setMobileControls(prev => ({ ...prev, moveLeft: false }))}
                      className={`w-16 h-16 rounded-lg border-2 font-bold text-xl transition-colors font-cyber ${
                        mobileControls.moveLeft 
                          ? 'bg-primary text-black border-primary' 
                          : 'bg-cyber-black text-primary border-primary hover:bg-primary/20'
                      }`}
                    >
                      ←
                    </button>
                    <button
                      onTouchStart={(e) => { 
                        e.preventDefault(); 
                        setMobileControls(prev => ({ ...prev, moveRight: true }));
                      }}
                      onTouchEnd={(e) => { 
                        e.preventDefault(); 
                        setMobileControls(prev => ({ ...prev, moveRight: false }));
                      }}
                      onMouseDown={() => setMobileControls(prev => ({ ...prev, moveRight: true }))}
                      onMouseUp={() => setMobileControls(prev => ({ ...prev, moveRight: false }))}
                      onMouseLeave={() => setMobileControls(prev => ({ ...prev, moveRight: false }))}
                      className={`w-16 h-16 rounded-lg border-2 font-bold text-xl transition-colors font-cyber ${
                        mobileControls.moveRight 
                          ? 'bg-primary text-black border-primary' 
                          : 'bg-cyber-black text-primary border-primary hover:bg-primary/20'
                      }`}
                    >
                      →
                    </button>
                  </div>
                  
                  {/* Shoot Button */}
                  <button
                    onTouchStart={(e) => { e.preventDefault(); handleMobileAction('shoot'); }}
                    onClick={() => handleMobileAction('shoot')}
                    className="w-20 h-16 bg-red-600 text-white font-bold rounded-lg border-2 border-red-600 hover:bg-red-700 transition-colors font-cyber"
                  >
                    FIRE
                  </button>
                </div>
              )}
            </div>
            
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