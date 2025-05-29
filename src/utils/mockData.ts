import { Project } from './types';

export const projects: Project[] = [
  {
    id: 'scene-loader',
    title: 'Advanced Scene Loader',
    engine: 'Unity',
    tools: ['C#', 'Unity', 'Addressables', 'Custom Editor Tools'],
    description: 'A robust scene loading system with async loading, object pooling, and memory management.',
    contributions: [
      'Implemented async scene loading with progress tracking',
      'Created custom editor tools for scene management',
      'Optimized memory usage with object pooling',
      'Added support for additive scene loading'
    ],
    mediaType: 'gif',
    mediaUrl: '/assets/projects/scene-loader.gif',
    repoUrl: 'https://github.com/username/scene-loader'
  },
  {
    id: 'audio-system',
    title: 'Dynamic Audio System',
    engine: 'Unreal',
    tools: ['C++', 'Unreal Engine', 'FMOD', 'Blueprints'],
    description: 'A comprehensive audio management system with dynamic mixing and spatial audio.',
    contributions: [
      'Developed modular audio system architecture',
      'Integrated FMOD for advanced audio features',
      'Created Blueprint interface for designers',
      'Implemented dynamic audio mixing based on gameplay states'
    ],
    mediaType: 'video',
    mediaUrl: '/assets/projects/audio-system.mp4',
    repoUrl: 'https://github.com/username/audio-system'
  },
  {
    id: 'combat-system',
    title: 'Action Combat System',
    engine: 'Unity',
    tools: ['C#', 'Unity', 'Animation Rigging', 'DOTween'],
    description: 'A flexible combat system with combo chains, hit detection, and damage systems.',
    contributions: [
      'Designed modular ability system',
      'Implemented hit detection and damage calculation',
      'Created combo system with animation canceling',
      'Added visual effects and camera shake'
    ],
    mediaType: 'gif',
    mediaUrl: '/assets/projects/combat.gif',
    projectUrl: 'https://itch.io/username/combat-demo'
  },
  {
    id: 'inventory-system',
    title: 'Inventory Framework',
    engine: 'Unreal',
    tools: ['C++', 'Unreal Engine', 'UMG', 'Blueprints'],
    description: 'A flexible inventory system with drag-and-drop UI, item stacking, and crafting.',
    contributions: [
      'Developed core inventory logic in C++',
      'Created responsive UI with UMG',
      'Implemented item crafting system',
      'Added save/load functionality'
    ],
    mediaType: 'image',
    mediaUrl: '/assets/projects/inventory.png',
    repoUrl: 'https://github.com/username/inventory'
  },
  {
    id: 'procedural-gen',
    title: 'Procedural Level Generator',
    engine: 'Unity',
    tools: ['C#', 'Unity', 'Custom Editor Tools'],
    description: 'A procedural level generation system with customizable rules and constraints.',
    contributions: [
      'Implemented Wave Function Collapse algorithm',
      'Created custom editor for rule definition',
      'Added support for multiple biomes',
      'Optimized generation performance'
    ],
    mediaType: 'gif',
    mediaUrl: '/assets/projects/proc-gen.gif',
    repoUrl: 'https://github.com/username/proc-gen'
  },
  {
    id: 'ai-system',
    title: 'Behavior Tree AI System',
    engine: 'Unreal',
    tools: ['C++', 'Unreal Engine', 'Behavior Trees', 'EQS'],
    description: 'An advanced AI system using behavior trees and environment queries.',
    contributions: [
      'Designed modular behavior tree tasks',
      'Implemented custom EQS queries',
      'Created debug visualization tools',
      'Optimized AI performance for large groups'
    ],
    mediaType: 'video',
    mediaUrl: '/assets/projects/ai-system.mp4',
    projectUrl: 'https://itch.io/username/ai-demo'
  }
]; 