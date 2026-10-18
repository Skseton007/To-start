import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useTasks } from '../store/useStore';
import { useToast } from './Toast';

// Fires a reminder when a task's time arrives. Reads the permission on every tick,
// so reminders start as soon as the user allows them (no reload needed).
export default function NotificationManager() {
  const { tasks } = useTasks();
  const { addToast } = useToast();
  const notified = useRef(new Set());
  const tasksRef = useRef(tasks);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const currentTime = format(now, 'HH:mm');
      tasksRef.current.forEach(task => {
        const key = `${task.id}-${today}`;
        if (task.completed || task.date !== today || task.time !== currentTime || notified.current.has(key)) return;
        notified.current.add(key);
        addToast(`Reminder: ${task.title}`, 'info');
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Task Reminder', { body: task.title, icon: import.meta.env.BASE_URL + 'logo.png' });
          } catch {
            // Some mobile browsers only allow notifications from a service worker
          }
        }
      });
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [addToast]);

  return null;
}
