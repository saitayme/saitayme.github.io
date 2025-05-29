import { motion } from 'framer-motion';
import { DiUnitySmall } from 'react-icons/di';
import { SiCplusplus, SiCsharp, SiUnrealengine } from 'react-icons/si';
import Section from '@/components/Section';

const skills = [
  {
    category: 'Game Engines',
    items: [
      { name: 'Unity', icon: DiUnitySmall, level: 90 },
      { name: 'Unreal Engine', icon: SiUnrealengine, level: 85 },
    ],
  },
  {
    category: 'Programming',
    items: [
      { name: 'C++', icon: SiCplusplus, level: 85 },
      { name: 'C#', icon: SiCsharp, level: 90 },
    ],
  },
];

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.2, ease: "easeInOut" }
};

const skillBarVariant = {
  initial: { scaleX: 0, originX: 0 },
  animate: { scaleX: 1 },
  transition: { duration: 1.5, ease: "easeOut" }
};

const About = () => {
  return (
    <div className="min-h-screen pt-20">
      <Section id="about" title="About Me">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Bio Section */}
          <motion.div {...fadeIn}>
            <h3 className="text-2xl font-cyber text-primary mb-6">
              Game Developer & Engine Programmer
            </h3>
            <div className="space-y-4 text-gray-400">
              <p>
                I'm a passionate game developer specializing in gameplay programming
                and engine tool development. With extensive experience in both Unity
                and Unreal Engine, I focus on creating robust systems that enhance
                game development workflows.
              </p>
              <p>
                My expertise includes developing scene management solutions,
                implementing complex audio systems, and creating custom editor tools
                that streamline the development process.
              </p>
              <p>
                I have a strong background in performance optimization and system
                architecture, ensuring that the tools and gameplay features I develop
                are both efficient and maintainable.
              </p>
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <h3 className="text-2xl font-cyber text-primary mb-6">
              Skills & Expertise
            </h3>
            <div className="space-y-8">
              {skills.map((skillGroup) => (
                <div key={skillGroup.category} className="space-y-4">
                  <h4 className="text-lg text-gray-300">{skillGroup.category}</h4>
                  <div className="space-y-4">
                    {skillGroup.items.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex items-center gap-2 mb-2">
                          <skill.icon className="text-primary" size={20} />
                          <span className="text-gray-300">{skill.name}</span>
                        </div>
                        <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
                          <motion.div
                            initial="initial"
                            animate="animate"
                            variants={skillBarVariant}
                            className="h-full bg-primary opacity-80"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Experience Timeline */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h3 className="text-2xl font-cyber text-primary mb-8">Experience</h3>
          <div className="space-y-12">
            <div className="relative pl-8 border-l-2 border-gray-800">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-0 opacity-80" />
              <div className="space-y-2">
                <h4 className="text-lg text-gray-300">Senior Game Developer</h4>
                <p className="text-primary">2020 - Present</p>
                <p className="text-gray-400">
                  Leading development of gameplay systems and engine tools.
                  Specializing in performance optimization and workflow improvements.
                </p>
              </div>
            </div>
            <div className="relative pl-8 border-l-2 border-gray-800">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-0 opacity-80" />
              <div className="space-y-2">
                <h4 className="text-lg text-gray-300">Game Engine Programmer</h4>
                <p className="text-primary">2018 - 2020</p>
                <p className="text-gray-400">
                  Developed custom tools and frameworks for Unity and Unreal Engine.
                  Created efficient asset management and scene loading systems.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
};

export default About; 