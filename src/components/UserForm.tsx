import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, BookOpen, CheckCircle2, AlertCircle, LogIn, ShieldCheck } from 'lucide-react';
import { UserDetails } from '../types';
import { INSTITUTE_NAME, QUIZ_DAY, QUIZ_TOPIC_ENGLISH } from '../data/quizData';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

interface UserFormProps {
  initialValues?: UserDetails | null;
  onSubmitSuccess: (user: UserDetails) => void;
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

export const UserForm: React.FC<UserFormProps> = ({ initialValues, onSubmitSuccess }) => {
  const { user, userProfile, signInWithGoogle, saveUserProfile } = useAuth();

  const isLocked = Boolean(userProfile?.isRegistered);

  const [fullName, setFullName] = useState(initialValues?.fullName || userProfile?.fullName || user?.displayName || '');
  const [email, setEmail] = useState(initialValues?.email || userProfile?.email || user?.email || '');
  const [mobile, setMobile] = useState(initialValues?.mobile || userProfile?.mobile || '');
  const [state, setState] = useState(initialValues?.state || userProfile?.state || 'Andhra Pradesh');
  const [examPreparation, setExamPreparation] = useState(initialValues?.examPreparation || userProfile?.examPreparation || 'AP DSC');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
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
    } else if (user) {
      if (user.displayName && !fullName) setFullName(user.displayName);
      if (user.email && !email) setEmail(user.email);
    }
  }, [userProfile, user]);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsGoogleSigningIn(true);
    try {
      const loggedInUser = await signInWithGoogle();
      if (loggedInUser) {
        setSuccessMsg(`Authenticated as ${loggedInUser.displayName || loggedInUser.email}! Please enter your mobile number and exam details to complete registration.`);
      }
    } catch (err: any) {
      setErrorMsg('Google Sign-In failed or was cancelled. Please complete the registration form below.');
    } finally {
      setIsGoogleSigningIn(false);
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
      let savedData: UserDetails;
      if (user) {
        savedData = await saveUserProfile({
          fullName: trimmedName,
          email: trimmedEmail,
          mobile: trimmedMobile,
          state,
          examPreparation
        });
      } else {
        // Fallback or unauthenticated save attempt requiring Google Auth
        setErrorMsg('Please Sign In with Google Account to save and register your candidate profile in Firestore.');
        setIsSubmitting(false);
        return;
      }

      onSubmitSuccess(savedData);
    } catch (err: any) {
      console.warn('Error saving user registration:', err);
      setErrorMsg(err.message || 'Failed to complete registration in Firestore. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center mb-6 sm:mb-8 flex flex-col items-center">
          <div className="mb-3">
            <Logo size="2xl" layout="badge-only" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Candidate Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Official Candidate Registry for <span className="text-amber-400 font-bold">{INSTITUTE_NAME} {QUIZ_DAY}</span>
          </p>
        </div>

        {/* Locked Registration Banner */}
        {isLocked && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-start gap-3 text-amber-200 text-xs backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold block text-white text-sm">Registration Complete & Locked</span>
              <p className="mt-0.5 leading-relaxed text-amber-200">
                Your candidate profile has been stored in Firestore. As per platform policy, once registered, profile details cannot be modified or re-registered.
              </p>
            </div>
          </div>
        )}

        {/* Google Authentication Section */}
        {!user ? (
          <div className="mb-6 p-4 bg-slate-900/90 border border-amber-500/30 rounded-2xl text-center space-y-3 backdrop-blur-md">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Step 1: Sign In with Google
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSigningIn}
              aria-label="Sign In with Google Account"
              className="w-full inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-950 font-black py-3 px-5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleSigningIn ? 'Signing in with Google...' : 'Sign In with Google Account'}</span>
            </button>
            <p className="text-xs text-slate-300">
              Sign in with your Google email to authenticate and save your details.
            </p>
          </div>
        ) : !isLocked ? (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-emerald-200 text-xs backdrop-blur-md">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User Avatar" className="w-10 h-10 rounded-xl object-cover border border-emerald-400/50" referrerPolicy="no-referrer" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" aria-hidden="true" />
              )}
              <div>
                <span className="font-bold block text-white text-sm">{user.displayName || user.email}</span>
                <span className="text-emerald-300 text-xs">Step 2: Fill mandatory details to complete registration</span>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Google Authenticated
            </span>
          </div>
        ) : null}

        {errorMsg && (
          <div role="alert" className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-sm backdrop-blur-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative" aria-label="Candidate Registration Form">
          
          {/* Full Name */}
          <div>
            <label htmlFor="fullNameInput" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-400" aria-hidden="true">* (Mandatory)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                id="fullNameInput"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter candidate full name"
                disabled={isLocked}
                required
                aria-required="true"
                aria-label="Full Name"
                className="w-full bg-slate-950/70 border border-white/20 focus:border-amber-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all backdrop-blur-md"
              />
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              This name will be stored in Firestore and printed on your Certificate of Achievement.
            </p>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="emailInput" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-400" aria-hidden="true">* (Mandatory & Unique)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                id="emailInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. candidate@gmail.com"
                disabled={isLocked || Boolean(user?.email)}
                required
                aria-required="true"
                aria-label="Email Address"
                className="w-full bg-slate-950/70 border border-white/20 focus:border-amber-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all backdrop-blur-md"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="mobileInput" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              Mobile Number <span className="text-rose-400" aria-hidden="true">* (Mandatory 10 digits & Unique)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                id="mobileInput"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                disabled={isLocked}
                required
                aria-required="true"
                aria-label="10-digit Mobile Number"
                className="w-full bg-slate-950/70 border border-white/20 focus:border-amber-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all backdrop-blur-md"
              />
            </div>
          </div>

          {/* State & Exam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stateSelect" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                State <span className="text-rose-400" aria-hidden="true">* (Mandatory)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                <select
                  id="stateSelect"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={isLocked}
                  required
                  aria-label="Select Candidate State"
                  className="w-full bg-slate-950/70 border border-white/20 focus:border-amber-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 pl-11 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all appearance-none cursor-pointer backdrop-blur-md"
                >
                  {STATES_LIST.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam Preparation */}
            <div>
              <label htmlFor="examSelect" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                Exam Preparation <span className="text-rose-400" aria-hidden="true">* (Mandatory)</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                <select
                  id="examSelect"
                  value={examPreparation}
                  onChange={(e) => setExamPreparation(e.target.value)}
                  disabled={isLocked}
                  required
                  aria-label="Select Exam Preparation Type"
                  className="w-full bg-slate-950/70 border border-white/20 focus:border-amber-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 pl-11 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all appearance-none cursor-pointer backdrop-blur-md"
                >
                  {EXAMS_LIST.map((e) => (
                    <option key={e} value={e} className="bg-slate-900 text-white">
                      {e}
                    </option>
                  ))}
                </select>
              </div>
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
              aria-label="Register Profile in Firestore and Start Platform"
              className="w-full mt-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-base font-black py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border border-amber-300/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {isSubmitting ? (
                <span>Checking Uniqueness & Storing in Firestore...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span>Submit & Register Candidate (Permanent)</span>
                </>
              )}
            </button>
          )}
        </form>

      </div>
    </div>
  );
};
