"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../lib/useAuth";

export default function TestPage() {
  const [interest, setInterest] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);
  const { user, preferences, addInterest, signIn, signUp } = useAuth();

  const handleAddInterest = async () => {
    console.log('Test: Add button clicked!');
    console.log('Test: Current user:', user);
    console.log('Test: Current interest:', interest);
    console.log('Test: Current preferences:', preferences);
    console.log('Test: addingTopic:', addingTopic);
    
    if (!user) {
      console.log('Test: No user, cannot add interest');
      return;
    }

    if (addingTopic) {
      console.log('Test: Already processing, ignoring click');
      return;
    }

    const trimmedInterest = interest.trim();
    
    if (!trimmedInterest) {
      console.log('Test: No interest entered');
      return;
    }

    if (preferences.includes(trimmedInterest)) {
      console.log('Test: Interest already exists');
      return;
    }

    try {
      setAddingTopic(true);
      console.log('Test: Adding interest:', trimmedInterest);
      await addInterest(trimmedInterest);
      setInterest("");
      console.log('Test: Interest added successfully');
    } catch (error) {
      console.error('Test: Error adding interest:', error);
    } finally {
      setAddingTopic(false);
      console.log('Test: Add interest operation completed');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <div className="mb-4">
        <p><strong>User:</strong> {user ? user.email : 'Not signed in'}</p>
        <p><strong>Preferences:</strong> {preferences.join(', ') || 'None'}</p>
        <p><strong>Adding Topic:</strong> {addingTopic ? 'Yes' : 'No'}</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !addingTopic && handleAddInterest()}
          disabled={addingTopic}
        />
        <Button
          onClick={handleAddInterest}
          disabled={!interest.trim() || addingTopic || !user}
        >
          {addingTopic ? 'Adding...' : 'Add'}
        </Button>
      </div>

      {!user && (
        <div className="mb-4">
          <p className="text-red-600">Please sign in to test the add functionality</p>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify({
            user: user ? { email: user.email, uid: user.uid } : null,
            preferences,
            addingTopic,
            interest
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}

