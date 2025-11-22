
import React, { useState } from 'react';
import { GoogleIcon, Eye, EyeOff } from './icons/Icons';
import { Page } from '../types';

interface SignupPageProps {
  onSignup: (name: string, email: string, password: string, phone: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  onNavigate: (page: Page) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onGoogleLogin, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const logoUrl = "https://lh3.googleusercontent.com/d/1RMsPbjIJVj5xZIj57bsNgqOgTGSOcgsA";

  // Real-time validation
  const passwordsMatch = password === confirmPassword;
  const showPasswordMismatchWarning = confirmPassword.length > 0 && !passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
        setError("Password should be at least 6 characters.");
        return;
    }

    if (!passwordsMatch) {
        setError("Passwords do not match.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSignup(name, email, password, phone);
    } catch (err: any) {
      setLoading(false);
      console.error("Signup failed:", err);
      
      if (err.message.includes("Firebase is not configured")) {
         setError(err.message);
         return;
      }

      if (err?.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('An account with this email already exists.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak. Please choose a stronger one.');
            break;
          case 'auth/invalid-api-key':
          case 'auth/api-key-not-valid':
            setError('Configuration Error: Invalid Firebase API Key. Please check your environment variables.');
            break;
          case 'auth/operation-not-allowed':
            setError('Email/Password sign-in is not enabled. Please enable it in your Firebase console.');
            break;
          case 'auth/network-request-failed':
            setError('Network error. Please check your internet connection.');
            break;
          default:
            setError(err.message || 'Failed to create an account. Please try again.');
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
        console.error("Google Signup failed", err);
         if (err?.code === 'auth/popup-closed-by-user') return;
         // Show the specific message so user knows if it's domain/config related
         setError(err.message || "Failed to sign up with Google.");
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
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
             <div>
              <label htmlFor="full-name" className="sr-only">
                Full Name
              </label>
              <input
                id="full-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-700 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-700 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-700 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-700 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm pr-10"
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
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${showPasswordMismatchWarning ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-700 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:z-10 sm:text-sm pr-10`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-primary focus:outline-none z-20"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
             {showPasswordMismatchWarning && (
                <p className="text-red-500 text-xs mt-1 px-1 font-medium">Passwords do not match</p>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline text-sm font-medium">{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
            Sign up with Google
        </button>

         <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Already have an account?{' '}
                <button onClick={() => onNavigate('login')} className="font-medium text-primary hover:text-primary-dark focus:outline-none">
                    Sign In
                </button>
              </p>
         </div>
      </div>
    </div>
  );
};

export default SignupPage;
