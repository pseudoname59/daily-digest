"use client";

import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";

interface DigestDisplayProps {
  digest: string;
}

interface TopicCard {
  topic: string;
  articles: string[];
  color: string;
  icon: string;
}

const TOPIC_COLORS = {
  'ai': { bg: 'bg-gradient-to-br from-blue-500 to-purple-600', text: 'text-white', border: 'border-blue-200', shadow: 'shadow-blue-200' },
  'biotech': { bg: 'bg-gradient-to-br from-green-500 to-teal-600', text: 'text-white', border: 'border-green-200', shadow: 'shadow-green-200' },
  'ethereum': { bg: 'bg-gradient-to-br from-orange-500 to-red-600', text: 'text-white', border: 'border-orange-200', shadow: 'shadow-orange-200' },
  'climate': { bg: 'bg-gradient-to-br from-emerald-500 to-green-600', text: 'text-white', border: 'border-emerald-200', shadow: 'shadow-emerald-200' },
  'space': { bg: 'bg-gradient-to-br from-indigo-500 to-purple-600', text: 'text-white', border: 'border-indigo-200', shadow: 'shadow-indigo-200' },
  'default': { bg: 'bg-gradient-to-br from-gray-500 to-gray-600', text: 'text-white', border: 'border-gray-200', shadow: 'shadow-gray-200' }
};

const TOPIC_ICONS = {
  'ai': '🤖',
  'biotech': '🧬',
  'ethereum': '₿',
  'climate': '🌱',
  'space': '🚀',
  'default': '📰'
};

