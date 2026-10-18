// Firebase project settings for cross-device sync.
// Get them from: Firebase console → Project settings → Your apps → Web app → "firebaseConfig".
// These values are not secret (every Firebase web app ships them to the browser);
// your data is protected by the rules in firestore.rules, which only let you read your own data.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export const isSyncConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
