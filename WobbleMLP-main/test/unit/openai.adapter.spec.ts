import { chat } from '@/lib/llmAdapters/openai';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Simple mock for the OpenAI client
const mockCreate = vi.fn();

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  };
});

describe('OpenAI Adapter', () => {
  const mockApiKey = 'test-api-key';
  const mockModel = 'gpt-4';
  const mockMessages = [{ role: 'user' as const, content: 'Hello' }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make a successful API call', async () => {
    // Mock the OpenAI client response
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: { 
          content: 'Hello! How can I help you today?' 
        }
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 10,
        total_tokens: 20
      }
    });

    // Make the call
    const result = await chat({
      key: mockApiKey,
      model: mockModel,
      messages: mockMessages
    });

    // Verify the result
    expect(result).toEqual({
      result: 'Hello! How can I help you today?',
      usage: {
        prompt_tokens: 10,
        completion_tokens: 10,
        total_tokens: 20
      }
    });
  });

  it('should handle empty response', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: { content: '' }
      }],
      usage: {
        prompt_tokens: 5,
        completion_tokens: 0,
        total_tokens: 5
      }
    });

    const result = await chat({
      key: mockApiKey,
      model: mockModel,
      messages: mockMessages
    });

    expect(result).toEqual({
      result: '',
      usage: {
        prompt_tokens: 5,
        completion_tokens: 0,
        total_tokens: 5
      }
    });
  });
});
