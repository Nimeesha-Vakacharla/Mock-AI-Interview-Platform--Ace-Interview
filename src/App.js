import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Intro from './components/Intro';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import Page3 from './components/Page3';
import './index.css';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [totalScore, setTotalScore] = useState(null);
  const [interviewType, setInterviewType] = useState('All');

  return (
    <Router>
      <head>
        <title>Ace Interview</title>
      </head>
      <header>
        <div className="header-content">
          <div className="logo">
            <img src="/assets/logo.png" alt="Ace Interview Logo" />
          </div>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/start">Start</Link>
            <Link to="/interview">Interview</Link>
            <Link to="/results">Results</Link>
            <div className="interview-types">
              <button>Interview Types</button>
              <div className="interview-types-content">
                <Link to="/" onClick={() => setInterviewType('All')}>All</Link>
                <Link to="/" onClick={() => setInterviewType('HR')}>HR</Link>
                <Link to="/" onClick={() => setInterviewType('Behavioral')}>Behavioral</Link>
                <Link to="/" onClick={() => setInterviewType('Technical')}>Technical</Link>
                <Link to="/" onClick={() => setInterviewType('Coding')}>Coding</Link>
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={<Intro interviewType={interviewType} />}
            />
            <Route
              path="/start"
              element={
                <Page1
                  resumeFile={resumeFile}
                  setResumeFile={setResumeFile}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  domain={domain}
                  setDomain={setDomain}
                  setQuestions={setQuestions}
                  interviewType={interviewType}
                />
              }
            />
            <Route
              path="/interview"
              element={
                <Page2
                  questions={questions}
                  answers={answers}
                  setAnswers={setAnswers}
                  evaluations={evaluations}
                  setEvaluations={setEvaluations}
                  setTotalScore={setTotalScore}
                  interviewType={interviewType}
                />
              }
            />
            <Route
              path="/results"
              element={<Page3 evaluations={evaluations} totalScore={totalScore} />}
            />
          </Routes>
        </AnimatePresence>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Ace Interview. Last updated: {new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: true, month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </footer>
    </Router>
  );
}

export default App;
