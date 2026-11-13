import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

let geminiClient = null;

if (env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    console.log('✅ Google GenAI SDK (@google/genai) initialized successfully.');
  } catch (err) {
    console.error('⚠️ Failed to initialize Google GenAI SDK:', err.message);
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY is not set. The platform will use agronomic rule engines until key is configured.');
}

export { geminiClient };
