import React, { useState, useEffect } from 'react';
import { UserDetails, ViewState, OptionKey, Question, QuizAttempt } from './types';
import { QUIZ_QUESTIONS } from './data/quizData';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { UserForm } from './components/UserForm';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { CertificateModal } from './components/CertificateModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, userProfile, loading } = useAuth();

  const [localUser, setLocalUser] = useState<UserDetails | null>(null);
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Sync user state with AuthContext userProfile or localStorage
  useEffect(() => {
    if (user && userProfile) {
      setLocalUser(userProfile);
      if (userProfile.isRegistered) {
        setViewState((prev) => (prev === 'USER_FORM' || prev === 'HOME' ? 'WELCOME' : prev));
      } else {
        setViewState('USER_FORM');
      }
    } else if (!user) {
      setLocalUser(null);
      // Keep on current view state unless navigating explicitly
    }
  }, [userProfile, user]);

  const effectiveUser = user ? (userProfile || localUser) : null;

  const handleUserSubmitted = (userData: UserDetails) => {
    setLocalUser(userData);
    setViewState('WELCOME');
  };

  const handleSelectLevel = (level: 1 | 2 | 3) => {
    setActiveLevel(level);
    setSelectedAnswers({});
    setViewState('QUIZ');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizSubmitted = (answers: Record<number, OptionKey>) => {
    setSelectedAnswers(answers);
    setViewState('RESULTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateCertificate = (attempt: QuizAttempt) => {
    setActiveAttempt(attempt);
    setShowCertificate(true);
  };

  const handleChangeUser = () => {
    setViewState('USER_FORM');
  };

  // Filter questions for active level
  const activeQuestions = QUIZ_QUESTIONS.filter((q) => q.level === activeLevel);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-amber-300">Loading NTR Digi Class Platform...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Permanent Header with Firebase Auth */}
      <Header
        userName={effectiveUser?.fullName}
        onChangeUser={effectiveUser ? handleChangeUser : undefined}
        onOpenSignIn={() => setViewState('USER_FORM')}
        onNavigateHome={() => setViewState('HOME')}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {viewState === 'HOME' && (
          <HomeScreen
            user={effectiveUser}
            onStartQuiz={() => setViewState(effectiveUser ? 'WELCOME' : 'USER_FORM')}
            onOpenSignIn={() => setViewState('USER_FORM')}
            onOpenRegister={() => setViewState('USER_FORM')}
          />
        )}

        {viewState === 'USER_FORM' && (
          <UserForm
            initialValues={effectiveUser}
            onSubmitSuccess={handleUserSubmitted}
            onNavigateHome={() => setViewState('HOME')}
          />
        )}

        {viewState === 'WELCOME' && effectiveUser && (
          <WelcomeScreen
            user={effectiveUser}
            onSelectLevel={handleSelectLevel}
            onChangeUser={handleChangeUser}
            onViewCertificate={handleGenerateCertificate}
          />
        )}

        {viewState === 'QUIZ' && (
          <QuizView
            level={activeLevel}
            questions={activeQuestions}
            onSubmitQuiz={handleQuizSubmitted}
            onExitQuiz={() => setViewState('WELCOME')}
          />
        )}

        {viewState === 'RESULTS' && effectiveUser && (
          <ResultsView
            user={effectiveUser}
            level={activeLevel}
            questions={activeQuestions}
            selectedAnswers={selectedAnswers}
            onGenerateCertificate={handleGenerateCertificate}
            onSelectAnotherLevel={() => setViewState('WELCOME')}
            onRetakeLevel={() => handleSelectLevel(activeLevel)}
          />
        )}
      </main>

      {/* Certificate Modal */}
      {showCertificate && activeAttempt && (
        <CertificateModal
          attempt={activeAttempt}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto space-y-2">
          <p className="font-semibold text-slate-300">
            NTR Digi Class — Day 06 Live Quiz Platform
          </p>
          <p className="text-slate-400">
            History Teaching Methods | చరిత్ర బోధనా పద్ధతులు — AP & TS TET / DSC Social Methodology
          </p>
          <p className="text-slate-400 text-[11px] pt-1">
            © {new Date().getFullYear()} NTR Digi Class. All rights reserved. Designed for TET & DSC aspirants.
          </p>
        </div>
      </footer>

    </div>
  );
}
