import { useSyncExternalStore } from 'react';
import { subscribe, getScreenReaderEnabled } from './screenReader';

export function useScreenReader() {
  return useSyncExternalStore(subscribe, getScreenReaderEnabled);
}