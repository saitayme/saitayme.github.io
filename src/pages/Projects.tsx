import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiUnitySmall } from 'react-icons/di';
import { SiUnrealengine } from 'react-icons/si';
import Section from '@/components/Section';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { useKeyboardNav } from '@/utils/useKeyboardNav';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import { Project } from '@/utils/types';
import { projects, secretProjects } from '../data/projects';

type Engine = 'Unity' | 'Unreal' | 'All';

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Unity' | 'Unreal Engine'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showSecretProjects, setShowSecretProjects] = useState(false);
  const { isEnabled: isKeyboardNavEnabled } = useKeyboardNav();

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
    <div className="min-h-screen bg-cyber-black py-24">
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid-bg opacity-10 pointer-events-none" />
      <div className="scanline" />

      <div className="cyber-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary font-mono text-sm mb-4"
            >
              Secret projects unlocked! 🔓
            </motion.div>
          )}
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`cyber-button-sm ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            All Projects
          </button>
          <button
            onClick={() => setSelectedCategory('Unity')}
            className={`cyber-button-sm ${selectedCategory === 'Unity' ? 'active' : ''}`}
          >
            Unity
          </button>
          <button
            onClick={() => setSelectedCategory('Unreal Engine')}
            className={`cyber-button-sm ${selectedCategory === 'Unreal Engine' ? 'active' : ''}`}
          >
            Unreal Engine
          </button>
        </div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

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