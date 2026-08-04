import React from 'react';
import { Award, BookOpen, CheckCircle2, ChevronRight, Youtube, Sparkles, UserPlus, LogIn, ShieldCheck, Zap, ExternalLink, Play, Layers } from 'lucide-react';
import { Logo } from './Logo';
import { UserDetails } from '../types';
import {
  INSTITUTE_NAME,
  QUIZ_DAY,
  QUIZ_TOPIC_ENGLISH,
  QUIZ_TOPIC_TELUGU,
  QUIZ_SUBTITLE,
  YOUTUBE_URL,
  LEVEL_INFO
} from '../data/quizData';

interface HomeScreenProps {
  user: UserDetails | null;
  onStartQuiz: () => void;
  onOpenSignIn: () => void;
  onOpenRegister: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onStartQuiz,
  onOpenSignIn,
  onOpenRegister
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12 animate-fadeIn">
      
      {/* Hero Branding Card */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {/* Background Decorative Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          
          {/* Logo Showcase */}
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Logo size="lg" className="shadow-2xl shadow-amber-500/20" />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {QUIZ_DAY} LIVE QUIZ
            </span>
            <span className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-bold px-3.5 py-1.5 rounded-full">
              {QUIZ_SUBTITLE}
            </span>
          </div>

          {/* Main Topic Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {QUIZ_TOPIC_TELUGU}
            </h1>
            <h2 className="text-lg sm:text-2xl font-bold text-amber-400 tracking-wide">
              {QUIZ_TOPIC_ENGLISH}
            </h2>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Welcome to the official live evaluation platform of <strong className="text-white">{INSTITUTE_NAME}</strong>. Practice 30 high-yield questions categorized into 3 difficulty levels tailored specifically for AP & TS TET / DSC Social Methodology.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full sm:w-auto">
            {user ? (
              <button
                onClick={onStartQuiz}
                aria-label="Continue to Quiz Level Selection"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base py-4 px-8 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-amber-300/30"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Go to Quiz Levels ({user.fullName.split(' ')[0]})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenRegister}
                  aria-label="Create New Account and Register Candidate"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base py-4 px-8 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-amber-300/30"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Register Candidate to Start</span>
                </button>

                <button
                  onClick={onOpenSignIn}
                  aria-label="Sign In to existing candidate account"
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base py-4 px-6 rounded-2xl border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5 text-amber-400" />
                  <span>Existing Candidate Sign In</span>
                </button>
              </>
            )}

            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit NTR Digi Class YouTube Channel"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold text-base py-4 px-6 rounded-2xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Youtube className="w-5 h-5 fill-white" />
              <span>YouTube Channel</span>
            </a>
          </div>

        </div>
      </section>

      {/* About Today's Quiz & Test Levels */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Today's Quiz Levels & Syllabus Overview
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Structured assessment designed according to latest AP & TS TET / DSC examination pattern
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            30 High-Yield Questions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([1, 2, 3] as const).map((levelNum) => {
            const level = LEVEL_INFO[levelNum];
            return (
              <div
                key={levelNum}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-3 py-1 rounded-full border ${level.badgeColor}`}>
                      {level.title}
                    </span>
                    <span className="text-xs font-bold text-slate-400">10 Questions</span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {level.subtitle}
                    </h4>
                    <p className="text-xs text-amber-400 font-medium mt-0.5">
                      {level.teluguSubtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {level.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Instant Explanations
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Certificate Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* YouTube Channel Showcase */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
              <Youtube className="w-4 h-4 fill-red-500 text-red-500" />
              <span>OFFICIAL YOUTUBE CHANNEL</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              NTR Digi Class — AP & TS TET / DSC Live Classes
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Subscribe to the official channel for live daily lectures, methodology short tricks, complete Social methodology revisions, and live quiz discussion sessions.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Daily Live Methodology Classes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Free Online Live Quizzes & Certificates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>AP & TS TET / DSC Content Guidance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant Exam Updates & Model Papers</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl min-w-[260px] text-center shadow-xl">
            <Logo size="md" />
            <div className="space-y-0.5">
              <span className="text-base font-black text-white block">NTR Digi Class</span>
              <span className="text-xs text-slate-400 block">AP & TS TET / DSC Aspirants Hub</span>
            </div>

            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-xs py-3 px-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>Subscribe Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* Platform Features / Guarantee */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-1.5">
          <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Authentic Exam Syllabus</h4>
          <p className="text-xs text-slate-400">Strictly follows government SCERT & NCERT methodology textbooks.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-1.5">
          <Award className="w-6 h-6 text-amber-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Verified Certificate</h4>
          <p className="text-xs text-slate-400">Generate instantly downloadable PDF certificates for score performance.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-1.5">
          <Zap className="w-6 h-6 text-amber-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Offline Buffer Protection</h4>
          <p className="text-xs text-slate-400">Never lose quiz attempts. Answers buffer safely if internet drops.</p>
        </div>
      </section>

    </div>
  );
};
