
import React, { useState, useRef, useEffect } from 'react';
import { Test, TestResultData } from '../types';
import { getQuestionAnalysis, getDetailedQuestionAnalysis } from '../services/geminiService';
import { 
    Sparkles, 
    CheckCircle, 
    XCircle, 
    HelpCircle, 
    Trophy, 
    Target, 
    Clock, 
    Users, 
    FileText,
    Award,
    Bookmark,
    ChevronUp,
    BookOpen
} from './icons/Icons';

interface TestResultProps {
  result: TestResultData;
  onRetry: (test: Test) => void;
  onHome: () => void;
}

const TestResult: React.FC<TestResultProps> = ({ result, onRetry, onHome }) => {
  const { score, total, test, userAnswers, timeTaken, timeSpentPerQuestion, rank, percentile, totalAttempts, markedForReview } = result;
  
  const analysisRef = useRef<HTMLDivElement>(null);

  const scrollToSolutions = () => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Trigger MathJax for the main result view
  useEffect(() => {
      if ((window as any).MathJax) {
           setTimeout(() => {
               if((window as any).MathJax.typesetPromise) {
                   (window as any).MathJax.typesetPromise();
               }
           }, 100);
      }
  }, [result]);

  // Use total for percentage calc (total is now total marks, score is user marks)
  // If score is negative, floor percentage at 0 for visual bars (though backend might store raw)
  const percentage = Math.max(0, Math.round((score / total) * 100));
  const attemptedCount = userAnswers.filter(a => a !== null).length;
  const correctCount = userAnswers.filter((ans, index) => ans === test.questions[index].correctOption).length;
  const incorrectCount = attemptedCount - correctCount;
  const totalQuestions = test.questions.length;
  
  // Format time taken (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate Max Time for display based on test duration if available
  const maxTimeDisplay = test.duration ? test.duration * 60 : totalQuestions * 90;
  
  // Use stored rank/percentile if available (legacy data might not have it, fallback to N/A or calc)
  const displayRank = rank !== undefined ? rank : 'N/A';
  const displayPercentile = percentile !== undefined ? percentile : 'N/A';
  // Use actual total attempts or fallback to 1 if undefined
  const totalCandidates = totalAttempts !== undefined ? totalAttempts : 1;

  // Ensure score is displayed with 2 decimal places
  const formattedScore = Number(score).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center transition-colors">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">{test.title}</h1>
        <div className="flex items-center space-x-4">
             <button onClick={() => onRetry(test)} className="flex items-center text-primary font-semibold hover:underline">
                Reattempt This Test
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
             </button>
             
             <button onClick={onHome} className="text-gray-600 dark:text-gray-300 hover:text-primary font-medium">Go to Tests</button>
             <button 
                onClick={scrollToSolutions}
                className="border border-primary text-primary px-4 py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
             >
                 Solutions
             </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-2 md:grid-cols-5 gap-8 divide-x divide-gray-100 dark:divide-gray-700 transition-colors">
        <StatItem 
            icon={<Trophy className="w-6 h-6 text-white" />} 
            iconBg="bg-red-500" 
            value={<span>{displayRank} <span className="text-gray-400 text-sm font-normal">/ {totalCandidates}</span></span>} 
            label="Rank" 
        />
        <StatItem 
            icon={<Award className="w-6 h-6 text-white" />} 
            iconBg="bg-purple-500" 
            value={<span>{formattedScore} <span className="text-gray-400 text-sm font-normal">/ {total}</span></span>} 
            label="Marks Scored" 
        />
        <StatItem 
            icon={<FileText className="w-6 h-6 text-white" />} 
            iconBg="bg-cyan-500" 
            value={<span>{attemptedCount} <span className="text-gray-400 text-sm font-normal">/ {totalQuestions}</span></span>} 
            label="Attempted" 
        />
        <StatItem 
            icon={<Target className="w-6 h-6 text-white" />} 
            iconBg="bg-green-500" 
            value={`${percentage}%`} 
            label="Accuracy" 
        />
        <StatItem 
            icon={<Users className="w-6 h-6 text-white" />} 
            iconBg="bg-indigo-500" 
            value={`${displayPercentile}%`} 
            label="Percentile" 
        />
      </div>

      {/* Sectional Summary */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sectional Summary</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 uppercase">
                    <tr>
                        <th className="px-6 py-3 font-medium">Section Name</th>
                        <th className="px-6 py-3 font-medium">Score</th>
                        <th className="px-6 py-3 font-medium">Attempted</th>
                        <th className="px-6 py-3 font-medium">Correct</th>
                        <th className="px-6 py-3 font-medium">Incorrect</th>
                        <th className="px-6 py-3 font-medium">Accuracy</th>
                        <th className="px-6 py-3 font-medium">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{test.category || "General Awareness"}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <span className="font-bold text-purple-600 dark:text-purple-400 mr-2">{formattedScore}</span>
                                <span className="text-gray-400">/ {total}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-gray-800 dark:text-white">{attemptedCount}</span>
                            <span className="text-gray-400"> / {totalQuestions}</span>
                        </td>
                        <td className="px-6 py-4">
                             <span className="font-bold text-green-600 dark:text-green-400">{correctCount}</span>
                        </td>
                        <td className="px-6 py-4">
                             <span className="font-bold text-red-600 dark:text-red-400">{incorrectCount}</span>
                        </td>
                        <td className="px-6 py-4">
                             <span className="font-bold text-gray-800 dark:text-white">{percentage}%</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-gray-800 dark:text-white">{formatTime(timeTaken)}</span>
                            <span className="text-gray-400"> / {formatTime(maxTimeDisplay)} min</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      {/* Detailed Analysis (Full Width) */}
      <div ref={analysisRef} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-6 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
               <h3 className="text-lg font-bold text-primary border-b-2 border-primary pb-4 -mb-4.5">Question Analysis</h3>
          </div>

          <div className="space-y-4">
               {test.questions.map((q, index) => (
                  <QuestionAnalysisItem 
                      key={index}
                      question={q} 
                      userAnswerIndex={userAnswers[index]}
                      questionNumber={index + 1}
                      timeTaken={timeSpentPerQuestion ? timeSpentPerQuestion[index] : 0}
                      isMarkedForReview={markedForReview ? markedForReview.includes(index) : false}
                  />
               ))}
          </div>
      </div>
    </div>
  );
};

