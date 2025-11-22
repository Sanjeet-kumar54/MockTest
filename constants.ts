
import { Test } from './types';

export const MOCK_TESTS: Test[] = [
  {
    id: 'ssc-1',
    title: 'SSC CGL Tier 1 - General Awareness',
    category: 'SSC',
    questions: [
      {
        question: 'Who is known as the "Father of the Indian Constitution"?',
        questionHindi: 'भारतीय संविधान के "जनक" के रूप में किसे जाना जाता है?',
        options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Dr. B.R. Ambedkar', 'Sardar Vallabhbhai Patel'],
        optionsHindi: ['महात्मा गांधी', 'जवाहरलाल नेहरू', 'डॉ. बी.आर. अंबेडकर', 'सरदार वल्लभभाई पटेल'],
        correctOption: 2,
      },
      {
        question: 'Which planet is known as the Red Planet?',
        questionHindi: 'किस ग्रह को लाल ग्रह के रूप में जाना जाता है?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        optionsHindi: ['पृथ्वी', 'मंगल', 'बृहस्पति', 'शुक्र'],
        correctOption: 1,
      },
      {
        question: 'What is the capital of Japan?',
        questionHindi: 'जापान की राजधानी क्या है?',
        options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'],
        optionsHindi: ['बीजिंग', 'सियोल', 'टोक्यो', 'बैंकॉक'],
        correctOption: 2,
      },
    ],
  },
  {
    id: 'banking-1',
    title: 'IBPS Clerk Prelims - Quantitative Aptitude',
    category: 'Banking',
    questions: [
      {
        question: 'A man buys a cycle for Rs. 1400 and sells it at a loss of 15%. What is the selling price of the cycle?',
        options: ['Rs. 1190', 'Rs. 1160', 'Rs. 1202', 'Rs. 1000'],
        correctOption: 0,
      },
      {
        question: 'The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?',
        options: ['4 years', '8 years', '10 years', 'None of these'],
        correctOption: 0,
      },
    ],
  },
  {
    id: 'upsc-1',
    title: 'UPSC Prelims - Indian Polity',
    category: 'UPSC',
    questions: [
      {
        question: 'The inspiration of ‘Liberty, Equality and Fraternity’ was derived from which revolution?',
        options: ['American Revolution', 'French Revolution', 'Russian Revolution', 'Industrial Revolution'],
        correctOption: 1,
      },
      {
        question: 'The Preamble of the Indian Constitution is based on the "Objectives Resolution" drafted and moved by:',
        options: ['Dr. B.R. Ambedkar', 'Jawaharlal Nehru', 'Dr. Rajendra Prasad', 'Sardar Vallabhbhai Patel'],
        correctOption: 1,
      },
    ],
  },
];

export const EXAM_CATEGORIES = [
    { name: 'Board exams', icon: '🏫' },
    { name: 'University exams', icon: '🎓' },
    { name: 'SSC', icon: '📝' },
    { name: 'Banking', icon: '🏦' },
    { name: 'Railway', icon: '🚆' },
    { name: 'Defence', icon: '🛡️' },
    { name: 'UPSC', icon: '🏛️' },
    { name: 'Teaching', icon: '👩‍🏫' },
    { name: 'All Govt. Exams', icon: '📜' },
];

export const USER_REVIEWS = [];
