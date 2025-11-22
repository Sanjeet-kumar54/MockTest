
import React, { useState } from 'react';
import { GoogleIcon, Eye, EyeOff } from './icons/Icons';
import { Page } from '../types';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoogleLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const logoUrl = "https://lh3.googleusercontent.com/d/1RMsPbjIJVj5xZIj57bsNgqOgTGSOcgsA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setLoading(false);
      console.error("Login failed:", err);
      
      // Handle configuration errors thrown by our service
      if (err.message.includes("Firebase is not configured")) {
         setError(err.message);
         return;
      }

      if (err?.code) {
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              setError('Invalid email or password.');
              break;
            case 'auth/invalid-api-key':
            case 'auth/api-key-not-valid':
              setError('Configuration Error: Invalid Firebase API Key. Please check your environment variables.');
              break;
            case 'auth/operation-not-allowed':
              setError('Email/Password sign-in is not enabled for this project in Firebase Console.');
              break;
            case 'auth/network-request-failed':
              setError('Network error. Please check your internet connection.');
              break;
            default:
              setError(err.message || 'Failed to log in. Please try again.');
              break;
          }
      } else {
         setError(err.message || 'An unexpected error occurred.');
      }
    }
  };

  const handleGoogleClick = async () => {
      setError(null);
      try {
          await onGoogleLogin();
      } catch (err: any) {
          console.error("Google Login failed", err);
           if (err?.code === 'auth/popup-closed-by-user') return;
           setError(err.message || "Failed to sign in with Google.");
      }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl transition-colors duration-200">
        <div>
            <div className="flex items-center justify-center space-x-2">
                <img 
                    src={logoUrl} 
                    alt="MockTest Logo" 
                    className="w-20 h-20 object-contain" 
                    referrerPolicy="no-referrer"
                />
            </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-700 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-700 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-primary focus:outline-none z-20"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary-dark">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
        </div>

        <button
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
            <GoogleIcon className="h-5 w-5 mr-2" />
            Sign in with Google
        </button>

         <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Don't have an account?{' '}
                <button onClick={() => onNavigate('signup')} className="font-medium text-primary hover:text-primary-dark focus:outline-none">
                    Sign Up
                </button>
              </p>
         </div>
      </div>
    </div>
  );
};

export default LoginPage;
