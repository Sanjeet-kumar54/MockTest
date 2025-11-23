
import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import { User, Test, TestResultData } from '../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';

// --- Auth Services ---

export const loginUser = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
        throw new Error("Firebase is not configured correctly. Please check your environment variables.");
    }
    // Firebase Authentication automatically persists user session (browserLocalPersistence default)
    return await signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (name: string, email: string, password: string, phone: string) => {
    if (!isFirebaseConfigured || !auth) {
        throw new Error("Firebase is not configured correctly. Please check your environment variables.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (user) {
        await updateProfile(user, { displayName: name });
        // Cast user to local User type for profile creation logic
        await createUserProfileDocument(user as unknown as User, { displayName: name, phone });
    }
    return user;
}

export const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
         throw new Error("Firebase is not configured correctly. Please check your environment variables.");
    }
    
    try {
        const provider = new GoogleAuthProvider();
        // Force account selection to prevent auto-login loops if state is stale
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (user) {
             // Ensure user profile exists in firestore
             // Wrap in try-catch so database errors don't block authentication
            try {
                await createUserProfileDocument(user as unknown as User, { displayName: user.displayName || 'User' });
            } catch (profileErr) {
                console.warn("Profile creation failed during Google Login (non-fatal):", profileErr);
            }
        }

        return user;
    } catch (error: any) {
        console.error("Google Sign In Error Details:", error);
        
        // If we see 't is not iterable', it's specifically an SDK mismatch
        if (error.message && error.message.includes('iterable')) {
            throw new Error("System Configuration Error: Please refresh the page. If the issue persists, the browser cache may need clearing.");
        }

        // Propagate message for UI display
        throw new Error(error.message || "Google Sign-In failed. Please try again.");
    }
}

export const logoutUser = async () => {
    if (auth) {
        return await signOut(auth);
    }
    return Promise.resolve();
}

export const subscribeToAuth = (callback: (user: User | null) => void) => {
    if (isFirebaseConfigured && auth) {
        return onAuthStateChanged(auth, (user) => {
            // Cast firebase user to our local User type interface
            callback(user as unknown as User);
        });
    }
    // If not configured, just return a no-op unsubscribe function
    callback(null);
    return () => {};
}

export const updateUserData = async (user: User, displayName: string, phone?: string) => {
    if (!isFirebaseConfigured || !auth || !db) {
         throw new Error("Firebase is not configured.");
    }
    
    // Update Auth Profile
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
    }
    
    // Update Firestore Document
    try {
        const userRef = doc(db, 'users', user.uid);
        const updateData: any = { displayName };
        if (phone !== undefined) updateData.phone = phone;
        
        await setDoc(userRef, updateData, { merge: true });
    } catch (error) {
        console.error("Failed to update user document in Firestore", error);
    }
};


// --- DB Services ---

export const createUserProfileDocument = async (userAuth: User, additionalData: { displayName: string; phone?: string }) => {
  if (!db) return;

  try {
    const userRef = doc(db, 'users', userAuth.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { email } = userAuth;
        const { displayName, phone } = additionalData;
        const createdAt = serverTimestamp();
        const data: any = { displayName, email, createdAt };
        if (phone) data.phone = phone;
        
        await setDoc(userRef, data);
    }
    return userRef;
  } catch (error) {
      // If permission error (common in test mode if rules aren't set), suppress noise
      if ((error as any).code === 'permission-denied') {
          console.warn("Profile creation skipped: Permission denied. App will function with local storage only.");
          return;
      }
      console.error("Firestore profile creation failed:", error);
      // Do NOT re-throw here, to allow auth to succeed even if DB fails
  }
};

