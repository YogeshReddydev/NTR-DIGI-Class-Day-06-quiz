import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { QuizAttempt } from '../types';

const BUFFER_KEY = 'ntr_buffered_quiz_attempts';

export function getBufferedAttempts(): QuizAttempt[] {
  try {
    const data = localStorage.getItem(BUFFER_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('Failed to read buffered attempts from localStorage:', err);
    return [];
  }
}

export function saveAttemptToBuffer(attempt: QuizAttempt): QuizAttempt[] {
  try {
    const existing = getBufferedAttempts();
    // Prevent duplicate buffered attempts with identical timestamp
    const updated = [...existing.filter(a => a.createdAt !== attempt.createdAt), attempt];
    localStorage.setItem(BUFFER_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save attempt to offline buffer:', err);
    return [];
  }
}

export function removeBufferedAttempt(createdAt: string): QuizAttempt[] {
  try {
    const existing = getBufferedAttempts();
    const filtered = existing.filter(a => a.createdAt !== createdAt);
    localStorage.setItem(BUFFER_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.warn('Failed to remove attempt from offline buffer:', err);
    return [];
  }
}

export async function syncBufferedAttempts(): Promise<{ syncedCount: number; failedCount: number }> {
  const buffered = getBufferedAttempts();
  if (buffered.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  // Clear buffer FIRST in localStorage to prevent concurrent/repeated sync loops
  try {
    localStorage.removeItem(BUFFER_KEY);
  } catch (e) {
    // ignore
  }

  let syncedCount = 0;
  let failedCount = 0;
  const failedItems: QuizAttempt[] = [];

  for (const attempt of buffered) {
    try {
      await addDoc(collection(db, 'quiz_attempts'), {
        ...attempt,
        syncedFromBuffer: true,
        timestamp: serverTimestamp()
      });
      syncedCount++;
    } catch (err) {
      console.warn('Failed to sync buffered attempt to Firestore:', err);
      failedCount++;
      failedItems.push(attempt);
    }
  }

  // Restore failed items to buffer if any
  if (failedItems.length > 0) {
    try {
      localStorage.setItem(BUFFER_KEY, JSON.stringify(failedItems));
    } catch (e) {
      // ignore
    }
  }

  return { syncedCount, failedCount };
}
