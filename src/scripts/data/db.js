const DB_NAME = 'cerita-kita-db';
const DB_VERSION = 2;
const CACHE_STORE = 'stories';
const SAVED_STORE = 'saved-stories';

const openDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE, { keyPath: 'id' });
    if (!db.objectStoreNames.contains(SAVED_STORE)) db.createObjectStore(SAVED_STORE, { keyPath: 'id' });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const writeMany = async (storeName, stories) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    stories.forEach((story) => store.put(story));
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
};

const readAll = async (storeName) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
};

const readOne = async (storeName, id) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(id);
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
};

const removeOne = async (storeName, id) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
};

export const saveStories = (stories) => writeMany(CACHE_STORE, stories);
export const getCachedStories = () => readAll(CACHE_STORE);
export const saveStory = (story) => writeMany(SAVED_STORE, [story]);
export const getSavedStories = () => readAll(SAVED_STORE);
export const getSavedStory = (id) => readOne(SAVED_STORE, id);
export const deleteSavedStory = (id) => removeOne(SAVED_STORE, id);
