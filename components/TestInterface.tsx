
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Test, Question, User } from '../types';
import { Maximize, Pause, UserIcon, Menu, X, ChevronLeft } from './icons/Icons'; 

interface TestInterfaceProps {
  test: Test;
  user: User | null;
  onFinish: (answers: (number | null)[], test: Test, timeTaken: number, timeSpentPerQuestion: number[], markedQuestions: number[]) => void;
}

const TestInterface: React.FC<TestInterfaceProps> = ({ test, user, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(test.questions.length).fill(null));
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  
  // Time tracking
  const [questionTimes, setQuestionTimes] = useState<number[]>(() => Array(test.questions.length).fill(0));
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use provided duration (in minutes) converted to seconds, OR default to 90s per question
  const maxTime = useMemo(() => {
      return test.duration ? test.duration * 60 : test.questions.length * 90;
  }, [test]);

  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // New States for functionality
  const [isPaused, setIsPaused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  // Logo URL
  const logoUrl = "https://lh3.googleusercontent.com/d/1RMsPbjIJVj5xZIj57bsNgqOgTGSOcgsA";

  // Try to enforce full screen on mount as backup
  useEffect(() => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
            // Ignore error if user interaction is missing
        });
    }
  }, []);

  // Trigger MathJax typesetting when question changes
  useEffect(() => {
      if ((window as any).MathJax) {
          // Small delay to ensure React has rendered the DOM
          setTimeout(() => {
               if ((window as any).MathJax.typesetPromise) {
                   (window as any).MathJax.typesetPromise();
               }
          }, 50);
      }
  }, [currentQuestionIndex, test]);

  // Global Timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleFinish(true); // force submit
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, answers, maxTime, isPaused]);

  // Question Timer Logic
  useEffect(() => {
      if (isPaused) return;

      questionTimerRef.current = setInterval(() => {
          setCurrentQuestionTime(prev => prev + 1);
      }, 1000);

      return () => {
          if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      };
  }, [currentQuestionIndex, isPaused]);


  // Handle Question Switching (Saving time)
  useEffect(() => {
      setSelectedOption(answers[currentQuestionIndex]);
      setVisitedQuestions(prev => new Set(prev).add(currentQuestionIndex));
      
      // Reset question timer for display
      setCurrentQuestionTime(questionTimes[currentQuestionIndex] || 0);

      return () => {
          // Save time when leaving question
          setQuestionTimes(prev => {
              const newTimes = [...prev];
              newTimes[currentQuestionIndex] = currentQuestionTime;
              return newTimes;
          });
      };
  }, [currentQuestionIndex]);
  
  // Update the running timer in the background state
  useEffect(() => {
     setQuestionTimes(prev => {
         const newTimes = [...prev];
         newTimes[currentQuestionIndex] = currentQuestionTime;
         return newTimes;
     });
  }, [currentQuestionTime, currentQuestionIndex]);


  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleSaveAndNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleMarkForReview = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption; // Save selected option if any
    setAnswers(newAnswers);

    setMarkedForReview(prev => {
        const newSet = new Set(prev);
        newSet.add(currentQuestionIndex);
        return newSet;
    });

    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleClearResponse = () => {
    setSelectedOption(null);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = null;
    setAnswers(newAnswers);
  };

  const handleFinish = (force = false) => {
    // Exit fullscreen
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log("Exit fullscreen failed", err));
    }

    // Update final time for current question before finishing
    const finalQuestionTimes = [...questionTimes];
    finalQuestionTimes[currentQuestionIndex] = currentQuestionTime;

    setIsSubmitting(true);
    const totalTimeTaken = maxTime - timeLeft;
    const markedArray = Array.from(markedForReview);
    
    // Small delay to ensure UI updates before unmounting
    setTimeout(() => {
        onFinish(answers, test, totalTimeTaken, finalQuestionTimes, markedArray);
    }, 100);
  };

  const formatTimeSegments = (totalSeconds: number) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return {
          h: hours.toString().padStart(2, '0'),
          m: minutes.toString().padStart(2, '0'),
          s: seconds.toString().padStart(2, '0')
      };
  };
  
  const formatQuestionTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
              console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
          });
      } else {
          document.exitFullscreen();
      }
  };

  const question = test.questions[currentQuestionIndex];

  // Counters for Legend
  const answeredCount = answers.filter((a, i) => a !== null && !markedForReview.has(i)).length;
  const notAnsweredCount = visitedQuestions.size - answers.filter(a => a !== null).length;
  const markedCount = markedForReview.size;
  const markedAndAnsweredCount = answers.filter((a, i) => a !== null && markedForReview.has(i)).length;
  const notVisitedCount = test.questions.length - visitedQuestions.size;

  const timeObj = formatTimeSegments(timeLeft);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden font-sans relative">
      {/* Overlay for Pause */}
      {isPaused && (
          <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center max-w-md">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Test Paused</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">The timer has been stopped. Resume when you are ready.</p>
                  <button 
                    onClick={() => setIsPaused(false)}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                      Resume Test
                  </button>
              </div>
          </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0 relative z-20">
        <div className="flex items-center">
             <img 
                src={logoUrl} 
                alt="MockTest Logo" 
                className="w-10 h-10 object-contain mr-3" 
                referrerPolicy="no-referrer"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight mr-4 hidden sm:block">MockTest</span>
            <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[150px] sm:max-w-md ml-2" title={test.title}>
                {test.title}
            </div>
        </div>
        
        <div className="flex items-center space-x-3">
            {/* Global Timer */}
            <div className="flex items-center space-x-1.5 mr-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mr-1 hidden sm:inline">Time Left</span>
                
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white w-9 h-9 flex items-center justify-center rounded font-bold shadow-sm text-base">
                    {timeObj.h}
                </div>
                <span className="text-gray-500 font-bold">:</span>
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white w-9 h-9 flex items-center justify-center rounded font-bold shadow-sm text-base">
                    {timeObj.m}
                </div>
                <span className="text-gray-500 font-bold">:</span>
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white w-9 h-9 flex items-center justify-center rounded font-bold shadow-sm text-base">
                    {timeObj.s}
                </div>
            </div>
            
            <button onClick={toggleFullscreen} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 rounded hover:bg-cyan-50 dark:hover:bg-gray-700 font-medium text-sm hidden sm:block transition-colors">
                Switch Full Screen
            </button>
            <button onClick={() => setIsPaused(!isPaused)} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 rounded hover:bg-cyan-50 dark:hover:bg-gray-700 font-medium text-sm hidden sm:block transition-colors">
                Pause
            </button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden relative">
        {/* Main Content */}
        <main className="flex-grow flex flex-col h-full overflow-hidden relative z-0 min-w-0">
           {/* Sub Header */}
           <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-between items-center flex-shrink-0">
               <div className="flex items-center space-x-4">
                   <span className="text-sm font-bold text-gray-700 dark:text-gray-300">SECTIONS</span>
                   <button className="bg-teal-700 text-white px-4 py-1 rounded text-sm font-medium hover:bg-teal-800">
                       {test.category || "General"}
                   </button>
               </div>
               
               <div className="flex items-center space-x-2 sm:space-x-4">
                   {/* Individual Question Timer (Moved here) */}
                   <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                       <span className="text-xs font-medium uppercase">Time</span>
                       <span className="text-sm font-mono">{formatQuestionTime(currentQuestionTime)}</span>
                   </div>

                   <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

                   {/* Marks */}
                   <div className="text-xs font-bold flex items-center space-x-1">
                        <span className="text-gray-500 dark:text-gray-400">Marks</span>
                        <span className="bg-green-100 text-green-700 px-1.5 rounded border border-green-200">+{test.positiveMarks || 1}</span>
                        <span className="bg-red-100 text-red-700 px-1.5 rounded border border-red-200">-{test.negativeMarks || 0}</span>
                   </div>
               </div>
           </div>

           {/* Question Area - Left aligned */}
           <div className="flex-grow overflow-y-auto p-4 sm:p-8">
               <div className="w-full"> 
                   <div className="mb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                       <h2 className="text-lg font-bold text-gray-800 dark:text-white">Question No. {currentQuestionIndex + 1}</h2>
                   </div>

                   <div className="mb-8">
                       <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{question.question}</p>
                       {/* Dual Language Display: Render Hindi question if available */}
                       {question.questionHindi && (
                           <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                               {question.questionHindi}
                           </p>
                       )}
                   </div>

                   <div className="space-y-3 max-w-3xl">
                       {question.options.map((option, index) => (
                           <div 
                               key={index}
                               onClick={() => handleOptionSelect(index)}
                               className="flex items-start p-3 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                           >
                               <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center mr-3 
                                   ${selectedOption === index 
                                       ? 'border-primary bg-primary' 
                                       : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700'}`}
                               >
                                   {selectedOption === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
                               </div>
                               <div className="flex flex-col">
                                   <span className="text-base text-gray-700 dark:text-gray-300">{option}</span>
                                   {/* Dual Language Display: Render Hindi option if available */}
                                   {question.optionsHindi && question.optionsHindi[index] && (
                                       <span className="text-base text-gray-500 dark:text-gray-400 mt-1">
                                           {question.optionsHindi[index]}
                                       </span>
                                   )}
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           {/* Bottom Navigation - Single Line Buttons with improved mobile spacing */}
           <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-3 sm:px-6 flex items-center justify-between flex-shrink-0 gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                        onClick={handleMarkForReview}
                        className="px-2 sm:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold whitespace-nowrap"
                    >
                        Mark for Review & Next
                    </button>
                    <button 
                        onClick={handleClearResponse}
                        className="px-2 sm:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold whitespace-nowrap"
                    >
                        Clear Response
                    </button>
                </div>
                <button 
                    onClick={handleSaveAndNext}
                    className="px-4 sm:px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded text-sm font-bold shadow-sm transition-colors whitespace-nowrap flex-shrink-0 ml-auto"
                >
                    Save & Next
                </button>
           </div>
        </main>

        {/* Right Sidebar - Responsive Drawer */}
        <aside className={`
            fixed inset-y-0 right-0 w-80 bg-blue-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            md:relative md:translate-x-0 md:flex md:shadow-none md:z-40 flex flex-col flex-shrink-0
        `}>
             
             {/* Mobile Close Button */}
             <div className="md:hidden absolute top-2 right-2 z-50">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    <X className="w-5 h-5" />
                </button>
             </div>

             {/* User Profile Snippet */}
             <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 dark:text-pink-400">
                      {user?.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                          <UserIcon className="w-6 h-6" />
                      )}
                  </div>
                  <div className="overflow-hidden">
                      <div className="text-sm font-bold text-gray-800 dark:text-white truncate">{user?.displayName || 'Student'}</div>
                  </div>
             </div>

             {/* Legend */}
             <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                 <div className="flex items-center text-xs"><span className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center mr-2 font-bold">{answeredCount}</span> Answered</div>
                 <div className="flex items-center text-xs"><span className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center mr-2 font-bold">{notAnsweredCount}</span> Not Answered</div>
                 <div className="flex items-center text-xs"><span className="w-6 h-6 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded flex items-center justify-center mr-2 font-bold border border-gray-300 dark:border-gray-500">{notVisitedCount}</span> Not Visited</div>
                 <div className="flex items-center text-xs"><span className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center mr-2 font-bold">{markedCount}</span> Marked for Review</div>
                 <div className="col-span-2 flex items-center text-xs mt-1">
                     <span className="relative w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center mr-2 font-bold">
                         {markedAndAnsweredCount}
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                     </span>
                     Answered & Marked for Review (will be considered for evaluation)
                 </div>
             </div>

             {/* Section Title */}
             <div className="bg-blue-100 dark:bg-gray-700 p-2 font-bold text-sm text-gray-800 dark:text-white px-4 flex-shrink-0">
                 SECTION : {test.category || "General"}
             </div>

             {/* Question Grid */}
             <div className="p-4 flex-grow overflow-y-auto bg-blue-50 dark:bg-gray-900/50">
                 <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                     {test.questions.map((_, idx) => {
                         const isAnswered = answers[idx] !== null;
                         const isMarked = markedForReview.has(idx);
                         const isCurrent = currentQuestionIndex === idx;
                         const isVisited = visitedQuestions.has(idx);

                         let className = "w-10 h-10 flex items-center justify-center rounded font-bold text-sm cursor-pointer border ";
                         
                         // Determine Color
                         if (isMarked && isAnswered) {
                             className += "bg-purple-600 text-white border-purple-700 relative overflow-visible"; 
                         } else if (isMarked) {
                             className += "bg-purple-600 text-white border-purple-700";
                         } else if (isAnswered) {
                             className += "bg-green-500 text-white border-green-600";
                         } else if (!isVisited) {
                             className += "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600";
                         } else {
                             // Visited but not answered
                             className += "bg-red-500 text-white border-red-600";
                         }

                         // Current question highlight
                         if (isCurrent) {
                             className += " ring-2 ring-blue-400 ring-offset-1";
                         }

                         return (
                             <div 
                                key={idx} 
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={className}
                             >
                                 {idx + 1}
                                 {/* Green dot for Marked & Answered */}
                                 {isMarked && isAnswered && (
                                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                                 )}
                             </div>
                         );
                     })}
                 </div>
             </div>

             {/* Submit Button Area */}
             <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                 <button 
                    onClick={() => handleFinish()} 
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded shadow-md transition-colors disabled:opacity-70"
                 >
                     {isSubmitting ? 'Submitting...' : 'Submit Test'}
                 </button>
             </div>
        </aside>

        {/* Mobile Toggle Tab Button - Restyled */}
        <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`
                md:hidden fixed top-1/2 right-0 z-40 
                transform -translate-y-1/2
                bg-blue-600 text-white 
                py-4 px-2 rounded-l-lg shadow-lg 
                hover:bg-blue-700 transition-colors
                flex items-center justify-center
            `}
        >
            <ChevronLeft className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

export default TestInterface;
