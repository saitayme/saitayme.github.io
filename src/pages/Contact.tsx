import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaItchIo, FaLinkedin, FaGithub } from 'react-icons/fa';
import Section from '@/components/Section';

const socialLinks = [
  {
    icon: FaItchIo,
    href: 'https://itch.io/profile',
    label: 'Check out my games on Itch.io',
  },
  {
    icon: FaLinkedin,
    href: 'https://linkedin.com/in/yourprofile',
    label: 'Connect with me on LinkedIn',
  },
  {
    icon: FaGithub,
    href: 'https://github.com/yourusername',
    label: 'View my code on GitHub',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: "easeOut" }
};

const socialLinkVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } }
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen pt-20">
      <Section
        id="contact"
        title="Contact"
        subtitle="Let's discuss your next project"
      >
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div {...fadeInUp}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-dark border-2 border-gray-800 rounded-lg 
                           focus:border-primary focus:outline-none transition-colors duration-300
                           text-white placeholder-gray-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-dark border-2 border-gray-800 rounded-lg 
                           focus:border-primary focus:outline-none transition-colors duration-300
                           text-white placeholder-gray-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-dark border-2 border-gray-800 rounded-lg 
                           focus:border-primary focus:outline-none transition-colors duration-300
                           text-white placeholder-gray-500"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 bg-cyber-dark border-2 border-gray-800 rounded-lg 
                           focus:border-primary focus:outline-none transition-colors duration-300
                           text-white placeholder-gray-500 resize-none"
                  placeholder="Your message here..."
                />
              </div>

              <motion.button
                type="submit"
                className="cyber-button w-full"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>

          {/* Social Links */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-cyber text-primary mb-6">
                Connect With Me
              </h3>
              <div className="space-y-6">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-gray-400 hover:text-primary transition-colors duration-300 group"
                    whileHover={{ x: 3 }}
                  >
                    <link.icon size={24} />
                    <span>{link.label}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-cyber text-primary mb-6">
                Location
              </h3>
              <p className="text-gray-400">
                Based in Germany
                <br />
                Available for remote work worldwide
              </p>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
};

export default Contact; 