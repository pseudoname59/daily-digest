import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserPreferences {
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Simple timeout to wait for Firebase
    const timer = setTimeout(() => {
      if (!auth || !db) {
        console.error('Firebase instances not available');
        setError('Firebase not initialized');
        setLoading(false);
        return;
      }
      
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
          setUser(user);
          if (user) {
            // Load user preferences from Firestore
            await loadUserPreferences(user.uid);
          } else {
            setPreferences([]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Auth state change error:', error);
          setError('Authentication error');
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Error setting up auth listener:', err);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    }, 500); // Wait 500ms for Firebase to initialize
    
    return () => clearTimeout(timer);
  }, []);

  // Load user preferences from Firestore
  const loadUserPreferences = async (userId: string) => {
    if (!db) {
      console.error('Firestore not available');
      return;
    }
    
    try {
      console.log('Loading preferences for user:', userId);
      const userDoc = doc(db, 'users', userId);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.preferences?.interests) {
          setPreferences(userData.preferences.interests);
          console.log('Loaded preferences from Firestore:', userData.preferences.interests);
        }
      } else {
        console.log('No existing preferences found for user');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Save user preferences to Firestore
  const saveUserPreferences = async (interests: string[]) => {
    console.log('saveUserPreferences called with:', interests);
    console.log('Current user:', user);
    console.log('Current db:', db);
    
    if (!user || !db) {
      console.log('No user or db, returning early');
      throw new Error('User or database not available');
    }

    try {
      console.log('Saving preferences for user:', user.uid, interests);
      const userDoc = doc(db, 'users', user.uid);
      const now = new Date();
      
      console.log('About to call setDoc...');
      await setDoc(userDoc, {
        email: user.email,
        preferences: {
          interests,
          createdAt: now,
          updatedAt: now
        }
      }, { merge: true });

      console.log('setDoc completed, updating local state...');
      setPreferences(interests);
      console.log('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Update local state even if Firebase fails to prevent infinite loops
      setPreferences(interests);
      console.log('Updated local state despite Firebase error');
      throw error;
    }
  };

  // Add a new interest
  const addInterest = async (interest: string) => {
    console.log('addInterest called with:', interest);
    console.log('Current user:', user);
    console.log('Current preferences:', preferences);
    
    if (!user) {
      console.log('No user, returning early');
      throw new Error('User not authenticated');
    }
    
    if (!db) {
      console.log('Firestore not available');
      throw new Error('Database not available');
    }
    
    // Check if interest already exists to prevent duplicates
    if (preferences.includes(interest)) {
      console.log('Interest already exists:', interest);
      return;
    }
    
    // Prevent duplicate calls
    const newInterests = [...preferences, interest];
    console.log('Adding interest, new preferences will be:', newInterests);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), 10000)
      );
      
      const savePromise = saveUserPreferences(newInterests);
      await Promise.race([savePromise, timeoutPromise]);
      
      console.log('addInterest completed successfully');
    } catch (error) {
      console.error('Error in addInterest:', error);
      throw error;
    }
  };

  // Remove an interest
  const removeInterest = async (interest: string) => {
    if (!user) return;
    
    const newInterests = preferences.filter(i => i !== interest);
    await saveUserPreferences(newInterests);
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication not available');
    }
    
    try {
      console.log('Attempting sign in for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      // Provide more specific error messages
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (authError.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (authError.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication is not configured. Please check your Firebase project settings.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email format.');
      } else {
        throw new Error(`Sign in failed: ${authError.message}`);
      }
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication not available');
    }
    
    try {
      console.log('Attempting sign up for:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign up successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      // Provide more specific error messages
      const authError = error as AuthError;
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (authError.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (authError.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication is not configured. Please check your Firebase project settings.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email format.');
      } else {
        throw new Error(`Sign up failed: ${authError.message}`);
      }
    }
  };

  // Sign out
  const logout = async () => {
    if (!auth) {
      console.error('Authentication not available');
      return;
    }
    
    try {
      console.log('Signing out user');
      await signOut(auth);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    preferences,
    error,
    addInterest,
    removeInterest,
    signIn,
    signUp,
    logout
  };
}
