
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { updateUserData, getUserProfile } from '../services/firebaseService';
import { UserIcon, Mail, Calendar, Edit, CheckCircle, Phone, Clock, LogOut } from './icons/Icons';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
      // Fetch additional profile data (like phone) from firestore
      const fetchProfileData = async () => {
          const profile = await getUserProfile(user.uid);
          if (profile && profile.phone) {
              setPhoneNumber(profile.phone);
          }
      };
      fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (message) {
        const timer = setTimeout(() => setMessage(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    
    setIsLoading(true);
    try {
      await updateUserData(user, displayName, phoneNumber);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Format creation time
  const joinDate = user.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';
    
  const lastLogin = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">My Profile</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-200">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
            <div className="px-6 pb-6 text-center relative">
                <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full p-1 mx-auto -mt-12 shadow-md transition-colors">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-slate-400 dark:text-gray-300">
                            <UserIcon className="w-12 h-12" />
                        </div>
                    )}
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">{user.displayName || 'User'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 py-2">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400"/> Joined</span>
                    <span className="font-medium">{joinDate}</span>
                </div>
            </div>
          </div>

           <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold py-3 px-4 rounded-xl transition-colors border border-red-200 dark:border-red-800"
           >
               <LogOut className="w-5 h-5" />
               <span>Sign Out</span>
           </button>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Account Settings</h3>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="flex items-center text-primary hover:text-primary-dark text-sm font-medium transition-colors"
                    >
                        <Edit className="w-4 h-4 mr-1" /> Edit Profile
                    </button>
                )}
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
                    {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                disabled={!isEditing}
                                className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border ${isEditing ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
                            />
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={!isEditing}
                                className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border ${isEditing ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={user.email || ''}
                                disabled
                                className="block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border border-transparent bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Email address cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Sign In</label>
                         <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={lastLogin}
                                disabled
                                className="block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border border-transparent bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => { setIsEditing(false); setDisplayName(user.displayName || ''); }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;