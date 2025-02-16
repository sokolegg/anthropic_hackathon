import { Anthropic } from '@anthropic-ai/sdk';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatResponse(messages: ClaudeMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key is not configured');
  }

  const response = await fetch('/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: messages,
      temperature: 0
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function generateSummary(messages: ClaudeMessage[]): Promise<string> {
  // Temporarily disabled Anthropic integration
  /*
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  if (!apiKey) {
    return `<div class="p-4 bg-destructive/10 text-destructive rounded-lg">
      Claude API key is not configured. Please add VITE_CLAUDE_API_KEY to your .env file.
    </div>`;
  }

  try {
    const response = await fetch('/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: messages,
        system: "You are an expert at analyzing timeline data and creating beautiful HTML visualizations. Your responses should be valid HTML that can be directly rendered in a browser. Use Tailwind CSS classes for styling."
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    if (!data.content || data.content.length === 0) {
      throw new Error('No content in response');
    }

    return data.content[0].text;
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return `<div class="p-4 bg-destructive/10 text-destructive rounded-lg">
          Invalid API key. Please check your VITE_CLAUDE_API_KEY configuration.
          <div class="mt-2 text-sm opacity-75">Make sure you're using a valid API key from your Anthropic account.</div>
        </div>`;
      }
      if (error.message.includes('429')) {
        return `<div class="p-4 bg-destructive/10 text-destructive rounded-lg">
          Rate limit exceeded. Please try again in a few moments.
          <div class="mt-2 text-sm opacity-75">Your account has reached its API rate limit.</div>
        </div>`;
      }
    }
    return `<div class="p-4 bg-destructive/10 text-destructive rounded-lg">
      Failed to generate visualization. Error: ${error instanceof Error ? error.message : 'Unknown error'}
      <div class="mt-2 text-sm opacity-75">Please check your API key and try again.</div>
    </div>`;
  }
  */
  
  // Return empty string while Anthropic integration is disabled
  return '';
}