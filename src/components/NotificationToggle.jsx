import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useToast } from './Toast';

const supported = typeof window !== 'undefined' && 'Notification' in window;

export default function NotificationToggle() {
  const [permission, setPermission] = useState(supported ? Notification.permission : 'denied');
  const [justEnabled, setJustEnabled] = useState(false);
  const { addToast } = useToast();

  const requestPermission = async () => {
    if (!supported) {
      addToast('Notifications are not supported in this browser.', 'error');
      return;
    }
    if (permission === 'denied') {
      addToast('Notifications are blocked. Please enable them in your browser settings.', 'error');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setJustEnabled(true);
        addToast('Notifications enabled successfully!', 'success');
      } else {
        addToast('Notification permission denied.', 'error');
      }
    } catch {
      addToast('Failed to request permission.', 'error');
    }
  };

  if (permission === 'granted') {
    return (
      <span className={`icon-btn text-indigo-500 hover:text-indigo-500 ${justEnabled ? 'animate-ring' : ''}`} title="Notifications active">
        <BellRing size={20} />
      </span>
    );
  }

  return (
    <button onClick={requestPermission} className="btn-outline px-3 py-1.5 text-xs" title="Enable notifications">
      <Bell size={16} /> <span className="hidden sm:inline">Allow Alerts</span>
    </button>
  );
}
