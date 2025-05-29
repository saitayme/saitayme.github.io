import { useState, useEffect } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

export const useKonamiCode = (onComplete: () => void) => {
  const [sequence, setSequence] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const newSequence = [...sequence, key];
      
      // Keep only the last N keys where N is the length of the Konami code
      if (newSequence.length > KONAMI_CODE.length) {
        newSequence.shift();
      }
      
      setSequence(newSequence);

      // Check if the sequence matches
      const isMatch = newSequence.join(',') === KONAMI_CODE.join(',');
      if (isMatch) {
        onComplete();
        setSequence([]); // Reset after successful completion
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence, onComplete]);

  // Return current sequence for potential UI feedback
  return sequence;
}; 