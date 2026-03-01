import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import History from './pages/History';

/* ── Error Boundary ── */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#040D0A' }}>
          <div className="text-center space-y-4 px-6">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,0.08)', border: '2px solid rgba(248,113,113,0.3)' }}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#E8FFF1]">Something went wrong</h2>
            <p className="text-sm text-[#9BB8A8]">An unexpected error occurred.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)', color: '#00FF87' }}
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── 404 Page ── */
const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#040D0A' }}>
    <div className="text-center space-y-4 px-6">
      <p className="text-7xl font-black" style={{ color: 'rgba(0,255,135,0.15)' }}>404</p>
      <h2 className="text-xl font-bold text-[#E8FFF1]">Page not found</h2>
      <p className="text-sm text-[#9BB8A8]">The page you're looking for doesn't exist.</p>
      <a href="/" className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold"
        style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)', color: '#00FF87' }}>
        Go Home
      </a>
    </div>
  </div>
);

/* ── Animated Routes ── */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<SendMoney />} />
          <Route path="/history" element={<History />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-[#040D0A]">
          <Navbar />
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
