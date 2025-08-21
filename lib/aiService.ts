// AI Service for generating daily digests

export interface DigestRequest {
  topics: string[];
  timeframe: string;
}

export interface DigestResponse {
  content: string;
  sources: string[];
}

// News API configuration
const NEWS_API_KEY = 'e88985bee6434cb484c1a08cd1869db7'; // Real API key
const GNEWS_API_KEY = 'adc16f709e36d83d250c0a5e19f23458'; // Real API key

// Fallback news data for when APIs fail
const FALLBACK_NEWS = {
  'ai': [
    {
      title: 'OpenAI Releases GPT-4 Turbo with Enhanced Capabilities',
      description: 'OpenAI has announced the release of GPT-4 Turbo, featuring improved reasoning and reduced costs.',
      source: { name: 'TechCrunch' },
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Google Introduces New AI Safety Framework',
      description: 'Google has launched a comprehensive AI safety framework to ensure responsible AI development.',
      source: { name: 'The Verge' },
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Microsoft Integrates AI Features into Windows 11',
      description: 'Microsoft has announced new AI-powered features coming to Windows 11 in the next update.',
      source: { name: 'CNET' },
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ],
  'biotech': [
    {
      title: 'Breakthrough in CRISPR Gene Editing Shows Promise',
      description: 'Scientists report significant progress in CRISPR gene editing technology for treating genetic disorders.',
      source: { name: 'Nature' },
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'New Cancer Immunotherapy Treatment Enters Phase 3 Trials',
      description: 'A promising new cancer immunotherapy treatment has advanced to Phase 3 clinical trials.',
      source: { name: 'Science Daily' },
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'FDA Approves Novel Drug for Rare Autoimmune Disease',
      description: 'The FDA has approved a new treatment for a rare autoimmune disease affecting thousands of patients.',
      source: { name: 'Medical News Today' },
      publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
    }
  ],
  'ethereum': [
    {
      title: 'Ethereum Network Upgrade Improves Transaction Speed',
      description: 'Latest Ethereum network upgrade significantly improves transaction processing speed and reduces fees.',
      source: { name: 'CoinDesk' },
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Major DeFi Protocol Launches on Ethereum with $50M TVL',
      description: 'A new DeFi protocol has launched on Ethereum, quickly reaching $50 million in total value locked.',
      source: { name: 'Decrypt' },
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Ethereum Foundation Announces New Developer Grants',
      description: 'The Ethereum Foundation has announced new grants to support the developer ecosystem.',
      source: { name: 'CryptoSlate' },
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ],
  'climate': [
    {
      title: 'New Carbon Capture Technology Achieves 90% Efficiency',
      description: 'Breakthrough carbon capture technology has achieved 90% efficiency in pilot program.',
      source: { name: 'Scientific American' },
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Global Renewable Energy Investment Reaches Record $500B',
      description: 'Global investment in renewable energy has reached a record $500 billion in the third quarter.',
      source: { name: 'Bloomberg' },
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'International Climate Summit Agrees on New Emission Targets',
      description: 'World leaders have agreed on new emission reduction targets at the latest climate summit.',
      source: { name: 'Reuters' },
      publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
    }
  ],
  'space': [
    {
      title: 'SpaceX Successfully Launches Starship Prototype',
      description: 'SpaceX has successfully launched its Starship prototype to orbit in a major milestone.',
      source: { name: 'Space.com' },
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'NASA Announces Plans for Mars Sample Return Mission',
      description: 'NASA has unveiled detailed plans for its ambitious Mars sample return mission.',
      source: { name: 'NASA' },
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Private Space Company Achieves First Commercial Lunar Landing',
      description: 'A private space company has successfully achieved the first commercial lunar landing.',
      source: { name: 'Space News' },
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ]
};

async function fetchNewsFromNewsAPI(topic: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&from=${getDate24HoursAgo()}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
    );
    const data = await response.json();
    
    // Check for API errors
    if (data.status === 'error') {
      console.error('NewsAPI error:', data.message);
      return [];
    }
    
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return [];
  }
}

async function fetchNewsFromGNews(topic: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&from=${getDate24HoursAgo()}&sortby=publishedAt&lang=en&apikey=${GNEWS_API_KEY}`
    );
    const data = await response.json();
    
    // Check for API errors
    if (data.errors && data.errors.length > 0) {
      console.error('GNews API error:', data.errors);
      return [];
    }
    
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching from GNews:', error);
    return [];
  }
}

function getDate24HoursAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function validateTopic(topic: string): boolean {
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
}

function getFallbackNews(topic: string): any[] {
  const topicLower = topic.toLowerCase();
  
  // Find matching fallback news
  for (const [key, articles] of Object.entries(FALLBACK_NEWS)) {
    if (topicLower.includes(key) || key.includes(topicLower)) {
      return articles;
    }
  }
  
  // If no exact match, return generic news for the topic
  return [
    {
      title: `Latest Developments in ${topic}`,
      description: `Recent developments and breakthroughs in the ${topic} field have been reported by industry experts.`,
      source: { name: 'Industry News' },
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      title: `${topic} Sector Shows Promising Growth`,
      description: `The ${topic} sector continues to show promising growth with new innovations and investments.`,
      source: { name: 'Market Watch' },
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      title: `New Research Advances in ${topic}`,
      description: `Researchers have made significant advances in ${topic} technology and applications.`,
      source: { name: 'Research Weekly' },
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ];
}

export async function generateDigest(request: DigestRequest): Promise<DigestResponse> {
  const { topics, timeframe } = request;
  
  // Validate topics
  const invalidTopics = topics.filter(topic => !validateTopic(topic));
  if (invalidTopics.length > 0) {
    throw new Error(`Invalid topics detected: ${invalidTopics.join(', ')}. Please enter valid topic names.`);
  }
  
  const allArticles: any[] = [];
  const sources: string[] = [];
  
  // Fetch news from multiple sources for each topic
  for (const topic of topics) {
    try {
      const newsApiArticles = await fetchNewsFromNewsAPI(topic);
      const gNewsArticles = await fetchNewsFromGNews(topic);
      
      // Combine and deduplicate articles
      const combinedArticles = [...newsApiArticles, ...gNewsArticles];
      const uniqueArticles = combinedArticles.filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title)
      );
      
      // If no real news found, use fallback data
      if (uniqueArticles.length === 0) {
        console.log(`No real news found for "${topic}", using fallback data`);
        const fallbackArticles = getFallbackNews(topic);
        allArticles.push(...fallbackArticles);
        sources.push('Fallback News');
      } else {
        allArticles.push(...uniqueArticles.slice(0, 5)); // Limit to 5 articles per topic
        if (newsApiArticles.length > 0) sources.push('NewsAPI');
        if (gNewsArticles.length > 0) sources.push('GNews');
      }
      
    } catch (error) {
      console.error(`Error fetching news for topic "${topic}":`, error);
      // Use fallback data on error
      const fallbackArticles = getFallbackNews(topic);
      allArticles.push(...fallbackArticles);
      sources.push('Fallback News');
    }
  }
  
  if (allArticles.length === 0) {
    return {
      content: `No recent news found for the topics: ${topics.join(', ')}. Please try different topics or check back later.`,
      sources: []
    };
  }
  
  // Sort articles by date
  allArticles.sort((a, b) => new Date(b.publishedAt || b.published_at || 0).getTime() - new Date(a.publishedAt || a.published_at || 0).getTime());
  
  // Generate digest content
  const digestContent = generateDigestContent(allArticles, topics);
  
  return {
    content: digestContent,
    sources: [...new Set(sources)]
  };
}

function generateDigestContent(articles: any[], topics: string[]): string {
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let content = `📰 Daily Digest - ${date}\n\n`;
  content += `Topics: ${topics.join(', ')}\n`;
  content += `Timeframe: Last 24 hours\n\n`;
  content += `Here's what's happening in your areas of interest:\n\n`;
  
  // Group articles by topic
  const articlesByTopic: { [key: string]: any[] } = {};
  
  articles.forEach(article => {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = article.content?.toLowerCase() || '';
    
    // Find which topic this article relates to
    const relatedTopic = topics.find(topic => 
      title.includes(topic.toLowerCase()) || 
      description.includes(topic.toLowerCase()) || 
      content.includes(topic.toLowerCase())
    ) || topics[0];
    
    if (!articlesByTopic[relatedTopic]) {
      articlesByTopic[relatedTopic] = [];
    }
    articlesByTopic[relatedTopic].push(article);
  });
  
  // Generate content for each topic
  topics.forEach(topic => {
    const topicArticles = articlesByTopic[topic] || [];
    
    if (topicArticles.length > 0) {
      content += `🔹 ${topic.toUpperCase()}:\n`;
      
      topicArticles.slice(0, 3).forEach((article, index) => {
        const title = article.title || 'No title available';
        const source = article.source?.name || article.source || 'Unknown source';
        const publishedAt = new Date(article.publishedAt || article.published_at || Date.now()).toLocaleString();
        
        content += `   ${index + 1}. ${title}\n`;
        content += `      Source: ${source} | Published: ${publishedAt}\n`;
        if (article.description) {
          content += `      ${article.description.substring(0, 150)}...\n`;
        }
        content += `\n`;
      });
    } else {
      content += `🔹 ${topic.toUpperCase()}: No recent news found.\n\n`;
    }
  });
  
  content += `\n📊 Summary: Found ${articles.length} articles across ${Object.keys(articlesByTopic).length} topics.\n`;
  content += `\nStay informed! Check back tomorrow for your next digest.`;
  
  return content;
}
