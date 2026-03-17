
import { GoogleGenAI, Type } from "@google/genai";
import { TimezoneResponse } from '../types';

export const isAIAvailable = (): boolean => {
    return Boolean(process.env.API_KEY);
};

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("No Gemini API key configured. Set GEMINI_API_KEY in .env.local to enable AI features.");
    return new GoogleGenAI({ apiKey });
};

export const resolveLocationToTimezone = async (locationQuery: string): Promise<TimezoneResponse> => {
    const ai = getClient();
    
    const prompt = `Identify the IANA timezone, standard city name, country, latitude, and longitude for the location: "${locationQuery}".`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        timezone: { type: Type.STRING, description: "Valid IANA timezone string (e.g. Europe/London)" },
                        city: { type: Type.STRING, description: "The city name" },
                        country: { type: Type.STRING, description: "The country name" },
                        utcOffset: { type: Type.STRING, description: "UTC offset string (e.g. UTC+5)" },
                        lat: { type: Type.NUMBER, description: "Latitude of the location" },
                        lng: { type: Type.NUMBER, description: "Longitude of the location" }
                    },
                    required: ["timezone", "city", "country", "utcOffset", "lat", "lng"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        return JSON.parse(text) as TimezoneResponse;
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback or rethrow
        throw new Error("Could not determine location details. Please try a major city name.");
    }
};

export const summarizeMeeting = async (meetingContent: string): Promise<{ summary: string; actionItems: string[] }> => {
    const ai = getClient();
    
    const prompt = `Analyze the following meeting notes (HTML/Text). Provide a concise summary (max 3 sentences) and extract a list of clear action items/tasks.
    
    Meeting Content:
    ${meetingContent}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "A concise summary of the meeting" },
                        actionItems: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "List of extracted tasks or action items"
                        }
                    },
                    required: ["summary", "actionItems"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Summary Error:", error);
        throw new Error("Failed to summarize meeting.");
    }
};
