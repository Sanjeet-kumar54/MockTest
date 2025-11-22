
import React, { useState } from 'react';
import { Page, User } from '../types';
import { Sun, Moon, Menu, X, UserIcon, LogOut } from './icons/Icons';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const Logo: React.FC = () => {
    const logoUrl = "https://lh3.googleusercontent.com/d/1RMsPbjIJVj5xZIj57bsNgqOgTGSOcgsA";

    return (
        <div className="flex items-center space-x-3">
            <img 
                src={logoUrl} 
                alt="MockTest Logo" 
                className="w-12 h-12 object-contain" 
                referrerPolicy="no-referrer"
            />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">MockTest</span>
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ onNavigate, user, darkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = !!user;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const handleMobileNavigate = (page: Page) => {
      onNavigate(page);
      setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo Section */}
        <button onClick={() => onNavigate('home')} className="cursor-pointer focus:outline-none z-50 relative">
           <Logo />
        </button>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Theme Toggle Button - Round Box Style */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all focus:outline-none shadow-sm"
            aria-label="Toggle Dark Mode"
          >
             {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation - Hidden on Mobile */}
          <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => onNavigate('home')} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium">Home</button>
              {isLoggedIn && <button onClick={() => onNavigate('attempted-tests')} className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Attempted Tests</button>}
              <button onClick={() => onNavigate('contact')} className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium cursor-pointer">Contact</button>
              
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => onNavigate('profile')}
                    className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 py-1 px-2 rounded-lg transition-colors"
                    title={displayName}
                  >
                    <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onNavigate('login')}
                        className="font-semibold py-2 px-4 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => onNavigate('signup')}
                        className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Sign Up
                    </button>
                </div>
              )}
          </div>

          {/* Mobile Menu Button - Visible only on Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 focus:outline-none"
          >
              <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
            <div 
                className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-900 shadow-2xl z-[70] md:hidden flex flex-col transform transition-transform duration-300 ease-in-out">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">Menu</span>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-4 flex-grow flex flex-col space-y-4 overflow-y-auto">
                    <button 
                        onClick={() => handleMobileNavigate('home')}
                        className="w-full text-left px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                        Home
                    </button>
                    
                    {isLoggedIn && (
                        <button 
                            onClick={() => handleMobileNavigate('attempted-tests')}
                            className="w-full text-left px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                        >
                            Attempted Tests
                        </button>
                    )}

                    <button 
                        onClick={() => handleMobileNavigate('contact')}
                        className="w-full text-left px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                        Contact
                    </button>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    {isLoggedIn ? (
                        <div className="space-y-3">
                             <button 
                                onClick={() => handleMobileNavigate('profile')}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-sm"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    )}
                                </div>
                                <span className="font-semibold truncate">{displayName}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => handleMobileNavigate('login')}
                                className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold bg-white dark:bg-gray-800"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => handleMobileNavigate('signup')}
                                className="w-full py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-blue-500/30"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
      )}
    </header>
  );
};

export default Header;
