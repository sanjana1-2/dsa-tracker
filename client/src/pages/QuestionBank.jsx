import React, { useState, useEffect } from 'react';
import { fetchQuestions, updateQuestionStatus } from '../api';
import { CheckCircle, Circle, ExternalLink, Search, Filter } from 'lucide-react';
import './QuestionBank.css';

const isSolved = (s) => s === 'solved';

const TOPICS = [
  'Binary Tree', 'BST', 'Graph BFS', 'Graph DFS',
  'DP', 'Stack', 'Two Pointer', 'Sliding Window', 'Heap',
  'Linked List', 'Array', 'String', 'Recursion', 'Sorting', 'Backtracking'
];

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadQuestions(); }, [filterTopic, filterDiff, filterStatus]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await fetchQuestions(null, filterTopic, filterDiff);
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleToggle = async (id, currentStatus) => {
    const newStatus = isSolved(currentStatus) ? 'pending' : 'solved';
    try {
      await updateQuestionStatus(id, newStatus);
      setQuestions(qs => qs.map(q => q._id === id ? { ...q, status: newStatus } : q));
    } catch (err) {
      console.error(err);
    }
  };

  // Client-side search + status filter
  const visible = questions.filter(q => {
    if (filterStatus === 'solved' && !isSolved(q.status)) return false;
    if (filterStatus === 'pending' && isSolved(q.status)) return false;
    if (search && !q.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const solvedCount  = questions.filter(q => isSolved(q.status)).length;
  const totalCount   = questions.length;
  const pct          = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="qbank animate-fade-in">

      {/* ── Header ── */}
      <div className="qbank-header">
        <div>
          <h1 className="text-gradient">Question Bank</h1>
          <p className="text-muted">All curated problems across 90 days.</p>
        </div>
        <div className="qbank-stats">
          <div className="mini-stat">
            <span className="mini-val mono">{solvedCount}</span>
            <span className="text-xs text-muted">Solved</span>
          </div>
          <div className="mini-stat">
            <span className="mini-val mono">{totalCount - solvedCount}</span>
            <span className="text-xs text-muted">Pending</span>
          </div>
          <div className="mini-stat">
            <span className="mini-val mono">{pct}%</span>
            <span className="text-xs text-muted">Done</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-bg mb-6">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* ── Filters ── */}
      <div className="card filters-bar mb-6">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search questions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search questions"
          />
        </div>

        <div className="filter-group">
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            value={filterTopic}
            onChange={e => setFilterTopic(e.target.value)}
            className="filter-select"
            aria-label="Filter by topic"
          >
            <option value="">All Topics</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={filterDiff}
            onChange={e => setFilterDiff(e.target.value)}
            className="filter-select"
            aria-label="Filter by difficulty"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="filter-select"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="solved">Solved</option>
            <option value="pending">Pending</option>
          </select>

          {(filterTopic || filterDiff || filterStatus || search) && (
            <button
              className="btn ghost sm"
              onClick={() => { setFilterTopic(''); setFilterDiff(''); setFilterStatus(''); setSearch(''); }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="loading mono">Loading question bank…</div>
      ) : (
        <div className="table-wrap card">
          <table className="q-table" role="table" aria-label="Question bank">
            <thead>
              <tr>
                <th scope="col" style={{ width: 48 }}></th>
                <th scope="col">Title</th>
                <th scope="col">Topic</th>
                <th scope="col">Difficulty</th>
                <th scope="col">Day</th>
                <th scope="col" style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((q, idx) => (
                <tr
                  key={q._id}
                  className={`q-row ${isSolved(q.status) ? 'q-row-solved' : ''}`}
                  style={{ animationDelay: `${idx * 0.02}s` }}
                >
                  <td className="check-cell">
                    <button
                      className="q-check-btn"
                      onClick={() => handleToggle(q._id, q.status)}
                      aria-label={isSolved(q.status) ? 'Mark pending' : 'Mark solved'}
                    >
                      {isSolved(q.status)
                        ? <CheckCircle size={20} className="check-icon solved" />
                        : <Circle size={20} className="check-icon pending" />
                      }
                    </button>
                  </td>
                  <td className="title-cell">
                    <a href={q.link} target="_blank" rel="noreferrer" className="table-link">
                      {q.title}
                    </a>
                  </td>
                  <td>
                    <span className="topic-chip mono text-xs">{q.topic}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                  </td>
                  <td className="day-cell mono text-xs text-muted">D{q.day}</td>
                  <td className="action-cell">
                    <a
                      href={q.link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn outline sm"
                      aria-label={`Open ${q.title}`}
                    >
                      <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="empty-state">
              No questions match your filters.
            </div>
          )}

          <div className="table-footer">
            Showing <strong>{visible.length}</strong> of <strong>{totalCount}</strong> questions
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
