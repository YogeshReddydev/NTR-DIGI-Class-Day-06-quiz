import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, Sparkles, BookOpen, Clock, Calendar, Check, AlertCircle, Trophy, Crown, Medal, TrendingUp, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { db, auth } from '../firebase';
import { Question, OptionKey, UserDetails, QuizAttempt } from '../types';
import { LEVEL_INFO, QUIZ_DAY, QUIZ_TOPIC_TELUGU, QUIZ_TOPIC_ENGLISH } from '../data/quizData';
import { YouTubeBanner } from './YouTubeBanner';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';

interface ResultsViewProps {
  user: UserDetails;
  level: 1 | 2 | 3;
  questions: Question[];
  selectedAnswers: Record<number, OptionKey>;
  quizDay?: string;
  topicTelugu?: string;
  topicEnglish?: string;
  onGenerateCertificate: (attempt: QuizAttempt) => void;
  onSelectAnotherLevel: () => void;
  onRetakeLevel: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  user,
  level,
  questions,
  selectedAnswers,
  quizDay = QUIZ_DAY,
  topicTelugu = QUIZ_TOPIC_TELUGU,
  topicEnglish = QUIZ_TOPIC_ENGLISH,
  onGenerateCertificate,
  onSelectAnotherLevel,
  onRetakeLevel
}) => {
  const [attemptData, setAttemptData] = useState<QuizAttempt | null>(null);
  const [isBufferedLocally, setIsBufferedLocally] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<QuizAttempt[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);

  const { fetchUserAttempts } = useAuth();
  const { saveQuizAttempt } = useNetwork();
  const hasSavedAttempt = React.useRef(false);

  // Fetch leaderboard rankings for the current quiz day and level
  useEffect(() => {
    let isMounted = true;
    const loadLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const q = query(
          collection(db, 'quiz_attempts'),
          where('quizDay', '==', quizDay),
          where('level', '==', level)
        );
        const snap = await getDocs(q);
        const fetchedList: QuizAttempt[] = [];
        snap.forEach((d) => {
          fetchedList.push({ id: d.id, ...d.data() } as QuizAttempt);
        });

        // Ensure current attempt is included
        if (attemptData) {
          const exists = fetchedList.some(
            (a) =>
              (a.id && a.id === attemptData.id) ||
              (a.userId === attemptData.userId &&
                a.completionDate === attemptData.completionDate &&
                a.score === attemptData.score)
          );
          if (!exists) {
            fetchedList.push(attemptData);
          }
        }

        // Sort descending by score, percentage, then newest first
        fetchedList.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.percentage !== a.percentage) return b.percentage - a.percentage;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        // Deduplicate candidates
        const uniqueRankings: QuizAttempt[] = [];
        const seen = new Set<string>();
        for (const item of fetchedList) {
          const key = item.userId || item.email || item.fullName;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueRankings.push(item);
          }
        }

        if (isMounted) {
          setLeaderboard(uniqueRankings.slice(0, 10));
        }
      } catch (err) {
        console.warn('Leaderboard fetch error:', err);
        if (isMounted && attemptData) {
          setLeaderboard([attemptData]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingLeaderboard(false);
        }
      }
    };

    if (attemptData) {
      loadLeaderboard();
    }

    return () => {
      isMounted = false;
    };
  }, [attemptData, quizDay, level]);

  useEffect(() => {
    if (hasSavedAttempt.current) return;
    hasSavedAttempt.current = true;

    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const certificateEligible = correctCount >= 8;

    const now = new Date();
    const completionDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const completionTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Unique Certificate ID generator: e.g. NTRDC-DAY07-L1-7F892
    const dayCode = quizDay.replace(/\s+/g, '');
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const certificateId = `NTRDC-${dayCode}-L${level}-${randomHex}`;

    const currentUserId = user.uid || user.id || auth.currentUser?.uid || 'anonymous';

    const attempt: QuizAttempt = {
      userId: currentUserId,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      examPreparation: user.examPreparation,
      quizDay: quizDay,
      topic: topicEnglish,
      level,
      score: correctCount,
      totalQuestions,
      percentage,
      correctAnswers: correctCount,
      incorrectAnswers: totalQuestions - correctCount,
      selectedAnswers,
      completionDate,
      completionTime,
      certificateEligible,
      certificateId,
      createdAt: now.toISOString()
    };

    setAttemptData(attempt);

    // Save attempt using network manager (saves to Firestore if online, or buffers locally if offline)
    saveQuizAttempt(attempt)
      .then((res) => {
        setIsBufferedLocally(res.bufferedLocally);
        fetchUserAttempts();
      })
      .catch((err) => {
        console.warn('Quiz attempt save handler error:', err);
      });

    // Trigger confetti if score >= 8
    if (certificateEligible) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore fallback
      }
    }
  }, [user, level, questions, selectedAnswers]);

  if (!attemptData) return null;

  const levelInfo = LEVEL_INFO[level];
  const isPassed = attemptData.certificateEligible;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Results Dashboard Card */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 shadow-2xl border border-white/10">
        <div className={`absolute top-0 right-0 w-80 h-80 ${isPassed ? 'bg-emerald-500/10' : 'bg-rose-500/10'} rounded-full blur-3xl pointer-events-none`} />

        <div className="relative text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quiz Completed</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {QUIZ_DAY} – {QUIZ_TOPIC_ENGLISH}
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-amber-400">
            {QUIZ_TOPIC_TELUGU} ({levelInfo.title})
          </p>

          <p className="text-xs text-slate-300">
            Candidate: <strong className="text-white">{attemptData.fullName}</strong> ({attemptData.examPreparation})
          </p>

          {isBufferedLocally && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 max-w-lg mx-auto backdrop-blur-md animate-pulse">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Offline Mode: Result saved locally. It will automatically sync to Firestore when reconnected.</span>
            </div>
          )}
        </div>

        {/* Score Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          
          <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Score
            </span>
            <span className="text-3xl sm:text-4xl font-black text-amber-400 mt-1 block">
              {attemptData.score} / {attemptData.totalQuestions}
            </span>
            <span className="text-[11px] font-semibold text-slate-300 mt-0.5 block">
              {attemptData.percentage}% Score
            </span>
          </div>

          <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Correct
            </span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 block">
              {attemptData.correctAnswers}
            </span>
            <span className="text-[11px] font-semibold text-emerald-300/80 mt-0.5 block">
              Questions
            </span>
          </div>

          <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Incorrect
            </span>
            <span className="text-3xl sm:text-4xl font-black text-rose-400 mt-1 block">
              {attemptData.incorrectAnswers}
            </span>
            <span className="text-[11px] font-semibold text-rose-300/80 mt-0.5 block">
              Questions
            </span>
          </div>

          <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Completion
            </span>
            <span className="text-xs font-bold text-slate-200 mt-2 block flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{attemptData.completionDate}</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>{attemptData.completionTime}</span>
            </span>
          </div>

        </div>

        {/* Certificate Eligibility Banner */}
        <div className="mt-8 pt-6 border-t border-white/10">
          {isPassed ? (
            <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900/60 to-emerald-950/50 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl backdrop-blur-md">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 backdrop-blur-md">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Congratulations, {user.fullName}!
                </h3>
                <p className="text-sm text-emerald-300 mt-1 font-semibold">
                  You have successfully qualified for the {attemptData.quizDay || quizDay} Level {level} Certificate!
                </p>
              </div>
              <button
                onClick={() => onGenerateCertificate(attemptData)}
                aria-label="Generate Official Certificate of Achievement"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black px-8 py-4 rounded-2xl text-base shadow-xl shadow-amber-500/30 border border-amber-300/30 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <Award className="w-5 h-5" aria-hidden="true" />
                <span>Generate Official Certificate</span>
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-slate-950/60 via-slate-900/60 to-slate-950/60 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl backdrop-blur-md">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center mx-auto backdrop-blur-md">
                <AlertCircle className="w-8 h-8" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Keep Learning and Try Again!
                </h3>
                <p className="text-sm text-slate-200 mt-1">
                  You need at least <strong className="text-amber-400">8 out of 10</strong> to qualify for the certificate.
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Your Score: <strong className="text-rose-400">{attemptData.score} / 10</strong>
                </p>
              </div>
              <button
                onClick={onRetakeLevel}
                aria-label={`Try Level ${level} Quiz Again`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm shadow-lg border border-amber-300/30 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Try Level {level} Again</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Leaderboard Rankings Section with Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="rounded-3xl glass-card p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{quizDay} – Level {level} Rankings</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 pt-1">
              <span>Top Candidate Leaderboard</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-300">
              Live examination score rankings for Social Methodology candidates
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 backdrop-blur-md">
            <Users className="w-4 h-4 text-sky-400" />
            <span>{leaderboard.length} Top Performers</span>
          </div>
        </div>

        {/* Animated Rankings List */}
        {isLoadingLeaderboard ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold animate-pulse">
            Loading candidate rankings leaderboard...
          </div>
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.15
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {leaderboard.map((item, index) => {
              const rank = index + 1;
              const isCurrentUser =
                item.userId === attemptData.userId ||
                (item.fullName === attemptData.fullName && item.score === attemptData.score);

              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;

              return (
                <motion.div
                  key={item.id || `${item.userId}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 15, scale: 0.98 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.35, ease: 'easeOut' }
                    }
                  }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : isGold
                      ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-slate-900/80 border-amber-400/50'
                      : isSilver
                      ? 'bg-gradient-to-r from-slate-400/15 via-slate-300/10 to-slate-900/80 border-slate-400/40'
                      : isBronze
                      ? 'bg-gradient-to-r from-orange-600/15 via-amber-700/10 to-slate-900/80 border-orange-400/40'
                      : 'bg-slate-950/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge Icon */}
                    <div className="flex-shrink-0">
                      {isGold ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/30">
                          <Crown className="w-5 h-5 fill-slate-950 text-slate-950" />
                        </div>
                      ) : isSilver ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                          <Medal className="w-5 h-5 text-slate-950" />
                        </div>
                      ) : isBronze ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                          <Award className="w-5 h-5 text-slate-950" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center font-black text-xs">
                          #{rank}
                        </div>
                      )}
                    </div>

                    {/* Candidate Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm sm:text-base">
                          {item.fullName}
                        </span>
                        {isCurrentUser && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.examPreparation || 'AP DSC Candidate'} • {item.completionDate}
                      </p>
                    </div>
                  </div>

                  {/* Score & Certificate Badge */}
                  <div className="flex items-center gap-3 mt-3 sm:mt-0 pl-13 sm:pl-0">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-amber-400 block">
                        {item.score} / {item.totalQuestions || 10} ({item.percentage}%)
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        {item.completionTime || 'Verified'}
                      </span>
                    </div>

                    {item.certificateEligible && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1" title="Certificate Qualified">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Answer Review Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <span>Detailed Answer Review & Explanations</span>
            </h3>
            <p className="text-xs text-slate-200 mt-1">
              Review correct answers and pedagogical explanations for all 10 questions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSelectAnotherLevel}
              aria-label="Select another quiz level"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 text-xs font-bold transition-all border border-white/20 backdrop-blur-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span>Select Level</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {questions.map((q, qIdx) => {
            const userChoice = selectedAnswers[q.id];
            const isCorrect = userChoice === q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`rounded-3xl border p-6 space-y-4 backdrop-blur-xl transition-all glass-card ${
                  isCorrect
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-rose-500/40 bg-rose-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      Q{qIdx + 1}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                      {q.questionTelugu}
                    </h4>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex-shrink-0 backdrop-blur-md ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Incorrect
                      </>
                    )}
                  </span>
                </div>

                {/* Level 2 Statements or Level 3 Assertion */}
                {q.statements && q.statements.length > 0 && (
                  <div className="bg-slate-950/50 border border-white/10 rounded-xl p-3 space-y-1.5 text-xs text-slate-300 backdrop-blur-md">
                    {q.statements.map((s, idx) => (
                      <p key={idx}>{s}</p>
                    ))}
                  </div>
                )}

                {q.assertion && q.reason && (
                  <div className="bg-slate-950/50 border border-white/10 rounded-xl p-3 space-y-2 text-xs text-slate-200 backdrop-blur-md">
                    <p><strong className="text-sky-400">Assertion (A):</strong> {q.assertion}</p>
                    <p><strong className="text-amber-400">Reason (R):</strong> {q.reason}</p>
                  </div>
                )}

                {/* Selected vs Correct Option */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className={`p-3 rounded-xl border backdrop-blur-md ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}>
                    <span className="font-bold block uppercase tracking-wider text-[10px] opacity-80 mb-1">
                      Your Selected Answer:
                    </span>
                    <span className="font-extrabold text-sm">
                      Option {userChoice || 'None'}
                    </span>
                    <p className="mt-0.5 opacity-90">
                      {q.options.find((o) => o.key === userChoice)?.text || 'Not Answered'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border bg-emerald-950/40 border-emerald-500/40 text-emerald-200 backdrop-blur-md">
                    <span className="font-bold block uppercase tracking-wider text-[10px] text-emerald-400 mb-1">
                      Correct Answer:
                    </span>
                    <span className="font-extrabold text-sm text-emerald-300">
                      Option {q.correctAnswer}
                    </span>
                    <p className="mt-0.5 opacity-90">
                      {q.options.find((o) => o.key === q.correctAnswer)?.text}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-950/60 border border-sky-500/20 rounded-2xl p-4 text-xs space-y-1 backdrop-blur-md">
                  <span className="font-black text-amber-400 uppercase tracking-wider text-[11px] block">
                    Explanation (వివరణ):
                  </span>
                  <p className="text-slate-200 leading-relaxed text-sm">
                    {q.explanation}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* YouTube Banner */}
      <YouTubeBanner />

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onRetakeLevel}
          aria-label={`Retake Level ${level} Quiz`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl border border-white/20 backdrop-blur-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Retake Level {level} Quiz</span>
        </button>

        <button
          onClick={onSelectAnotherLevel}
          aria-label="Select another quiz level"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg border border-indigo-400/30 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span>Select Another Quiz Level</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

    </div>
  );
};
