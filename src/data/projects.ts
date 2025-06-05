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
    id: 'nok-sound-system',
    title: 'NOK - Advanced Sound System',
    description: 'Developed a comprehensive sound system for NOK, a physics-based sandbox hidden object game. The system features dynamic audio mixing, spatial audio, and interactive sound effects.',
    thumbnail: '/projects/nok-sound.jpg',
    category: 'Unity',
    tags: ['Audio Programming', 'Game Development', 'Unity Package'],
    systems: [
      {
        name: 'Dynamic Sound System',
        description: 'Custom sound management system with dynamic mixing and spatial audio capabilities.',
        techStack: ['C#', 'Unity Audio System', 'BaboonWorks Package'],
        features: [
          'Dynamic audio mixing',
          'Spatial audio implementation',
          'Interactive sound effects',
          'Custom audio package development'
        ]
      }
    ]
  },
  {
    id: 'scene-loader',
    title: 'Advanced Scene Loader',
    description: 'A robust scene loading framework with async loading, object pooling, and memory management. Part of the BaboonWorks Unity package.',
    thumbnail: '/projects/scene-loader.svg',
    category: 'Unity',
    tags: ['Tool Development', 'Performance', 'Memory Management'],
    systems: [
      {
        name: 'Scene Management System',
        description: 'Advanced scene loading and management system with performance optimizations.',
        techStack: ['Unity', 'C#', 'Async Operations'],
        features: [
          'Asynchronous scene loading',
          'Object pooling system',
          'Memory management',
          'Loading screen integration',
          'Progress tracking',
          'Scene transition effects'
        ]
      }
    ]
  },
  {
    id: 'scriptable-reset',
    title: 'Scriptable Object Reset Tool',
    description: 'An editor tool for managing and resetting ScriptableObject values during builds, ensuring consistent behavior across development and production.',
    thumbnail: '/projects/nok-sound.jpg',
    category: 'Unity',
    tags: ['Editor Tools', 'Workflow', 'Build Management'],
    systems: [
      {
        name: 'Value Management System',
        description: 'Comprehensive system for tracking and resetting ScriptableObject values.',
        techStack: ['Unity Editor', 'C#', 'ScriptableObjects'],
        features: [
          'Value persistence tracking',
          'Build-time value reset',
          'Custom reset configurations',
          'Editor integration',
          'Value history management',
          'Batch processing'
        ]
      }
    ]
  },
  {
    id: 'editor-snapping',
    title: 'Editor Snapping Tool',
    description: 'A precision object placement tool for the Unity Editor, making level design and object placement more efficient.',
    thumbnail: '/projects/nok-sound.jpg',
    category: 'Unity',
    tags: ['Editor Tools', 'Level Design', 'Workflow'],
    systems: [
      {
        name: 'Snapping System',
        description: 'Advanced object placement and alignment system for the Unity Editor.',
        techStack: ['Unity Editor', 'C#', 'Editor Tools'],
        features: [
          'Floor snapping',
          'Surface alignment',
          'Grid-based placement',
          'Custom snap points',
          'Editor integration',
          'Multi-object alignment'
        ]
      }
    ]
  },
  {
    id: 'proximity-chat',
    title: 'Photon Proximity Chat',
    description: 'A multiplayer proximity chat system built with Photon, enabling spatial voice communication in games.',
    thumbnail: '/projects/proximity-chat.svg',
    category: 'Unity',
    tags: ['Multiplayer', 'Networking', 'Voice Chat'],
    systems: [
      {
        name: 'Proximity Voice System',
        description: 'Real-time voice communication system with distance-based audio attenuation.',
        techStack: ['Photon', 'Unity', 'Voice SDK'],
        features: [
          'Spatial voice chat',
          'Distance-based audio',
          'Multiplayer integration',
          'Custom voice filters'
        ]
      }
    ],
    githubUrl: 'https://github.com/NerdMonkeys/photon-third-person-mp.git'
  },
  {
    id: 'cognition-redcross',
    title: 'Cognition - Red Cross Project',
    description: 'Developed puzzle and session logic for an educational project aimed at elderly care, commissioned by the Portuguese Red Cross.',
    thumbnail: '/projects/cognition.jpg',
    category: 'Unity',
    tags: ['Educational', 'Healthcare', 'Puzzle Design'],
    systems: [
      {
        name: 'Pipe Logic Puzzle',
        description: 'Interactive puzzle system designed for cognitive training.',
        techStack: ['Unity', 'C#'],
        features: [
          'Custom puzzle mechanics',
          'Session management',
          'Progress tracking',
          'Accessibility features'
        ]
      },
      {
        name: 'Session Management',
        description: 'Comprehensive session handling system for tracking user progress and engagement.',
        techStack: ['Unity', 'C#'],
        features: [
          'User progress tracking',
          'Session persistence',
          'Data analytics',
          'Customizable difficulty'
        ]
      }
    ]
  },
  {
    id: 'broken-glass',
    title: 'Broken Glass',
    description: 'An impactful anti-drug PSA game developed in Unreal Engine, exploring themes of substance abuse and its consequences.',
    thumbnail: '/projects/broken-glass.jpg',
    category: 'Unreal Engine',
    tags: ['Serious Games', 'Visual Novel', 'PSX Style'],
    systems: [
      {
        name: 'Narrative System',
        description: 'Branching narrative system with emotional storytelling.',
        techStack: ['Unreal Engine', 'Blueprints'],
        features: [
          'Branching dialogue',
          'Emotional storytelling',
          'PSX-style graphics',
          'Content warning system'
        ]
      }
    ],
    demoUrl: 'https://sssodium.itch.io/broken-glass'
  },
  {
    id: 'scalien',
    title: 'Scalien - GMTK Game Jam 2024',
    description: 'A unique game about scaling animals to objects, created for the GMTK Game Jam 2024.',
    thumbnail: '/projects/scalien.jpg',
    category: 'Unreal Engine',
    tags: ['Game Jam', 'Physics', 'Puzzle'],
    systems: [
      {
        name: 'Scaling System',
        description: 'Physics-based scaling system for animals and objects.',
        techStack: ['Unreal Engine', 'Blueprints'],
        features: [
          'Dynamic scaling mechanics',
          'Physics interactions',
          'Reference-based puzzles',
          'Quick iteration system'
        ]
      }
    ],
    demoUrl: 'https://itch.io/jam/gmtk-2024/rate/2915721'
  },
  {
    id: 'five-nights-furbys',
    title: 'Five Nights at Furbys',
    description: 'A horror game created for the Hagenberg Game Jam, featuring Furbys in a Five Nights at Freddy\'s style setting.',
    thumbnail: '/projects/furbys.jpg',
    category: 'Unreal Engine',
    tags: ['Horror', 'Game Jam', 'AI Behavior'],
    systems: [
      {
        name: 'AI Behavior System',
        description: 'Advanced AI system for Furby behavior and movement patterns.',
        techStack: ['Unreal Engine', 'Blueprints'],
        features: [
          'Pathfinding AI',
          'Behavior trees',
          'Dynamic difficulty',
          'Horror mechanics'
        ]
      }
    ],
    githubUrl: 'https://github.com/saitayme/Five-Nights-At-Furbys.git'
  }
];

