import React, { useState, useEffect } from 'react';
import { fetchDayStatus, updateQuestionStatus, updateDayStatus } from '../api';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, ExternalLink, Flame } from 'lucide-react';
import './Dashboard.css';

// ── helpers ──────────────────────────────────────────
const isSolved = (s) => s === 'solved';

const Dashboard = () => {
  const [day, setDay] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [dayStatus, setDayStatus] = useState('not_started');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadDay(day); }, [day]);

  const loadDay = async (d) => {
    setLoading(true);
    try {
      const { data } = await fetchDayStatus(d);
      setQuestions(data.questions || []);
      setDayStatus(data.status || 'not_started');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = isSolved(currentStatus) ? 'pending' : 'solved';
    try {
      await updateQuestionStatus(id, newStatus);
      setQuestions(qs =>
        qs.map(q => q._id === id ? { ...q, status: newStatus } : q)
      );
      if (newStatus === 'solved') showToast('Question marked as solved! ✅');
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleMarkDayComplete = async () => {
    try {
      await updateDayStatus(day, 'completed');
      setDayStatus('completed');
      showToast(`Day ${day} completed! 🔥`);
    } catch (err) {
      console.error(err);
    }
  };

  const solvedCount = questions.filter(q => isSolved(q.status)).length;
  const totalCount = questions.length;
  const pct = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;
  const isAllSolved = solvedCount === totalCount && totalCount > 0;

  // Determine month from day
  const month = Math.ceil(day / 30);

  return (
    <div className="dashboard animate-fade-in">

      {/* ── Day header ── */}
      <div className="day-header">
        <div className="day-info">
          <div className="month-chip mono">Month {month}</div>
          <h1 className="text-gradient day-title">Day {day} Mission</h1>
          <p className="text-muted">Stay consistent · {600 - solvedCount} questions left to 600</p>
        </div>
        <div className="day-nav">
          <button
            className="btn outline sm"
            onClick={() => setDay(d => Math.max(1, d - 1))}
            disabled={day === 1}
            aria-label="Previous day"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="day-badge mono">Day {day} / 90</span>
          <button
            className="btn primary sm"
            onClick={() => setDay(d => d + 1)}
            aria-label="Next day"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading mono">Loading your mission...</div>
      ) : (
        <div className="mission-layout">

          {/* ── Sidebar panel ── */}
          <div className="mission-sidebar">
            <div className="card progress-panel">
              <div className="pct-ring">
                <svg viewBox="0 0 80 80" className="ring-svg">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--line)" strokeWidth="7"/>
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="url(#pctGrad)"
                    strokeWidth="7"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                  <defs>
                    <linearGradient id="pctGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="pct-label">
                  <span className="pct-num">{pct}%</span>
                  <span className="text-xs text-muted">done</span>
                </div>
              </div>

              <div className="progress-stats">
                <div className="pstat">
                  <span className="pstat-val">{solvedCount}</span>
                  <span className="pstat-label text-muted text-xs">Solved</span>
                </div>
                <div className="pstat-divider" />
                <div className="pstat">
                  <span className="pstat-val">{totalCount - solvedCount}</span>
                  <span className="pstat-label text-muted text-xs">Remaining</span>
                </div>
                <div className="pstat-divider" />
                <div className="pstat">
                  <span className="pstat-val">{totalCount}</span>
                  <span className="pstat-label text-muted text-xs">Total</span>
                </div>
              </div>

              <div className="progress-bar-bg mt-4">
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>

              {isAllSolved && dayStatus !== 'completed' && (
                <button className="btn success full-width mt-4" onClick={handleMarkDayComplete}>
                  <Flame size={16} /> Complete Day {day}
                </button>
              )}

              {dayStatus === 'completed' && (
                <div className="status-badge success full-width mt-4">
                  🎉 Day {day} Completed!
                </div>
              )}
            </div>

            {/* Difficulty breakdown */}
            <div className="card diff-panel mt-4">
              <h4 className="text-sm text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Difficulty</h4>
              {['Easy', 'Medium', 'Hard'].map(d => {
                const total = questions.filter(q => q.difficulty === d).length;
                const done  = questions.filter(q => q.difficulty === d && isSolved(q.status)).length;
                const p = total ? Math.round((done / total) * 100) : 0;
                const cls = d.toLowerCase();
                return (
                  <div key={d} className="diff-row">
                    <span className={`badge badge-${cls}`}>{d}</span>
                    <div className="diff-bar-bg">
                      <div className={`diff-bar-fill diff-fill-${cls}`} style={{ width: `${p}%` }} />
                    </div>
                    <span className="mono text-xs text-muted">{done}/{total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Question List ── */}
          <div className="question-list">
            {questions.map((q, idx) => (
              <div
                key={q._id}
                className={`q-card card animate-fade-in ${isSolved(q.status) ? 'q-solved' : ''}`}
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <button
                  className="q-check"
                  onClick={() => handleToggleStatus(q._id, q.status)}
                  aria-label={isSolved(q.status) ? 'Mark as pending' : 'Mark as solved'}
                >
                  {isSolved(q.status)
                    ? <CheckCircle size={22} className="check-icon solved" />
                    : <Circle size={22} className="check-icon pending" />
                  }
                </button>

                <div className="q-body">
                  <a href={q.link} target="_blank" rel="noreferrer" className="q-title">
                    {q.title}
                  </a>
                  <div className="q-meta">
                    <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                    <span className="q-topic mono text-xs text-muted">{q.topic}</span>
                  </div>
                </div>

                <a
                  href={q.link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn outline sm q-solve-btn"
                  aria-label={`Solve ${q.title}`}
                >
                  <ExternalLink size={14} /> Solve
                </a>
              </div>
            ))}

            {totalCount === 0 && (
              <div className="empty-state">
                <div>No questions assigned for Day {day}.</div>
                <div className="text-xs text-dim mt-2">Try a different day or seed the database.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type}`} role="alert">
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
