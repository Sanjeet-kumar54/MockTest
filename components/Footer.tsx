
import React from 'react';
import { Page } from '../types';
import { Instagram, Facebook, Twitter, Linkedin, Plane } from './icons/Icons';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const logoUrl = "https://lh3.googleusercontent.com/d/1RMsPbjIJVj5xZIj57bsNgqOgTGSOcgsA";

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 transition-colors duration-200 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
             <div className="flex items-center space-x-3">
                <img 
                    src={logoUrl} 
                    alt="MockTest Logo" 
                    className="w-10 h-10 object-contain" 
                    referrerPolicy="no-referrer"
                />
                <span className="text-2xl font-bold text-gray-800 dark:text-white">MockTest</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Test More. Score More. <br/>
              Your ultimate AI-powered platform for government exam preparation and analysis.
            </p>
            <div className="flex space-x-3 pt-2">
                <SocialLink href="https://www.facebook.com" icon={<Facebook className="w-4 h-4" />} />
                <SocialLink href="https://twitter.com" icon={<Twitter className="w-4 h-4" />} />
                <SocialLink href="https://www.instagram.com/abhi_raj_268?igsh=emJidnhvOHl0ODNk" icon={<Instagram className="w-4 h-4" />} />
                <SocialLink href="https://linkedin.com" icon={<Linkedin className="w-4 h-4" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><button onClick={() => onNavigate('home')} className="hover:text-primary dark:hover:text-primary transition-colors text-left">Home</button></li>
              <li><button onClick={() => onNavigate('attempted-tests')} className="hover:text-primary dark:hover:text-primary transition-colors text-left">Attempted Tests</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-primary dark:hover:text-primary transition-colors text-left">Contact Us</button></li>
              <li><button onClick={() => onNavigate('profile')} className="hover:text-primary dark:hover:text-primary transition-colors text-left">My Profile</button></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4 text-lg">AI Tools</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><button onClick={() => onNavigate('pdf-generator')} className="hover:text-primary dark:hover:text-primary transition-colors text-left">PDF to Mock Test</button></li>
              <li><button onClick={() => onNavigate('image-generator')} className="hover:text-primary dark:hover:text-primary transition-colors text-left">Image to Mock Test</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4 text-lg">Get in Touch</h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center group">
                <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-colors">📧</span>
                <a href="mailto:abhishekkumarstm2019@gmail.com" className="hover:text-primary transition-colors break-all">abhishekkumarstm2019@gmail.com</a>
              </li>
              <li className="flex items-center group">
                <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <Instagram className="w-4 h-4" />
                </span>
                <a href="https://www.instagram.com/abhi_raj_268?igsh=emJidnhvOHl0ODNk" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Follow on Instagram</a>
              </li>
              <li className="flex items-center group">
                <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <Plane className="w-4 h-4" />
                </span>
                <a href="https://letstravelindia.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Visit Let's Travel</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} MockTest. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-500">
             <button className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Privacy Policy</button>
             <button className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Terms of Service</button>
             <button className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink: React.FC<{ href: string; icon: React.ReactNode }> = ({ href, icon }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
    >
        {icon}
    </a>
);

export default Footer;
