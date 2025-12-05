import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'https://sindhupandrangi-mock-interview-backend.hf.space';

function Page1({
  resumeFile,
  setResumeFile,
  jobDescription,
  setJobDescription,
  domain,
  setDomain,
  setQuestions,
  interviewType
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [showTransition, setShowTransition] = useState(false);
  const [transitionText, setTransitionText] = useState('');

  const [candidateName, setCandidateName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [resumeToken, setResumeToken] = useState('');

  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search || '');
  const selectedCompany = params.get('company') || '';
  const selectedLevel = params.get('level') || '';

  useEffect(() => {
    setDomain && setDomain('');
    setResumeFile && setResumeFile(null);
    setJobDescription && setJobDescription('');
    setCandidateName('');
    setResumeToken('');
    setFileInputKey(k => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    { title: "Select Your Domain", subtitle: "Choose the field you're interviewing for", emoji: "🎯" },
    { title: "Upload Your Resume", subtitle: "Help us personalize your questions", emoji: "📄" },
    { title: "Job Description", subtitle: "Add job details for tailored questions (Optional)", emoji: "💼" }
  ];

  const domains = (typeof window !== 'undefined' && Array.isArray(window.__DOMAINS__))
    ? window.__DOMAINS__
    : [
        "Data Scientist", "Data Analyst", "Business Analyst",
        "ML Engineer", "Deep Learning Engineer", "AI Engineer",
        "Software Engineer", "Software AI Engineer", "AI Researcher",
      ];

  const handleResumeUpload = async (file) => {
    setResumeFile && setResumeFile(file);
    if (!file) return;
    try {
      setError('');
      setIsParsing(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/parse_resume`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const name = (data?.name || '').trim();
      const token = data?.resume_token || '';
      if (name) setCandidateName(name);
      if (token) {
        setResumeToken(token);
        try {
          sessionStorage.setItem('resume_token', token);
          localStorage.setItem('resume_token', token);
        } catch {}
      }
    } catch (e) {
      console.error('parse_resume failed:', e);
      setError('Could not read the resume. Please try a different PDF/TXT.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !domain) {
      setError('Please select a domain');
      return;
    }
    if (currentStep === 1 && !resumeFile) {
      setError('Please upload your resume');
      return;
    }
    setError('');
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
    else handleBegin();
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleBegin = async () => {
    if (!domain) {
      setError('Domain is required');
      return;
    }

    setShowTransition(true);
    setTransitionText("Brace Yourself! 💪");
    setTimeout(() => setTransitionText("Generating Your Interview Questions... ✨"), 1200);
    setTimeout(() => setTransitionText("Get Ready to Ace This! 🚀"), 2500);

    const mergedJD = `${jobDescription || ''}

Company Focus: ${selectedCompany}
Seniority Level: ${selectedLevel}`.trim();

    try {
      const role = domain || interviewType || '';
      const resp = await fetch(`${API_BASE}/generate_questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: candidateName || 'there',
          domain,
          role,
          job_description: mergedJD,
          n_questions: 5,
          resume_token: resumeToken || null
        })
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      const qs = Array.isArray(data.questions) ? data.questions.filter(Boolean) : [];
      if (!qs.length) throw new Error('Model returned no questions');

      setQuestions && setQuestions(qs);
      try { sessionStorage.setItem('questions', JSON.stringify(qs)); } catch {}

      navigate('/interview');
    } catch (err) {
      console.error(err);
      setError('Sorry, could not generate questions right now. Please try again.');
      setShowTransition(false);
    }
  };

  return (
    <>
      <nav className="main-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo"><img src="/assets/logo.png" alt="Ace Interview" /></Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/start" className="nav-link">Start Practice</Link>
            <div className="nav-dropdown">
              <span className="nav-link dropdown-trigger">Interview Types ▼</span>
              <div className="dropdown-content">
                <Link to="/" onClick={() => {}}>All Interviews</Link>
                <Link to="/" onClick={() => {}}>HR Interviews</Link>
                <Link to="/" onClick={() => {}}>Behavioral</Link>
                <Link to="/" onClick={() => {}}>Technical</Link>
                <Link to="/" onClick={() => {}}>Coding</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showTransition && (
          <motion.div className="transition-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="transition-content" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="transition-text">{transitionText}</div>
              <div className="transition-spinner"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page1-container">
        <motion.div className="page1-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="page1-header">
            <h1>{candidateName ? `Hi ${candidateName}! 👋` : "Let's Get You Interview Ready! 🎯"}</h1>
            <p>Follow these simple steps to create your personalized interview experience</p>

            <div className="progress-container">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
              <span className="progress-text">Step {currentStep + 1} of {steps.length}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentStep} className="step-content" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}>
              <div className="step-header">
                <div className="step-emoji">{steps[currentStep].emoji}</div>
                <h2>{currentStep === 1 && candidateName ? `Upload Your Resume, ${candidateName}` : steps[currentStep].title}</h2>
                <p>{currentStep === 2 && candidateName ? `Great, ${candidateName}! Paste the job description so we can tailor questions.` : steps[currentStep].subtitle}</p>
              </div>

              <div className="step-body">
                {currentStep === 0 && (
                  <div className="domain-selection">
                    <div className="domain-grid">
                      {domains.map((opt) => (
                        <motion.button key={opt} className={`domain-card ${domain === opt ? 'selected' : ''}`} onClick={() => { setDomain(opt); setError(''); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          {opt}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="resume-upload">
                    <div className="upload-area">
                      <div className="upload-icon">📎</div>
                      <div className="upload-text">
                        <h3>{candidateName ? `Resume for ${candidateName}` : 'Upload Your Resume'}</h3>
                        <p>PDF or TXT files only</p>
                      </div>
                      <input
                        key={fileInputKey}
                        type="file"
                        accept=".pdf,.txt"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setError('');
                          handleResumeUpload(f);
                        }}
                        className="file-input"
                      />
                      {isParsing && <div className="file-selected">⏳ Reading your resume…</div>}
                      {resumeFile && !isParsing && <div className="file-selected">✅ {resumeFile.name}</div>}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="job-description">
                    <div className="textarea-container">
                      <label>{candidateName ? `Job Description for ${candidateName}` : 'Job Description (Optional but Recommended)'}</label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription && setJobDescription(e.target.value)}
                        placeholder="Paste the job description here to get more tailored questions..."
                        rows="8"
                        className="job-textarea"
                        autoComplete="off"
                        name="jobDescription"
                      />
                      <div className="textarea-hint">💡 Adding job description helps us create questions specific to the role requirements</div>
                    </div>
                  </div>
                )}
              </div>

              {error && (<motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>⚠️ {error}</motion.div>)}

              <div className="step-navigation">
                {currentStep > 0 && (<button onClick={handleBack} className="nav-button secondary">← Back</button>)}
                <button onClick={handleNext} className="nav-button primary" disabled={(currentStep === 0 && !domain) || (currentStep === 1 && isParsing)}>
                  {currentStep === steps.length - 1 ? 'Begin Interview 🚀' : 'Next →'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

export default Page1;
