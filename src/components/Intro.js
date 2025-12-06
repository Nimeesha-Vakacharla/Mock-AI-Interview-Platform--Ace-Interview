import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Intro({ interviewType, setInterviewType }) {
  const navigate = useNavigate();

  // Auth modal state
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'

  // Company / level selection
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  // Testimonials / quotes
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const levels =
    (typeof window !== 'undefined' && Array.isArray(window.__LEVELS__))
      ? window.__LEVELS__
      : ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

  const companies =
    (typeof window !== 'undefined' && Array.isArray(window.__COMPANIES__))
      ? window.__COMPANIES__
      : ['Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Other'];

  const testimonials = [
    {
      text: "Landed my dream job after using Ace Interview! The AI feedback was incredibly detailed.",
      author: "Sarah M.",
      role: "Software Engineer"
    },
    {
      text: "Best interview prep platform I've ever used. The questions felt exactly like real interviews.",
      author: "Michael T.",
      role: "Product Manager"
    },
    {
      text: "Boosted my confidence tremendously. The practice sessions were game-changing!",
      author: "Jessica L.",
      role: "Data Scientist"
    },
    {
      text: "Amazing platform! Got offers from 3 companies after practicing here.",
      author: "David R.",
      role: "Marketing Lead"
    },
    {
      text: "The personalized feedback helped me identify and fix my weak points quickly.",
      author: "Emily C.",
      role: "UX Designer"
    }
  ];

  const quotes = [
    '"Success is not final, failure is not fatal: It is the courage to continue that counts." — Winston Churchill',
    '"The only way to do great work is to love what you do." — Steve Jobs',
    '"Believe you can and you are halfway there." — Theodore Roosevelt',
    '"Innovation distinguishes between a leader and a follower." — Steve Jobs',
    '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
    '"Your limitation — it\'s only your imagination."',
    '"Great things never come from comfort zones."',
    '"Dream it. Wish it. Do it."',
    '"Opportunities don\'t happen, you create them." — Chris Grosser',
    '"It always seems impossible until it\'s done." — Nelson Mandela'
  ];

  const whyBestFeatures = [
    {
      icon: '🚀',
      title: 'AI-Powered Questions',
      description: 'Advanced AI generates industry-specific questions tailored to your role and experience level.'
    },
    {
      icon: '📊',
      title: 'Real-Time Feedback',
      description: 'Get instant, detailed feedback on your answers with scoring and improvement suggestions.'
    },
    {
      icon: '🎯',
      title: 'Personalized Practice',
      description: 'Upload your resume and job description for highly relevant, personalized interviews.'
    },
    {
      icon: '💡',
      title: 'Multi-Format Support',
      description: 'Practice HR, behavioral, technical, and coding interviews in one place.'
    }
  ];

  useEffect(() => {
    if (!testimonials.length) return;
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setIsAuthDialogOpen(false);
  };

  const handleNavigation = (path) => {
    const overlay = document.createElement('div');
    overlay.className = 'entry-transition-overlay';
    overlay.innerHTML = `
      <div class="entry-transition-content">
        <div class="entry-transition-text">Let's Start! 🚀</div>
        <div class="entry-transition-subtext">Get ready to ace your interview</div>
        <div class="entry-transition-spinner"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      navigate(path);
      document.body.removeChild(overlay);
    }, 2000);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="main-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img src="/assets/logo.png" alt="Ace Interview" />
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/start" className="nav-link">Start Practice</Link>
            <div className="nav-dropdown">
              <span className="nav-link dropdown-trigger">Interview Types ▼</span>
              <div className="dropdown-content">
                <Link to="/" onClick={() => setInterviewType && setInterviewType('All')}>All Interviews</Link>
                <Link to="/" onClick={() => setInterviewType && setInterviewType('HR')}>HR Interviews</Link>
                <Link to="/" onClick={() => setInterviewType && setInterviewType('Behavioral')}>Behavioral</Link>
                <Link to="/" onClick={() => setInterviewType && setInterviewType('Technical')}>Technical</Link>
                <Link to="/" onClick={() => setInterviewType && setInterviewType('Coding')}>Coding</Link>
              </div>
            </div>
            <button
              className="auth-button"
              onClick={() => {
                setAuthMode('signin');
                setIsAuthDialogOpen(true);
              }}
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* AUTH MODAL */}
      {isAuthDialogOpen && (
        <div className="auth-dialog-overlay">
          <div className="auth-dialog">
            <button
              className="close-dialog"
              onClick={() => setIsAuthDialogOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <h2>{authMode === 'signin' ? 'Welcome Back 👋' : 'Create Your Account 🧑‍💻'}</h2>

            <div className="auth-toggle">
              <button
                type="button"
                className={authMode === 'signin' ? 'active' : ''}
                onClick={() => setAuthMode('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={authMode === 'signup' ? 'active' : ''}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                />
              )}
              <input
                type="email"
                placeholder="you@example.com"
                required
              />
              <input
                type="password"
                placeholder="Password"
                required
              />
              <button type="submit">
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main>
        {/* HERO SECTION */}
        <motion.section
          className="hero-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <h1 className="hero-title">
              Level Up Your <span className="gradient-text">Interview Game</span>
            </h1>
            <p className="hero-subtitle">
              Master any interview with AI-powered practice, personalized feedback,
              and real-world scenarios tailored to your dream role.
            </p>
            <motion.button
              className="hero-cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleNavigation('/start')}
            >
              Start Practicing Now
            </motion.button>
          </motion.div>
        </motion.section>

        {/* COMPANY PREP SECTION */}
        <section className="company-prep-section">
          <h2 className="section-title">Prepare for Your Dream Company</h2>
          <p className="section-subtitle">
            Choose your experience level and target company. We’ll tailor the interview questions accordingly.
          </p>

          <div className="prep-selector">
            <div className="dropdown-container">
              <select
                className="prep-dropdown"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="" disabled>
                  Select Level
                </option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <select
                className="prep-dropdown"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="" disabled>
                  Select Company
                </option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>

              {/* NEW: Interview type dropdown */}
              <select
                className="prep-dropdown"
                value={interviewType}
                onChange={(e) => setInterviewType && setInterviewType(e.target.value)}
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Coding">Coding</option>
              </select>

              <button
                className="prep-cta"
                disabled={!selectedLevel || !selectedCompany}
                onClick={() => {
                  const qs = new URLSearchParams();
                  qs.set('level', selectedLevel);
                  qs.set('company', selectedCompany);
                  // type is stored in global state via setInterviewType,
                  // Page1 gets it from props.
                  handleNavigation(`/start?${qs.toString()}`);
                }}
              >
                Start Company Prep
              </button>
            </div>
          </div>
        </section>

        {/* ... rest of your Intro sections (Why Best, How It Works, quotes, CTA, footer) stay unchanged ... */}
      </main>
    </>
  );
}

export default Intro;
