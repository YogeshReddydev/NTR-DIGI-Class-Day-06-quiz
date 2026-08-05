import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { QuizAttempt } from '../types';
import {
  getBufferedAttempts,
  saveAttemptToBuffer,
  syncBufferedAttempts
} from '../utils/offlineBuffer';

interface NetworkContextType {
  isOnline: boolean;
  pendingBufferCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
  saveQuizAttempt: (attempt: QuizAttempt) => Promise<{ success: boolean; bufferedLocally: boolean }>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [pendingBufferCount, setPendingBufferCount] = useState<number>(() => getBufferedAttempts().length);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncingRef = React.useRef<boolean>(false);

  // Sync buffered attempts if online
  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const res = await syncBufferedAttempts();
      const remaining = getBufferedAttempts().length;
      setPendingBufferCount(remaining);
      if (res.syncedCount > 0) {
        console.log(`Successfully synced ${res.syncedCount} buffered quiz attempt(s) to Firestore.`);
      }
    } catch (err) {
      console.warn('Sync buffered attempts error:', err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  // Online / Offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when returning online
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount
    if (navigator.onLine && getBufferedAttempts().length > 0) {
      syncNow();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow]);

  // Save Quiz Attempt with automatic offline buffering fallback
  const saveQuizAttempt = async (attempt: QuizAttempt): Promise<{ success: boolean; bufferedLocally: boolean }> => {
    // If browser is offline, buffer directly
    if (!navigator.onLine) {
      const updatedBuffer = saveAttemptToBuffer(attempt);
      setPendingBufferCount(updatedBuffer.length);
      return { success: true, bufferedLocally: true };
    }

    try {
      // Attempt online Firestore write
      await addDoc(collection(db, 'quiz_attempts'), {
        ...attempt,
        timestamp: serverTimestamp()
      });
      // Try syncing any prior buffered attempts as well
      if (getBufferedAttempts().length > 0) {
        syncNow();
      }
      return { success: true, bufferedLocally: false };
    } catch (err) {
      console.warn('Firestore attempt write failed, buffering locally:', err);
      const updatedBuffer = saveAttemptToBuffer(attempt);
      setPendingBufferCount(updatedBuffer.length);
      return { success: true, bufferedLocally: true };
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        pendingBufferCount,
        isSyncing,
        syncNow,
        saveQuizAttempt
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
