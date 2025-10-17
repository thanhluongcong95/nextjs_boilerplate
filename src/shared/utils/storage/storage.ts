/**
 * Simple Storage Utils for Next.js
 */

type StorageType = 'local' | 'session';

class Storage {
  private readonly storage: globalThis.Storage | null = null;

  constructor(type: StorageType) {
    if (globalThis.window !== undefined) {
      this.storage = type === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
    }
  }

  /** Get data */
  get<T>(key: string): T | null {
    if (!this.storage) return null;
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  /** Save data */
  set<T>(key: string, value: T): boolean {
    if (!this.storage) return false;
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  /** Remove data */
  remove(key: string): boolean {
    if (!this.storage) return false;
    try {
      this.storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /** Clear all */
  clear(): boolean {
    if (!this.storage) return false;
    try {
      this.storage.clear();
      return true;
    } catch {
      return false;
    }
  }

  /** Check if key exists */
  has(key: string): boolean {
    return this.storage?.getItem(key) !== null;
  }

  /** Save with expiry time */
  setWithExpiry<T>(key: string, value: T, ttl: number): boolean {
    return this.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  /** Get and check expiry */
  getWithExpiry<T>(key: string): T | null {
    const item = this.get<{ value: T; expiry: number }>(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }
    return item.value;
  }
}

// Export instances
export const local = new Storage('local');
export const session = new Storage('session');
export default { local, session };

/*
=== USAGE EXAMPLES ===

// Basic save/get data
local.set('user', { name: 'John', age: 30 });
const user = local.get<User>('user');
local.remove('user');
local.clear();

// Check existence
if (local.has('user')) {
  console.log('User exists');
}

// With expiry time
local.setWithExpiry('token', 'abc123', 60 * 60 * 1000); // 1 hour
const token = local.getWithExpiry<string>('token');
if (!token) {
  // Expired, redirect to login
}

// SessionStorage (cleared when tab is closed)
session.set('currentStep', 2);
session.set('formData', { email: 'test@example.com' });
const step = session.get<number>('currentStep');
*/
