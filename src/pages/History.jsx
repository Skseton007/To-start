import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import { CheckSquare, Lightbulb, FileText, Target } from 'lucide-react';
import { useTasks, useVideos, useSettings, useAnalytics } from "../store/useStore";

const PERIODS = { Day: 'day', Week: 'week', Month: 'month' };
const STATUS_ORDER = ['idea', 'script', 'recording', 'editing', 'review', 'ready', 'published'];

export default function History() {
  const { getCompletionsByDate } = useTasks();
  const { videos } = useVideos();
  const { settings } = useSettings();
  const { getStats } = useAnalytics();
  const [period, setPeriod] = useState('Week');

  const isDark = settings.theme === 'dark';
  const themeColors = {
    primary: isDark ? '#ffffff' : '#111111',
    secondary: isDark ? '#a1a1aa' : '#6b6b73',
    pie: isDark
      ? ['#ffffff', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a']
      : ['#111111', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'],
  };

  const stats = getStats(PERIODS[period]);

  // Month shows the last 30 days, Day/Week the last 7
  const chartDays = period === 'Month' ? 30 : 7;
  const counts = getCompletionsByDate(
    format(subDays(new Date(), chartDays - 1), 'yyyy-MM-dd'),
    format(new Date(), 'yyyy-MM-dd')
  );
  const chartData = Array.from({ length: chartDays }, (_, i) => {
    const d = subDays(new Date(), chartDays - 1 - i);
    return {
      name: format(d, chartDays > 7 ? 'd MMM' : 'EEE'),
      completed: counts[format(d, 'yyyy-MM-dd')] || 0,
    };
  });

  const pieData = STATUS_ORDER
    .map(status => ({ name: status, value: videos.filter(v => v.status === status).length }))
    .filter(d => d.value > 0);

  const periodLabel = { Day: 'Today', Week: 'This week', Month: 'This month' }[period];
  const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)' };

  return (
    <div className="page-container history-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & History</h1>
          <p className="page-subtitle">Track your productivity and content growth</p>
        </div>

        <div className="tabs" role="tablist">
          {Object.keys(PERIODS).map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={period === t}
              className={`tab ${period === t ? 'active' : ''}`}
              onClick={() => setPeriod(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Tasks Completed', value: stats.completedTasks, Icon: CheckSquare },
          { label: 'Ideas Created', value: stats.ideasCreated, Icon: Lightbulb },
          { label: 'Scripts Written', value: stats.scriptsWritten, Icon: FileText },
          { label: 'Videos Published', value: stats.videosPublished, Icon: Target },
        ].map(({ label, value, Icon }, i) => (
          <div key={label} className="stat-card card card-3d animate-task-enter" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="stat-icon"><Icon size={24} /></div>
            <div className="stat-info">
              <h3>{label}</h3>
              <p className="stat-value">{value}</p>
              <p className="text-xs text-[var(--text-muted)]">{periodLabel}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '24px' }}>
        <div className="chart-card card" style={{ padding: '24px' }}>
          <h3 className="font-bold mb-5">Tasks Completed (Last {chartDays} Days)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke={themeColors.secondary} tickLine={false} axisLine={false} fontSize={12} interval={chartDays > 7 ? 4 : 0} />
                <YAxis stroke={themeColors.secondary} tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} width={28} />
                <Tooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-main)' }} labelStyle={{ color: 'var(--text-muted)' }} />
                <Bar dataKey="completed" name="Completed" fill={themeColors.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card card" style={{ padding: '24px' }}>
          <h3 className="font-bold mb-5">Content by Status</h3>
          <div style={{ height: '300px' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" stroke="var(--bg-card)">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={themeColors.pie[STATUS_ORDER.indexOf(entry.name)]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-main)', textTransform: 'capitalize' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No content data available
              </div>
            )}
          </div>
          {pieData.length > 0 && (
            <div className="chart-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', marginTop: '20px' }}>
              {pieData.map((entry) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid var(--border)', backgroundColor: themeColors.pie[STATUS_ORDER.indexOf(entry.name)] }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
