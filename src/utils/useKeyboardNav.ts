import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  'a',
];

export const useKeyboardNav = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  // Konami code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K shortcut
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsEnabled(prev => !prev);
        return;
      }

      // Check for Konami code
      const key = e.key.toLowerCase();
      setKonamiProgress(prev => {
        const newProgress = [...prev, key];
        if (newProgress.length > KONAMI_CODE.length) {
          newProgress.shift();
        }
        
        // Check if Konami code is completed
        if (newProgress.join(',') === KONAMI_CODE.map(k => k.toLowerCase()).join(',')) {
          setIsEnabled(true);
          // Play activation sound
          const audio = new Audio('/assets/sounds/activate.mp3');
          audio.play().catch(() => {}); // Ignore if sound fails to play
          return [];
        }
        
        return newProgress;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // WASD/Arrow key navigation when enabled
  useEffect(() => {
    if (!isEnabled) return;

    const handleGamepadNav = (e: KeyboardEvent) => {
      e.preventDefault();

      const key = e.key.toLowerCase();
      let nextElement: HTMLElement | null = null;

      // Find all interactive elements
      const interactiveElements = Array.from(document.querySelectorAll(
        'a[href], button, [role="button"], [tabindex="0"]'
      )) as HTMLElement[];

      if (!selectedElement) {
        nextElement = interactiveElements[0];
      } else {
        const currentRect = selectedElement.getBoundingClientRect();
        
        switch (key) {
          case 'w':
          case 'arrowup':
            nextElement = findClosestElement(interactiveElements, currentRect, 'up');
            break;
          case 's':
          case 'arrowdown':
            nextElement = findClosestElement(interactiveElements, currentRect, 'down');
            break;
          case 'a':
          case 'arrowleft':
            nextElement = findClosestElement(interactiveElements, currentRect, 'left');
            break;
          case 'd':
          case 'arrowright':
            nextElement = findClosestElement(interactiveElements, currentRect, 'right');
            break;
          case 'enter':
          case ' ':
            selectedElement.click();
            break;
        }
      }

      if (nextElement) {
        setSelectedElement(nextElement);
        nextElement.focus();
        
        // Play navigation sound
        const audio = new Audio('/assets/sounds/nav.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {});
      }
    };

    if (isEnabled) {
      window.addEventListener('keydown', handleGamepadNav);
    }

    return () => window.removeEventListener('keydown', handleGamepadNav);
  }, [isEnabled, selectedElement]);

  return { isEnabled, selectedElement };
};

// Helper function to find the closest element in a given direction
const findClosestElement = (
  elements: HTMLElement[],
  currentRect: DOMRect,
  direction: 'up' | 'down' | 'left' | 'right'
): HTMLElement | null => {
  let closest: HTMLElement | null = null;
  let minDistance = Infinity;

  elements.forEach(element => {
    const rect = element.getBoundingClientRect();
    let isInDirection = false;
    let distance = 0;

    switch (direction) {
      case 'up':
        isInDirection = rect.bottom < currentRect.top;
        distance = currentRect.top - rect.bottom;
        break;
      case 'down':
        isInDirection = rect.top > currentRect.bottom;
        distance = rect.top - currentRect.bottom;
        break;
      case 'left':
        isInDirection = rect.right < currentRect.left;
        distance = currentRect.left - rect.right;
        break;
      case 'right':
        isInDirection = rect.left > currentRect.right;
        distance = rect.left - currentRect.right;
        break;
    }

    if (isInDirection && distance < minDistance) {
      minDistance = distance;
      closest = element;
    }
  });

  return closest;
}; 