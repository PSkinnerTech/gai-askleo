
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import type { SuggestionPayload, OutgoingMessage } from '../types/index.js';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }

  private readonly SYSTEM_PROMPT = `You are an expert medical writing assistant named Askleo. Your task is to identify and correct spelling, grammar, and style errors in clinical documentation. Your suggestions must be precise and maintain a formal, clinical tone. You must only provide corrections as a stream of structured JSON objects. Do not add conversational text or any other filler.

You must analyze the provided text and return ONLY a JSON array of correction objects. Each correction must follow this exact format:

[
  {
    "range": {"from": 10, "to": 20},
    "replacement": "corrected text",
    "rule": "Spelling|Grammar|Style",
    "explanation": "Brief explanation of the correction"
  }
]

Rules:
- Only suggest corrections that improve clinical accuracy or clarity
- Maintain medical terminology and formal clinical tone
- Focus on spelling errors, grammatical mistakes, and style improvements
- Return empty array [] if no corrections are needed
- Do not include any other text or formatting`;

  async *getSuggestions(text: string, docId: string): AsyncGenerator<OutgoingMessage> {
    try {
      const stream = await this.client.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: this.SYSTEM_PROMPT },
          { role: 'user', content: `Please analyze this clinical text for corrections: "${text}"` }
        ],
        stream: true,
        temperature: 0.1,
        max_tokens: 1000,
      });

      let accumulatedContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          accumulatedContent += content;
          
          // Try to parse accumulated content as JSON
          try {
            const suggestions = JSON.parse(accumulatedContent);
            if (Array.isArray(suggestions)) {
              // Valid suggestions array received
              for (const suggestion of suggestions) {
                const payload: SuggestionPayload = {
                  id: uuidv4(),
                  range: suggestion.range,
                  replacement: suggestion.replacement,
                  rule: suggestion.rule,
                  explanation: suggestion.explanation,
                };

                yield {
                  type: 'suggestion',
                  payload,
                };
              }
              break; // Exit after processing valid suggestions
            }
          } catch {
            // Continue accumulating if JSON is not complete yet
            continue;
          }
        }
      }

      yield {
        type: 'complete',
        payload: { message: 'Analysis complete' },
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      yield {
        type: 'error',
        payload: { message: 'Failed to analyze text' },
      };
    }
  }
}
