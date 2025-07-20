// src/hooks/useAutoSave.ts
"use client";

import { useEffect, useRef, useCallback } from 'react';
import { debounce } from '@/lib/financial-utils';

interface AutoSaveOptions {
  key: string;
  data: any;
  delay?: number;
  onSave?: (data: any) => void;
  onRestore?: (data: any) => void;
  enabled?: boolean;
}

export function useAutoSave({
  key,
  data,
  delay = 2000,
  onSave,
  onRestore,
  enabled = true
}: AutoSaveOptions) {
  const isInitialMount = useRef(true);
  const hasDataRef = useRef(false);

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce((dataToSave: any) => {
      if (!enabled || !dataToSave) return;
      
      try {
        // Only save if there's meaningful data
        const hasData = Object.values(dataToSave).some(value => {
          if (typeof value === 'string') return value.trim() !== '';
          if (typeof value === 'number') return value > 0;
          return Boolean(value);
        });

        if (hasData) {
          const saveData = {
            ...dataToSave,
            savedAt: new Date().toISOString(),
            version: '1.0'
          };
          
          localStorage.setItem(`autosave_${key}`, JSON.stringify(saveData));
          hasDataRef.current = true;
          onSave?.(saveData);
          
          // Dispatch custom event for other components to listen
          window.dispatchEvent(new CustomEvent('autosave', { 
            detail: { key, data: saveData } 
          }));
        }
      } catch (error) {
        console.warn('Failed to auto-save data:', error);
      }
    }, delay),
    [key, delay, onSave, enabled]
  );

  // Auto-save when data changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (enabled && data) {
      debouncedSave(data);
    }
  }, [data, debouncedSave, enabled]);

  // Restore data on mount
  const restoreData = useCallback(() => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsedData = JSON.parse(saved);
        
        // Check if data is not too old (24 hours)
        const savedAt = new Date(parsedData.savedAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          hasDataRef.current = true;
          onRestore?.(parsedData);
          return parsedData;
        } else {
          // Clean up old data
          localStorage.removeItem(`autosave_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to restore auto-saved data:', error);
    }
    
    return null;
  }, [key, enabled, onRestore]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(`autosave_${key}`);
      hasDataRef.current = false;
      
      window.dispatchEvent(new CustomEvent('autosave-cleared', { 
        detail: { key } 
      }));
    } catch (error) {
      console.warn('Failed to clear auto-saved data:', error);
    }
  }, [key]);

  // Check if there's saved data
  const hasSavedData = useCallback(() => {
    if (!enabled) return false;
    
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      return Boolean(saved);
    } catch {
      return false;
    }
  }, [key, enabled]);

  // Get save timestamp
  const getSaveTimestamp = useCallback(() => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsedData = JSON.parse(saved);
        return new Date(parsedData.savedAt);
      }
    } catch {
      return null;
    }
    
    return null;
  }, [key, enabled]);

  return {
    restoreData,
    clearSavedData,
    hasSavedData,
    getSaveTimestamp,
    hasData: hasDataRef.current
  };
}

// Hook for managing multiple auto-save instances
export function useAutoSaveManager() {
  const cleanupOldSaves = useCallback(() => {
    const now = new Date();
    const keys = Object.keys(localStorage).filter(key => key.startsWith('autosave_'));
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.savedAt) {
          const savedAt = new Date(data.savedAt);
          const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
          
          // Remove saves older than 7 days
          if (hoursDiff > 24 * 7) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Remove invalid data
        localStorage.removeItem(key);
      }
    });
  }, []);

  const getAllSavedData = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('autosave_'));
    const saves: Record<string, any> = {};
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const cleanKey = key.replace('autosave_', '');
        saves[cleanKey] = data;
      } catch {
        // Skip invalid data
      }
    });
    
    return saves;
  }, []);

  const clearAllSavedData = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('autosave_'));
    keys.forEach(key => localStorage.removeItem(key));
    
    window.dispatchEvent(new CustomEvent('autosave-all-cleared'));
  }, []);

  // Cleanup on mount
  useEffect(() => {
    cleanupOldSaves();
  }, [cleanupOldSaves]);

  return {
    cleanupOldSaves,
    getAllSavedData,
    clearAllSavedData
  };
}

// Hook for showing auto-save status with i18n support
export function useAutoSaveStatus(key: string, t?: (key: string, params?: any) => string) {
  const { hasSavedData, getSaveTimestamp } = useAutoSave({ 
    key, 
    data: null, 
    enabled: false 
  });

  const getStatusMessage = useCallback(() => {
    if (!hasSavedData()) return null;
    
    const timestamp = getSaveTimestamp();
    if (!timestamp) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (!t) {
      // Fallback to English if no translation function provided
      if (diffMinutes < 1) return 'Saved just now';
      if (diffMinutes < 60) return `Saved ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Saved ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      return `Saved ${timestamp.toLocaleDateString()}`;
    }

    // Use i18n translations
    if (diffMinutes < 1) return t('autoSave.savedJustNow');
    if (diffMinutes < 60) return t('autoSave.savedMinutesAgo', { 
      minutes: diffMinutes, 
      plural: diffMinutes > 1 ? 's' : '' 
    });
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return t('autoSave.savedHoursAgo', { 
      hours: diffHours, 
      plural: diffHours > 1 ? 's' : '' 
    });
    
    return t('autoSave.savedOn', { date: timestamp.toLocaleDateString() });
  }, [hasSavedData, getSaveTimestamp, t]);

  return {
    hasSavedData: hasSavedData(),
    getStatusMessage
  };
}