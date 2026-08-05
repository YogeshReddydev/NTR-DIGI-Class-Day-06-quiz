import React from 'react';
import { Play, Award, CheckCircle2, Zap, Shield, Sparkles, BookOpen, UserCheck, Calendar, Clock, Download, Check } from 'lucide-react';
import {
  INSTITUTE_NAME,
  QUIZ_DAY,
  QUIZ_TOPIC_TELUGU,
  QUIZ_TOPIC_ENGLISH,
  QUIZ_SUBTITLE,
  LEVEL_INFO,
  ALL_QUIZ_DAYS
} from '../data/quizData';
import { UserDetails, QuizAttempt } from '../types';
import { YouTubeBanner } from './YouTubeBanner';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { playNavigationSound } from '../utils/soundEffects';

interface WelcomeScreenProps {
  user: UserDetails;
  selectedDay?: string;
  onSelectDay?: (day: string) => void;
  onSelectLevel: (level: 1 | 2 | 3) => void;
  onChangeUser: () => void;
  onViewCertificate?: (attempt: QuizAttempt) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  user,
  selectedDay = 'DAY 07',
  onSelectDay,
  onSelectLevel,
  onChangeUser,
  onViewCertificate
}) => {
  const { userAttempts } = useAuth();
  const activeDayData = ALL_QUIZ_DAYS[selectedDay] || ALL_QUIZ_DAYS['DAY 07'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      
      {/* User Welcome Header Card */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex-shrink-0 hidden sm:block">
              <Logo size="xl" layout="badge-only" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Candidate Portal</span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">{user.fullName}</span>!
              </h2>
              
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Test your understanding of important <strong className="text-white">History Teaching Methods ({QUIZ_TOPIC_TELUGU})</strong> concepts with carefully designed AP & TS TET / DSC level questions.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-2 bg-slate-950/60 border border-white/10 rounded-2xl p-4 w-full md:w-auto backdrop-blur-md shadow-inner">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Exam: <strong className="text-white">{user.examPreparation}</strong> ({user.state})</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Email: {user.email} {user.mobile && user.mobile !== 'N/A' ? `| Mobile: ${user.mobile}` : ''}
            </div>
            <button
              onClick={onChangeUser}
              aria-label={user.isRegistered ? "View locked candidate profile details" : "Change candidate profile details"}
              className={`text-xs font-semibold underline transition-colors cursor-pointer mt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                user.isRegistered ? 'text-amber-300 hover:text-amber-200' : 'text-sky-400 hover:text-sky-300'
              }`}
            >
              {user.isRegistered ? 'View Profile Details 🔒' : 'Change Candidate Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Details Banner */}
      <div className="text-center space-y-4">
        {/* Day Selector Buttons */}
        <div className="inline-flex items-center justify-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {Object.keys(ALL_QUIZ_DAYS).map((dayKey) => {
            const isSelected = selectedDay === dayKey;
            return (
              <button
                key={dayKey}
                onClick={() => onSelectDay && onSelectDay(dayKey)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>{dayKey}</span>
                {dayKey === 'DAY 07' && <span className="text-[10px] bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/40">LIVE</span>}
              </button>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-slate-100 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md">
          <BookOpen className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>{activeDayData.quizDay} LIVE EXAMINATION PLATFORM</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white">
          {activeDayData.topicEnglish} | {activeDayData.topicTelugu}
        </h3>
        <p className="text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
          Select a difficulty level below to begin your <strong className="text-amber-300">{activeDayData.quizDay}</strong> exam. Complete 10 questions per level. Score 8 or more out of 10 to earn your official <strong className="text-amber-400">{INSTITUTE_NAME} Level Certificate</strong>!
        </p>
      </div>

      {/* 3 Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {([1, 2, 3] as const).map((lvl) => {
          const info = LEVEL_INFO[lvl];
          const bestAttempt = userAttempts.find((a) => a.level === lvl && a.certificateEligible);
          return (
            <div
              key={lvl}
              className={`group relative rounded-3xl glass-card p-6 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 border border-white/10`}
            >
              {/* Background gradient hint */}
              <div className={`absolute inset-0 bg-gradient-to-br ${info.cardGradient} opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none`} />

              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${info.badgeColor} uppercase tracking-wider backdrop-blur-md`}>
                    Level {lvl}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-200 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
                    <Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                    <span>10 Qs</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                    {info.title}
                  </h4>
                  <p className="text-xs font-semibold text-amber-400 mt-0.5">
                    {info.teluguSubtitle}
                  </p>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed min-h-[48px]">
                  {info.description}
                </p>

                {bestAttempt && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                      <span>Certified: <strong>{bestAttempt.score}/10</strong> ({bestAttempt.percentage}%)</span>
                    </div>
                    {onViewCertificate && (
                      <button
                        onClick={() => onViewCertificate(bestAttempt)}
                        aria-label={`View Certificate for Level ${lvl}`}
                        className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      >
                        Certificate
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                    <span>Independent Level Attempt</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                    <span>Certificate Pass Marks: <strong className="text-amber-300">8/10</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Shield className="w-4 h-4 text-sky-400 flex-shrink-0" aria-hidden="true" />
                    <span>Explanations shown after submit</span>
                  </div>
                </div>
              </div>

              <div className="relative pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    playNavigationSound('next');
                    onSelectLevel(lvl);
                  }}
                  aria-label={`${bestAttempt ? 'Retake' : 'Start'} Level ${lvl} Quiz`}
                  className={`w-full ${info.btnColor} font-black py-3.5 px-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02] active:scale-[0.98] border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>{bestAttempt ? `Retake Level ${lvl} Quiz` : `Start Level ${lvl} Quiz`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Firestore Attempt History Card */}
      {userAttempts.length > 0 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="text-lg font-black text-white">Your Certificate & Attempt History</h4>
                <p className="text-xs text-slate-300">Saved securely under your candidate account</p>
              </div>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full">
              {userAttempts.length} Attempts Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {userAttempts.map((att, i) => (
              <div
                key={att.id || i}
                className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-md"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">Level {att.level} Quiz</span>
                  <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${att.certificateEligible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    {att.certificateEligible ? 'PASSED (8+)' : 'ATTEMPTED'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">{att.score} <span className="text-xs font-semibold text-slate-400">/ 10 ({att.percentage}%)</span></span>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-400" />
                    <span>{att.completionDate}</span>
                  </div>
                </div>

                {att.certificateEligible && onViewCertificate && (
                  <button
                    onClick={() => onViewCertificate(att)}
                    className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download Certificate</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YouTube Promotion Banner */}
      <YouTubeBanner />

    </div>
  );
};
