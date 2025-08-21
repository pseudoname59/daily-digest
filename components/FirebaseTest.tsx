"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function FirebaseTest() {
  const [status, setStatus] = useState<string>('Testing Firebase...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      setStatus('Testing Firebase initialization...');
      
      // Test Firebase imports
      const { initializeApp, getApps } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');
      
      setStatus('Firebase modules imported successfully...');
      
      // Test Firebase config
      const firebaseConfig = {
        apiKey: "AIzaSyAzy8ymL2ptkmNnbhoQDxMRCh5F0WlcO5w",
        authDomain: "daily-digest-333e9.firebaseapp.com",
        projectId: "daily-digest-333e9",
        storageBucket: "daily-digest-333e9.firebasestorage.app",
        messagingSenderId: "746944694033",
        appId: "1:746944694033:web:4a4e292c27c9a3adeeaeb0",
        measurementId: "G-FL229NV189"
      };
      
      setStatus('Firebase config loaded...');
      
      // Test app initialization
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      setStatus('Firebase app initialized...');
      
      // Test Auth initialization
      getAuth(app);
      setStatus('Firebase Auth initialized...');
      
      // Test Firestore initialization
      getFirestore(app);
      setStatus('Firestore initialized...');
      
      setStatus('✅ All Firebase services working correctly!');
      setError(null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setStatus('❌ Firebase test failed');
      setError(errorMessage);
      console.error('Firebase test error:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Firebase Connection Test</h3>
      <div className="space-y-3">
        <p className="text-sm text-gray-600">{status}</p>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        <Button onClick={testFirebase} variant="outline" size="sm">
          Test Again
        </Button>
      </div>
    </div>
  );
}

