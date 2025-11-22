
import React, { useState, useEffect } from 'react';
import { User, TestResultData, Test } from '../types';
import { getTestHistory } from '../services/firebaseService';
import { Trophy, FileText, Clock } from './icons/Icons';

interface AttemptedTestsPageProps {
    user: User;
    onViewResult: (result: TestResultData) => void;
    onReattempt: (test: Test) => void;
    onNavigate: (page: any) => void;
}

const AttemptedTestsPage: React.FC<AttemptedTestsPageProps> = ({ user, onViewResult, onReattempt, onNavigate }) => {
    const [history, setHistory] = useState<TestResultData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                try {
                    const userHistory = await getTestHistory(user.uid);
                    setHistory(userHistory);
                } catch (error) {
                    console.error("Failed to fetch test history:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Helper to format date for the section header (e.g., "NOV 2025")
    const formatHeaderDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        }).toUpperCase();
    };

    const groupedHistory: { [key: string]: TestResultData[] } = {};
    history.forEach(item => {
        const key = formatHeaderDate(item.date);
        if (!groupedHistory[key]) groupedHistory[key] = [];
        groupedHistory[key].push(item);
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Attempted Tests</h1>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button className="border-b-2 border-primary py-3 px-1 text-sm font-medium text-primary">
                        Mock Test
                    </button>
                </nav>
            </div>

            {Object.keys(groupedHistory).length === 0 ? (
                 <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">No tests attempted yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start a test to see your history here.</p>
                    <button onClick={() => onNavigate('home')} className="mt-4 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Explore Tests
                    </button>
                 </div>
            ) : (
                Object.entries(groupedHistory).map(([dateHeader, items]) => (
                    <div key={dateHeader} className="mb-8">
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{dateHeader}</h2>
                        <div className="space-y-4">
                            {items.map((item) => (
                                <HistoryCard 
                                    key={item.id} 
                                    data={item} 
                                    onViewResult={onViewResult}
                                    onReattempt={onReattempt}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

const HistoryCard: React.FC<{ 
    data: TestResultData; 
    onViewResult: (data: TestResultData) => void; 
    onReattempt: (test: Test) => void;
}> = ({ data, onViewResult, onReattempt }) => {
    
    const getLeftBorderColor = (p: number) => {
        if (p >= 80) return 'border-green-500';
        if (p >= 50) return 'border-blue-500';
        return 'border-red-400';
    };

    const getScoreBadgeColor = (p: number) => {
        if (p >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (p >= 50) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-all duration-200">
            
            {/* Main Content Area */}
            <div className={`flex-grow flex flex-col justify-between relative border-l-4 ${getLeftBorderColor(data.percentage)}`}>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 pr-2">{data.test.title}</h3>
                        <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded ${getScoreBadgeColor(data.percentage)}`}>
                            {data.percentage}%
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                         <div className="flex items-center">
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            <span><span className="font-semibold text-gray-700 dark:text-gray-300">{data.score}/{data.total}</span> Marks</span>
                        </div>
                         <div className="flex items-center">
                             <Clock className="w-3.5 h-3.5 mr-1.5" />
                             <span>{new Date(data.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Compact vertical list on desktop, horizontal on mobile */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 sm:w-40 sm:border-l border-t sm:border-t-0 border-gray-100 dark:border-gray-700 flex sm:flex-col items-center justify-center gap-2">
                <button 
                    onClick={() => onViewResult(data)}
                    className="flex-1 w-full border border-primary text-primary dark:border-blue-500 dark:text-blue-400 text-xs font-semibold py-1.5 px-3 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                    Analysis
                </button>
                <button 
                    onClick={() => onReattempt(data.test)}
                    className="flex-1 w-full border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300 text-xs font-semibold py-1.5 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    Reattempt
                </button>
            </div>
        </div>
    );
};

export default AttemptedTestsPage;
