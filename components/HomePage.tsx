
import React from 'react';
import { Test, Page } from '../types';
import { EXAM_CATEGORIES } from '../constants';
import { Upload, Camera } from './icons/Icons';

interface HomePageProps {
  onStartTest: (test: Test) => void;
  onNavigate: (page: Page) => void;
  tests: Test[];
}

const HomePage: React.FC<HomePageProps> = ({ onStartTest, onNavigate, tests }) => {
  
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-lg transition-colors duration-200">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 dark:text-white mb-4 tracking-tight">
          Test More. <span className="text-primary">Score More.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Your ultimate platform for exam preparation. Powered by AI to give you the winning edge.
        </p>
        <div className="relative max-w-xl mx-auto">
          <input
            type="search"
            placeholder="Search for an exam (e.g., SSC, UPSC...)"
            className="w-full p-4 pr-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 dark:text-white transition-all placeholder-gray-400"
          />
          <svg className="w-6 h-6 text-gray-400 absolute right-5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </section>

      {/* AI Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">AI-Powered Tools</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <FeatureCard
            icon={<Upload className="w-12 h-12 text-primary" />}
            title="PDF to Mock Test"
            description="Have a question paper in PDF? Upload it and our AI will instantly create an interactive mock test for you."
            onClick={() => onNavigate('pdf-generator')}
          />
          <FeatureCard
            icon={<Camera className="w-12 h-12 text-secondary" />}
            title="Image to Mock Test"
            description="Snap a picture of a question from a book or your notes. Get a quick mock test with AI-generated analysis."
            onClick={() => onNavigate('image-generator')}
          />
        </div>
      </section>

      {/* Exam Categories Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Exam Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-4 max-w-5xl mx-auto">
          {EXAM_CATEGORIES.map(category => (
            <div key={category.name} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-48 md:h-52">
              <div className="text-5xl mb-4">{category.icon}</div>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">{category.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 p-8 py-10 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center w-full md:w-[28rem] min-h-[350px] border border-gray-100 dark:border-gray-700 group">
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-600 transition-colors">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8 flex-grow leading-relaxed">{description}</p>
        <button className="mt-auto bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark transition-colors shadow-md">
            Try Now
        </button>
    </div>
);

export default HomePage;
