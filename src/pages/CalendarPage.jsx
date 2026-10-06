import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, 
  Calendar as CalendarIcon, Video, CheckSquare
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, 
  addMonths, subMonths 
} from 'date-fns';
import { useTasks, useVideos } from "../store/useStore";
import { v4 as uuidv4 } from 'uuid';

export default function CalendarPage() {
  const { tasks, addTask } = useTasks();
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

  const getEventsForDate = (date) => {
    const dayTasks = tasks.filter(t => t.date && isSameDay(new Date(t.date), date));
    const dayVideos = videos.filter(v => v.deadline && isSameDay(new Date(v.deadline), date));
    return { dayTasks, dayVideos };
  };

  const { dayTasks: selectedTasks, dayVideos: selectedVideos } = getEventsForDate(selectedDate);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask({
      id: uuidv4(),
      title: newTaskText,
      completed: false,
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
          <button className="icon-btn" onClick={prevMonth}><ChevronLeft /></button>
          <h2>{format(currentDate, dateFormat)}</h2>
          <button className="icon-btn" onClick={nextMonth}><ChevronRight /></button>
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
                onClick={() => setSelectedDate(day)}
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

        <div className="events-lists" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
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
              <button type="submit" className="btn-primary" style={{ padding: '8px' }}>
                <Plus size={20} />
              </button>
            </form>

            {selectedTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No tasks for this date.</p>
            ) : (
              <ul className="task-list" style={{ listStyle: 'none', padding: 0 }}>
                {selectedTasks.map(task => (
                  <li key={task.id} className="task-item" style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '8px' }}>
                    {task.title}
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

