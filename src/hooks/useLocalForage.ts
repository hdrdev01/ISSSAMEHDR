import { useState, useEffect, useCallback } from 'react';

export function useLocalForage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await localforage.getItem<T>(key);
        if (item !== null) {
          setStoredValue(item);
        }
      } catch (error) {
        console.error(`Error loading ${key} from localforage:`, error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadValue();
  }, [key]);

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await localforage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting ${key} in localforage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoaded] as const;
}

import localforage from 'localforage';
