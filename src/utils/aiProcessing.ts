import { getPreferenceValues } from "@raycast/api";
import fetch from 'node-fetch';
import OpenAI from "openai";
import { Mistral } from '@mistralai/mistralai';
import { ChatCompletionResponse } from "@mistralai/mistralai/models/components";
import { Preferences } from "./preferenceValidation";

// Make fetch available globally for OpenAI client
if (!global.fetch) {
  global.fetch = fetch as unknown as typeof global.fetch;
}

interface AIClient {
  processText(text: string, systemPrompt: string, options?: ProcessingOptions): Promise<string>;
}

export type ProcessingOptions = {
  temperature?: number;
};

class OpenAIClient implements AIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async processText(text: string, systemPrompt: string, options: ProcessingOptions = {}) {
    const { temperature = 0.7 } = options;
    const completion = await this.client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      model: "gpt-3.5-turbo",
      temperature,
    });
    return completion.choices[0]?.message?.content || "";
  }
}

class MistralAIClient implements AIClient {
  private client: Mistral;

  constructor(apiKey: string) {
    this.client = new Mistral({ apiKey });
  }

  async processText(text: string, systemPrompt: string, options: ProcessingOptions = {}) {
    const { temperature = 0.7 } = options;
    if (!this.client) {
      throw new Error('Mistral client is not initialized');
    }
    const response: ChatCompletionResponse = await this.client.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        {role: 'system', content: systemPrompt},
        {role: 'user', content: text}
      ],
      temperature
    });

    const firstChoice = (response && response.choices && response.choices?.length>0) ? response.choices[0]:undefined;
    return firstChoice?.message.content?.toString() || '';
  }
}

export function createAIClient(): AIClient {
  const preferences = getPreferenceValues<Preferences>();

  switch (preferences.selectedModel) {
    case "openai":
      return new OpenAIClient(preferences.apiKey);
    case "mistral":
      return new MistralAIClient(preferences.apiKey);
    default:
      throw new Error(`Unsupported AI model: ${preferences.selectedModel}`);
  }
}

class LLMError extends Error {
  constructor(message: string, public model: string) {
    super(message);
    this.name = 'LLMError';
  }
}

export async function processWithAI(
  text: string,
  systemPrompt: string,
  options: ProcessingOptions = {}
) {
  try {
    const client = createAIClient();
    return await client.processText(text, systemPrompt, options);
  } catch (error) {
    const preferences = getPreferenceValues<Preferences>();
    const modelName = preferences.selectedModel.toUpperCase();

    if (error instanceof Error) {
      // Handle authentication errors specifically
      if ('code' in error && error.code === 'ERR_BAD_REQUEST' && error.message.includes('401')) {
        throw new LLMError(
          `${modelName} Authentication Error: Invalid API key. Please check your API key in the extension preferences.`,
          preferences.selectedModel
        );
      }

      throw new LLMError(
        `${modelName} Error: ${error.message}\n\nPlease verify your API key and configuration.`,
        preferences.selectedModel
      );
    }

    throw new LLMError(
      `Unknown ${modelName} error occurred. Please verify your configuration.`,
      preferences.selectedModel
    );
  }
}
