import React, { useState } from 'react';
import { Test } from '../types';
import { Clock, AlertTriangle, FileText, CheckCircle } from './icons/Icons';

interface TestInstructionsProps {
  test: Test;
  onStart: () => void;
  onBack: () => void;
}

const TestInstructions: React.FC<TestInstructionsProps> = ({ test, onStart, onBack }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');

  const totalQuestions = test.questions.length;
  const duration = test.duration ? test.duration : Math.ceil(totalQuestions * 1.5); // Default ~1.5 min per question if not set
  const posMark = test.positiveMarks || 1;
  const negMark = test.negativeMarks || 0;

  const t = (english: string, hindi: string) => language === 'English' ? english : hindi;

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 my-8">
      {/* Header */}
      <div className="bg-blue-50 dark:bg-gray-700/50 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('General Instructions', 'सामान्य निर्देश')}</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{t('Please read the instructions carefully before starting the test.', 'कृपया परीक्षा शुरू करने से पहले निर्देशों को ध्यान से पढ़ें।')}</p>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('View in:', 'भाषा चुनें:')}</span>
            <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'English' | 'Hindi')}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
            >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
            </select>
        </div>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
        {/* Left Col: Instructions Text */}
        <div className="md:col-span-2 space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          
          <section>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary"/> {t('Examination Details', 'परीक्षा विवरण')}
            </h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>{t('Test Name:', 'परीक्षा का नाम:')}</strong> {test.title}</li>
                <li><strong>{t('Total Duration:', 'कुल अवधि:')}</strong> {duration} {t('Minutes', 'मिनट')}</li>
                <li><strong>{t('Total Questions:', 'कुल प्रश्न:')}</strong> {totalQuestions}</li>
                <li><strong>{t('Total Marks:', 'कुल अंक:')}</strong> {totalQuestions * posMark}</li>
                <li><strong>{t('Marking Scheme:', 'अंकन योजना:')}</strong> <span className="text-green-600 font-bold">+{posMark}</span> {t('for Correct', 'सही के लिए')}, <span className="text-red-600 font-bold">-{negMark}</span> {t('for Incorrect', 'गलत के लिए')}.</li>
            </ul>
          </section>

          <hr className="border-gray-200 dark:border-gray-700"/>

          <section>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">{t('General Rules', 'सामान्य नियम')}</h3>
            <ul className="list-decimal pl-5 space-y-2">
                <li>{t('The server clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.', 'सर्वर पर घड़ी सेट की जाएगी। स्क्रीन के ऊपरी दाएं कोने में काउंटडाउन टाइमर परीक्षा पूरी करने के लिए आपके पास शेष समय प्रदर्शित करेगा।')}</li>
                <li>{t('When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.', 'जब टाइमर शून्य पर पहुंच जाएगा, तो परीक्षा अपने आप समाप्त हो जाएगी। आपको अपनी परीक्षा समाप्त करने या जमा करने की आवश्यकता नहीं होगी।')}</li>
                <li>{t('The Question Palette displayed on the right side of screen will show the status of each question using specific color codes (explained in the legend).', 'स्क्रीन के दाईं ओर प्रदर्शित प्रश्न पैलेट विशिष्ट रंग कोड का उपयोग करके प्रत्येक प्रश्न की स्थिति दिखाएगा (लीजेंड में समझाया गया है)।')}</li>
                <li>{t('Do not refresh the page or switch tabs during the test, as it may lead to automatic submission or loss of progress.', 'परीक्षा के दौरान पेज को रिफ्रेश न करें या टैब न बदलें, क्योंकि इससे स्वचालित सबमिशन या प्रगति का नुकसान हो सकता है।')}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">{t('Navigating & Answering', 'नेविगेट करना और उत्तर देना')}</h3>
            <ul className="list-decimal pl-5 space-y-2">
                <li>{t('Click on the question number in the Question Palette to go to that numbered question directly.', 'उस प्रश्न पर सीधे जाने के लिए प्रश्न पैलेट में प्रश्न संख्या पर क्लिक करें।')}</li>
                <li>{t('Click on Save & Next to save your answer for the current question and then go to the next question.', 'अपने उत्तर को सहेजने के लिए Save & Next पर क्लिक करें और फिर अगले प्रश्न पर जाएं।')}</li>
                <li>{t('Click on Mark for Review & Next to save your answer for the current question, mark it for review, and then go to the next question.', 'वर्तमान प्रश्न के लिए अपना उत्तर सहेजने, समीक्षा के लिए चिह्नित करने और फिर अगले प्रश्न पर जाने के लिए Mark for Review & Next पर क्लिक करें।')}</li>
                <li>{t('To deselect your chosen answer, click on the Clear Response button.', 'अपने चुने हुए उत्तर को अचयनित करने के लिए, Clear Response बटन पर क्लिक करें।')}</li>
            </ul>
          </section>
        </div>

        {/* Right Col: Legend & Action */}
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-secondary"/> {t('Status Legend', 'स्थिति लीजेंड')}
                </h3>
                <div className="space-y-3 text-xs font-medium">
                    <div className="flex items-center">
                        <span className="w-8 h-8 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center mr-3 text-gray-500">1</span>
                        <span>{t('Not Visited', 'नहीं देखा गया')}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center mr-3">3</span>
                        <span>{t('Not Answered', 'उत्तर नहीं दिया गया')}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center mr-3">5</span>
                        <span>{t('Answered', 'उत्तर दिया गया')}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-8 h-8 bg-purple-600 text-white rounded flex items-center justify-center mr-3">7</span>
                        <span>{t('Marked for Review', 'समीक्षा के लिए चिह्नित')}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="relative w-8 h-8 bg-purple-600 text-white rounded flex items-center justify-center mr-3">
                            9
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                        </span>
                        <span className="leading-tight">{t('Answered & Marked for Review (Considered for evaluation)', 'उत्तर दिया गया और समीक्षा के लिए चिह्नित (मूल्यांकन के लिए विचार किया जाएगा)')}</span>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"/>
                <p>{t('Note: Questions marked for review will be treated as answered only if you have selected an option.', 'नोट: समीक्षा के लिए चिह्नित प्रश्नों को केवल तभी उत्तरित माना जाएगा यदि आपने कोई विकल्प चुना है।')}</p>
            </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <label className="flex items-center cursor-pointer select-none">
                  <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                      />
                      <div className={`w-6 h-6 border-2 rounded transition-colors flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-primary border-primary' : 'border-gray-400 bg-white dark:bg-gray-800'}`}>
                          {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('I have read and understood the instructions. I agree that I am not carrying any prohibited material.', 'मैंने निर्देशों को पढ़ और समझ लिया है। मैं सहमत हूं कि मैं कोई निषिद्ध सामग्री नहीं ले जा रहा हूं।')}
                  </span>
              </label>

              <div className="flex space-x-4 w-full md:w-auto">
                  <button 
                    onClick={onBack}
                    className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                      {t('Back', 'वापस')}
                  </button>
                  <button 
                    onClick={onStart}
                    disabled={!isChecked}
                    className="flex-1 md:flex-none px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {t('I am ready to begin', 'मैं शुरू करने के लिए तैयार हूं')}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default TestInstructions;