import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function identifyPlant(imageBase64: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const prompt = "Identify this plant and provide the following information in JSON format: 1. commonName 2. scientificName 3. description 4. careInstructions 5. idealConditions";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64.split(",")[1]
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        try {
            return JSON.parse(text);
        } catch (parseError) {
            // If JSON parsing fails, return formatted object
            return {
                commonName: "Unknown Plant",
                scientificName: "Not identified",
                description: text,
                careInstructions: "Not available",
                idealConditions: "Not available"
            };
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error(`Gemini API error: ${(error as Error).message}`);
    }
}