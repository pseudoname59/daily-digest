"use client";

import { useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function AuthTest() {
  const { user, loading, preferences, signIn, signUp, logout, addInterest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testInterest, setTestInterest] = useState('');

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      alert('Sign in successful!');
    } catch (error) {
      alert(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      alert('Sign up successful!');
    } catch (error) {
      alert(`Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddTestInterest = async () => {
    try {
      await addInterest(testInterest);
      alert(`Added interest: ${testInterest}`);
      setTestInterest('');
    } catch (error) {
      alert(`Failed to add interest: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Authentication Test</h2>
      
      {user ? (
        <div>
          <p className="mb-2">✅ Signed in as: {user.email}</p>
          <p className="mb-2">User ID: {user.uid}</p>
          <p className="mb-4">Preferences: {preferences.join(', ') || 'None'}</p>
          
          <div className="mb-4">
            <Input
              value={testInterest}
              onChange={(e) => setTestInterest(e.target.value)}
              placeholder="Add test interest"
              className="mb-2"
            />
            <Button onClick={handleAddTestInterest} className="w-full mb-2">
              Add Interest
            </Button>
          </div>
          
          <Button onClick={logout} className="w-full">
            Sign Out
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-4">❌ Not signed in</p>
          
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="mb-2"
          />
          
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-4"
          />
          
          <div className="flex gap-2">
            <Button onClick={handleSignIn} className="flex-1">
              Sign In
            </Button>
            <Button onClick={handleSignUp} className="flex-1">
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
