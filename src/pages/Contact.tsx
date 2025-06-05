import { motion } from 'framer-motion';
import { FaItchIo, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { SiSpotify, SiInstagram } from 'react-icons/si';

import InteractiveBackground from '@/components/InteractiveBackground';

const socialLinks = [
  {
    name: 'Itch.io',
    url: 'https://itch.io/profile/sssodium',
    icon: FaItchIo,
    color: '#fa5c5c',
    description: 'Game Portfolio'
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/julian-strunz/',
    icon: FaLinkedin,
    color: '#0077b5',
    description: 'Professional Network'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/saitayme',
    icon: FaGithub,
    color: '#6e5494',
    description: 'Code Repository'
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com/user/huliwun?si=92fb6bdc4dd24ff7',
    icon: SiSpotify,
    color: '#1db954',
    description: 'Music Playlists'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/saitayme/',
    icon: SiInstagram,
    color: '#e4405f',
    description: 'Visual Stories'
  },
  {
    name: 'Email',
    url: 'mailto:julian.strunz@hotmail.com',
    icon: FaEnvelope,
    color: '#f07e41',
    description: 'Direct Contact'
  }
];

const Contact = () => {
  return (
    <div className="min-h-screen py-24 relative">
      <InteractiveBackground variant="particles" intensity="medium" />
      
      <div className="cyber-container">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-cyber text-white mb-4 neon-text">
            CONTACT
          </h1>
          <div className="w-32 h-1 bg-primary mx-auto mb-6 shadow-[0_0_15px_rgba(240,126,65,0.5)]" />
          <p className="text-gray-300 text-lg font-mono max-w-2xl mx-auto">
            Establishing secure communication channels...
            <br />
            <span className="text-primary">Connection protocols active</span>
          </p>
        </motion.div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {socialLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card Background */}
              <div className="relative bg-cyber-black border-2 border-primary/30 rounded-lg p-6 h-full transition-all duration-300 hover:border-primary hover:shadow-[0_0_25px_rgba(240,126,65,0.3)]">
                
                {/* Animated Border Effect */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-[1px] rounded-lg bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
                </div>

                {/* Icon Container */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${link.color}20`,
                      boxShadow: `0 0 20px ${link.color}40`
                    }}
                  >
                    <link.icon 
                      className="w-8 h-8 transition-all duration-300 group-hover:scale-110" 
                      style={{ color: link.color }}
                    />
                  </div>

                  {/* Platform Name */}
                  <h3 className="text-xl font-cyber text-white mb-2 group-hover:text-primary transition-colors duration-300">
                    {link.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm font-mono mb-4">
                    {link.description}
                  </p>

                  {/* Access Button */}
                  <div className="w-full h-8 bg-cyber-black border border-primary/50 rounded flex items-center justify-center font-mono text-xs text-primary group-hover:bg-primary/10 group-hover:shadow-[0_0_15px_rgba(240,126,65,0.3)] transition-all duration-300">
                    ACCESS CHANNEL
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                  style={{ 
                    background: `radial-gradient(circle at center, ${link.color} 0%, transparent 70%)`
                  }}
                />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom Terminal Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-cyber-black border-2 border-primary/30 rounded-lg p-6 font-mono">
            <div className="flex items-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="ml-4 text-primary text-sm">communication_terminal.exe</span>
            </div>
            
            <div className="text-green-400 text-sm leading-relaxed">
              <p className="mb-2">
                <span className="text-primary">$</span> status --all-channels
              </p>
              <p className="mb-2">
                <span className="text-gray-500">[INFO]</span> All communication channels active and secure
              </p>
              <p className="mb-2">
                <span className="text-gray-500">[INFO]</span> Response time: &lt; 24 hours
              </p>
              <p className="mb-2">
                <span className="text-gray-500">[INFO]</span> Encryption: AES-256 enabled
              </p>
              <p className="text-primary animate-pulse">
                <span className="text-primary">$</span> Ready for incoming transmission_
              </p>
            </div>
          </div>
        </motion.div>

        {/* Floating Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 font-mono text-sm">
            Preferred contact protocol: <span className="text-primary">EMAIL</span>
          </p>
          <p className="text-gray-500 font-mono text-xs mt-2">
            julian.strunz@hotmail.com
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 