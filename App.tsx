
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import TestInterface from './components/TestInterface';
import AttemptedTestsPage from './components/AttemptedTestsPage';
import { Test, Question, Page, TestResultData, User } from './types';
import { MOCK_TESTS } from './constants';
import TestResult from './components/TestResult';
import { PDFGenerator } from './components/PDFGenerator';
import { ImageQuizGenerator } from './components/ImageQuizGenerator';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/ProfilePage';
import ContactPage from './components/ContactPage';
import TestInstructions from './components/TestInstructions';
import ChatAssistant from './components/ChatAssistant';
import { 
  subscribeToAuth, 
  loginUser, 
  registerUser, 
  loginWithGoogle,
  logoutUser, 
  saveTestResult 
} from './services/firebaseService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [testResult, setTestResult] = useState<TestResultData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Dark mode state initialized from localStorage if available
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };


  useEffect(() => {
    const unsubscribe = subscribeToAuth(user => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleLogin = async (email: string, password: string) => {
    await loginUser(email, password);
    navigate('home');
  };

  const handleSignup = async (name: string, email: string, password: string, phone: string) => {
    await registerUser(name, email, password, phone);
    navigate('home');
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    navigate('home');
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('home');
  };

  const requestFullScreen = () => {
      try {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
      } catch (e) {
          console.warn("Full screen request failed", e);
      }
  };

  const startTest = useCallback((test: Test) => {
    if (!currentUser) {
      alert("Please log in to start a test.");
      navigate('login');
      return;
    }
    
    setActiveTest(test);
    setCurrentPage('instructions'); // Go to instructions first
  }, [currentUser]);

  const proceedToTest = useCallback(() => {
      if (activeTest) {
          requestFullScreen();
          setCurrentPage('test');
      }
  }, [activeTest]);

  const startGeneratedTest = useCallback((title: string, questions: Question[], config?: { posMarks?: number, negMarks?: number, duration?: number }) => {
    if (!currentUser) {
      alert("Please log in to start a test.");
      navigate('login');
      return;
    }
    
    const generatedTest: Test = {
      id: `gen-${Date.now()}`,
      title,
      category: "Generated",
      questions,
      positiveMarks: config?.posMarks,
      negativeMarks: config?.negMarks,
      duration: config?.duration
    };
    setActiveTest(generatedTest);
    setCurrentPage('instructions'); // Go to instructions first
  }, [currentUser]);

  const finishTest = useCallback(async (userAnswers: (number | null)[], test: Test, timeTaken: number, timeSpentPerQuestion?: number[], markedQuestions?: number[]) => {
    try {
        let score = 0;
        
        // Scoring Logic
        const posMark = test.positiveMarks || 1;
        const negMark = test.negativeMarks || 0;
        const totalMarks = test.questions.length * posMark;

        test.questions.forEach((q, index) => {
          if (q.correctOption === userAnswers[index]) {
            score += posMark;
          } else if (userAnswers[index] !== null) {
            // Only deduct marks if attempted and wrong
            score -= negMark;
          }
        });
        
        // Avoid negative percentage visualization
        const percentage = Math.max(0, Math.round((score / totalMarks) * 100));
        
        // Default fallback values (1/1)
        let rank = 1;
        let percentile = 100;
        let totalCandidates = 1;

        // Save to DB first to get real Rank/Percentile from global stats
        if(currentUser) {
          try {
            // Create a promise that rejects after 4 seconds to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Database save timed out")), 4000)
            );
            
            const savePromise = saveTestResult(currentUser.uid, {
                score, 
                total: totalMarks, 
                test, 
                userAnswers, 
                timeTaken, 
                timeSpentPerQuestion,
                markedForReview: markedQuestions
            });

            // Race: if save takes too long, we proceed with defaults
            const stats: any = await Promise.race([savePromise, timeoutPromise]);
            
            if (stats) {
                rank = stats.rank;
                percentile = stats.percentile;
                totalCandidates = stats.totalAttempts;
            }
            console.log("Test result saved successfully.");
          } catch (error) {
            console.warn("Proceeding with local results (DB save failed or timed out):", error);
          }
        }

        const resultData: TestResultData = { 
            id: `result-${Date.now()}`,
            score, 
            total: totalMarks, 
            percentage,
            test, 
            userAnswers, 
            timeTaken,
            date: Date.now(),
            timeSpentPerQuestion,
            markedForReview: markedQuestions,
            rank: rank,
            percentile: percentile,
            totalAttempts: totalCandidates
        };
        
        setTestResult(resultData);

    } catch (err) {
        console.error("Critical Error in finishTest:", err);
        // Ensure we at least show the result page even if calculation fails
        if (!testResult) {
             // Fallback minimal result
             const fallbackResult: TestResultData = {
                id: `err-${Date.now()}`,
                test,
                score: 0,
                total: 0,
                percentage: 0,
                date: Date.now(),
                timeTaken,
                userAnswers,
                rank: 0,
                percentile: 0,
                totalAttempts: 0
             };
             setTestResult(fallbackResult);
        }
    } finally {
        // ALWAYS navigate to result, ensuring "Submitting..." state is cleared
        setActiveTest(null);
        setCurrentPage('result');
    }

  }, [currentUser, testResult]);

  // Restores a past result to the result view
  const handleViewResult = (historyItem: TestResultData) => {
      setTestResult(historyItem);
      setCurrentPage('result');
  };
  
  const renderContent = () => {
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )
    }

    switch (currentPage) {
      case 'instructions':
        return activeTest ? <TestInstructions test={activeTest} onStart={proceedToTest} onBack={() => navigate('home')} /> : null;
      case 'test':
        return activeTest && <TestInterface test={activeTest} onFinish={finishTest} user={currentUser} />;
      case 'attempted-tests':
        return currentUser ? (
            <AttemptedTestsPage 
                user={currentUser} 
                onViewResult={handleViewResult} 
                onReattempt={startTest} 
                onNavigate={navigate}
            /> 
        ) : <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onNavigate={navigate} />;
      case 'result':
        return testResult && <TestResult result={testResult} onRetry={startTest} onHome={() => navigate('home')} />;
      case 'pdf-generator':
        return currentUser ? (
            <PDFGenerator onTestGenerated={startGeneratedTest} />
        ) : (
            <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onNavigate={navigate} />
        );
      case 'image-generator':
        return currentUser ? (
            <ImageQuizGenerator onTestGenerated={startGeneratedTest} />
        ) : (
            <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onNavigate={navigate} />
        );
      case 'login':
        return <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onNavigate={navigate} />;
      case 'signup':
        return <SignupPage onSignup={handleSignup} onGoogleLogin={handleGoogleLogin} onNavigate={navigate} />;
      case 'profile':
        return currentUser ? <ProfilePage user={currentUser} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onNavigate={navigate} />;
      case 'contact':
        return <ContactPage />;
      case 'home':
      default:
        return <HomePage onStartTest={startTest} onNavigate={navigate} tests={MOCK_TESTS} />;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-100 transition-colors duration-200 flex flex-col relative">
      {currentPage !== 'test' && (
          <Header onNavigate={navigate} user={currentUser} onLogout={handleLogout} darkMode={darkMode} toggleTheme={toggleTheme} />
      )}
      <main className={`${currentPage === 'test' ? "" : "container mx-auto px-4 py-8"} flex-grow`}>
        {renderContent()}
      </main>
      {currentPage !== 'test' && currentPage !== 'instructions' && (
          <Footer onNavigate={navigate} />
      )}
      
      {/* Chat Assistant - Always available except potentially on focused test interface if user desires, but prompt said 'All good', so available globally is best */}
      {currentPage !== 'test' && <ChatAssistant />}
    </div>
  );
};

export default App;
