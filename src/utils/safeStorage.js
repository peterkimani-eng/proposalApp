const memoryStore = new Map();

export const safeStorage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore.has(key) ? memoryStore.get(key) : null;
    }
  },

  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryStore.set(key, String(value));
    }
  },

  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryStore.delete(key);
    }
  },
};