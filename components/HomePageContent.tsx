"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { AuthModal } from "./AuthModal";
import { LoadingSpinner } from "./LoadingSpinner";
import { generateDigest as generateAIDigest } from "../lib/aiService";
import DigestDisplay from "./DigestDisplay";
import ArticleSummarizer from "./ArticleSummarizer";
import { useAuth } from "../lib/useAuth";

export default function HomePageContent() {
  const [interest, setInterest] = useState("");
  const [digest, setDigest] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [topicList] = useState(["AI Policy", "Biotech", "Ethereum", "Climate Tech", "Space Exploration"]);
  const [addingTopic, setAddingTopic] = useState(false);
  const [removingTopic, setRemovingTopic] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'digest' | 'summarizer'>('digest');
  
  // Use proper Firebase authentication
  const { user, loading, preferences, addInterest, removeInterest, signIn, signUp, logout } = useAuth();

  // Remove the localStorage loading since we're using Firebase now

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Remove the old functions since we're using the ones from useAuth hook

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setShowAuthModal(false);
      showNotification('success', 'Signed in successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      showNotification('error', errorMessage);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      await signUp(email, password);
      setShowAuthModal(false);
      showNotification('success', 'Account created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      showNotification('error', errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('success', 'Signed out successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      showNotification('error', errorMessage);
    }
  };

  const validateTopic = (topic: string): boolean => {
    // Check if topic is not gibberish
    const minLength = 2;
    const maxLength = 50;
    const validCharacters = /^[a-zA-Z0-9\s\-_&]+$/;
    
    if (topic.length < minLength || topic.length > maxLength) {
      return false;
    }
    
    if (!validCharacters.test(topic)) {
      return false;
    }
    
    // Check for common gibberish patterns
    const gibberishPatterns = [
      /^[aeiou]{3,}$/i, // Too many vowels in a row
      /^[bcdfghjklmnpqrstvwxyz]{5,}$/i, // Too many consonants in a row
      /^(.)\1{3,}$/, // Same character repeated too many times
      /^[0-9]{3,}$/, // Too many numbers
    ];
    
    return !gibberishPatterns.some(pattern => pattern.test(topic));
  };

  const handleAddInterest = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (addingTopic) {
      return;
    }

    const trimmedInterest = interest.trim();
    
    if (!trimmedInterest) {
      showNotification('error', 'Please enter a topic to add.');
      return;
    }

    if (!validateTopic(trimmedInterest)) {
      showNotification('error', 'Please enter a valid topic name (2-50 characters, no special characters).');
      return;
    }

    if (preferences.includes(trimmedInterest)) {
      showNotification('error', 'This topic is already in your list.');
      return;
    }

    try {
      setAddingTopic(true);
      await addInterest(trimmedInterest);
      setInterest("");
      showNotification('success', `"${trimmedInterest}" added to your topics!`);
    } catch (error) {
      console.error('Error adding interest:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add topic. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setAddingTopic(false);
    }
  };

  const handleQuickAdd = async (topic: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (addingTopic) {
      return;
    }

    if (preferences.includes(topic)) {
      showNotification('error', 'This topic is already in your list.');
      return;
    }

    try {
      setAddingTopic(true);
      await addInterest(topic);
      showNotification('success', `"${topic}" added to your topics!`);
    } catch (error) {
      console.error('Error in quick add:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add topic. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setAddingTopic(false);
    }
  };

  const handleRemoveInterest = async (topic: string) => {
    if (user) {
      try {
        setRemovingTopic(topic);
        await removeInterest(topic);
        showNotification('success', `"${topic}" removed from your topics.`);
      } catch (error) {
        console.error('Error removing interest:', error);
        showNotification('error', 'Failed to remove topic. Please try again.');
      } finally {
        setRemovingTopic(null);
      }
    }
  };

  const generateDigest = async () => {
    if (preferences.length === 0) {
      showNotification('error', 'Please add some topics first before generating a digest.');
      return;
    }

    try {
      setDigest("Generating your personalized digest...");
      
      const aiResponse = await generateAIDigest({
        topics: preferences,
        timeframe: 'last 24 hours'
      });
      
      setDigest(aiResponse.content);
      showNotification('success', 'Your daily digest has been generated!');
      
    } catch (error) {
      console.error('Error generating digest:', error);
      setDigest("Failed to generate digest. Please try again.");
      showNotification('error', 'Failed to generate digest. Please try again.');
    }
  };

  const copyDigest = () => {
    if (digest) {
      navigator.clipboard.writeText(digest);
      showNotification('success', 'Digest copied to clipboard!');
    }
  };



  const refreshDigest = () => {
    generateDigest();
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-gray-900">Daily Digest AI</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowAuthModal(true)}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>

             {/* Hero Section */}
       <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-16">
         <div className="max-w-6xl mx-auto text-center">
           <h1 className="text-4xl font-bold text-gray-900 mb-4">
             Daily Digest AI — Your AI-powered news companion
           </h1>
           <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
             Get personalized daily digests and summarize any news article with AI
           </p>
           
           {/* Tab Navigation */}
           <div className="flex justify-center mb-8">
             <div className="bg-white rounded-lg p-1 shadow-sm">
               <button
                 onClick={() => setActiveTab('digest')}
                 className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                   activeTab === 'digest'
                     ? 'bg-purple-600 text-white shadow-sm'
                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 📰 Daily Digest
               </button>
               <button
                 onClick={() => setActiveTab('summarizer')}
                 className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                   activeTab === 'summarizer'
                     ? 'bg-purple-600 text-white shadow-sm'
                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 📄 Article Summarizer
               </button>
             </div>
           </div>
           
           {/* Tab-specific content */}
           {activeTab === 'digest' && (
             <div>
               <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
                 Tell us what you care about. We&apos;ll curate a concise, trustworthy roundup every day.
               </p>
          
                                    {/* Interest Input Section */}
               <div className="flex gap-3 mb-6 justify-center">
                 <Input
                   placeholder="Add an interest (e.g., AI policy, biotech, Ethereum)"
                   value={interest}
                   onChange={(e) => setInterest(e.target.value)}
                   className="max-w-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                   onKeyPress={(e) => e.key === 'Enter' && !addingTopic && handleAddInterest()}
                   disabled={addingTopic}
                 />
                 <Button
                   onClick={handleAddInterest}
                   disabled={!interest.trim() || addingTopic || loading}
                   className="bg-purple-600 hover:bg-purple-700 text-white px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {addingTopic ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                   ) : (
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                   )}
                   {!user ? 'Sign In to Add' : addingTopic ? 'Adding...' : loading ? 'Loading...' : 'Add'}
                 </Button>
               </div>
               
               {/* Help text */}
               {!user && (
                 <div className="text-center mb-4">
                   <p className="text-sm text-gray-600">
                     💡 <strong>Tip:</strong> Sign in first to save your interests and get personalized digests!
                   </p>
                 </div>
               )}

               {/* Quick Add Section */}
               <div className="flex items-center gap-4 justify-center">
                 <span className="text-sm text-gray-600">Quick add:</span>
                 <select
                   onChange={(e) => {
                     if (e.target.value) {
                       handleQuickAdd(e.target.value);
                       e.target.value = '';
                     }
                   }}
                   className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                   defaultValue=""
                   disabled={!user || addingTopic}
                 >
                   <option value="">{!user ? 'Sign in to use quick add' : addingTopic ? 'Adding topic...' : 'Choose a topic'}</option>
                   {topicList.map((topic) => (
                     <option key={topic} value={topic}>{topic}</option>
                   ))}
                 </select>
                 <a href="#" className="text-sm text-purple-600 hover:text-purple-700 underline">Learn more</a>
               </div>
             </div>
           )}
           
           {/* Article Summarizer Tab Content */}
           {activeTab === 'summarizer' && (
             <div className="max-w-4xl mx-auto">
               <ArticleSummarizer user={user ? { email: user.email || '' } : null} />
             </div>
           )}
         </div>
       </div>

             {/* Saved Topics Section - Only show for digest tab */}
       {activeTab === 'digest' && user && (
         <div className="max-w-6xl mx-auto px-6 py-8">
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                 <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                 </svg>
                 Your Saved Topics
               </h2>
               <span className="text-sm text-gray-500">{preferences.length} topic{preferences.length !== 1 ? 's' : ''}</span>
             </div>
            
            {preferences.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {preferences.map((topic) => (
                    <span 
                      key={topic} 
                      className="flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200 hover:bg-purple-150 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {topic}
                      <button
                        onClick={() => handleRemoveInterest(topic)}
                        disabled={removingTopic === topic}
                        className="ml-2 text-purple-500 hover:text-purple-800 focus:outline-none disabled:opacity-50"
                        title="Remove topic"
                      >
                        {removingTopic === topic ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600"></div>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <Button
                    onClick={generateDigest}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Digest
                  </Button>
                  <span className="text-sm text-gray-500">
                    Ready to create your personalized digest
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No topics saved yet</p>
                <p className="text-sm text-gray-400">Add your first topic above to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

             {/* Show login prompt if not authenticated - Only for digest tab */}
       {activeTab === 'digest' && !user && (
         <div className="max-w-6xl mx-auto px-6 py-8">
           <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 text-center">
             <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
             </div>
             <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in to save your topics</h3>
             <p className="text-gray-600 mb-4">
               Create an account to save your interests and get personalized daily digests
             </p>
             <Button
               onClick={() => setShowAuthModal(true)}
               className="bg-purple-600 hover:bg-purple-700 text-white px-6"
             >
               Sign In / Sign Up
             </Button>
           </div>
         </div>
       )}

       {/* Daily Digest Section - Only show for digest tab */}
       {activeTab === 'digest' && (
         <div className="max-w-6xl mx-auto px-6 pb-12">
           <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                 <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 Daily Digest
               </h2>
               <div className="flex items-center gap-3">
                 <Button
                   onClick={copyDigest}
                   disabled={!digest}
                   className="bg-purple-600 hover:bg-purple-700 text-white px-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   title="Copy digest to clipboard"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                   Copy
                 </Button>
                 <Button
                   onClick={refreshDigest}
                   className="bg-purple-600 hover:bg-purple-700 text-white px-4 flex items-center gap-2"
                   title="Generate a new digest"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                   Refresh
                 </Button>

               </div>

             </div>
             
             {digest ? (
               <DigestDisplay digest={digest} />
             ) : (
               <Card className="border border-purple-200 shadow-sm bg-white">
                 <div className="p-6 text-center">
                   <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                   </div>
                   <p className="text-gray-500 mb-2">No digest yet</p>
                   <p className="text-sm text-gray-400">
                     Add interests and click Generate Digest to see your beautiful topic cards here.
                   </p>
                 </div>
               </Card>
             )}
           </div>
         </div>
       )}

       {/* Authentication Modal */}
       <AuthModal
         isOpen={showAuthModal}
         onClose={() => setShowAuthModal(false)}
         onSignIn={handleSignIn}
         onSignUp={handleSignUp}
       />
     </div>
   );
 }
