import { motion } from 'framer-motion';
import { FaItchIo, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import Section from '@/components/Section';

const socialLinks = [
  {
    name: 'Itch.io',
    url: 'https://itch.io/profile/sssodium',
    icon: FaItchIo,
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/julian-strunz/',
    icon: FaLinkedin,
  },
  {
    name: 'GitHub',
    url: 'https://github.com/saitayme',
    icon: FaGithub,
  },
  {
    name: 'Email',
    url: 'mailto:julian.strunz@hotmail.com',
    icon: FaEnvelope,
  }
];

const Contact = () => {
  return (
    <Section id="contact" title="Contact" className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16"
      >
        <h2 className="text-4xl font-bold mb-8 text-center text-[#f07e41]">
          Get in Touch
        </h2>
        
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-6 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <link.icon className="w-8 h-8 text-[#f07e41] mr-4" />
                <span className="text-xl text-white">{link.name}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  );
};

export default Contact; 