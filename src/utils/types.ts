export type Project = {
  id: string;
  title: string;
  engine: 'Unity' | 'Unreal';
  tools: string[];
  description: string;
  contributions: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'gif';
  projectUrl?: string;
  repoUrl?: string;
  technicalDetails: {
    systems: Array<{
      name: string;
      description: string;
      features: string[];
      techStack: string[];
    }>;
    architecture?: string;
    performance?: string;
    challenges?: string[];
  };
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
  onSelect?: () => void;
}; 