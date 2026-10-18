// Cloud sync logic, independent of Firebase so it can be tested with a fake backend.
//
// Cloud layout (per signed-in user):
//   users/{uid}                     -> profile fields (settings, goals, streak, ...)
//   users/{uid}/{collection}/{id}   -> one document per task, idea, note, ...
// One document per item means two devices editing different items never overwrite each other,
// and only the items that changed are uploaded.

export const COLLECTIONS = ['tasks', 'ideas', 'notebooks', 'notes', 'scripts', 'videos', 'categories', 'completionLog', 'reminders'];
export const PROFILE_KEYS = ['settings', 'contentGoals', 'streak', 'platforms', 'lastLoginDate', 'schemaVersion'];

// New items appear at the start of these lists (newest first); other lists append
const NEWEST_FIRST = new Set(['tasks', 'ideas', 'notes', 'scripts', 'videos']);

// Wait this long after the last local change before uploading, so typing in a note
// becomes one upload instead of one per keystroke. Still feels instant on the other device.
export const FLUSH_DELAY_MS = 400;

export function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a == b; // null and undefined count as equal (Firestore drops undefined)
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

// What changed between two store snapshots. The store updates immutably,
// so an unchanged item keeps the same object reference.
export function diffData(prev, next) {
  const docs = [];
  const profile = {};
  for (const col of COLLECTIONS) {
    const before = prev?.[col] || [];
    const after = next?.[col] || [];
    if (before === after) continue;
    const beforeById = new Map(before.map(item => [item.id, item]));
    const afterIds = new Set();
    for (const item of after) {
      if (!item?.id) continue;
      afterIds.add(item.id);
      const old = beforeById.get(item.id);
      if (old !== item && !deepEqual(old, item)) docs.push({ col, id: String(item.id), data: item });
    }
    for (const id of beforeById.keys()) {
      if (!afterIds.has(id)) docs.push({ col, id: String(id), data: null });
    }
  }
  for (const key of PROFILE_KEYS) {
    if (prev?.[key] !== next?.[key] && !deepEqual(prev?.[key], next?.[key]) && next?.[key] !== undefined) {
      profile[key] = next[key];
    }
  }
  return { docs, profile };
}

// Everything in `data`, as upload operations (first device to sync)
export function fullUpload(data) {
  return diffData({}, data);
}

export function hasUserContent(data) {
  return ['tasks', 'ideas', 'notebooks', 'notes', 'scripts', 'videos'].some(col => (data?.[col] || []).length > 0);
}

// Build the list for one collection from the cloud documents.
// - keeps local changes that haven't been uploaded yet (`pending`: id -> item, or null = deleted)
// - reuses the local object when nothing changed (no needless re-render)
// - keeps the local order; new items go first or last depending on the list
export function mergeCollection(col, localItems, remoteDocs, pending = new Map()) {
  const localById = new Map((localItems || []).map(item => [String(item.id), item]));
  const localIndex = new Map((localItems || []).map((item, i) => [String(item.id), i]));

  const merged = [];
  const seen = new Set();
  for (const { id, data } of remoteDocs) {
    const key = String(id);
    seen.add(key);
    if (pending.has(key)) {
      const p = pending.get(key);
      if (p) merged.push(p);
      continue;
    }
    const local = localById.get(key);
    merged.push(local && deepEqual(local, data) ? local : data);
  }
  // Local items created here but not uploaded yet
  for (const [key, p] of pending) {
    if (p && !seen.has(key)) merged.push(p);
  }

  const newestFirst = NEWEST_FIRST.has(col);
  const rank = (item) => {
    const i = localIndex.get(String(item.id));
    if (i !== undefined) return i;
    return newestFirst ? -1 : Number.MAX_SAFE_INTEGER;
  };
  const byCreated = (a, b) => (newestFirst
    ? (b.createdAt || '').localeCompare(a.createdAt || '')
    : (a.createdAt || '').localeCompare(b.createdAt || ''));
  merged.sort((a, b) => (rank(a) - rank(b)) || byCreated(a, b));

  const same = localItems && merged.length === localItems.length && merged.every((item, i) => item === localItems[i]);
  return same ? localItems : merged;
}

// Data for the store from a full cloud load: cloud wins, local order is kept
export function buildFromCloud(local, cloud) {
  const patch = {};
  for (const col of COLLECTIONS) {
    if (cloud.collections[col]) patch[col] = mergeCollection(col, local[col], cloud.collections[col]);
  }
  for (const key of PROFILE_KEYS) {
    if (cloud.profile && cloud.profile[key] !== undefined) {
      patch[key] = deepEqual(local[key], cloud.profile[key]) ? local[key] : cloud.profile[key];
    }
  }
  return patch;
}

// Items that exist on this device but not in the cloud
export function localOnlyItems(local, cloud) {
  const docs = [];
  for (const col of COLLECTIONS) {
    const inCloud = new Set((cloud.collections[col] || []).map(d => String(d.id)));
    for (const item of local[col] || []) {
      if (item?.id && !inCloud.has(String(item.id))) docs.push({ col, id: String(item.id), data: item });
    }
  }
  return docs;
}

