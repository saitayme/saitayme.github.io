import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { trackSocialClick } from '@/utils/analytics';

const Footer = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/yourusername',
      icon: FaGithub,
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername',
      icon: FaLinkedin,
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/yourusername',
      icon: FaTwitter,
    },
  ];

  return (
    <footer className="bg-cyber-black border-t border-gray-800">
      <div className="cyber-container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-mono text-sm"
          >
            © {new Date().getFullYear()} Julian R. Strunz. All rights reserved.
          </motion.div>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSocialClick(link.name)}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <link.icon size={20} />
                <span className="sr-only">{link.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <a
              href="/privacy"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 