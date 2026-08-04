import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, HelpCircle, Shield, ListOrdered } from 'lucide-react';
import { Question, OptionKey } from '../types';
import { LEVEL_INFO, QUIZ_TOPIC_TELUGU, QUIZ_TOPIC_ENGLISH } from '../data/quizData';

interface QuizViewProps {
  level: 1 | 2 | 3;
  questions: Question[];
  onSubmitQuiz: (selectedAnswers: Record<number, OptionKey>) => void;
  onExitQuiz: () => void;
}

const TOTAL_TIME_SECONDS = 15 * 60; // 15 minutes = 900 seconds

export const QuizView: React.FC<QuizViewProps> = ({
  level,
  questions,
  onSubmitQuiz,
  onExitQuiz
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const levelInfo = LEVEL_INFO[level];
  const currentQuestion = questions[currentIndex];

  // 15-minute countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit when time runs out
          onSubmitQuiz(selectedAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAnswers, onSubmitQuiz]);

  const handleSelectOption = (optionKey: OptionKey) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionKey
    }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      setVisited((prev) => new Set(prev).add(index));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Bar: Level Badge, Timer, Exit */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-black px-3 py-1 rounded-full border ${levelInfo.badgeColor} uppercase tracking-wider backdrop-blur-md`}>
            Level {level} Quiz
          </span>
          <div>
            <h2 className="text-sm font-bold text-white">
              {QUIZ_TOPIC_ENGLISH}
            </h2>
            <p className="text-xs text-amber-400 font-medium">
              {QUIZ_TOPIC_TELUGU}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold backdrop-blur-md ${
            timeLeft < 180
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
              : 'bg-slate-950/60 border-white/10 text-amber-400'
          }`}>
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={onExitQuiz}
            aria-label="Exit level quiz and return to dashboard"
            className="text-xs font-bold text-slate-200 hover:text-white px-3.5 py-1.5 rounded-lg border border-white/20 hover:border-white/40 backdrop-blur-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Exit Level
          </button>
        </div>
      </div>

      {/* Question Progress Bar */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
          <span className="text-white">
            Question <span className="text-amber-400 text-sm">{currentIndex + 1}</span> of {questions.length}
          </span>
          <span className="text-emerald-400">
            {answeredCount} / {questions.length} Answered ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden border border-white/20" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz progress">
          <div
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Navigator Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2 text-xs text-slate-200">
            <span className="flex items-center gap-1 font-semibold text-slate-100">
              <ListOrdered className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>Question Navigator (Click to Jump):</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-sky-400" aria-hidden="true" /> Visited
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2" role="group" aria-label="Question Navigator">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isVisited = visited.has(idx);

              let styleClass = 'bg-slate-950/60 text-slate-300 border-white/20 hover:border-white/40';
              if (isCurrent) {
                styleClass = 'bg-amber-500 text-slate-950 font-black border-amber-300 ring-2 ring-amber-400/50 shadow-lg';
              } else if (isAnswered) {
                styleClass = 'bg-emerald-600/40 text-emerald-200 font-bold border-emerald-500/60 backdrop-blur-md';
              } else if (isVisited) {
                styleClass = 'bg-slate-900/80 text-sky-200 font-semibold border-sky-500/50 backdrop-blur-md';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  aria-label={`Jump to Question ${idx + 1}${isAnswered ? ', Answered' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${styleClass}`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Question Header */}
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-lg flex items-center justify-center backdrop-blur-md" aria-hidden="true">
            {currentIndex + 1}
          </span>
          <div className="space-y-2 flex-grow">
            <h3 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
              {currentQuestion.questionTelugu}
            </h3>
          </div>
        </div>

        {/* Level 2 Statement Box if present */}
        {currentQuestion.statements && currentQuestion.statements.length > 0 && (
          <div className="bg-slate-950/60 border border-white/20 rounded-2xl p-4 space-y-2 text-slate-100 text-sm backdrop-blur-md">
            {currentQuestion.statementHeader && (
              <p className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">
                {currentQuestion.statementHeader}
              </p>
            )}
            {currentQuestion.statements.map((stmt, sIdx) => (
              <div key={sIdx} className="flex items-start gap-2.5 leading-relaxed bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="text-amber-400 font-bold" aria-hidden="true">•</span>
                <span>{stmt}</span>
              </div>
            ))}
          </div>
        )}

        {/* Level 3 Assertion & Reason Box if present */}
        {currentQuestion.assertion && currentQuestion.reason && (
          <div className="bg-slate-950/60 border border-white/20 rounded-2xl p-4 sm:p-5 space-y-3 backdrop-blur-md">
            <div className="bg-sky-950/40 border border-sky-500/40 rounded-xl p-3.5 space-y-1">
              <span className="text-xs font-black text-sky-400 uppercase tracking-wider">Assertion (A):</span>
              <p className="text-sm sm:text-base text-white font-semibold leading-relaxed">
                {currentQuestion.assertion}
              </p>
            </div>
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 space-y-1">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Reason (R):</span>
              <p className="text-sm sm:text-base text-white font-semibold leading-relaxed">
                {currentQuestion.reason}
              </p>
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Select Option (A / B / C / D):</span>
          </p>

          <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Multiple choice options">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option.key;

              return (
                <button
                  key={option.key}
                  onClick={() => handleSelectOption(option.key)}
                  aria-pressed={isSelected}
                  aria-label={`Option ${option.key}: ${option.text}`}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/40 backdrop-blur-md'
                      : 'bg-slate-950/60 border-white/20 text-slate-100 hover:border-white/40 hover:bg-white/10 backdrop-blur-md'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-white/15 text-slate-200 group-hover:bg-white/25'
                    }`}
                  >
                    {option.key}
                  </span>

                  <span className="text-sm sm:text-base font-medium leading-relaxed pt-1 flex-grow">
                    {option.text}
                  </span>

                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Go to Previous Question"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-slate-100 font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              aria-label="Go to Next Question"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 border border-amber-300/30 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitModal(true)}
              aria-label="Submit Level Quiz"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/30 border border-emerald-400/30 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              <span>Submit Quiz</span>
            </button>
          )}
        </div>

      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="submitModalTitle">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center border border-white/20">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto backdrop-blur-md">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            <div>
              <h3 id="submitModalTitle" className="text-xl font-black text-white">
                Submit Level {level} Quiz?
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                You have answered <strong className="text-emerald-400">{answeredCount} out of {questions.length}</strong> questions.
              </p>
              <p className="text-xs text-rose-300 mt-2 font-semibold">
                "Once submitted, your answers cannot be changed."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                aria-label="Cancel quiz submission and resume answering"
                className="py-3 px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-slate-100 font-bold text-sm transition-colors cursor-pointer backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmitQuiz(selectedAnswers)}
                aria-label="Confirm and submit quiz answers"
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/30 border border-emerald-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
