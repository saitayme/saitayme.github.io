import { motion } from 'framer-motion';
import { DiUnitySmall, DiJava } from 'react-icons/di';
import { SiCplusplus, SiCsharp, SiUnrealengine, SiJavascript, SiTypescript, SiPython, SiPhp, SiMysql, SiCss3, SiHtml5 } from 'react-icons/si';
import { MdEmail, MdPhone, MdLocationOn, MdLanguage, MdMusicNote, MdGamepad, MdAudiotrack, MdMusicVideo } from 'react-icons/md';
import Section from '@/components/Section';
import TerminalTypewriter from '@/components/TerminalTypewriter';
import SkillBar from '@/components/SkillBar';
import ExperienceCard from '@/components/ExperienceCard';
import { useState } from 'react';
import ContactPanel from '@/components/ContactPanel';
import LanguageChip from '@/components/LanguageChip';
import SteckbriefTypewriter from '@/components/SteckbriefTypewriter';

const skills = [
  {
    category: 'Core Expertise',
    items: [
      { name: 'Game Development', description: 'Unity & Unreal Engine, Blueprints, Multiplayer Systems, Animation' },
      { name: 'Programming', description: 'C++, C#, Java, Python, Web Technologies' },
      { name: 'Audio Production', description: 'FL Studio, Logic Pro, MIDI, Game Audio Design' },
    ],
  },
];

const languages = [
  { name: 'German', level: 'Native' },
  { name: 'English', level: 'Native-like' },
  { name: 'Spanish', level: 'Basic' },
];

const contactInfo = {
  address: 'Ziehrerstraße 18, 4020 Linz',
  email: 'julian.strunz@hotmail.com',
  phone: '+43 664 9145420',
  birthDate: '18 November 2001, Italy',
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.2, ease: "easeInOut" }
};

const skillList = [
  { name: 'Unity', level: 90, description: 'Professional experience with gameplay, tools, and editor scripting.' },
  { name: 'Unreal Engine', level: 85, description: 'Blueprints, multiplayer, animation systems, and C++.' },
  { name: 'C#', level: 90, description: 'Primary language for Unity and tools development.' },
  { name: 'C++', level: 85, description: 'Used for Unreal Engine and performance-critical systems.' },
  { name: 'Java', level: 80, description: 'Academic and personal projects.' },
  { name: 'JavaScript/TypeScript', level: 75, description: 'Web development, React, and interactive UI.' },
  { name: 'Python', level: 70, description: 'Scripting, automation, and prototyping.' },
  { name: 'PHP', level: 60, description: 'Web backend and scripting.' },
  { name: 'SQL', level: 75, description: 'Database design and queries.' },
  { name: 'HTML5/CSS3', level: 85, description: 'Modern, responsive web design.' },
  { name: 'Audio Production', level: 85, description: 'FL Studio, Logic Pro, MIDI, and game audio design.' },
];

// Experience data
const mainExperience = {
  title: 'Game Developer',
  company: 'Nerd Monkeys (Remote)',
  date: 'Feb 2025 – Present',
  description: 'Unity and C#. Gameplay programming, tools, and engine work.',
  details: 'Working on cross-platform game features, multiplayer, and custom Unity tools. Collaborating with international teams.'
};

const otherRoles = [
  {
    title: 'Lifeguard',
    company: 'LINZ AG',
    date: 'May 2022 – Sept 2022',
    description: 'Supervised public pools and ensured safety.'
  },
  {
    title: 'Promoter',
    company: 'easystaff human & resources GmbH',
    date: 'Apr 2022 – May 2022',
    description: 'Promoted JBL at MediaMarkt.'
  },
  {
    title: 'Medical Assistant',
    company: 'easystaff human & resources GmbH',
    date: 'Oct 2021 – Mar 2022',
    description: 'Covid-19 testing, care, and observation after vaccination.'
  },
  {
    title: 'Military Service (Field Medic)',
    company: 'Austrian Armed Forces',
    date: 'Dec 2020 – May 2021',
    description: 'Field medic at Covid-19 test centers.'
  },
  {
    title: 'Call Center Agent',
    company: 'City of Linz',
    date: 'Sept 2020 – Nov 2020',
    description: 'Covid hotline 1450, Red Cross Linz Mitte.'
  }
];

const About = () => {
  const [showOther, setShowOther] = useState(false);

  return (
    <div className="min-h-screen pt-20">
      <Section id="about" title="About Me">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Steckbrief Bio Section */}
          <SteckbriefTypewriter
            portraitUrl="/assets/portrait.jpg"
            name="Julian Strunz"
            profession="Game Developer & Engine Programmer"
            level="23"
            levelProgress={75}
            specialMoves={["Unity Mastery", "Unreal Blueprints", "Audio Wizardry", "Editor Scripting"]}
            origin="Italy"
            languages={["German", "English", "Spanish"]}
            quirk="Can make a game and a soundtrack before breakfast."
          />

          {/* Skills Section */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <h3 className="text-2xl font-cyber text-primary mb-6">
              Skills & Expertise
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {skillList.map((skill) => (
                <SkillBar key={skill.name} {...skill} />
              ))}
            </div>
            {/* Languages Section */}
            <div className="space-y-4 mt-8">
              <h4 className="text-lg text-gray-300">Languages</h4>
              <div className="flex flex-wrap gap-2">
                <LanguageChip countryCode="de" label="German" context="Native language. Used for documentation and communication." />
                <LanguageChip countryCode="gb" label="English" context="Used for work, study, and international projects." />
                <LanguageChip countryCode="es" label="Spanish" context="Basic proficiency. Used for localization and travel." />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Info Section */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="mt-12">
          <ContactPanel />
        </motion.div>

        {/* Experience Timeline */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h3 className="text-2xl font-cyber text-primary mb-8">Experience</h3>
          <ExperienceCard {...mainExperience} highlight />
          <motion.div
            className="mb-4"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button
              className="mt-2 mb-4 px-4 py-2 bg-cyber-dark border border-primary text-primary font-cyber rounded shadow hover:bg-primary hover:text-black transition-all"
              onClick={() => setShowOther((v) => !v)}
              aria-expanded={showOther}
            >
              {showOther ? 'Hide Other Roles' : 'Show Other Roles'}
            </button>
            <motion.div
              initial={false}
              animate={{ height: showOther ? 'auto' : 0, opacity: showOther ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ overflow: 'hidden' }}
            >
              {showOther && (
                <div className="grid md:grid-cols-2 gap-6">
                  {otherRoles.map((role) => (
                    <ExperienceCard key={role.title + role.date} {...role} />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Education Section */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.5 }}
          className="mt-20 flex justify-center"
        >
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-lg w-full p-6 rounded-lg border border-primary bg-black/80 shadow-[0_0_24px_#f07e41]"
          >
            <h3 className="text-xl font-cyber text-primary mb-2">Hagenberg Campus – FH Upper Austria</h3>
            <p className="text-primary font-mono mb-1">Media Technology and Design</p>
            <p className="text-gray-400 text-sm mb-2">Oct 2022 – July 2025</p>
            <p className="text-gray-300 text-sm">Acquired and honed skills in game development, programming, and media design.</p>
          </motion.div>
        </motion.div>

        {/* Flickering Neon Divider */}
        <div className="w-full h-1 my-12 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 animate-flicker bg-primary/60" style={{filter:'blur(2px)'}} />
        </div>
      </Section>
    </div>
  );
};

export default About; 