import { AccessibilityInfo } from 'react-native';

let enabled = false;
let settled = false;
let initialized = false;
const listeners = new Set<() => void>();

function set(v: boolean) {
  settled = true;
  if (v !== enabled) {
    enabled = v;
    listeners.forEach(l => l());
  }
}

export function initScreenReader() {
  if (initialized) return;
  initialized = true;
  AccessibilityInfo.isScreenReaderEnabled().then(v => { if (!settled) set(v); });
  AccessibilityInfo.addEventListener('screenReaderChanged', set);
}

export function getScreenReaderEnabled() {
  return enabled;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}