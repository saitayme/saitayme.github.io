import React, { useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdContentCopy, MdCheck } from 'react-icons/md';

const contact = {
  city: 'Linz, Austria',
  email: 'julian.strunz@hotmail.com',
  phone: '+43 664 9145420',
  birth: '18 November 2001, Italy',
};

const iconGlow = 'drop-shadow(0 0 6px #f07e41) drop-shadow(0 0 12px #f07e41)';

const ContactPanel: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (value: string, type: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg border border-primary bg-black/80 relative shadow-lg overflow-hidden" style={{boxShadow: '0 0 24px #f07e41, 0 0 48px #18181b inset'}}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <MdLocationOn size={22} className="text-primary" style={{filter: iconGlow}} />
          <span className="text-gray-200 font-mono">{contact.city}</span>
        </div>
        <div className="flex items-center gap-3">
          <MdEmail size={22} className="text-primary" style={{filter: iconGlow}} />
          <span className="text-gray-200 font-mono">{contact.email}</span>
          <button
            className="ml-2 p-1 rounded bg-cyber-dark border border-primary hover:bg-primary/20 transition"
            onClick={() => handleCopy(contact.email, 'email')}
            aria-label="Copy email"
          >
            {copied === 'email' ? <MdCheck className="text-primary" /> : <MdContentCopy className="text-primary" />}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <MdPhone size={22} className="text-primary" style={{filter: iconGlow}} />
          <span className="text-gray-200 font-mono">{contact.phone}</span>
          <button
            className="ml-2 p-1 rounded bg-cyber-dark border border-primary hover:bg-primary/20 transition"
            onClick={() => handleCopy(contact.phone, 'phone')}
            aria-label="Copy phone"
          >
            {copied === 'phone' ? <MdCheck className="text-primary" /> : <MdContentCopy className="text-primary" />}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-primary font-mono">Born:</span>
          <span className="text-gray-200 font-mono">{contact.birth}</span>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{background: 'url(/assets/crt-noise.png)', opacity: 0.10, mixBlendMode: 'screen'}} />
    </div>
  );
};

export default ContactPanel; 