import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

// ---------- helpers ----------

function toArrayOfStrings(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x.map(String).filter(Boolean);
  return [String(x)].filter(Boolean);
}

// Turn raw 0–100 or 0–10 into 0–10
function parseScore(raw) {
  if (raw == null) return null;

  if (typeof raw === 'number' && isFinite(raw)) {
    let v = raw;
    if (v > 10) v = v / 10; // 0–100 -> /10
    return Math.max(0, Math.min(10, v));
  }

  const m = String(raw).trim().match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  let v = parseFloat(m[0]);
  if (!isFinite(v)) return null;
  if (v > 10) v = v / 10;
  return Math.max(0, Math.min(10, v));
}

// Normalize any evaluation object/string to our UI format
function coerceEvaluation(ev) {
  let obj = ev;
  if (typeof ev === 'string') {
    try {
      obj = JSON.parse(ev);
    } catch {
      return {
        score: null,
        strengths: [],
        improvements: [],
        detailed: String(ev),
        subscores: {}
      };
    }
  }
  if (!obj || typeof obj !== 'object') {
    return {
      score: null,
      strengths: [],
      improvements: [],
      detailed: '',
      subscores: {}
    };
  }

  // Prefer overall_score, fall back to score
  const rawScore = obj.overall_score ?? obj.score;

  // Strengths
  const strengths = toArrayOfStrings(obj.strengths);

  // Improvements: weaknesses + suggestions + legacy improvements
  let improvements = [];
  if (obj.weaknesses) improvements = improvements.concat(toArrayOfStrings(obj.weaknesses));
  if (obj.suggestions) improvements = improvements.concat(toArrayOfStrings(obj.suggestions));
  if (!improvements.length && obj.improvements) {
    improvements = improvements.concat(toArrayOfStrings(obj.improvements));
  }

  // Detailed feedback / model answer text
  const pieces = [];
  if (obj.detailed_feedback) pieces.push(String(obj.detailed_feedback));
  if (obj.model_answer) pieces.push(String(obj.model_answer)); // backwards compat
  const detailed = pieces.join('\n\n');

  // Subscores (0–10 scale for display)
  const subscores = {
    accuracy: parseScore(obj.accuracy_score),
    completeness: parseScore(obj.completeness_score),
    clarity: parseScore(obj.clarity_score),
    depth: parseScore(obj.depth_score),
    relevance: parseScore(obj.relevance_score)
  };

  return {
    score: parseScore(rawScore),
    strengths,
    improvements,
    detailed,
    subscores
  };
}

// ---------- component ----------

function Page3({ evaluations, totalScore }) {
  const navigate = useNavigate();

  // evaluations: { [questionText]: evaluationObjectOrString }
  const normalized = useMemo(() => {
    if (!evaluations || typeof evaluations !== 'object') return [];
    return Object.entries(evaluations).map(([question, ev]) => {
      const c = coerceEvaluation(ev);
      return { question, ...c };
    });
  }, [evaluations]);

  const computedTotal = useMemo(() => {
    const nums = normalized
      .map(e => e.score)
      .filter(s => typeof s === 'number' && isFinite(s));
    if (!nums.length) return null;
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return Math.max(0, Math.min(10, avg));
  }, [normalized]);

  const finalTotal =
    typeof totalScore === 'number' && isFinite(totalScore)
      ? Math.max(0, Math.min(10, totalScore))
      : computedTotal;

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

      <div className="results-container">
        {finalTotal != null && finalTotal > 8 && <Confetti />}

        <motion.div
          className="results-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="results-header">
            <h1>Interview Results</h1>
          </div>

          {!normalized.length ? (
            <p className="error">No evaluations available.</p>
          ) : (
            <>
              <motion.div
                className="total-score"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h2>
                  Total Score:{' '}
                  {finalTotal != null ? finalTotal.toFixed(1) : 'N/A'} / 10
                </h2>
              </motion.div>

              <div className="evaluations-list">
                {normalized.map((item, index) => (
                  <motion.div
                    key={index}
                    className="evaluation-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 + 0.2 }}
                  >
                    <strong>Question:</strong> {item.question}
                    <br />
                    <strong>Overall Score:</strong>{' '}
                    {typeof item.score === 'number'
                      ? `${item.score.toFixed(1)}/10`
                      : 'N/A'}
                    <br />

                    {/* Subscores */}
                    {item.subscores && Object.values(item.subscores).some(v => v != null) && (
                      <div className="subscores">
                        <strong>Breakdown:</strong>
                        <ul>
                          {item.subscores.accuracy != null && (
                            <li>Accuracy: {item.subscores.accuracy.toFixed(1)}/10</li>
                          )}
                          {item.subscores.completeness != null && (
                            <li>Completeness: {item.subscores.completeness.toFixed(1)}/10</li>
                          )}
                          {item.subscores.clarity != null && (
                            <li>Clarity: {item.subscores.clarity.toFixed(1)}/10</li>
                          )}
                          {item.subscores.depth != null && (
                            <li>Depth: {item.subscores.depth.toFixed(1)}/10</li>
                          )}
                          {item.subscores.relevance != null && (
                            <li>Relevance: {item.subscores.relevance.toFixed(1)}/10</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {item.strengths?.length > 0 && (
                      <>
                        <strong>Strengths:</strong>
                        <ul>
                          {item.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {item.improvements?.length > 0 && (
                      <>
                        <strong>Improvements:</strong>
                        <ul>
                          {item.improvements.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {item.detailed && (
                      <>
                        <strong>Detailed Feedback:</strong>
                        <p>{item.detailed}</p>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}

          <motion.button
            onClick={() => navigate('/')}
            className="nav-button primary"
            style={{ margin: '2rem auto 0', display: 'block', maxWidth: '300px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Start New Interview
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}

export default Page3;
