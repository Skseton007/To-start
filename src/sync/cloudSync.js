// Firebase connection: Google sign-in + Firestore. Loaded only when sync is configured,
// so the app stays small and fully offline-capable without it.
import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, onAuthStateChanged,
  signInWithPopup, signInWithRedirect, getRedirectResult, signOut as fbSignOut,
} from 'firebase/auth';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, getDocs, getDocFromServer, getDocsFromServer, onSnapshot, writeBatch,
} from 'firebase/firestore';
import { COLLECTIONS } from './syncCore';

// Firestore allows 500 writes per batch
const BATCH_LIMIT = 450;

export function initCloud(config) {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = initializeFirestore(app, {
    // Keeps a copy on the device: works offline and queues changes until back online
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    ignoreUndefinedProperties: true,
  });

  // Finish a redirect sign-in if one was started (fallback for blocked popups)
  getRedirectResult(auth).catch(e => console.error('Sign-in redirect failed:', e));

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, provider);
      } else if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        throw e;
      }
    }
  };

  const backendFor = (uid) => {
    const userDoc = doc(db, 'users', uid);
    const colRef = (col) => collection(db, 'users', uid, col);
    const toDocs = (snap) => snap.docs.map(d => ({ id: d.id, data: d.data() }));

    return {
      // fromServer: never trust an empty local cache (first sign-in on a device),
      // otherwise an offline phone could think the cloud is empty and upload over it
      async loadAll({ fromServer = false } = {}) {
        const readDoc = fromServer ? getDocFromServer : getDoc;
        const readDocs = fromServer ? getDocsFromServer : getDocs;
        const [profileSnap, ...colSnaps] = await Promise.all([
          readDoc(userDoc),
          ...COLLECTIONS.map(col => readDocs(colRef(col))),
        ]);
        const collections = {};
        COLLECTIONS.forEach((col, i) => { collections[col] = toDocs(colSnaps[i]); });
        return { profile: profileSnap.exists() ? profileSnap.data() : null, collections };
      },

      async commit({ docs, profile }) {
        const ops = docs.map(d => (batch) => {
          const ref = doc(db, 'users', uid, d.col, d.id);
          if (d.data) batch.set(ref, d.data);
          else batch.delete(ref);
        });
        if (Object.keys(profile).length) {
          ops.push((batch) => batch.set(userDoc, { ...profile, updatedAt: new Date().toISOString() }, { merge: true }));
        }
        const commits = [];
        for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
          const batch = writeBatch(db);
          ops.slice(i, i + BATCH_LIMIT).forEach(op => op(batch));
          commits.push(batch.commit());
        }
        await Promise.all(commits);
      },

      subscribe(onCollection, onProfile) {
        const unsubs = COLLECTIONS.map(col => onSnapshot(
          colRef(col),
          (snap) => onCollection(col, toDocs(snap), snap.metadata.hasPendingWrites),
          (e) => console.error(`Sync listener failed (${col}):`, e),
        ));
        unsubs.push(onSnapshot(
          userDoc,
          (snap) => onProfile(snap.exists() ? snap.data() : null, snap.metadata.hasPendingWrites),
          (e) => console.error('Sync listener failed (profile):', e),
        ));
        return () => unsubs.forEach(u => u());
      },
    };
  };

  return {
    onAuth: (cb) => onAuthStateChanged(auth, cb),
    signIn,
    signOut: () => fbSignOut(auth),
    backendFor,
  };
}
