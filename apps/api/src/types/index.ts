
import { z } from 'zod';

export const IncomingMessageSchema = z.object({
  docId: z.string().uuid(),
  text: z.string().min(1),
});

export type IncomingMessage = z.infer<typeof IncomingMessageSchema>;

export interface SuggestionPayload {
  id: string;
  range: {
    from: number;
    to: number;
  };
  replacement: string;
  rule: 'Spelling' | 'Grammar' | 'Style';
  explanation: string;
}

export interface OutgoingMessage {
  type: 'suggestion' | 'error' | 'complete';
  payload: SuggestionPayload | { message: string };
}

export interface JWTPayload {
  sub: string;
  email?: string;
  aud: string;
  role: string;
  iat: number;
  exp: number;
}
