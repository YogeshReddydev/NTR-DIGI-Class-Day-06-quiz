import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase';
import { UserDetails, QuizAttempt } from '../types';
import { QUIZ_DAY, QUIZ_TOPIC_ENGLISH } from '../data/quizData';

interface AuthContextType {
  user: User | null;
  userProfile: UserDetails | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  saveUserProfile: (details: Partial<UserDetails>) => Promise<UserDetails>;
  userAttempts: QuizAttempt[];
  fetchUserAttempts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserDetails | null>(null);
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user profile document from Firestore
  const loadUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserDetails;
        const fullProfile: UserDetails = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          fullName: data.fullName || firebaseUser.displayName || '',
          email: data.email || firebaseUser.email || '',
          mobile: data.mobile || '',
          state: data.state || 'Andhra Pradesh',
          examPreparation: data.examPreparation || 'AP DSC',
          quizDay: data.quizDay || QUIZ_DAY,
          topic: data.topic || QUIZ_TOPIC_ENGLISH,
          photoURL: firebaseUser.photoURL || data.photoURL || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        setUserProfile(fullProfile);
        // Sync with localStorage for quick initial render fallback
        localStorage.setItem('ntr_quiz_user', JSON.stringify(fullProfile));
        return fullProfile;
      } else {
        // Document doesn't exist yet (New User), create partial template
        const newProfile: UserDetails = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          mobile: '',
          state: 'Andhra Pradesh',
          examPreparation: 'AP DSC',
          quizDay: QUIZ_DAY,
          topic: QUIZ_TOPIC_ENGLISH,
          photoURL: firebaseUser.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Error loading user profile from Firestore:', err);
      // Fallback
      const fallbackProfile: UserDetails = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        mobile: '',
        state: 'Andhra Pradesh',
        examPreparation: 'AP DSC',
        quizDay: QUIZ_DAY,
        topic: QUIZ_TOPIC_ENGLISH,
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date().toISOString()
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  // Fetch all quiz attempts submitted by current candidate
  const fetchUserAttempts = async () => {
    if (!auth.currentUser) return;
    try {
      const path = 'quiz_attempts';
      const q = query(
        collection(db, path),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const attempts: QuizAttempt[] = [];
      snapshot.forEach((docSnap) => {
        attempts.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<QuizAttempt, 'id'>)
        });
      });
      // Sort newest first
      attempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserAttempts(attempts);
    } catch (err) {
      console.warn('Could not load user quiz attempts:', err);
    }
  };

  // Save/Update Candidate Profile in Firestore `users/{uid}`
  const saveUserProfile = async (details: Partial<UserDetails>): Promise<UserDetails> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to save profile details.');
    }

    const now = new Date().toISOString();
    const updatedProfile: UserDetails = {
      id: currentUser.uid,
      uid: currentUser.uid,
      fullName: (details.fullName || userProfile?.fullName || currentUser.displayName || '').trim(),
      email: (details.email || userProfile?.email || currentUser.email || '').trim(),
      mobile: (details.mobile || userProfile?.mobile || '').trim(),
      state: details.state || userProfile?.state || 'Andhra Pradesh',
      examPreparation: details.examPreparation || userProfile?.examPreparation || 'AP DSC',
      quizDay: QUIZ_DAY,
      topic: QUIZ_TOPIC_ENGLISH,
      photoURL: currentUser.photoURL || userProfile?.photoURL || '',
      createdAt: userProfile?.createdAt || now,
      updatedAt: now
    };

    const userRef = doc(db, 'users', currentUser.uid);

    try {
      await setDoc(userRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
      localStorage.setItem('ntr_quiz_user', JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
      throw error;
    }
  };

  // Google Sign In Popup
  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        await loadUserProfile(result.user);
        await fetchUserAttempts();
        return result.user;
      }
      return null;
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  // Sign Out
  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setUserAttempts([]);
      localStorage.removeItem('ntr_quiz_user');
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  // Listen to Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserProfile(firebaseUser);
        await fetchUserAttempts();
      } else {
        setUser(null);
        setUserProfile(null);
        setUserAttempts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signOutUser,
        saveUserProfile,
        userAttempts,
        fetchUserAttempts
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
