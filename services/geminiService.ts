import { GoogleGenAI, Type } from "@google/genai";
import type { HarmAnalysisResult } from '../types';

// Access the API key from the environment variable
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This error is for the developer's console, indicating a configuration issue.
  console.error("API_KEY environment variable is not set.");
}

// Initialize the GoogleGenAI client only if the API key is available.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        isHarmful: {
            type: Type.BOOLEAN,
            description: "Is the text harmful, containing cyberbullying, hate speech, or threats?"
        },
        severity: {
            type: Type.STRING,
            description: "The severity of the harmful content. Can be 'Low', 'Medium', or 'High'. Returns 'Low' if not harmful.",
            enum: ["Low", "Medium", "High"]
        },
        suggestion: {
            type: Type.STRING,
            description: "A constructive suggestion to rephrase the message kindly, or an empty string if not harmful."
        }
    },
    required: ["isHarmful", "severity", "suggestion"]
};

export const analyzeMessage = async (message: string): Promise<HarmAnalysisResult> => {
    if (!ai) {
        console.error("Gemini AI client not initialized. API key might be missing. Returning a mock response.");
        // Return a mock response if the AI client isn't initialized.
        // This provides a fallback for local development or if the key is missing.
        const isHarmfulMock = message.toLowerCase().includes('dumb');
        return {
            isHarmful: isHarmfulMock,
            severity: isHarmfulMock ? 'Medium' : 'Low',
            suggestion: isHarmfulMock ? "Maybe try saying 'I don't agree with that' instead." : ""
        };
    }
    
    try {
        const systemInstruction = "You are a cyberbullying detection expert. Analyze the user's text for harmful content like bullying, hate speech, or threats. Respond ONLY with the requested JSON object described in the schema. Your analysis should be swift and accurate to protect users.";
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this text: "${message}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.1,
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        // Type guard to ensure the result matches the HarmAnalysisResult interface
        if (
            typeof result.isHarmful === 'boolean' &&
            ['Low', 'Medium', 'High'].includes(result.severity) &&
            typeof result.suggestion === 'string'
        ) {
            return result as HarmAnalysisResult;
        } else {
            throw new Error("Invalid JSON structure from API");
        }
    } catch (error) {
        console.error("Error analyzing message with Gemini API:", error);
        // Fallback to a default non-harmful response on API error
        return {
            isHarmful: false,
            severity: 'Low',
            suggestion: ''
        };
    }
};
