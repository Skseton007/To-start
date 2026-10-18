// Sync state for the UI (sign-in, status, merge question). Firebase itself is loaded lazily.
import store from '../store/dataStore';
import { SyncEngine } from './syncCore';
import { firebaseConfig, isSyncConfigured } from './firebaseConfig';

const LAST_UID_KEY = 'tostart_sync_uid';

let state = {
  configured: isSyncConfigured,
  // off | signed-out | connecting | synced | saving | offline | error
  status: isSyncConfigured ? 'connecting' : 'off',
  user: null,
  error: null,
  mergePrompt: null, // { count } while asking whether to merge this device's data
};
const listeners = new Set();
let cloud = null;
let engine = null;
let started = false;
let mergeResolve = null;
let engineStatus = 'connecting';
let currentUid = null;

const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
};

const online = () => typeof navigator === 'undefined' || navigator.onLine !== false;

const refreshStatus = () => {
  if (!state.configured) return set({ status: 'off' });
  if (!state.user) return set({ status: cloud ? 'signed-out' : 'connecting' });
  if (engineStatus === 'error') return set({ status: 'error' });
  if (!online()) return set({ status: 'offline' });
  set({ status: engineStatus });
};

export const syncManager = {
  getState: () => state,

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async init() {
    if (started || !isSyncConfigured) return;
    started = true;
    window.addEventListener('online', () => {
      // Retry a connection that failed while offline
      if (currentUid && engineStatus === 'error' && cloud) connect(currentUid);
      refreshStatus();
    });
    window.addEventListener('offline', refreshStatus);
    // Send waiting changes right away when the app is hidden or closed
    // (switching apps on a phone, closing the tab)
    const flushNow = () => { if (engine?.pendingDocs.size || Object.keys(engine?.pendingProfile || {}).length) engine.flush(); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNow(); });
    window.addEventListener('pagehide', flushNow);
    try {
      const { initCloud } = await import('./cloudSync');
      cloud = initCloud(firebaseConfig);
      cloud.onAuth((user) => {
        engine?.stop();
        engine = null;
        currentUid = user?.uid || null;
        if (!user) {
          set({ user: null, error: null });
          refreshStatus();
          return;
        }
        set({ user: { name: user.displayName, email: user.email, photo: user.photoURL }, error: null });
        connect(user.uid);
      });
      refreshStatus();
    } catch (e) {
      console.error('Could not start cloud sync:', e);
      set({ status: 'error', error: 'Could not start sync.' });
    }
  },

  async signIn() {
    if (!cloud) return;
    try {
      set({ error: null });
      await cloud.signIn();
    } catch (e) {
      console.error('Sign-in failed:', e);
      const msg = e?.code === 'auth/unauthorized-domain'
        ? 'This website address is not allowed yet. Add it in Firebase → Authentication → Settings → Authorized domains.'
        : 'Sign-in failed. Please try again.';
      set({ error: msg });
    }
  },

  async signOut() {
    if (!cloud) return;
    await engine?.flush();
    await cloud.signOut();
  },

  answerMerge(merge) {
    mergeResolve?.(merge);
    mergeResolve = null;
    set({ mergePrompt: null });
  },
};

async function connect(uid) {
  engine?.stop();
  const firstTimeOnDevice = localStorage.getItem(LAST_UID_KEY) !== uid;
  engineStatus = 'connecting';
  refreshStatus();
  const current = new SyncEngine(store, cloud.backendFor(uid), {
    onStatus: (s) => { engineStatus = s; refreshStatus(); },
    onError: () => set({ error: 'Some changes could not be uploaded yet. Retrying…' }),
  });
  engine = current;
  try {
    await current.connect({
      firstTimeOnDevice,
      askMerge: (count) => new Promise((resolve) => {
        mergeResolve = resolve;
        set({ mergePrompt: { count } });
      }),
    });
    if (engine === current) {
      localStorage.setItem(LAST_UID_KEY, uid);
      set({ error: null });
    }
  } catch (e) {
    console.error('Sync connect failed:', e);
    engineStatus = 'error';
    set({ error: e?.code === 'permission-denied'
      ? 'The cloud database refused access. Check the Firestore security rules.'
      : 'Could not reach the cloud. Will keep working on this device.' });
    refreshStatus();
  }
}
