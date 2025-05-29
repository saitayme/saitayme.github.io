const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const projectImages = [
  { name: 'dungeon-gen.jpg', text: 'Procedural Dungeon Generator' },
  { name: 'ai-director.jpg', text: 'Dynamic AI Director' },
  { name: 'shaders.jpg', text: 'Advanced Shader Collection' },
  { name: 'secret-ai.jpg', text: 'Experimental AI Framework' }
];

const width = 800;
const height = 450;

// Create projects directory if it doesn't exist
const projectsDir = path.join(__dirname, '../public/projects');
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

// Generate images
projectImages.forEach(({ name, text }) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Grid pattern
  ctx.strokeStyle = 'rgba(240, 126, 65, 0.1)';
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x < width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Random glitch rectangles
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 50 + Math.random() * 100;
    const h = 2 + Math.random() * 10;
    const alpha = 0.1 + Math.random() * 0.2;
    
    ctx.fillStyle = `rgba(240, 126, 65, ${alpha})`;
    ctx.fillRect(x, y, w, h);
  }

  // Text
  ctx.font = '40px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Text shadow (glow effect)
  ctx.shadowColor = '#f07e41';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#f07e41';
  ctx.fillText(text, width / 2, height / 2);

  // Save image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(projectsDir, name), buffer);
});

console.log('Generated placeholder images in public/projects/'); 