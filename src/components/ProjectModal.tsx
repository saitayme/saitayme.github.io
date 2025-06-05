import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../data/projects';
import { DiUnitySmall } from 'react-icons/di';
import { SiUnrealengine } from 'react-icons/si';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  if (!project) return null;

  const EngineIcon = project.category === 'Unity' ? DiUnitySmall : SiUnrealengine;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-cyber-black border-2 border-primary/30 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-primary/30">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-primary"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <EngineIcon className="text-3xl text-primary" />
              <h2 className="text-2xl font-cyber text-primary neon-text">
                {project.title}
              </h2>
            </div>
            
            <p className="text-gray-400">
              {project.description}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-cyber text-primary mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Systems */}
            <div className="space-y-6">
              <h3 className="text-lg font-cyber text-primary mb-4">Technical Systems</h3>
              {project.systems.map((system, index) => (
                <div
                  key={index}
                  className="border border-primary/30 rounded-lg p-6 bg-black/30"
                >
                  <h4 className="text-lg text-primary mb-2">{system.name}</h4>
                  <p className="text-gray-400 mb-4">{system.description}</p>
                  
                  {/* Tech Stack */}
                  <div className="mb-4">
                    <h5 className="text-sm text-gray-500 mb-2">Tech Stack:</h5>
                    <div className="flex flex-wrap gap-2">
                      {system.techStack.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="text-xs px-2 py-1 rounded bg-primary/10 text-primary/80"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h5 className="text-sm text-gray-500 mb-2">Key Features:</h5>
                    <ul className="list-disc list-inside text-gray-400">
                      {system.features.map((feature, featureIndex) => (
                        <li key={featureIndex}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="mt-8 pt-6 border-t border-primary/30">
              <div className="flex gap-4">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-button"
                  >
                    View Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-button-secondary"
                  >
                    View Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectModal; 