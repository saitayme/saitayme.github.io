interface ProjectSystem {
  name: string;
  description: string;
  techStack: string[];
  features: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: 'Unity' | 'Unreal Engine';
  tags: string[];
  isSecret?: boolean;
  systems: ProjectSystem[];
  demoUrl?: string;
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'procedural-dungeon',
    title: 'Procedural Dungeon Generator',
    description: 'A highly customizable procedural dungeon generation system with room-based layouts, corridors, and environment decoration.',
    thumbnail: '/projects/dungeon-gen.jpg',
    category: 'Unity',
    tags: ['Procedural Generation', 'Level Design', 'Tool Development'],
    systems: [
      {
        name: 'Room Generation System',
        description: 'Generates rooms with customizable sizes and features using cellular automata.',
        techStack: ['C#', 'Unity Editor Tools'],
        features: [
          'Room size constraints',
          'Custom room templates',
          'Cellular automata for organic shapes'
        ]
      },
      {
        name: 'Corridor System',
        description: 'Creates pathways between rooms using A* pathfinding.',
        techStack: ['A* Pathfinding', 'Delaunay Triangulation'],
        features: [
          'Multiple corridor styles',
          'Optimal path generation',
          'Door placement'
        ]
      }
    ]
  },
  {
    id: 'ai-director',
    title: 'Dynamic AI Director',
    description: 'An advanced AI system that dynamically adjusts game difficulty and spawns enemies based on player performance.',
    thumbnail: '/projects/ai-director.jpg',
    category: 'Unreal Engine',
    tags: ['AI Systems', 'Game Balance', 'Blueprint Development'],
    systems: [
      {
        name: 'Performance Analysis',
        description: 'Tracks and analyzes player performance metrics in real-time.',
        techStack: ['C++', 'Blueprints'],
        features: [
          'Health tracking',
          'Combat efficiency scoring',
          'Resource management analysis'
        ]
      },
      {
        name: 'Dynamic Spawning',
        description: 'Intelligently spawns enemies and resources based on current game state.',
        techStack: ['Behavior Trees', 'EQS'],
        features: [
          'Smart spawn point selection',
          'Enemy type variation',
          'Resource distribution'
        ]
      }
    ]
  },
  {
    id: 'shader-collection',
    title: 'Advanced Shader Collection',
    description: 'A comprehensive collection of custom shaders for various visual effects and material systems.',
    thumbnail: '/projects/shaders.jpg',
    category: 'Unity',
    tags: ['Graphics Programming', 'Optimization', 'Visual Effects'],
    systems: [
      {
        name: 'Environment Shaders',
        description: 'Custom shaders for environmental effects and materials.',
        techStack: ['HLSL', 'ShaderLab'],
        features: [
          'Dynamic snow accumulation',
          'Realistic water simulation',
          'Vertex displacement effects'
        ]
      },
      {
        name: 'Character Shaders',
        description: 'Specialized shaders for character rendering and effects.',
        techStack: ['HLSL', 'Amplify Shader Editor'],
        features: [
          'Subsurface scattering',
          'Dynamic dissolve effects',
          'Holographic projections'
        ]
      }
    ]
  }
];

// Secret projects only revealed through Konami code
export const secretProjects: Project[] = [
  {
    id: 'experimental-ai',
    title: 'Experimental AI Framework',
    description: 'A cutting-edge AI framework exploring advanced behavior systems and procedural animation.',
    thumbnail: '/projects/secret-ai.jpg',
    category: 'Unity',
    tags: ['AI Research', 'Procedural Animation', 'Machine Learning'],
    isSecret: true,
    systems: [
      {
        name: 'Neural Network System',
        description: 'Custom neural network implementation for character behavior.',
        techStack: ['Python', 'TensorFlow', 'Unity ML-Agents'],
        features: [
          'Behavior learning',
          'Real-time adaptation',
          'Performance optimization'
        ]
      },
      {
        name: 'Procedural Animation',
        description: 'Dynamic animation system using inverse kinematics and physics.',
        techStack: ['Animation Rigging', 'Physics System'],
        features: [
          'Dynamic movement adaptation',
          'Environmental interaction',
          'Realistic weight distribution'
        ]
      }
    ]
  }
]; 