import React, { useState } from 'react';
import { Youtube, Award, LogIn, LogOut, UserCheck, ShieldCheck, Volume2, VolumeX, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { isSoundMuted, setSoundMuted, playOptionSelectSound } from '../utils/soundEffects';
import {
  INSTITUTE_NAME,
  QUIZ_DAY,
  QUIZ_TOPIC_TELUGU,
  QUIZ_TOPIC_ENGLISH,
  QUIZ_SUBTITLE,
  YOUTUBE_URL
} from '../data/quizData';

interface HeaderProps {
  userName?: string;
  onChangeUser?: () => void;
  onOpenSignIn?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName, onChangeUser, onOpenSignIn, onNavigateHome }) => {
  const { user, userProfile, signOutUser } = useAuth();
  const { isOnline, pendingBufferCount, isSyncing, syncNow } = useNetwork();
  const [muted, setMuted] = useState<boolean>(() => isSoundMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) playOptionSelectSound();
  };

  const displayName = userProfile?.fullName || user?.displayName || userName;
  const photoURL = userProfile?.photoURL || user?.photoURL;
  const isLoggedIn = Boolean(user && displayName);

  return (
    <header className="bg-slate-950/60 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand & Titles */}
          <button
            onClick={onNavigateHome}
            aria-label="Go to NTR Digi Class Home Page"
            className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-center md:justify-start group text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl p-1"
          >
            <div className="relative flex-shrink-0 transform group-hover:scale-105 transition-transform">
              <Logo size="lg" layout="badge-only" />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                LIVE
              </span>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                  {INSTITUTE_NAME}
                </span>
                <span className="bg-sky-500/10 text-sky-300 border border-sky-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                  {QUIZ_DAY} LIVE QUIZ
                </span>
              </div>

              <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white mt-1 group-hover:text-amber-300 transition-colors">
                {QUIZ_TOPIC_ENGLISH} <span className="text-amber-400 font-semibold">| {QUIZ_TOPIC_TELUGU}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {QUIZ_SUBTITLE}
              </p>
            </div>
          </button>

          {/* User Auth Profile Badge & YouTube CTA */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-2 md:pt-0">
            
            {isLoggedIn ? (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 rounded-2xl p-1.5 pr-3 text-xs text-slate-200 backdrop-blur-md shadow-lg">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName || 'User'}
                    className="w-7 h-7 rounded-xl object-cover border border-amber-400/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-xs">
                    {(displayName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col text-left">
                  <span className="font-bold text-white max-w-[120px] sm:max-w-[150px] truncate leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-amber-300 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{userProfile?.examPreparation || 'Candidate'}</span>
                  </span>
                </div>

                {onChangeUser && (
                  <button
                    onClick={onChangeUser}
                    aria-label={userProfile?.isRegistered ? "View candidate registration profile" : "Register or Edit candidate profile"}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ml-1 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      userProfile?.isRegistered
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-sky-300 hover:text-sky-200'
                    }`}
                    title={userProfile?.isRegistered ? "Candidate profile registered & locked" : "Edit candidate details"}
                  >
                    {userProfile?.isRegistered ? 'Profile 🔒' : 'Edit'}
                  </button>
                )}

                {user && (
                  <button
                    onClick={signOutUser}
                    aria-label="Sign Out of Candidate Account"
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer ml-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    title="Sign Out of Account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                aria-label="Sign In or Register Candidate Profile"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black px-4 py-2 rounded-xl shadow-lg border border-amber-300/30 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Visual Firestore / Network Connection Status Indicator */}
            <div className="flex items-center">
              {isOnline ? (
                pendingBufferCount > 0 ? (
                  <button
                    onClick={syncNow}
                    disabled={isSyncing}
                    aria-label={`Sync ${pendingBufferCount} pending attempt(s) to Firestore`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold transition-all hover:bg-amber-500/30 cursor-pointer shadow-lg animate-pulse focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    title="Click to sync locally buffered quiz submissions to Firestore database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync ({pendingBufferCount})</span>
                  </button>
                ) : (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md cursor-help"
                    title="Connected to Firestore database. Quiz submissions sync in real-time."
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Online</span>
                  </div>
                )
              ) : (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold backdrop-blur-md cursor-help animate-pulse"
                  title="Network connection lost. Quiz answers are buffered safely in local storage and will auto-sync when connection is restored."
                >
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                  </span>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>{pendingBufferCount > 0 ? `Offline (${pendingBufferCount} Buffered)` : 'Offline (Buffered)'}</span>
                </div>
              )}
            </div>

            <button
              onClick={toggleSound}
              aria-label={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                muted
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title={muted ? 'Sound Effects Muted' : 'Sound Effects Enabled'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to NTR Digi Class YouTube Channel (opens in new tab)"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-red-600/30 border border-red-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
              <span>Subscribe Channel</span>
            </a>

          </div>

        </div>
      </div>
    </header>
  );
};
