import { motion } from 'framer-motion';
import { Project } from '../data/projects';
import { DiUnitySmall } from 'react-icons/di';
import { SiUnrealengine } from 'react-icons/si';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const EngineIcon = project.category === 'Unity' ? DiUnitySmall : SiUnrealengine;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="group relative bg-cyber-black border-2 border-primary/30 rounded-lg overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent z-10" />
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Engine Icon */}
        <div className="absolute top-4 right-4 z-20">
          <EngineIcon className="text-primary text-2xl" />
        </div>

        {/* Secret Project Badge */}
        {project.isSecret && (
          <div className="absolute top-4 left-4 z-20 bg-primary/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-cyber text-primary border border-primary/30">
            SECRET
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-cyber text-primary mb-2 group-hover:neon-text transition-all">
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary/80"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Systems Preview */}
        <div className="mt-4 pt-4 border-t border-primary/10">
          <div className="text-xs text-gray-500 mb-2">Key Systems:</div>
          <ul className="text-sm text-gray-400">
            {project.systems.slice(0, 2).map((system, index) => (
              <li key={index} className="mb-1 line-clamp-1">
                • {system.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
};

export default ProjectCard; 