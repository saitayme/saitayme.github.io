import { motion } from 'framer-motion';
import { SectionProps } from '@/utils/types';

const Section: React.FC<SectionProps> = ({ id, title, subtitle, children, className = '' }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={`py-16 ${className}`}
    >
      <div className="cyber-container">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-cyber text-primary mb-4 glitch-effect">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-400">{subtitle}</p>
          )}
        </motion.div>
        {children}
      </div>
    </motion.section>
  );
};

export default Section; 