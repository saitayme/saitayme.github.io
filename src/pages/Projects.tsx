import { useState } from 'react';
import { DiUnitySmall } from 'react-icons/di';
import { SiUnrealengine } from 'react-icons/si';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import { Project } from '@/utils/types';
import { projects, secretProjects } from '../data/projects';
import InteractiveBackground from '@/components/InteractiveBackground';

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Unity' | 'Unreal Engine'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showSecretProjects, setShowSecretProjects] = useState(false);

  // Handle Konami code completion
  useKonamiCode(() => {
    setShowSecretProjects(true);
  });

  // Combine regular and secret projects if revealed
  const allProjects = [...projects, ...(showSecretProjects ? secretProjects : [])];

  // Filter projects by category
  const filteredProjects = selectedCategory === 'all'
    ? allProjects
    : allProjects.filter(project => project.category === selectedCategory);

  return (
    <div className="min-h-screen py-24 relative">
      <InteractiveBackground variant="particles" intensity="medium" />
      {/* Background Effects */}
      <div className="scanline" />

      <div className="cyber-container">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-cyber text-white mb-4 neon-text">
            Projects
          </h1>
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-primary">
              <DiUnitySmall className="text-2xl" />
              <span className="font-mono">Unity</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <SiUnrealengine className="text-2xl" />
              <span className="font-mono">Unreal Engine</span>
            </div>
          </div>
          {showSecretProjects && (
            <div className="text-primary font-mono text-sm mb-4">
              Secret projects unlocked! 🔓
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-md font-cyber text-sm transition-all duration-300
              ${selectedCategory === 'all' 
                ? 'bg-primary text-cyber-black shadow-[0_0_15px_rgba(240,126,65,0.5)]' 
                : 'bg-cyber-black text-primary border-2 border-primary/30 hover:border-primary hover:shadow-[0_0_10px_rgba(240,126,65,0.3)]'
              }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setSelectedCategory('Unity')}
            className={`px-6 py-2 rounded-md font-cyber text-sm transition-all duration-300
              ${selectedCategory === 'Unity' 
                ? 'bg-primary text-cyber-black shadow-[0_0_15px_rgba(240,126,65,0.5)]' 
                : 'bg-cyber-black text-primary border-2 border-primary/30 hover:border-primary hover:shadow-[0_0_10px_rgba(240,126,65,0.3)]'
              }`}
          >
            Unity
          </button>
          <button
            onClick={() => setSelectedCategory('Unreal Engine')}
            className={`px-6 py-2 rounded-md font-cyber text-sm transition-all duration-300
              ${selectedCategory === 'Unreal Engine' 
                ? 'bg-primary text-cyber-black shadow-[0_0_15px_rgba(240,126,65,0.5)]' 
                : 'bg-cyber-black text-primary border-2 border-primary/30 hover:border-primary hover:shadow-[0_0_10px_rgba(240,126,65,0.3)]'
              }`}
          >
            Unreal Engine
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No projects found in this category.</p>
          </div>
        )}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default Projects; 