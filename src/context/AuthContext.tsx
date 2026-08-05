import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
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
  signUpWithEmail: (email: string, pass: string) => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
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

  // Check if Email or Mobile is already registered by another candidate
  const checkUniqueness = async (email: string, mobile: string, currentUid?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    try {
      // 1. Check Email uniqueness in Registration and users collections
      if (cleanEmail) {
        const regEmailQuery = query(collection(db, 'Registration'), where('email', '==', cleanEmail));
        const regEmailSnap = await getDocs(regEmailQuery);
        const dupRegEmail = regEmailSnap.docs.find((d) => d.id !== currentUid);
        if (dupRegEmail) {
          throw new Error(`The Email Address '${cleanEmail}' is already registered. Duplicate registration is strictly prohibited.`);
        }

        const userEmailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const userEmailSnap = await getDocs(userEmailQuery);
        const dupUserEmail = userEmailSnap.docs.find((d) => d.id !== currentUid);
        if (dupUserEmail) {
          throw new Error(`The Email Address '${cleanEmail}' is already registered. Duplicate registration is strictly prohibited.`);
        }
      }

      // 2. Check Mobile uniqueness in Registration and users collections
      if (cleanMobile) {
        const regMobileQuery = query(collection(db, 'Registration'), where('mobile', '==', cleanMobile));
        const regMobileSnap = await getDocs(regMobileQuery);
        const dupRegMobile = regMobileSnap.docs.find((d) => d.id !== currentUid);
        if (dupRegMobile) {
          throw new Error(`The Mobile Number '${cleanMobile}' is already registered. Re-registration with the same mobile number is not allowed.`);
        }

        const userMobileQuery = query(collection(db, 'users'), where('mobile', '==', cleanMobile));
        const userMobileSnap = await getDocs(userMobileQuery);
        const dupUserMobile = userMobileSnap.docs.find((d) => d.id !== currentUid);
        if (dupUserMobile) {
          throw new Error(`The Mobile Number '${cleanMobile}' is already registered. Re-registration with the same mobile number is not allowed.`);
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        throw err;
      }
      console.warn('Firestore uniqueness check query error:', err);
    }
  };

  // Load user profile document from Firestore Registration collection
  const loadUserProfile = async (firebaseUser: User) => {
    try {
      // Check Registration collection first
      const regRef = doc(db, 'Registration', firebaseUser.uid);
      let regSnap = await getDoc(regRef);

      if (regSnap.exists()) {
        const data = regSnap.data() as UserDetails;
        const isReg = Boolean(data.isRegistered || (data.fullName && data.mobile && data.mobile.length === 10));
        const fullProfile: UserDetails = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          fullName: data.fullName || firebaseUser.displayName || '',
          email: (data.email || firebaseUser.email || '').toLowerCase(),
          mobile: data.mobile || '',
          state: data.state || 'Andhra Pradesh',
          examPreparation: data.examPreparation || 'AP DSC',
          quizDay: data.quizDay || QUIZ_DAY,
          topic: data.topic || QUIZ_TOPIC_ENGLISH,
          photoURL: firebaseUser.photoURL || data.photoURL || '',
          isRegistered: isReg,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        setUserProfile(fullProfile);
        localStorage.setItem('ntr_quiz_user', JSON.stringify(fullProfile));
        return fullProfile;
      }

      // Check users collection as fallback
      const userRef = doc(db, 'users', firebaseUser.uid);
      let docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserDetails;
        const isReg = Boolean(data.isRegistered || (data.fullName && data.mobile && data.mobile.length === 10));
        const fullProfile: UserDetails = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          fullName: data.fullName || firebaseUser.displayName || '',
          email: (data.email || firebaseUser.email || '').toLowerCase(),
          mobile: data.mobile || '',
          state: data.state || 'Andhra Pradesh',
          examPreparation: data.examPreparation || 'AP DSC',
          quizDay: data.quizDay || QUIZ_DAY,
          topic: data.topic || QUIZ_TOPIC_ENGLISH,
          photoURL: firebaseUser.photoURL || data.photoURL || '',
          isRegistered: isReg,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        setUserProfile(fullProfile);
        localStorage.setItem('ntr_quiz_user', JSON.stringify(fullProfile));
        return fullProfile;
      } else {
        // Check if there is an existing registered user profile by email in Registration collection
        if (firebaseUser.email) {
          const cleanEmail = firebaseUser.email.trim().toLowerCase();
          const qReg = query(collection(db, 'Registration'), where('email', '==', cleanEmail));
          const regSnapByEmail = await getDocs(qReg);
          if (!regSnapByEmail.empty) {
            const existingDoc = regSnapByEmail.docs[0];
            const data = existingDoc.data() as UserDetails;
            const fullProfile: UserDetails = {
              id: existingDoc.id,
              uid: firebaseUser.uid,
              fullName: data.fullName || firebaseUser.displayName || '',
              email: (data.email || firebaseUser.email).toLowerCase(),
              mobile: data.mobile || '',
              state: data.state || 'Andhra Pradesh',
              examPreparation: data.examPreparation || 'AP DSC',
              quizDay: data.quizDay || QUIZ_DAY,
              topic: data.topic || QUIZ_TOPIC_ENGLISH,
              photoURL: firebaseUser.photoURL || data.photoURL || '',
              isRegistered: Boolean(data.isRegistered || (data.fullName && data.mobile)),
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setUserProfile(fullProfile);
            localStorage.setItem('ntr_quiz_user', JSON.stringify(fullProfile));
            return fullProfile;
          }
        }

        // New User template (needs to complete mandatory mobile, state, exam prep)
        const newProfile: UserDetails = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || '',
          email: (firebaseUser.email || '').toLowerCase(),
          mobile: '',
          state: 'Andhra Pradesh',
          examPreparation: 'AP DSC',
          quizDay: QUIZ_DAY,
          topic: QUIZ_TOPIC_ENGLISH,
          photoURL: firebaseUser.photoURL || '',
          isRegistered: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Error loading user profile from Firestore:', err);
      const fallbackProfile: UserDetails = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || '',
        email: (firebaseUser.email || '').toLowerCase(),
        mobile: '',
        state: 'Andhra Pradesh',
        examPreparation: 'AP DSC',
        quizDay: QUIZ_DAY,
        topic: QUIZ_TOPIC_ENGLISH,
        photoURL: firebaseUser.photoURL || '',
        isRegistered: false,
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
      const seenKeys = new Set<string>();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<QuizAttempt, 'id'>;
        const day = data.quizDay || 'DAY 07';
        // Deduplicate by Day, Level, Score, and Completion Date so duplicate records collapse
        const key = `${day}-L${data.level}-${data.score}-${data.completionDate}`;

        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          attempts.push({
            id: docSnap.id,
            ...data
          });
        }
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
      throw new Error('Candidate must be authenticated to complete registration.');
    }

    // Check if user is already registered and locked
    if (userProfile?.isRegistered) {
      throw new Error('Registration Complete: Candidate profile details are locked and cannot be modified once registered.');
    }

    const cleanName = (details.fullName || userProfile?.fullName || currentUser.displayName || '').trim();
    const cleanEmail = (details.email || userProfile?.email || currentUser.email || '').trim().toLowerCase();
    const cleanMobile = (details.mobile || userProfile?.mobile || '').trim();
    const cleanState = details.state || userProfile?.state || 'Andhra Pradesh';
    const cleanExam = details.examPreparation || userProfile?.examPreparation || 'AP DSC';

    // Mandatory Field Validation
    if (!cleanName || cleanName.length < 2) {
      throw new Error('Full Name is mandatory and must be at least 2 characters long.');
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('A valid Email Address is mandatory for candidate registration.');
    }
    if (!cleanMobile || !/^[0-9]{10}$/.test(cleanMobile)) {
      throw new Error('A valid 10-digit Mobile Number is mandatory for candidate registration.');
    }
    if (!cleanState) {
      throw new Error('State selection is mandatory.');
    }
    if (!cleanExam) {
      throw new Error('Exam Preparation selection is mandatory.');
    }

    // Check uniqueness of Email and Mobile Number in Firestore
    await checkUniqueness(cleanEmail, cleanMobile, currentUser.uid);

    const now = new Date().toISOString();
    const updatedProfile: UserDetails = {
      id: currentUser.uid,
      uid: currentUser.uid,
      fullName: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      state: cleanState,
      examPreparation: cleanExam,
      quizDay: QUIZ_DAY,
      topic: QUIZ_TOPIC_ENGLISH,
      photoURL: currentUser.photoURL || userProfile?.photoURL || '',
      isRegistered: true, // Permanent lock flag
      createdAt: userProfile?.createdAt || now,
      updatedAt: now
    };

    const regRef = doc(db, 'Registration', currentUser.uid);
    const userRef = doc(db, 'users', currentUser.uid);

    try {
      // Primary store: Registration database collection
      await setDoc(regRef, updatedProfile);
      // Sync store: users collection
      await setDoc(userRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
      localStorage.setItem('ntr_quiz_user', JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `Registration/${currentUser.uid}`);
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

  // Email & Password Sign Up
  const signUpWithEmail = async (emailStr: string, pass: string): Promise<User | null> => {
    const cleanEmail = emailStr.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Email address is required.');
    if (!pass || pass.length < 6) throw new Error('Password must be at least 6 characters long.');

    // Check uniqueness in Registration database prior to account creation
    await checkUniqueness(cleanEmail, '');

    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (result.user) {
        setUser(result.user);
        await loadUserProfile(result.user);
        await fetchUserAttempts();
        return result.user;
      }
      return null;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error(`The Email Address '${cleanEmail}' is already registered. Duplicate registration is strictly prohibited.`);
      }
      if (err.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      }
      throw new Error(err.message || 'Failed to create candidate account. Please verify credentials.');
    }
  };

  // Email & Password Sign In
  const signInWithEmail = async (emailStr: string, pass: string): Promise<User | null> => {
    const cleanEmail = emailStr.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Email address is required.');
    if (!pass) throw new Error('Password is required.');

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (result.user) {
        setUser(result.user);
        await loadUserProfile(result.user);
        await fetchUserAttempts();
        return result.user;
      }
      return null;
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. If you do not have an account, please select Create New Account.');
      }
      throw new Error(err.message || 'Failed to sign in with email and password.');
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
        signUpWithEmail,
        signInWithEmail,
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
