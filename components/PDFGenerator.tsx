
import React, { useState } from 'react';
import { Question } from '../types';
import { Upload, Sparkles, FileText } from './icons/Icons';
import { analyzePdfForQuiz } from '../services/geminiService';

interface PDFGeneratorProps {
  onTestGenerated: (title: string, questions: Question[], config?: { posMarks?: number, negMarks?: number, duration?: number }) => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ onTestGenerated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [posMarks, setPosMarks] = useState<string>('');
  const [negMarks, setNegMarks] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnswerSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setAnswerSheet(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
        // Pass answer sheet if present
        const questions = await analyzePdfForQuiz(file, answerSheet || undefined);
        if (questions && questions.length > 0) {
            onTestGenerated(
                `Generated Test from ${file.name}`, 
                questions,
                {
                    posMarks: posMarks ? parseFloat(posMarks) : undefined,
                    negMarks: negMarks ? parseFloat(negMarks) : undefined,
                    duration: duration ? parseInt(duration) : undefined
                }
            );
        } else {
            setError("Could not find any questions in the PDF. Please try another one.");
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl transition-colors duration-200">
        <div className="text-center mb-8">
            <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">PDF to Mock Test Generator</h1>
            <p className="text-gray-600 dark:text-gray-300">
            Upload your question paper in PDF format. Our AI will analyze it and create an interactive test.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main File Upload */}
          <label htmlFor="pdf-upload" className="cursor-pointer block w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center transition-colors">
            {file ? (
              <span className="text-secondary font-semibold flex items-center justify-center gap-2">
                 <FileText className="w-5 h-5"/> {file.name}
              </span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Click to upload Question Paper (PDF)</span>
            )}
            <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </label>

          {/* Optional Configuration Grid */}
          <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
             <h3 className="font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2 mb-4">Optional Configuration</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pos. Marks (+ve)</label>
                    <input 
                        type="number" 
                        step="0.25"
                        placeholder="e.g. 1" 
                        value={posMarks}
                        onChange={(e) => setPosMarks(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Neg. Marks (-ve)</label>
                    <input 
                        type="number" 
                        step="0.25"
                        placeholder="e.g. 0.25" 
                        value={negMarks}
                        onChange={(e) => setNegMarks(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Duration (Mins)</label>
                    <input 
                        type="number" 
                        placeholder="e.g. 60" 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
             </div>

             {/* Answer Sheet Upload */}
             <div>
                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Upload Answer Key/Sheet (Optional)</label>
                 <label htmlFor="answer-sheet-upload" className="cursor-pointer flex items-center justify-center w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-600 text-center transition-colors bg-white dark:bg-gray-700">
                    {answerSheet ? (
                    <span className="text-secondary text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4"/> {answerSheet.name}
                    </span>
                    ) : (
                    <span className="text-gray-400 text-sm">Click to upload Answer Sheet (PDF/Image)</span>
                    )}
                    <input id="answer-sheet-upload" type="file" accept=".pdf,image/*" className="hidden" onChange={handleAnswerSheetChange} />
                </label>
             </div>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          
          <button 
            type="submit" 
            disabled={isGenerating || !file}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center shadow-lg"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing with Gemini...
              </>
            ) : (
               <>
                <Sparkles className="w-5 h-5 mr-2"/>
                Generate Test
               </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
