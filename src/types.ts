export interface UserDetails {
  id?: string;
  uid?: string;
  fullName: string;
  email: string;
  mobile: string;
  state: string;
  examPreparation: 'AP TET' | 'TS TET' | 'AP DSC' | 'TS DSC' | 'Other' | string;
  quizDay: string;
  topic: string;
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
}

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  level: 1 | 2 | 3;
  questionTelugu: string;
  questionEnglishTitle?: string;
  statementHeader?: string;
  statements?: string[];
  assertion?: string;
  reason?: string;
  options: {
    key: OptionKey;
    text: string;
  }[];
  correctAnswer: OptionKey;
  explanation: string;
}

export interface QuizAttempt {
  id?: string;
  userId?: string;
  fullName: string;
  email: string;
  mobile: string;
  examPreparation: string;
  quizDay: string;
  topic: string;
  level: 1 | 2 | 3;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  selectedAnswers: Record<number, OptionKey>;
  completionDate: string;
  completionTime: string;
  certificateEligible: boolean;
  certificateId: string;
  createdAt: string;
}

export type ViewState = 'USER_FORM' | 'WELCOME' | 'QUIZ' | 'RESULTS' | 'CERTIFICATE';