/**
 * Keeps the store and the cloud in step.
 *
 * backend: {
 *   loadAll(): Promise<{ profile: object|null, collections: { [col]: [{ id, data }] } }>
 *   commit({ docs, profile }): Promise           // upload changes
 *   subscribe(onCollection, onProfile): unsubscribe
 *     onCollection(col, [{ id, data }], hasPendingWrites)
 *     onProfile(profile|null, hasPendingWrites)
 * }
 */
export class SyncEngine {
  constructor(store, backend, { onStatus = () => {}, onError = () => {} } = {}) {
    this.store = store;
    this.backend = backend;
    this.onStatus = onStatus;
    this.onError = onError;
    this.pendingDocs = new Map();   // `${col}/${id}` -> { col, id, data|null }
    this.pendingProfile = {};
    this.inFlight = 0;
    this.timer = null;
    this.unsubs = [];
    this.stopped = false;
  }

  // askMerge(): Promise<boolean> — asked only when this device has items the cloud doesn't
  async connect({ firstTimeOnDevice, askMerge }) {
    this.onStatus('connecting');
    const cloud = await this.backend.loadAll({ fromServer: firstTimeOnDevice });
    if (this.stopped) return;
    const local = this.store.getData();
    const cloudEmpty = !cloud.profile && COLLECTIONS.every(col => !(cloud.collections[col] || []).length);

    if (cloudEmpty) {
      // First device: upload everything it has
      this.enqueue(fullUpload(local));
    } else {
      const extra = firstTimeOnDevice && hasUserContent(local) ? localOnlyItems(local, cloud) : [];
      const merge = extra.length > 0 ? await askMerge(extra.length) : false;
      if (this.stopped) return;
      const patch = buildFromCloud(local, cloud);
      if (merge) {
        for (const doc of extra) {
          patch[doc.col] = [...(patch[doc.col] || []), doc.data];
        }
        this.enqueue({ docs: extra, profile: {} });
      }
      this.store.applyRemote(patch);
    }

    // From now on: upload local changes, apply remote ones
    this.unsubs.push(this.store.subscribeChanges((prev, next, { remote }) => {
      if (!remote) this.enqueue(diffData(prev, next));
    }));
    this.unsubs.push(this.backend.subscribe(
      (col, docs, hasPendingWrites) => this.applyCollection(col, docs, hasPendingWrites),
      (profile, hasPendingWrites) => this.applyProfile(profile, hasPendingWrites),
    ));

    // The cloud copy may be from yesterday: run the daily routine reset on it
    this.store.rollover();
    this.flushSoon(0);
    this.updateStatus();
  }

  enqueue({ docs, profile }) {
    for (const d of docs) this.pendingDocs.set(`${d.col}/${d.id}`, d);
    Object.assign(this.pendingProfile, profile);
    if (docs.length || Object.keys(profile).length) {
      this.onStatus('saving');
      this.flushSoon();
    }
  }

  flushSoon(delay = FLUSH_DELAY_MS) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), delay);
  }

  async flush() {
    if (this.stopped) return;
    const docs = [...this.pendingDocs.values()];
    const profile = this.pendingProfile;
    if (!docs.length && !Object.keys(profile).length) return this.updateStatus();
    this.pendingDocs = new Map();
    this.pendingProfile = {};
    this.inFlight++;
    this.updateStatus();
    try {
      await this.backend.commit({ docs, profile });
    } catch (e) {
      console.error('Cloud sync upload failed:', e);
      this.onError(e);
      // Put them back (unless changed again since) and retry later
      for (const d of docs) {
        const key = `${d.col}/${d.id}`;
        if (!this.pendingDocs.has(key)) this.pendingDocs.set(key, d);
      }
      this.pendingProfile = { ...profile, ...this.pendingProfile };
      this.flushSoon(5000);
    } finally {
      this.inFlight--;
      this.updateStatus();
    }
  }

  pendingFor(col) {
    const map = new Map();
    for (const d of this.pendingDocs.values()) {
      if (d.col === col) map.set(d.id, d.data);
    }
    return map;
  }

  applyCollection(col, docs, hasPendingWrites) {
    // Snapshots that include our own not-yet-confirmed writes add nothing new
    if (hasPendingWrites || this.stopped) return;
    const local = this.store.getData()[col] || [];
    const merged = mergeCollection(col, local, docs, this.pendingFor(col));
    if (merged !== local) this.store.applyRemote({ [col]: merged });
  }

  applyProfile(profile, hasPendingWrites) {
    if (hasPendingWrites || this.stopped || !profile) return;
    const data = this.store.getData();
    const patch = {};
    for (const key of PROFILE_KEYS) {
      if (key in this.pendingProfile || profile[key] === undefined) continue;
      if (!deepEqual(data[key], profile[key])) patch[key] = profile[key];
    }
    if (Object.keys(patch).length) this.store.applyRemote(patch);
  }

  updateStatus() {
    if (this.stopped) return;
    const busy = this.inFlight > 0 || this.pendingDocs.size > 0 || Object.keys(this.pendingProfile).length > 0;
    this.onStatus(busy ? 'saving' : 'synced');
  }

  hasUnsavedChanges() {
    return this.inFlight > 0 || this.pendingDocs.size > 0 || Object.keys(this.pendingProfile).length > 0;
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.timer);
    this.unsubs.forEach(u => u());
    this.unsubs = [];
  }
}