export const getUserProfile = async (userId: string) => {
    if (!db) return null;
    try {
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
            return snapshot.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

// Helper to remove undefined values which cause Firestore to crash
const sanitizeForFirestore = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
};

export const saveTestResult = async (userId: string, result: { score: number; total: number; test: Test; userAnswers: (number | null)[]; timeTaken: number; timeSpentPerQuestion?: number[]; markedForReview?: number[] }) => {
    if (!userId) return null;

    const testId = result.test.id;
    const percentage = Math.round((result.score / result.total) * 100);

    // Default values (Rank 1/1) if DB fails
    let calculatedRank = 1;
    let totalAttempts = 1;
    let calculatedPercentile = 100;

    // 1. Save to Global Results & Calculate Rank (Real Data)
    if (db) {
        try {
            const globalResultsRef = collection(db, 'global_test_results');
            
            // Add current attempt to global collection
            await addDoc(globalResultsRef, {
                testId: testId,
                userId: userId,
                score: result.score,
                percentage: percentage,
                date: serverTimestamp()
            });

            // Fetch all scores for this test to calculate Rank
            const q = query(globalResultsRef, where("testId", "==", testId));
            const querySnapshot = await getDocs(q);
            
            const allScores = querySnapshot.docs.map(doc => doc.data().score);
            totalAttempts = allScores.length;
            
            // Count how many people scored higher than current user
            const betterScores = allScores.filter(s => s > result.score).length;
            
            // Rank = (Number of people better than you) + 1
            calculatedRank = betterScores + 1;

            // Percentile
            calculatedPercentile = totalAttempts > 1 
                ? ((totalAttempts - calculatedRank) / totalAttempts) * 100 
                : 100;
            
        } catch (error) {
            // Suppress permission errors to avoid confusing users/logs
            if ((error as any).code !== 'permission-denied') {
                console.error("Error calculating global rank:", error);
            }
        }
    }

    // 2. Prepare Data for User History
    // CRITICAL: Sanitize data to remove 'undefined' values which break Firestore
    const sanitizedTest = sanitizeForFirestore(result.test);
    
    const resultData: any = {
        test: sanitizedTest,
        score: result.score,
        total: result.total,
        percentage: percentage,
        timeTaken: result.timeTaken,
        date: Date.now(),
        userAnswers: result.userAnswers,
        testTitle: sanitizedTest.title,
        rank: calculatedRank,
        percentile: parseFloat(calculatedPercentile.toFixed(2)),
        totalAttempts: totalAttempts
    };

    if (result.timeSpentPerQuestion) {
        resultData.timeSpentPerQuestion = result.timeSpentPerQuestion;
    }

    if (result.markedForReview) {
        resultData.markedForReview = result.markedForReview;
    }
    
    // Double check sanitization on the final payload
    const finalPayload = sanitizeForFirestore(resultData);

    // 3. Save to Local Storage (Backup)
    try {
        const key = `test_history_${userId}`;
        const existingHistory = localStorage.getItem(key);
        const historyArr = existingHistory ? JSON.parse(existingHistory) : [];
        const localItem = { ...finalPayload, id: `local-${Date.now()}` };
        historyArr.unshift(localItem);
        localStorage.setItem(key, JSON.stringify(historyArr));
    } catch (e) {
        console.error("Failed to save history to local storage", e);
    }

    // 4. Save to Firestore User History (Permanent Storage)
    if (db) {
        try {
            const resultsCollectionRef = collection(db, 'users', userId, 'testResults');
            await addDoc(resultsCollectionRef, finalPayload);
            console.log("Test result permanently saved to Firestore");
        } catch (error) {
             if ((error as any).code === 'permission-denied') {
                 console.warn("Cloud save skipped: Permission denied. Data saved locally.");
             } else {
                 console.error("Error saving test result to Firestore:", error);
             }
        }
    }

    return { rank: calculatedRank, percentile: parseFloat(calculatedPercentile.toFixed(2)), totalAttempts };
};

export const getTestHistory = async (userId: string): Promise<TestResultData[]> => {
    if (!userId) return [];
    
    let firestoreData: any[] = [];

    // 1. Try fetch from Firestore
    if (db) {
        try {
            const resultsCollectionRef = collection(db, 'users', userId, 'testResults');
            const q = query(resultsCollectionRef, orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            firestoreData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
             if ((error as any).code !== 'permission-denied') {
                 console.error("Error fetching history from Firestore:", error);
             }
        }
    }

    // 2. Fetch from Local Storage
    let localData: any[] = [];
    try {
        const key = `test_history_${userId}`;
        const localDataStr = localStorage.getItem(key);
        if (localDataStr) {
            localData = JSON.parse(localDataStr);
        }
    } catch (e) {
        console.error("Error fetching local history", e);
    }
    
    // Prefer Firestore data (it's permanent), fall back to local if offline/empty
    if (firestoreData.length > 0) {
        return firestoreData as TestResultData[];
    }
    
    return localData as TestResultData[];
};
