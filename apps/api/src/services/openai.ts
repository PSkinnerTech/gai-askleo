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

  private readonly SYSTEM_PROMPT = `You are a precision-focused JSON API for medical text correction. Your sole function is to identify spelling, grammar, and style errors in a user-provided text and return a JSON object with a 'suggestions' array.

You MUST adhere to the following rules:
1.  Your entire response must be a single, valid JSON object. Do not include any text or markdown before or after the JSON.
2.  The root object must have one key: "suggestions".
3.  "suggestions" must be an array of correction objects.
4.  Each correction object must have these keys: "range" (with "from" and "to" zero-indexed character offsets), "replacement" (the corrected text), "rule" (one of "Spelling", "Grammar", or "Style"), and a concise "explanation".
5.  If no errors are found, return an empty array: {"suggestions": []}.

Example:
User text: "Pt states she hasnt been feeling rite for 3 days now. Complains of persistant fatigue, headak, and light diziness when standing."
Your JSON response:
{
  "suggestions": [
    {
      "range": { "from": 12, "to": 18 },
      "replacement": "hasn't",
      "rule": "Spelling",
      "explanation": "Corrected contraction."
    },
    {
      "range": { "from": 32, "to": 36 },
      "replacement": "right",
      "rule": "Spelling",
      "explanation": "Corrected spelling of 'right'."
    },
    {
      "range": { "from": 65, "to": 75 },
      "replacement": "persistent",
      "rule": "Spelling",
      "explanation": "Corrected spelling of 'persistent'."
    },
    {
      "range": { "from": 85, "to": 91 },
      "replacement": "headache",
      "rule": "Spelling",
      "explanation": "Corrected spelling of 'headache'."
    },
    {
      "range": { "from": 102, "to": 109 },
      "replacement": "dizziness",
      "rule": "Spelling",
      "explanation": "Corrected spelling of 'dizziness'."
    }
  ]
}`;

  async getSuggestions(text: string): Promise<OutgoingMessage[]> {
    if (!text.trim()) {
      return [];
    }

    console.log("----- Sending to OpenAI -----");
    console.log("Text:", text);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      });

      console.log("----- OpenAI Raw Response -----");
      console.log(JSON.stringify(response, null, 2));

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error("!!! OpenAI response content is null or empty.");
        return [];
      }
      
      console.log("----- OpenAI Parsed Content -----");
      console.log(content);

      const parsed = JSON.parse(content);
      const suggestions: any[] = parsed.suggestions || [];

      if (!Array.isArray(suggestions)) {
        console.error("!!! AI response did not contain a 'suggestions' array:", parsed);
        return [];
      }

      console.log(`Found ${suggestions.length} suggestions.`);

      return suggestions.map((suggestion): OutgoingMessage => ({
        type: 'suggestion',
        payload: {
          id: uuidv4(),
          range: suggestion.range,
          replacement: suggestion.replacement,
          rule: suggestion.rule,
          explanation: suggestion.explanation,
        },
      }));

    } catch (error) {
      console.error('!!! OpenAI API error:', error);
      return [{
        type: 'error',
        payload: { message: 'Failed to analyze text due to an API error.' },
      }];
    }
  }
}
