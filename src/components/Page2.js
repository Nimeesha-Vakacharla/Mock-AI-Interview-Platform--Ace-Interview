import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://127.0.0.1:7860';

function Page2({
  questions,
  answers,
  setAnswers,
  evaluations,
  setEvaluations,
  setTotalScore,
  interviewType,
  domain
}) {
  const [fetchedQuestions, setFetchedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [resumeToken, setResumeToken] = useState('');
  const [candidateName, setCandidateName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Load resume token + name from storage
  useEffect(() => {
    try {
      const t = sessionStorage.getItem('resume_token') || localStorage.getItem('resume_token');
      if (t) setResumeToken(t);

      const storedName = sessionStorage.getItem('candidate_name') || localStorage.getItem('candidate_name');
      if (storedName) setCandidateName(storedName);
    } catch {}
  }, []);

  // Prefer questions from props, else use fetchedQuestions
  const effectiveQuestions = useMemo(
    () => (questions && questions.length ? questions : fetchedQuestions),
    [questions, fetchedQuestions]
  );

  // If Page2 is opened directly, fetch questions here
  useEffect(() => {
    const needToFetch = !questions || questions.length === 0;
    const usedDomain = (domain && domain.trim()) || (interviewType && interviewType.trim()) || '';

    if (!needToFetch) return;
    if (!usedDomain) {
      setError('No domain provided. Please go back and select your domain.');
      return;
    }

    const params = new URLSearchParams(window.location.search || '');
    const selectedCompany = params.get('company') || '';
    const selectedLevel = params.get('level') || '';

    (async () => {
      try {
        setIsLoadingQuestions(true);
        setError('');

        const resp = await fetch(`${API_BASE}/generate_questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'there',
            domain: usedDomain,
            role: usedDomain,
            job_description: `Company Focus: ${selectedCompany}\nSeniority Level: ${selectedLevel}`,
            n_questions: 5,
            resume_token: resumeToken || null
          })
        });

        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        const qs = Array.isArray(data.questions) ? data.questions.filter(Boolean) : [];
        if (!qs.length) throw new Error('No questions returned. Please try again.');

        setFetchedQuestions(qs);
        setCurrentQuestionIndex(0);
      } catch (e) {
        console.error(e);
        setError('Sorry, could not generate questions. Please go back and try again.');
      } finally {
        setIsLoadingQuestions(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeToken]);

  const currentQuestionObj = effectiveQuestions[currentQuestionIndex] || {};
  const currentQuestion = currentQuestionObj.question || '';
  const currentQuestionType = currentQuestionObj.type || 'technical';

  // Load previously saved answer for current question (if any)
  useEffect(() => {
    if (!currentQuestion) return;
    const prevAnswer = answers && answers[currentQuestion];
    setAnswer(prevAnswer || '');
    setError('');
  }, [currentQuestion, answers]);

  const handleSubmitAnswer = async () => {
    if (!answer || !answer.trim()) {
      setError('Please type your answer before submitting.');
      return;
    }

    if (!currentQuestion) {
      setError('No question to answer.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // removed unused `usedDomain` here – it was causing the ESLint warning

      const newAnswers = { ...(answers || {}), [currentQuestion]: answer };
      setAnswers(newAnswers);

      const resp = await fetch(`${API_BASE}/evaluate_answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          answer,
          question_type: currentQuestionType,
          level: 'mid_level',
          resume_token: resumeToken || null,
          job_description: ''
        })
      });

      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();

      let parsed = data.evaluation;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = { model_answer: parsed };
        }
      }

      const updatedEvaluations = { ...(evaluations || {}), [currentQuestion]: parsed };
      setEvaluations(updatedEvaluations);

      try {
        sessionStorage.setItem('answers', JSON.stringify(newAnswers));
        sessionStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
      } catch {}

      const nextIndex = currentQuestionIndex + 1;
      setAnswer('');
      if (nextIndex < effectiveQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        // compute average score from all questions
        const scores = Object.values(updatedEvaluations)
          .map((e) => {
            if (!e) return null;
            if (typeof e.overall_score === 'number') return e.overall_score;
            if (typeof e.score === 'number') return e.score;
            return null;
          })
          .filter((v) => v !== null);

        const avg = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : null;

        setTotalScore(avg);
        navigate('/results');
      }
    } catch (err) {
      console.error(err);
      setError('Sorry, could not evaluate your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((!effectiveQuestions || effectiveQuestions.length === 0) && isLoadingQuestions) {
    return (
      <>
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

        <motion.div
          className="page-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="loading">
            <FaSpinner className="spinner" /> Generating your interview questions...
          </p>
        </motion.div>
      </>
    );
  }

  if (!effectiveQuestions || effectiveQuestions.length === 0) {
    return (
      <>
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

        <motion.div
          className="page-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="error">No questions available. Please go back and submit details.</p>
          {error && <p className="error" style={{ marginTop: '0.5rem' }}>{error}</p>}
        </motion.div>
      </>
    );
  }

  const progressPct = effectiveQuestions.length
    ? ((currentQuestionIndex + 1) / effectiveQuestions.length) * 100
    : 0;

  return (
    <>
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

      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {/* This is the line you asked for */}
        <h1>
          {candidateName
            ? `${candidateName}, get ready for your interview!`
            : 'Get ready for your interview!'}
        </h1>

        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <p>Question {currentQuestionIndex + 1} of {effectiveQuestions.length}:</p>
        <p className="question">{currentQuestion}</p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows="6"
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleSubmitAnswer} disabled={isSubmitting}>
          {isSubmitting ? <FaSpinner className="spinner" /> : 'Submit Answer'}
        </button>
      </motion.div>
    </>
  );
}

export default Page2;
