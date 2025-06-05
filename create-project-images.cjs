const fs = require('fs');
const path = require('path');

// Simple SVG placeholder generator
function generateProjectImage(title, category) {
  const svg = `<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(240,126,65,0.1)" stroke-width="1"/>
      </pattern>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="800" height="450" fill="#0a0a0a"/>
    
    <!-- Grid -->
    <rect width="800" height="450" fill="url(#grid)"/>
    
    <!-- Glitch rectangles -->
    <rect x="100" y="200" width="80" height="3" fill="rgba(240,126,65,0.3)"/>
    <rect x="300" y="150" width="120" height="2" fill="rgba(240,126,65,0.2)"/>
    <rect x="500" y="300" width="60" height="4" fill="rgba(240,126,65,0.4)"/>
    
    <!-- Category badge -->
    <rect x="20" y="20" width="100" height="30" fill="rgba(240,126,65,0.2)" rx="5"/>
    <text x="70" y="40" text-anchor="middle" fill="#f07e41" font-family="monospace" font-size="14">${category}</text>
    
    <!-- Main title -->
    <text x="400" y="225" text-anchor="middle" fill="#f07e41" font-family="monospace" font-size="32" filter="url(#glow)">${title}</text>
    
    <!-- Cyberpunk lines -->
    <line x1="0" y1="400" x2="800" y2="400" stroke="rgba(240,126,65,0.3)" stroke-width="2"/>
    <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(240,126,65,0.2)" stroke-width="1"/>
  </svg>`;
  
  return svg;
}

// Project configurations
const projects = [
  { name: 'nok-sound.svg', title: 'NOK Sound System', category: 'Unity' },
  { name: 'scene-loader.svg', title: 'Scene Loader', category: 'Unity' },
  { name: 'scriptable-reset.svg', title: 'Scriptable Reset', category: 'Unity' },
  { name: 'editor-snapping.svg', title: 'Editor Snapping', category: 'Unity' },
  { name: 'proximity-chat.svg', title: 'Proximity Chat', category: 'Unity' },
  { name: 'cognition.svg', title: 'Cognition', category: 'Unity' },
  { name: 'broken-glass.svg', title: 'Broken Glass', category: 'Unreal' },
  { name: 'scalien.svg', title: 'Scalien', category: 'Unreal' },
  { name: 'furbys.svg', title: 'Five Nights Furbys', category: 'Unreal' },
  { name: 'baboonworks.svg', title: 'BaboonWorks', category: 'Unity' }
];

// Create projects directory if it doesn't exist
const projectsDir = path.join(__dirname, 'public', 'projects');
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

// Generate SVG images
projects.forEach(project => {
  const svgContent = generateProjectImage(project.title, project.category);
  const filePath = path.join(projectsDir, project.name);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated: ${project.name}`);
});

console.log('\n✅ Generated placeholder images for all projects!');
console.log('📝 Replace these SVG files with your actual JPG images when ready.');
console.log('📁 Location: public/projects/'); 