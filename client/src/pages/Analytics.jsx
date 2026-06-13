import React, { useState, useEffect } from 'react';
import { fetchStats } from '../api';
import { Flame, Trophy, Target, Zap, BookOpen, TrendingUp } from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const { data } = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading mono animate-fade-in">Crunching your data…</div>;

  const total    = stats?.total   || 0;
  const solved   = stats?.solved  || 0;
  const pending  = stats?.pending || 0;
  const streak   = stats?.streak  || {};
  const diff     = stats?.difficulty || {};
  const topics   = (stats?.topicStats || []).sort((a, b) => b.solved - a.solved).slice(0, 10);
  const pct      = total ? Math.round((solved / total) * 100) : 0;

  const MetricCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className={`metric-card card animate-fade-in`}>
      <div className="metric-icon" style={{ color }}>
        <Icon size={28} />
      </div>
      <div className="metric-body">
        <div className="metric-value">{value}</div>
        <div className="metric-label text-muted text-sm">{label}</div>
        {sub && <div className="metric-sub text-dim text-xs">{sub}</div>}
      </div>
    </div>
  );

  const DiffBar = ({ label, color, solved: s, total: t }) => {
    const p = t ? Math.round((s / t) * 100) : 0;
    return (
      <div className="diff-row-full">
        <span className={`badge badge-${label.toLowerCase()}`}>{label}</span>
        <div className="diff-bar-bg-full">
          <div
            className="diff-bar-fill-full"
            style={{ width: `${p}%`, background: color }}
          />
        </div>
        <span className="mono text-xs text-muted">{s}/{t}</span>
        <span className="mono text-xs" style={{ color }}>{p}%</span>
      </div>
    );
  };

  return (
    <div className="analytics animate-fade-in">
      <div className="analytics-header">
        <h1 className="text-gradient">Analytics</h1>
        <p className="text-muted">Your progress across 90 days and 600 questions.</p>
      </div>

      {/* ── Overall Progress ── */}
      <div className="card overall-card mb-6">
        <div className="overall-left">
          <h3 style={{ marginBottom: 6 }}>Overall Progress</h3>
          <p className="text-muted text-sm">{solved} solved out of {total} total questions</p>
          <div className="progress-bar-bg mt-4" style={{ height: 12, borderRadius: 99 }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="pct-label-row mt-2">
            <span className="text-xs text-muted">{pending} pending</span>
            <span className="text-gradient" style={{ fontWeight: 800, fontSize: '1.1rem' }}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="metrics-grid mb-6">
        <MetricCard icon={Flame}    label="Current Streak" value={`${streak.current || 0}d`} color="var(--hard)" sub="Keep going!" />
        <MetricCard icon={Trophy}   label="Best Streak"    value={`${streak.max || 0}d`}     color="var(--med)"  sub="Personal best" />
        <MetricCard icon={Target}   label="Solved"         value={solved}                     color="var(--accent)" sub={`${pct}% complete`} />
        <MetricCard icon={Zap}      label="Pending"        value={pending}                    color="var(--primary)" sub="Questions left" />
        <MetricCard icon={BookOpen} label="Total"          value={total}                      color="var(--accent2)" sub="In your bank" />
        <MetricCard icon={TrendingUp} label="Daily Avg"    value={streak.current ? Math.round(solved / (streak.current || 1)) : 0}  color="var(--easy)" sub="questions/day" />
      </div>

      {/* ── Difficulty ── */}
      <div className="card mb-6">
        <h3 style={{ marginBottom: 20 }}>Performance by Difficulty</h3>
        <DiffBar label="Easy"   color="var(--easy)" solved={diff.easy?.solved   || 0} total={diff.easy?.total   || 0} />
        <DiffBar label="Medium" color="var(--med)"  solved={diff.medium?.solved || 0} total={diff.medium?.total || 0} />
        <DiffBar label="Hard"   color="var(--hard)" solved={diff.hard?.solved   || 0} total={diff.hard?.total   || 0} />
      </div>

      {/* ── Topic Breakdown ── */}
      {topics.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Top Topics</h3>
          <div className="topic-grid">
            {topics.map(t => {
              const p = t.total ? Math.round((t.solved / t.total) * 100) : 0;
              return (
                <div key={t._id} className="topic-row">
                  <span className="topic-name text-sm">{t._id}</span>
                  <div className="diff-bar-bg-full">
                    <div
                      className="diff-bar-fill-full"
                      style={{
                        width: `${p}%`,
                        background: `linear-gradient(90deg, var(--primary), var(--accent))`
                      }}
                    />
                  </div>
                  <span className="mono text-xs text-muted">{t.solved}/{t.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
