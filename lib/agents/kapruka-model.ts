import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import { wrapLanguageModel, type LanguageModel } from 'ai';
import { GEMINI_MODEL } from '@/constants/agent';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export function getKaprukaModel(): LanguageModel {
  const baseModel = google(GEMINI_MODEL);

  if (process.env.NODE_ENV === 'development') {
    return wrapLanguageModel({
      model: baseModel,
      middleware: devToolsMiddleware(),
    });
  }

  return baseModel;
}
