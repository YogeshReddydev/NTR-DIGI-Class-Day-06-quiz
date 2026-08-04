import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, BookOpen, CheckCircle2, AlertCircle, LogIn, ShieldCheck, KeyRound, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { UserDetails } from '../types';
import { INSTITUTE_NAME, QUIZ_DAY } from '../data/quizData';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

interface UserFormProps {
  initialValues?: UserDetails | null;
  onSubmitSuccess: (user: UserDetails) => void;
  onNavigateHome?: () => void;
}

const STATES_LIST = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Odisha',
  'Other State'
];

const EXAMS_LIST = [
  'AP TET',
  'TS TET',
  'AP DSC',
  'TS DSC',
  'Other'
];

export const UserForm: React.FC<UserFormProps> = ({ initialValues, onSubmitSuccess, onNavigateHome }) => {
  const { user, userProfile, signInWithGoogle, signUpWithEmail, signInWithEmail, saveUserProfile, signOutUser } = useAuth();

  const isLocked = Boolean(userProfile?.isRegistered);

  const [fullName, setFullName] = useState(initialValues?.fullName || userProfile?.fullName || '');
  const [email, setEmail] = useState(initialValues?.email || userProfile?.email || '');
  const [mobile, setMobile] = useState(initialValues?.mobile || userProfile?.mobile || '');
  const [state, setState] = useState(initialValues?.state || userProfile?.state || '');
  const [examPreparation, setExamPreparation] = useState(initialValues?.examPreparation || userProfile?.examPreparation || '');

  // Main mode: 'signin' (existing user) vs 'signup' (new candidate)
  const [formMode, setFormMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync inputs with Auth state or userProfile
  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) setFullName(userProfile.fullName);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.mobile) setMobile(userProfile.mobile);
      if (userProfile.state) setState(userProfile.state);
      if (userProfile.examPreparation) setExamPreparation(userProfile.examPreparation);
      
      // Auto-advance registered users
      if (userProfile.isRegistered) {
        onSubmitSuccess(userProfile);
      }
    } else if (user) {
      if (user.displayName && !fullName) setFullName(user.displayName);
      if (user.email && !email) setEmail(user.email);
    }
  }, [userProfile, user]);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsAuthLoading(true);
    try {
      const loggedInUser = await signInWithGoogle();
      if (loggedInUser) {
        if (loggedInUser.email) setEmail(loggedInUser.email);
        if (loggedInUser.displayName) setFullName(loggedInUser.displayName);
        setSuccessMsg(`Authenticated as ${loggedInUser.displayName || loggedInUser.email}! Please enter your details below to complete registration.`);
      }
    } catch (err: any) {
      setErrorMsg('Google Sign-In failed. Please try again or use Email & Password authentication.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsAuthLoading(true);
    try {
      let authedUser;
      if (formMode === 'signup') {
        authedUser = await signUpWithEmail(cleanEmail, authPassword);
        setSuccessMsg(`Account created & authenticated for ${cleanEmail}! Please complete candidate details below.`);
      } else {
        authedUser = await signInWithEmail(cleanEmail, authPassword);
        setSuccessMsg(`Signed in successfully as ${cleanEmail}!`);
      }
      if (authedUser) {
        setEmail(cleanEmail);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isLocked) {
      if (userProfile) onSubmitSuccess(userProfile);
      return;
    }

    // Strict Mandatory Validations
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Full Name is mandatory and must be at least 2 characters long.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('A valid Email Address is mandatory for candidate registration.');
      return;
    }

    const trimmedMobile = mobile.trim();
    if (!trimmedMobile || !/^[0-9]{10}$/.test(trimmedMobile)) {
      setErrorMsg('A valid 10-digit Mobile Number is mandatory for registration.');
      return;
    }

    if (!state) {
      setErrorMsg('State selection is mandatory.');
      return;
    }

    if (!examPreparation) {
      setErrorMsg('Exam Preparation selection is mandatory.');
      return;
    }

    setIsSubmitting(true);

    try {
      let currentFirebaseUser = user;
      if (!currentFirebaseUser) {
        setErrorMsg('Please complete Step 1 (Sign In with Google Account or Email & Password) to authenticate before submitting your candidate registration.');
        setIsSubmitting(false);
        return;
      }

      const savedData = await saveUserProfile({
        fullName: trimmedName,
        email: trimmedEmail,
        mobile: trimmedMobile,
        state,
        examPreparation
      });

      onSubmitSuccess(savedData);
    } catch (err: any) {
      console.warn('Error saving user registration:', err);
      setErrorMsg(err.message || 'Failed to complete registration. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-slate-900/90 border border-slate-700/60 shadow-2xl">
        
        {/* Navigation & Glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home Overview</span>
          </button>
        )}

        <div className="relative text-center mb-6 flex flex-col items-center">
          <div className="mb-3">
            <Logo size="2xl" layout="badge-only" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formMode === 'signin' ? 'Candidate Sign In' : 'New Candidate Registration'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Official Portal for <span className="text-amber-400 font-bold">{INSTITUTE_NAME} {QUIZ_DAY}</span>
          </p>
        </div>

        {/* Top Direct Switcher: Sign In Existing vs New Candidate Registration */}
        {!user && !isLocked && (
          <div className="mb-6 grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setFormMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-3 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                formMode === 'signin'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In Existing</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-3 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                formMode === 'signup'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Registration</span>
            </button>
          </div>
        )}

        {/* Locked Registration Banner */}
        {isLocked && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-start gap-3 text-amber-200 text-xs backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold block text-white text-sm">Registration Complete & Locked</span>
              <p className="mt-0.5 leading-relaxed text-amber-200">
                Your candidate profile has been verified and registered. As per platform policy, once registered, profile details cannot be modified or re-registered.
              </p>
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div role="alert" className="mb-6 p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl flex items-start gap-3 text-rose-200 text-sm backdrop-blur-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: SIGN IN EXISTING USER (Simple, Direct, No extra bottom inputs) */}
        {formMode === 'signin' && !user && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Sign In with Your Credentials
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                  Existing Candidates
                </span>
              </div>

              {/* Method Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthMethod('google')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'google'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google Account
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email & Password
                </button>
              </div>

              {/* Google Sign In Option */}
              {authMethod === 'google' && (
                <div className="space-y-3 text-center pt-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    aria-label="Sign In with Google Account"
                    className="w-full inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-950 font-black py-3.5 px-5 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{isAuthLoading ? 'Authenticating Google Account...' : 'Sign In with Google'}</span>
                  </button>
                </div>
              )}

              {/* Email & Password Sign In Option */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailAuthSubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Candidate Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g. candidate@gmail.com"
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Enter your account password"
                        required
                        minLength={6}
                        className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isAuthLoading ? 'Signing in...' : 'Sign In Now'}</span>
                  </button>
                </form>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setFormMode('signup')}
                className="text-xs text-slate-400 hover:text-amber-400 underline font-medium cursor-pointer"
              >
                Don't have an account yet? Click here to Register as New Candidate
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: NEW CANDIDATE REGISTRATION (Clean fields + Interactive Pills) */}
        {(formMode === 'signup' || user || isLocked) && (
          <div className="space-y-6">
            {!user && (
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Step 1: Account Credentials
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    Authentication
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Use Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`py-2.5 px-3 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      authMethod === 'email'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Use Email</span>
                  </button>
                </div>

                {authMethod === 'email' && (
                  <form onSubmit={handleEmailAuthSubmit} className="space-y-3 pt-1">
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Enter account email"
                      required
                      className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Create password (min 6 chars)"
                      required
                      minLength={6}
                      className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs shadow-md"
                    >
                      {isAuthLoading ? 'Creating Account...' : 'Set Account Credentials'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {user && !isLocked && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-emerald-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block text-xs">{user.displayName || user.email}</span>
                    <span className="text-[10px] text-emerald-300">Authenticated & Ready</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOutUser}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Change Account
                </button>
              </div>
            )}

            {/* Candidate Details Form */}
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Candidate Registration Form">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Step 2: Candidate Profile Details
                </span>
                <span className="text-[10px] text-rose-400 font-bold">* Mandatory</span>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullNameInput" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="fullNameInput"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter candidate full name"
                    disabled={isLocked}
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:bg-slate-950 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all disabled:opacity-60"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Name to be printed on Certificate.
                </p>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="emailInput" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="emailInput"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. candidate@gmail.com"
                    disabled={isLocked || Boolean(user?.email)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:bg-slate-950 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobileInput" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="mobileInput"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    disabled={isLocked}
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:bg-slate-950 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Interactive State Options */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Select Candidate State <span className="text-rose-400" aria-hidden="true">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STATES_LIST.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setState(s)}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                        state === s
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Exam Preparation Options */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Select Exam Preparation <span className="text-rose-400" aria-hidden="true">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXAMS_LIST.map((e) => (
                    <button
                      key={e}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setExamPreparation(e)}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                        examPreparation === e
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {isLocked ? (
                <button
                  type="button"
                  onClick={() => userProfile && onSubmitSuccess(userProfile)}
                  className="w-full mt-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white text-base font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-emerald-300/30"
                >
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span>Details Saved & Locked — Go to Platform</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-base font-black py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border border-amber-300/30"
                >
                  {isSubmitting ? (
                    <span>Verifying details & completing registration...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                      <span>Submit & Register Candidate</span>
                    </>
                  )}
                </button>
              )}
            </form>

            {!isLocked && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setFormMode('signin')}
                  className="text-xs text-slate-400 hover:text-amber-400 underline font-medium cursor-pointer"
                >
                  Already registered? Switch to Existing Candidate Sign In
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
