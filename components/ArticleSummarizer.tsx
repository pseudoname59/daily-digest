"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface ArticleSummarizerProps {
  user: { email: string } | null;
}

interface SummaryResult {
  title: string;
  summary: string[];
  source: string;
  timestamp: string;
}

export default function ArticleSummarizer({ user }: ArticleSummarizerProps) {
  const [url, setUrl] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown source';
    }
  };

  const summarizeArticle = async () => {
    if (!url.trim()) {
      setError("Please enter a URL to summarize.");
      return;
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }

    setIsSummarizing(true);
    setError(null);
    setSummary(null);

    try {
      // Call the API to summarize the article
      const response = await fetch('/api/summarize-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const result = await response.json();

      if (response.ok) {
        setSummary({
          title: result.title || 'Article Summary',
          summary: result.summary || [],
          source: extractDomain(url),
          timestamp: new Date().toLocaleString()
        });
      } else {
        setError(result.error || 'Failed to summarize article. Please try again.');
      }
    } catch (error) {
      console.error('Error summarizing article:', error);
      setError('Failed to connect to the summarization service. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const copySummary = async () => {
    if (!summary) return;
    
    const summaryText = `📰 Article Summary\n\nTitle: ${summary.title}\nSource: ${summary.source}\n\nKey Points:\n${summary.summary.map((point, index) => `${index + 1}. ${point}`).join('\n')}\n\nSummarized on: ${summary.timestamp}`;
    
    try {
      await navigator.clipboard.writeText(summaryText);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  };

  const clearForm = () => {
    setUrl("");
    setSummary(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📄 Article Summarizer
        </h2>
        <p className="text-gray-600">
          Paste any news article URL and get a concise 5-point summary
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-6 border border-purple-200 shadow-sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="article-url" className="block text-sm font-medium text-gray-700 mb-2">
              Article URL
            </label>
            <Input
              id="article-url"
              type="url"
              placeholder="https://example.com/news-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              disabled={isSummarizing}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={summarizeArticle}
              disabled={!url.trim() || isSummarizing}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSummarizing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {isSummarizing ? 'Summarizing...' : 'Summarize Article'}
            </Button>
            
            {summary && (
              <Button
                onClick={clearForm}
                variant="outline"
                className="text-gray-600 hover:text-gray-900"
              >
                Clear
              </Button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Result */}
      {summary && (
        <Card className="border border-purple-200 shadow-sm bg-white">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {summary.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Source: {summary.source} • {summary.timestamp}
                </p>
              </div>
              <Button
                onClick={copySummary}
                variant="outline"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </Button>
            </div>

            {/* Summary Points */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Key Points:</h4>
              <div className="space-y-2">
                {summary.summary.map((point, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                💡 This summary was generated using AI. Always verify important information from the original source.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="p-6 border border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Paste any news article URL from major news sources</li>
            <li>• Our AI will extract and analyze the article content</li>
            <li>• Get a concise 5-point summary of the key information</li>
            <li>• Copy the summary to share or save for later</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Supported sources: Most major news websites, blogs, and articles with public access.
          </p>
        </div>
      </Card>
    </div>
  );
}


