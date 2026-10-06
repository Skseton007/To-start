import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { CheckSquare, Lightbulb, FileText, Video, Target } from 'lucide-react';
import { useTasks, useIdeas, useScripts, useVideos, useSettings } from "../store/useStore";

export default function History() {
  const { tasks } = useTasks();
  const { ideas } = useIdeas();
  const { scripts } = useScripts();
  const { videos } = useVideos();
  const { settings } = useSettings();
  const [period, setPeriod] = useState('Week');

  const themeColors = {
    primary: settings.theme === 'dark' ? '#ffffff' : '#000000',
    secondary: settings.theme === 'dark' ? '#888888' : '#666666',
    accent: settings.theme === 'dark' ? '#333333' : '#e0e0e0',
    pie: ['#ffffff', '#cccccc', '#999999', '#666666', '#333333']
  };
  
  if (settings.theme === 'light') {
    themeColors.pie = ['#000000', '#333333', '#666666', '#999999', '#cccccc'];
  }

  // Calculate Tasks per day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: d,
      name: format(d, 'EEE'),
      completed: tasks.filter(t => t.completed && t.date && t.date === format(d, 'yyyy-MM-dd')).length
    };
  });

  // Calculate Content by Status
  const statusCounts = videos.reduce((acc, video) => {
    acc[video.status] = (acc[video.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const totalTasks = tasks.filter(t => t.completed).length;
  const totalIdeas = ideas.length;
  const totalScripts = scripts.length;
  const totalVideos = videos.length;
  const totalPublished = videos.filter(v => v.status === 'Published').length;

  return (
    <div className="page-container history-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & History</h1>
          <p className="page-subtitle">Track your productivity and content growth</p>
        </div>
        
        <div className="tabs">
          {['Day', 'Week', 'Month'].map(t => (
            <button 
              key={t}
              className={`tab ${period === t ? 'active' : ''}`}
              onClick={() => setPeriod(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card card">
          <div className="stat-icon"><CheckSquare size={24} /></div>
          <div className="stat-info">
            <h3>Tasks Completed</h3>
            <p className="stat-value">{totalTasks}</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon"><Lightbulb size={24} /></div>
          <div className="stat-info">
            <h3>Ideas Created</h3>
            <p className="stat-value">{totalIdeas}</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon"><FileText size={24} /></div>
          <div className="stat-info">
            <h3>Scripts Written</h3>
            <p className="stat-value">{totalScripts}</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon"><Target size={24} /></div>
          <div className="stat-info">
            <h3>Videos Published</h3>
            <p className="stat-value">{totalPublished}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="chart-card card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Tasks Completed (Last 7 Days)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis dataKey="name" stroke={themeColors.secondary} />
                <YAxis stroke={themeColors.secondary} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="completed" fill={themeColors.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Content by Status</h3>
          <div style={{ height: '300px' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={themeColors.pie[index % themeColors.pie.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'none', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No content data available
              </div>
            )}
          </div>
          {pieData.length > 0 && (
            <div className="chart-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
              {pieData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: themeColors.pie[index % themeColors.pie.length] }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

