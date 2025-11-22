
export interface Question {
  question: string;
  questionHindi?: string; // Added for dual language support
  options: string[];
  optionsHindi?: string[]; // Added for dual language support
  correctOption: number;
}

export interface Test {
  id: string;
  title: string;
  category: string;
  questions: Question[];
  positiveMarks?: number;
  negativeMarks?: number;
  duration?: number; // in minutes
}

export type Page = 'home' | 'test' | 'instructions' | 'attempted-tests' | 'result' | 'pdf-generator' | 'image-generator' | 'login' | 'signup' | 'profile' | 'contact';

export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    metadata: {
        creationTime?: string;
        lastSignInTime?: string;
    };
}

export interface TestResultData {
  id: string;
  test: Test;
  score: number;
  total: number;
  percentage: number;
  date: number; 
  timeTaken: number; // Total time
  timeSpentPerQuestion?: number[]; // Array of seconds spent per question index
  markedForReview?: number[]; // Array of question indices marked for review
  userAnswers: (number | null)[];
  rank?: number;
  percentile?: number;
  totalAttempts?: number; // Total number of participants for this test
}
