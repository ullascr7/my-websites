import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini API
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string; placeAnswerSources?: any[] };
}

export type AIMode = 'chat' | 'fast' | 'search' | 'maps' | 'think';

export const AiService = {
  async generate(
    prompt: string, 
    mode: AIMode,
    location?: { lat: number; lng: number }
  ) {
    let model = 'gemini-3-pro-preview';
    let config: any = {};
    let tools: any[] = [];

    switch (mode) {
      case 'fast':
        model = 'gemini-2.5-flash-lite';
        break;
      case 'search':
        model = 'gemini-2.5-flash';
        tools = [{ googleSearch: {} }];
        break;
      case 'maps':
        model = 'gemini-2.5-flash';
        tools = [{ googleMaps: {} }];
        if (location) {
          config.toolConfig = {
            retrievalConfig: {
              latLng: { latitude: location.lat, longitude: location.lng }
            }
          };
        }
        break;
      case 'think':
        model = 'gemini-3-pro-preview';
        // Max thinking budget for 3-pro
        config.thinkingConfig = { thinkingBudget: 32768 };
        break;
      case 'chat':
      default:
        model = 'gemini-3-pro-preview';
        break;
    }

    if (tools.length > 0) config.tools = tools;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      return {
        text: response.text,
        grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined
      };
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  async speak(text: string): Promise<string | undefined> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text: text }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      console.error("TTS Error:", error);
      throw error;
    }
  }
};
