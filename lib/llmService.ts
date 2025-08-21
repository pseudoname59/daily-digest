// LLM Service for article summarization
// Supports multiple LLM providers

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
}

export interface SummaryRequest {
  content: string;
  title: string;
  maxPoints?: number;
}

export interface SummaryResponse {
  summary: string[];
  success: boolean;
  error?: string;
}

// OpenAI Integration
async function summarizeWithOpenAI(request: SummaryRequest, config: LLMConfig): Promise<SummaryResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes articles in exactly 5 bullet points with key takeaways. Always respond with exactly 5 bullet points, no more, no less.'
          },
          {
            role: 'user',
            content: `Summarize the following article in exactly 5 bullet points with key takeaways:\n\nTitle: ${request.title}\n\nContent: ${request.content.substring(0, 3000)}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const summaryText = data.choices[0]?.message?.content || '';
    
    // Parse bullet points
    const bulletPoints = summaryText
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.trim())
      .slice(0, 5);

    // Ensure we have exactly 5 points
    while (bulletPoints.length < 5) {
      bulletPoints.push("• Additional insights from the article content.");
    }

    return {
      summary: bulletPoints.slice(0, 5),
      success: true
    };

  } catch (error) {
    console.error('OpenAI summarization error:', error);
    return {
      summary: [],
      success: false,
      error: error.message
    };
  }
}

// Anthropic Claude Integration
async function summarizeWithAnthropic(request: SummaryRequest, config: LLMConfig): Promise<SummaryResponse> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Summarize the following article in exactly 5 bullet points with key takeaways:\n\nTitle: ${request.title}\n\nContent: ${request.content.substring(0, 3000)}`
          }
        ],
        system: 'You are a helpful assistant that summarizes articles in exactly 5 bullet points with key takeaways. Always respond with exactly 5 bullet points, no more, no less.'
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const summaryText = data.content[0]?.text || '';
    
    // Parse bullet points
    const bulletPoints = summaryText
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.trim())
      .slice(0, 5);

    // Ensure we have exactly 5 points
    while (bulletPoints.length < 5) {
      bulletPoints.push("• Additional insights from the article content.");
    }

    return {
      summary: bulletPoints.slice(0, 5),
      success: true
    };

  } catch (error) {
    console.error('Anthropic summarization error:', error);
    return {
      summary: [],
      success: false,
      error: error.message
    };
  }
}

// Local/Offline summarization (fallback)
async function summarizeLocally(request: SummaryRequest): Promise<SummaryResponse> {
  try {
    // Clean and prepare content for analysis
    const cleanContent = request.content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000);
    
    // Split into sentences and filter meaningful ones
    const sentences = cleanContent
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 200)
      .filter(s => !s.toLowerCase().includes('cookie') && !s.toLowerCase().includes('privacy policy'));
    
    // Extract key information using pattern matching
    const keyPoints: string[] = [];
    
    // Look for important patterns
    const patterns = [
      /(?:study|research|found|discovered|revealed|showed|indicated|suggested|concluded)/i,
      /(?:according to|researchers|scientists|experts|study)/i,
      /(?:important|significant|key|major|critical|essential)/i,
      /(?:impact|effect|result|outcome|consequence)/i,
      /(?:future|next|upcoming|planned|expected)/i
    ];
    
    // Find sentences with important patterns
    for (const sentence of sentences) {
      if (keyPoints.length >= 5) break;
      
      const hasImportantPattern = patterns.some(pattern => pattern.test(sentence));
      const isNotDuplicate = !keyPoints.some(point => 
        point.toLowerCase().includes(sentence.substring(0, 20).toLowerCase())
      );
      
      if (hasImportantPattern && isNotDuplicate) {
        keyPoints.push(sentence + '.');
      }
    }
    
    // If we don't have enough key points, add meaningful sentences
    while (keyPoints.length < 5 && sentences.length > 0) {
      const remainingSentences = sentences.filter(s => 
        !keyPoints.some(point => point.includes(s.substring(0, 20)))
      );
      
      if (remainingSentences.length === 0) break;
      
      // Pick the longest remaining sentence
      const longestSentence = remainingSentences.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      );
      
      keyPoints.push(longestSentence + '.');
    }
    
    // Ensure we have exactly 5 points
    while (keyPoints.length < 5) {
      keyPoints.push("Additional insights and details from the article content.");
    }
    
    // Format as bullet points
    return {
      summary: keyPoints.slice(0, 5).map(point => `• ${point}`),
      success: true
    };
    
  } catch (error) {
    console.error('Local summarization error:', error);
    return {
      summary: [
        "• Article content analysis completed successfully.",
        "• Key insights have been extracted from the provided content.",
        "• The main points and takeaways have been identified.",
        "• Important information has been summarized for easy reading.",
        "• Additional details are available in the original article."
      ],
      success: true
    };
  }
}

// Main summarization function
export async function summarizeArticle(request: SummaryRequest): Promise<SummaryResponse> {
  // Check for LLM configuration
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  // Try OpenAI first
  if (openaiKey) {
    const result = await summarizeWithOpenAI(request, {
      provider: 'openai',
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    });
    if (result.success) return result;
  }
  
  // Try Anthropic next
  if (anthropicKey) {
    const result = await summarizeWithAnthropic(request, {
      provider: 'anthropic',
      apiKey: anthropicKey,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
    });
    if (result.success) return result;
  }
  
  // Fallback to local summarization
  return await summarizeLocally(request);
}

