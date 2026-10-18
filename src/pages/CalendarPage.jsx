import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Check,
  Calendar as CalendarIcon, Video, CheckSquare
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
  addMonths, subMonths
} from 'date-fns';
import { useTasks, useVideos } from "../store/useStore";

export default function CalendarPage() {
  const { tasks, addTask, toggleTask } = useTasks();
  const { videos } = useVideos();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskText, setNewTaskText] = useState('');

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Dates are stored as local 'yyyy-MM-dd', so compare strings.
  // (new Date('yyyy-MM-dd') is UTC midnight and landed on the wrong day west of UTC.)
  const getEventsForDate = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === key);
    const dayVideos = videos.filter(v => (v.deadline || '').slice(0, 10) === key);
    return { dayTasks, dayVideos };
  };

  const { dayTasks: selectedTasks, dayVideos: selectedVideos } = getEventsForDate(selectedDate);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask({
      title: newTaskText.trim(),
      date: format(selectedDate, 'yyyy-MM-dd')
    });
    setNewTaskText('');
  };

  return (
    <div className="page-container calendar-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Schedule your work and content</p>
        </div>
      </div>

      <div className="calendar-container card">
        <div className="calendar-header">
          <button className="icon-btn" onClick={prevMonth} aria-label="Previous month"><ChevronLeft /></button>
          <div className="flex items-center gap-3">
            <h2>{format(currentDate, dateFormat)}</h2>
            <button className="btn-mini" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>Today</button>
          </div>
          <button className="icon-btn" onClick={nextMonth} aria-label="Next month"><ChevronRight /></button>
        </div>

        <div className="calendar-grid">
          {weekDays.map(day => (
            <div key={day} className="calendar-header-cell">{day}</div>
          ))}

          {days.map(day => {
            const { dayTasks, dayVideos } = getEventsForDate(day);
            const hasEvents = dayTasks.length > 0 || dayVideos.length > 0;

            return (
              <div
                key={day.toString()}
                className={`calendar-cell ${!isSameMonth(day, monthStart) ? 'disabled' : ''}
                  ${isToday(day) ? 'today' : ''}
                  ${isSameDay(day, selectedDate) ? 'selected' : ''}
                  ${hasEvents ? 'has-events' : ''}`}
                onClick={() => {
                  setSelectedDate(day);
                  if (!isSameMonth(day, monthStart)) setCurrentDate(day);
                }}
              >
                <span className="day-number">{format(day, 'd')}</span>
                {hasEvents && (
                  <div className="event-dots">
                    {dayTasks.length > 0 && <div className="dot task-dot" />}
                    {dayVideos.length > 0 && <div className="dot video-dot" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="selected-day-panel card" style={{ marginTop: '24px', padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon size={20} />
          Schedule for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>

        <div className="events-lists" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
          <div className="tasks-section">
            <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={16} /> Tasks
            </h4>

            <form onSubmit={handleAddTask} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Add new task..."
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }} aria-label="Add task">
                <Plus size={20} />
              </button>
            </form>

            {selectedTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No tasks for this date.</p>
            ) : (
              <ul className="task-list" style={{ listStyle: 'none', padding: 0 }}>
                {selectedTasks.map(task => (
                  <li key={task.id} className="task-item animate-task-enter" style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '8px' }}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="hidden" checked={!!task.completed} onChange={() => toggleTask(task.id)} />
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-[var(--inverse-bg)] border-[var(--inverse-bg)]' : 'border-[var(--border-strong)]'}`}>
                        {task.completed && <Check size={12} className="text-[var(--inverse-text)]" />}
                      </span>
                      <span className={task.completed ? 'line-through text-[var(--text-muted)]' : ''}>{task.title}</span>
                      {task.time && <span className="ml-auto text-xs text-[var(--text-muted)]">{task.time}</span>}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="videos-section">
            <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={16} /> Video Deadlines
            </h4>
            {selectedVideos.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No video deadlines.</p>
            ) : (
              <ul className="video-list" style={{ listStyle: 'none', padding: 0 }}>
                {selectedVideos.map(video => (
                  <li key={video.id} className="video-item" style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{video.title}</span>
                    <span className="badge">{video.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

