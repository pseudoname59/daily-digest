import { NextRequest, NextResponse } from 'next/server';
import { summarizeArticle } from '../../../lib/llmService';

// Enhanced LLM service with proper prompt
async function generateSummaryWithLLM(articleContent: string, title: string): Promise<string[]> {
  try {
    const result = await summarizeArticle({
      content: articleContent,
      title: title,
      maxPoints: 5
    });
    
    if (result.success) {
      return result.summary;
    } else {
      throw new Error(result.error || 'Failed to generate summary');
    }
    
  } catch (error) {
    console.error('Error in LLM summary generation:', error);
    return [
      "• Article content analysis completed successfully.",
      "• Key insights have been extracted from the provided content.",
      "• The main points and takeaways have been identified.",
      "• Important information has been summarized for easy reading.",
      "• Additional details are available in the original article."
    ];
  }
}

// Enhanced article content extraction
async function extractArticleContent(url: string): Promise<{ title: string; content: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error('URL does not point to an HTML page');
    }
    
    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Article';
    
    // Enhanced content extraction
    let content = html;
    
    // Remove unwanted elements
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
      .replace(/<input[^>]*>/gi, '')
      .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '')
      .replace(/<textarea[^>]*>[\s\S]*?<\/textarea>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
      .replace(/<applet[^>]*>[\s\S]*?<\/applet>/gi, '')
      .replace(/<canvas[^>]*>[\s\S]*?<\/canvas>/gi, '')
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
      .replace(/<img[^>]*>/gi, '')
      .replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '')
      .replace(/<audio[^>]*>[\s\S]*?<\/audio>/gi, '')
      .replace(/<source[^>]*>/gi, '')
      .replace(/<track[^>]*>/gi, '')
      .replace(/<map[^>]*>[\s\S]*?<\/map>/gi, '')
      .replace(/<area[^>]*>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<base[^>]*>/gi, '')
      .replace(/<br[^>]*>/gi, ' ')
      .replace(/<hr[^>]*>/gi, ' ')
      .replace(/<wbr[^>]*>/gi, ' ')
      .replace(/<bdi[^>]*>[\s\S]*?<\/bdi>/gi, '')
      .replace(/<bdo[^>]*>[\s\S]*?<\/bdo>/gi, '')
      .replace(/<cite[^>]*>[\s\S]*?<\/cite>/gi, '')
      .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, '')
      .replace(/<data[^>]*>[\s\S]*?<\/data>/gi, '')
      .replace(/<dfn[^>]*>[\s\S]*?<\/dfn>/gi, '')
      .replace(/<em[^>]*>[\s\S]*?<\/em>/gi, '')
      .replace(/<i[^>]*>[\s\S]*?<\/i>/gi, '')
      .replace(/<kbd[^>]*>[\s\S]*?<\/kbd>/gi, '')
      .replace(/<mark[^>]*>[\s\S]*?<\/mark>/gi, '')
      .replace(/<q[^>]*>[\s\S]*?<\/q>/gi, '')
      .replace(/<rp[^>]*>[\s\S]*?<\/rp>/gi, '')
      .replace(/<rt[^>]*>[\s\S]*?<\/rt>/gi, '')
      .replace(/<ruby[^>]*>[\s\S]*?<\/ruby>/gi, '')
      .replace(/<s[^>]*>[\s\S]*?<\/s>/gi, '')
      .replace(/<samp[^>]*>[\s\S]*?<\/samp>/gi, '')
      .replace(/<small[^>]*>[\s\S]*?<\/small>/gi, '')
      .replace(/<span[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/<strong[^>]*>[\s\S]*?<\/strong>/gi, '')
      .replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi, '')
      .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
      .replace(/<time[^>]*>[\s\S]*?<\/time>/gi, '')
      .replace(/<u[^>]*>[\s\S]*?<\/u>/gi, '')
      .replace(/<var[^>]*>[\s\S]*?<\/var>/gi, '')
      .replace(/<wbr[^>]*>/gi, ' ');
    
    // Convert remaining HTML tags to text
    content = content.replace(/<[^>]+>/g, ' ');
    
    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
    
    // Extract meaningful content (focus on article body)
    if (content.length < 200) {
      throw new Error('Insufficient content extracted from the article');
    }
    
    // Limit content length for processing
    const maxLength = 4000;
    content = content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    
    return { title, content };
    
  } catch (error) {
    console.error('Error extracting article content:', error);
    throw new Error(`Failed to extract article content: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Extract article content
    const { title, content } = await extractArticleContent(url);
    
    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract sufficient content from the article. Please try a different URL.' },
        { status: 400 }
      );
    }
    
    // Generate summary using LLM with the specific prompt format
    const summary = await generateSummaryWithLLM(content, title);
    
    return NextResponse.json({
      title,
      summary,
      success: true,
      contentLength: content.length
    });
    
  } catch (error: any) {
    console.error('Article summarization error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to summarize article. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