// Secret projects only revealed through Konami code
export const secretProjects: Project[] = [
  {
    id: 'baboonworks-package',
    title: 'BaboonWorks Unity Package',
    description: 'A comprehensive Unity package containing various tools and systems for game development, including advanced scene loading, editor utilities, and audio systems.',
    thumbnail: '/projects/baboonworks.svg',
    category: 'Unity',
    tags: ['Unity Package', 'Tool Development', 'Game Systems', 'Editor Tools'],
    isSecret: true,
    systems: [
      {
        name: 'Advanced Scene Loader',
        description: 'Robust scene loading framework with async loading, object pooling, and memory management.',
        techStack: ['Unity', 'C#', 'Async Operations'],
        features: [
          'Asynchronous scene loading',
          'Object pooling system',
          'Memory management',
          'Loading screen integration',
          'Progress tracking'
        ]
      },
      {
        name: 'Scriptable Object Reset Tool',
        description: 'Editor tool for managing and resetting ScriptableObject values during builds.',
        techStack: ['Unity Editor', 'C#', 'ScriptableObjects'],
        features: [
          'Value persistence tracking',
          'Build-time value reset',
          'Custom reset configurations',
          'Editor integration',
          'Value history management'
        ]
      },
      {
        name: 'Editor Snapping Tool',
        description: 'Precision object placement tool for the Unity Editor.',
        techStack: ['Unity Editor', 'C#', 'Editor Tools'],
        features: [
          'Floor snapping',
          'Surface alignment',
          'Grid-based placement',
          'Custom snap points',
          'Editor integration'
        ]
      },
      {
        name: 'Dynamic Sound System',
        description: 'Advanced audio management system with dynamic mixing and spatial audio.',
        techStack: ['Unity', 'C#', 'Audio System'],
        features: [
          'Dynamic audio mixing',
          'Spatial audio implementation',
          'Interactive sound effects',
          'Audio pooling',
          'Custom audio package development'
        ]
      }
    ]
  }
]; 