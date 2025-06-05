// Type declaration for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  if (typeof window === 'undefined') return;

  // Load Google Analytics Script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId);

  // Make gtag available globally
  window.gtag = gtag;
};

// Custom hook for page views
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};

// Event tracking utility
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Project view tracking
export const trackProjectView = (projectTitle: string) => {
  trackEvent('Project', 'view', projectTitle);
};

// Contact form tracking
export const trackContactFormSubmission = () => {
  trackEvent('Contact', 'form_submission');
};

// Social link tracking
export const trackSocialClick = (platform: string) => {
  trackEvent('Social', 'click', platform);
}; 