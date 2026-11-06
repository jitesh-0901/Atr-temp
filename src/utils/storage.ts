export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`atr_${key}`);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to load key atr_${key} from localStorage`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`atr_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save key atr_${key} to localStorage`, e);
  }
}

export function clearAtrStorage(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('atr_')) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