export default function DigestDisplay({ digest }: DigestDisplayProps) {
  const [currentCard, setCurrentCard] = useState(0);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevCard();
      } else if (event.key === 'ArrowRight') {
        nextCard();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Parse digest content to extract topics and articles
  const parseDigest = (content: string): TopicCard[] => {
    const cards: TopicCard[] = [];
    const lines = content.split('\n');
    let currentTopic = '';
    let currentArticles: string[] = [];
    
    console.log('Parsing digest with', lines.length, 'lines');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for topic headers (🔹 TOPIC: format)
      if (trimmedLine.includes('🔹') && trimmedLine.includes(':') && !trimmedLine.startsWith('   ')) {
        // Save previous topic if exists
        if (currentTopic && currentArticles.length > 0) {
          cards.push(createTopicCard(currentTopic, currentArticles));
        }
        
        // Start new topic - extract topic name
        const topicMatch = trimmedLine.match(/🔹\s*([^:]+):/);
        currentTopic = topicMatch ? topicMatch[1].trim() : '';
        currentArticles = [];
        console.log('Found topic:', currentTopic);
      } else if (trimmedLine.match(/^\s*\d+\.\s/) && currentTopic) {
        // This is an article line (starts with number and dot, with optional leading spaces)
        const articleText = trimmedLine.replace(/^\s*\d+\.\s*/, '');
        if (articleText && !articleText.includes('Source:') && !articleText.includes('Published:')) {
          currentArticles.push(articleText);
          console.log('Found article:', articleText.substring(0, 50) + '...');
        }
      }
    }
    
    // Add the last topic
    if (currentTopic && currentArticles.length > 0) {
      cards.push(createTopicCard(currentTopic, currentArticles));
    }
    
    console.log('Primary parsing found', cards.length, 'cards');
    
    // If no cards were created, try alternative parsing
    if (cards.length === 0) {
      const alternativeCards = parseDigestAlternative(content);
      console.log('Alternative parsing found', alternativeCards.length, 'cards');
      if (alternativeCards.length === 0) {
        const fallbackCards = parseDigestFallback(content);
        console.log('Fallback parsing found', fallbackCards.length, 'cards');
        return fallbackCards;
      }
      return alternativeCards;
    }
    
    return cards;
  };
  
  // Alternative parsing method for different formats
  const parseDigestAlternative = (content: string): TopicCard[] => {
    const cards: TopicCard[] = [];
    const lines = content.split('\n');
    let currentTopic = '';
    let currentArticles: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for topic patterns
      if (trimmedLine.includes('TOPICS:') || trimmedLine.includes('Topics:') || 
          trimmedLine.includes('Timeframe:') || trimmedLine.includes('Here\'s what\'s happening')) {
        continue; // Skip header lines
      }
      
      // Check for topic headers (various formats)
      if ((trimmedLine.includes('🔹') && trimmedLine.includes(':')) ||
          (trimmedLine.includes(':') && !trimmedLine.startsWith('   ') && !trimmedLine.startsWith('•') && trimmedLine.length < 100)) {
        
        // Save previous topic if exists
        if (currentTopic && currentArticles.length > 0) {
          cards.push(createTopicCard(currentTopic, currentArticles));
        }
        
        // Start new topic
        currentTopic = trimmedLine.replace(/^[🔹•\s]+/, '').replace(/:\s*$/, '');
        currentArticles = [];
      } else if (trimmedLine.length > 20 && currentTopic && 
                 !trimmedLine.includes('Source:') && !trimmedLine.includes('Published:') &&
                 !trimmedLine.includes('Summary:') && !trimmedLine.includes('Stay informed')) {
        // This might be an article
        currentArticles.push(trimmedLine);
      }
    }
    
    // Add the last topic
    if (currentTopic && currentArticles.length > 0) {
      cards.push(createTopicCard(currentTopic, currentArticles));
    }
    
    return cards;
  };
  
  // Fallback parsing method for when other methods fail
  const parseDigestFallback = (content: string): TopicCard[] => {
    const cards: TopicCard[] = [];
    const lines = content.split('\n');
    const topics = ['AI POLICY', 'BIOTECH', 'ETHEREUM', 'CLIMATE TECH', 'SPACE EXPLORATION'];
    
    // Try to find any topic mentions in the content
    for (const topic of topics) {
      const topicLines = lines.filter(line => 
        line.toLowerCase().includes(topic.toLowerCase()) && 
        line.length > 20 &&
        !line.includes('Source:') && 
        !line.includes('Published:') &&
        !line.includes('Summary:')
      );
      
      if (topicLines.length > 0) {
        cards.push(createTopicCard(topic, topicLines.slice(0, 3)));
      }
    }
    
    return cards;
  };
  
  const createTopicCard = (topic: string, articles: string[]): TopicCard => {
    const topicLower = topic.toLowerCase();
    const colorKey = Object.keys(TOPIC_COLORS).find(key => topicLower.includes(key)) || 'default';
    const iconKey = Object.keys(TOPIC_ICONS).find(key => topicLower.includes(key)) || 'default';
    
    return {
      topic,
      articles,
      color: colorKey,
      icon: TOPIC_ICONS[iconKey as keyof typeof TOPIC_ICONS]
    };
  };
  
  const topicCards = parseDigest(digest);
  
  // Debug logging
  console.log('Digest content:', digest);
  console.log('Parsed topic cards:', topicCards);
  console.log('Number of topic cards found:', topicCards.length);
  
  if (topicCards.length === 0) {
    // Fallback to original format if parsing fails
    console.log('No topic cards parsed, showing fallback');
    return (
      <Card className="border border-purple-200 shadow-sm bg-white">
        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Showing digest in original format. The topic card view will be available once articles are properly categorized.
            </p>
          </div>
          <pre className="whitespace-pre-wrap text-gray-700 font-sans">{digest}</pre>
        </div>
      </Card>
    );
  }
  
  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % topicCards.length);
  };
  
  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + topicCards.length) % topicCards.length);
  };
  
  const currentCardData = topicCards[currentCard];
  const colors = TOPIC_COLORS[currentCardData.color as keyof typeof TOPIC_COLORS];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📰 Your Daily Digest
        </h3>
        <p className="text-sm text-gray-600">
          {topicCards.length} topic{topicCards.length !== 1 ? 's' : ''} • Card {currentCard + 1} of {topicCards.length}
        </p>
      </div>
      
             {/* Main Card */}
       <div className="relative">
         <Card className={`overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.border} ${colors.shadow}`}>
          {/* Card Header */}
          <div className={`${colors.bg} ${colors.text} p-6 text-center relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <div className="text-6xl">{currentCardData.icon}</div>
            </div>
            <div className="relative z-10">
              <div className="text-4xl mb-2">{currentCardData.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{currentCardData.topic}</h2>
              <p className="text-sm opacity-90">
                {currentCardData.articles.length} article{currentCardData.articles.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-6 bg-white">
            <div className="space-y-4">
              {currentCardData.articles.map((article, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300 hover:border-l-4 hover:border-gray-400 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium leading-relaxed">
                        {article.replace(/^\d+\.\s*/, '')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Navigation Arrows */}
        {topicCards.length > 1 && (
          <>
            <button
              onClick={prevCard}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextCard}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Topic Indicators */}
      {topicCards.length > 1 && (
        <div className="flex justify-center space-x-2">
          {topicCards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentCard 
                  ? 'bg-purple-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Summary Footer */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
        <p>
          📊 Found {topicCards.reduce((total, card) => total + card.articles.length, 0)} articles across {topicCards.length} topics
        </p>
        <p className="mt-1">
          💡 Swipe or use arrows to explore different topics
        </p>
      </div>
    </div>
  );
}
