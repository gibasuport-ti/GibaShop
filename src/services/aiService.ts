import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Service for GIBASHOP
 * -----------------------
 * SECURITY WARNING: 
 * If this app is hosted as a static site (e.g., GitHub Pages), 
 * using API keys directly in the client is INSECURE as they will be visible in the browser.
 * 
 * RECOMMENDED APPROACH:
 * Use a serverless function (Firebase Functions, GitHub Action, or Backend) to proxy AI requests.
 */

// In this environment, GEMINI_API_KEY is provided via process.env
const API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const getAIModel = (modelName = "gemini-1.5-flash") => {
  if (!API_KEY) {
    console.warn("GEMINI_API_KEY is missing. AI features may not work.");
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export const generateProductDescription = async (productTitle: string) => {
  try {
    const model = getAIModel();
    const prompt = `Gere uma descrição atraente e profissional para o produto: ${productTitle}. Foco em tecnologia e estilo.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro na geração de IA:", error);
    return null;
  }
};
