export type ProjectSystem = {
  name: string;
  description: string;
  techStack: string[];
  features: string[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  category: 'Unity' | 'Unreal Engine';
  thumbnail: string;
  tags: string[];
  isSecret?: boolean;
  systems: ProjectSystem[];
  demoUrl?: string;
  githubUrl?: string;
};

export type SectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export type ProjectCardProps = {
  project: Project;
  className?: string;
  onClick?: () => void;
}; 