interface StatItemProps {
    icon: React.ReactNode;
    iconBg: string;
    value: React.ReactNode;
    label: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, iconBg, value, label }) => (
    <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${iconBg}`}>
            {icon}
        </div>
        <div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        </div>
    </div>
);


interface QuestionAnalysisItemProps {
    question: Test['questions'][0];
    userAnswerIndex: number | null;
    questionNumber: number;
    timeTaken: number;
    isMarkedForReview: boolean;
}

const QuestionAnalysisItem: React.FC<QuestionAnalysisItemProps> = ({ question, userAnswerIndex, questionNumber, timeTaken, isMarkedForReview }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetailed, setIsLoadingDetailed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    
    const isCorrect = question.correctOption === userAnswerIndex;
    const isUnanswered = userAnswerIndex === null;

    // Effect to typeset math when analysis or detailed solution is shown
    useEffect(() => {
        if ((window as any).MathJax && (showAnalysis || detailedAnalysis)) {
             setTimeout(() => {
                 if((window as any).MathJax.typesetPromise) {
                    (window as any).MathJax.typesetPromise();
                 }
             }, 50);
        }
    }, [showAnalysis, detailedAnalysis, analysis, detailedAnalysis]);

    const handleAnalysis = async () => {
        // If we already have the analysis, just show it without refetching
        if (analysis) {
            setShowAnalysis(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await getQuestionAnalysis(question, userAnswerIndex);
            setAnalysis(result);
            setShowAnalysis(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDetailedAnalysis = async () => {
        if (detailedAnalysis) return;
        setIsLoadingDetailed(true);
        try {
            const result = await getDetailedQuestionAnalysis(question, userAnswerIndex);
            setDetailedAnalysis(result);
        } catch (err) {
             // Could set a specific error for detailed here if needed
             console.error(err);
        } finally {
            setIsLoadingDetailed(false);
        }
    };

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };
    
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-sm transition-all">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm">
                        {questionNumber}
                    </span>
                    <div className="flex flex-col">
                         <div className="flex items-center gap-2">
                             <span className={`text-xs font-bold uppercase tracking-wide ${isCorrect ? 'text-green-600 dark:text-green-400' : isUnanswered ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                                {isCorrect ? 'Correct' : isUnanswered ? 'Skipped' : 'Incorrect'}
                             </span>
                             {isMarkedForReview && (
                                 <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 flex items-center">
                                     <Bookmark className="w-3 h-3 mr-1" /> Marked
                                 </span>
                             )}
                         </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Time: <span className="font-medium text-gray-700 dark:text-gray-300">{formatTime(timeTaken)}</span></span>
                    </div>
                    <div className="flex-shrink-0">
                        {isCorrect ? <CheckCircle className="w-6 h-6 text-green-500" /> : isUnanswered ? <HelpCircle className="w-6 h-6 text-yellow-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                    </div>
                </div>
            </div>

            <p className="text-gray-800 dark:text-gray-200 font-medium mb-3 ml-11">{question.question}</p>
            {question.questionHindi && (
                 <p className="text-gray-700 dark:text-gray-300 font-medium mb-3 ml-11">{question.questionHindi}</p>
            )}
            
            <div className="ml-11 space-y-2 text-sm">
                {question.options.map((opt, i) => (
                    <div key={i} className={`flex items-center p-2 rounded ${
                        i === question.correctOption ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 
                        (i === userAnswerIndex && !isCorrect) ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800' : ''
                    }`}>
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full border text-[10px] mr-2 
                            ${i === question.correctOption ? 'bg-green-500 text-white border-green-500' : 'border-gray-400 text-gray-500 dark:text-gray-400'}
                        `}>
                            {String.fromCharCode(65 + i)}
                        </span>
                        <div className="flex flex-col">
                            <span className={i === question.correctOption ? 'text-green-800 dark:text-green-300 font-medium' : 'text-gray-600 dark:text-gray-400'}>{opt}</span>
                            {question.optionsHindi && question.optionsHindi[i] && (
                                <span className={`text-xs mt-0.5 ${i === question.correctOption ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                    {question.optionsHindi[i]}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="ml-11 mt-4">
                {showAnalysis && analysis && (
                    <div className="mt-4 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20 overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 border-b border-indigo-100 dark:border-indigo-900">
                             <span className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                                 <Sparkles className="w-3 h-3" /> AI Explanation
                             </span>
                             <button 
                                onClick={() => setShowAnalysis(false)}
                                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-1 transition-colors"
                                title="Minimize"
                             >
                                 <ChevronUp className="w-4 h-4" />
                             </button>
                        </div>
                        <div className="p-4 prose prose-sm max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }}>
                        </div>
                        
                        {/* Detailed Solution Section */}
                        <div className="px-4 pb-4">
                             {detailedAnalysis ? (
                                 <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800">
                                     <h4 className="font-bold text-indigo-700 dark:text-indigo-300 text-sm mb-2">Detailed Solution:</h4>
                                     <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: detailedAnalysis.replace(/\n/g, '<br />') }}></div>
                                 </div>
                             ) : (
                                 <button 
                                    onClick={handleDetailedAnalysis} 
                                    disabled={isLoadingDetailed}
                                    className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                                 >
                                     {isLoadingDetailed ? (
                                         <>Loading detailed solution...</>
                                     ) : (
                                         <>
                                            <BookOpen className="w-3 h-3" /> View Detailed Solution
                                         </>
                                     )}
                                 </button>
                             )}
                        </div>
                    </div>
                )}

                {error && <p className="mt-4 text-red-600 bg-red-100 dark:bg-red-900/30 p-2 rounded text-sm">{error}</p>}
                
                {!showAnalysis && (
                     <button onClick={handleAnalysis} disabled={isLoading} className="flex items-center space-x-2 text-primary text-sm font-medium hover:text-primary-dark disabled:opacity-50 mt-2">
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating AI Explanation...
                            </span>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                <span>View Solution & Explanation</span>
                            </>
                        )}
                     </button>
                )}
            </div>
        </div>
    );
};

export default TestResult;
