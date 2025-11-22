
import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Plane, CheckCircle, AlertTriangle } from './icons/Icons';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch("https://formspree.io/f/xblbazek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
        
        {/* Left Column: Content & Socials */}
        <div className="lg:col-span-2 flex flex-col justify-center space-y-10 pt-8 lg:pt-0">
          <div>
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white">Contact us</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-md">
              We'd love to hear from you. Whether you have a question about features, or any other query, our team is ready to answer all your questions.
            </p>
          </div>

          <div className="space-y-4 w-full sm:w-auto">
             <a href="https://www.instagram.com/abhi_raj_268?igsh=emJidnhvOHl0ODNk" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                <div className="bg-gradient-to-br from-pink-600 to-orange-500 p-2.5 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-pink-900/20">
                    <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                    <span className="block text-lg font-bold text-gray-900 dark:text-white">Follow on Instagram</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Stay updated with us</span>
                </div>
             </a>
             
             <a href="https://letstravelindia.netlify.app/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                <div className="bg-cyan-600 p-2.5 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-cyan-900/20">
                    <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                    <span className="block text-lg font-bold text-gray-900 dark:text-white">Visit Let's Travel</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">My first college project</span>
                </div>
             </a>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Follow us</h3>
            <div className="flex flex-wrap gap-3">
               <SocialIconLink href="https://www.facebook.com" icon={<Facebook className="w-5 h-5"/>} />
               <SocialIconLink href="https://twitter.com" icon={<Twitter className="w-5 h-5"/>} />
               <SocialIconLink href="https://www.instagram.com/abhi_raj_268?igsh=emJidnhvOHl0ODNk" icon={<Instagram className="w-5 h-5"/>} />
            </div>
          </div>
        </div>

        {/* Right Column: The Form Card */}
        <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {status === 'success' && (
                        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="font-medium">Message sent successfully!</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="font-medium">Failed to send message. Please try again.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Name</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Phone</label>
                            <input
                                name="phone"
                                type="tel"
                                placeholder="1234567890"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Subject</label>
                            <input
                                name="subject"
                                type="text"
                                placeholder="Subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Message</label>
                        <textarea
                            name="message"
                            rows={6}
                            placeholder="Write your message here..."
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/30 w-full sm:w-auto min-w-[200px] text-base disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === 'submitting' ? 'Sending...' : 'Send message'}
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};

const SocialIconLink: React.FC<{ href: string; icon: React.ReactNode }> = ({ href, icon }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-11 h-11 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-600 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 shadow-sm"
    >
        {icon}
    </a>
);

export default ContactPage;
