import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertTriangle, LogOut, Smartphone, Laptop } from 'lucide-react';
import { syncManager } from '../sync/syncManager';

export function useSync() {
  return useSyncExternalStore(syncManager.subscribe, syncManager.getState);
}

const STATUS = {
  'signed-out': { label: 'Not syncing', Icon: CloudOff, cls: 'text-[var(--text-muted)]' },
  connecting: { label: 'Connecting…', Icon: RefreshCw, cls: 'text-indigo-500 animate-spin' },
  saving: { label: 'Syncing…', Icon: RefreshCw, cls: 'text-indigo-500 animate-spin' },
  synced: { label: 'All devices up to date', Icon: Cloud, cls: 'text-emerald-500' },
  offline: { label: 'Offline — changes will sync when you reconnect', Icon: CloudOff, cls: 'text-amber-500' },
  error: { label: 'Sync problem', Icon: AlertTriangle, cls: 'text-red-500' },
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

// Sign-in / status panel content, shared by the top-bar popover and the Settings page
export function SyncPanel() {
  const sync = useSync();
  const st = STATUS[sync.status] || STATUS['signed-out'];

  if (!sync.configured) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Cloud sync isn't set up yet, so your data stays on this device only.
      </p>
    );
  }

  if (!sync.user) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Laptop size={18} /> <span className="text-lg leading-none">⇄</span> <Smartphone size={18} />
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Sign in on each device with the same Google account. Anything you add or change shows on all of them instantly.
        </p>
        <button className="btn-outline w-full" onClick={() => syncManager.signIn()} disabled={sync.status === 'connecting'}>
          <GoogleIcon /> Sign in with Google
        </button>
        {sync.error && <p className="text-sm text-red-500">{sync.error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {sync.user.photo
          ? <img src={sync.user.photo} alt="" className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
          : <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">{(sync.user.name || sync.user.email || '?')[0]}</div>}
        <div className="min-w-0">
          <div className="font-semibold truncate">{sync.user.name || 'Signed in'}</div>
          <div className="text-xs text-[var(--text-muted)] truncate">{sync.user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <st.Icon size={16} className={st.cls} />
        <span>{st.label}</span>
        {sync.status === 'synced' && <Check size={14} className="text-emerald-500" />}
      </div>
      {sync.error && <p className="text-sm text-red-500">{sync.error}</p>}
      <button className="btn-secondary w-full" onClick={() => syncManager.signOut()}>
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}

// Asked once per device when it already has its own items and the account has data too
function MergeDialog() {
  const sync = useSync();
  if (!sync.mergePrompt) return null;
  const n = sync.mergePrompt.count;
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-card border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-md p-6" role="dialog" aria-modal="true">
        <h2 className="text-lg font-bold mb-2">Keep this device's data?</h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          This device has {n} item{n === 1 ? '' : 's'} (tasks, ideas, notes…) that are not in your account yet.
          Add them to your account so they show on all your devices, or use only what's already in your account?
        </p>
        <div className="flex flex-col gap-2">
          <button className="btn-primary w-full" onClick={() => syncManager.answerMerge(true)}>
            Add them to my account
          </button>
          <button className="btn-secondary w-full" onClick={() => syncManager.answerMerge(false)}>
            Use my account's data only
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SyncButton() {
  const sync = useSync();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { syncManager.init(); }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!sync.configured) return null;
  const st = STATUS[sync.status] || STATUS['signed-out'];

  return (
    <div className="relative" ref={ref}>
      <button
        className="icon-btn relative"
        onClick={() => setOpen(o => !o)}
        aria-label={`Sync: ${st.label}`}
        title={st.label}
        aria-expanded={open}
      >
        <st.Icon size={20} className={st.cls} />
        {!sync.user && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />}
      </button>
      {open && (
        <div className="more-menu w-72 p-4" role="dialog" aria-label="Sync across devices">
          <h3 className="font-bold mb-3">Sync across devices</h3>
          <SyncPanel />
        </div>
      )}
      <MergeDialog />
    </div>
  );
}
