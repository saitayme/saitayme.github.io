import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { initGA, usePageTracking } from '@/utils/analytics'
import { useEffect } from 'react'
// import BackgroundAnimation from '@/components/BackgroundAnimation' // Temporarily disabled for performance
// import CyberGame from '@/components/CyberGame' // Temporarily disabled for deployment
import LoadingScreen from '@/components/LoadingScreen'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const Contact = lazy(() => import('./pages/Contact'))

const App = () => {
  // const [showGame, setShowGame] = useState(false) // Temporarily disabled for deployment

  useEffect(() => {
    // Konami code implementation
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let current = 0;

    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === sequence[current]) {
        current++;
        if (current === sequence.length) {
          // setShowGame(true); // Temporarily disabled for deployment
          current = 0;
        }
      } else {
        current = 0;
      }
    };

    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, []);

  useEffect(() => {
    // Only initialize GA if we have a measurement ID
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId) {
      initGA(measurementId);
    }
  }, []);

  // Only track pages if GA is initialized
  if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
    usePageTracking();
  }

  return (
    <div className="min-h-screen bg-cyber-black text-gray-100 relative">
      {/* <BackgroundAnimation /> */} {/* Disabled for performance testing */}
      
      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />
        <Suspense fallback={<LoadingScreen />}>
          <main>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home onPlayGame={() => {}} />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </AnimatePresence>
          </main>
        </Suspense>
      </div>

      {/* Game Modal - Temporarily disabled for deployment */}
      {/* <CyberGame isVisible={showGame} onClose={() => setShowGame(false)} /> */}
    </div>
  )
}

export default App 