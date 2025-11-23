
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Initialize Gemini client safely with the provided API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper function to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImageForQuiz = async (imageFile: File, answerSheetFile?: File): Promise<Question[]> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const parts: any[] = [imagePart];

    let promptText = `
      Analyze the image to generate a mock test. 
      Identify all questions, their multiple-choice options, and the correct answer.
      
      CRITICAL INSTRUCTION FOR TEXT FLOW:
      - **Verbatim Transcription**: Extract text exactly as it appears. Do NOT rephrase.
      - **Preserve Lines**: Keep original line breaks and paragraph structure.
      - **Fix Broken Sentences**: If a sentence is split across two lines due to layout, join them with a space. Do NOT add a newline in the middle of a sentence.
      - **Comma Handling**: Do NOT break a line immediately after a comma. Keep the text flowing naturally.
      
      CRITICAL INSTRUCTION FOR MATH:
      - **Always Use LaTeX**: Wrap ALL math expressions in single dollar signs ($...$).
      - **Fractions**: Use $\\displaystyle \\frac{a}{b}$ for fractions to ensure they stack vertically.
      - **Display Math**: Use double dollar signs ($$...$$) ONLY for large, complex equations that must be on their own line.
      - **Consistency**: Do NOT use plain text for math (like x^2), always use LaTeX ($x^2$).

      CRITICAL INSTRUCTION FOR FIGURES & DIAGRAMS:
      - Do NOT try to generate SVG code or ASCII art for diagrams.
      - Instead, explicitly mention that there is a diagram and describe it briefly in the 'question' text.
      - Example: "Question text... [Refer to the diagram in original document showing three intersecting circles A, B, C...]"
      
      CRITICAL INSTRUCTION FOR LANGUAGES:
      - If the image contains questions in BOTH English and Hindi, extract BOTH.
      - Map English text to 'question' and 'options'.
      - Map Hindi text to 'questionHindi' and 'optionsHindi'.
      - If only one language is present, leave the *Hindi fields empty.

      The correct answer might be marked. If not, please infer it.
    `;

    if (answerSheetFile) {
        const answerSheetPart = await fileToGenerativePart(answerSheetFile);
        parts.push(answerSheetPart);
        promptText += " I have also attached an image of the Answer Sheet. Please use this second image to strictly determine the correct option for each question identified in the first image.";
    }

    parts.push({ text: promptText });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              questionHindi: { type: Type.STRING, description: "Question text in Hindi if available" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              optionsHindi: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Options in Hindi if available"
              },
              correctOption: {
                type: Type.INTEGER,
                description: 'The index (0-based) of the correct option in the options array.',
              }
            },
            required: ['question', 'options', 'correctOption'],
          },
        },
      },
    });

    const jsonString = response.text;
    if (!jsonString) throw new Error("No text returned from Gemini");
    const parsedData = JSON.parse(jsonString);
    return parsedData as Question[];

  } catch (error: any) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error(`Failed to generate mock test from image: ${error.message || "Unknown error"}`);
  }
};

export const analyzePdfForQuiz = async (pdfFile: File, answerSheetFile?: File): Promise<Question[]> => {
  try {
    const pdfPart = await fileToGenerativePart(pdfFile);
    const parts: any[] = [pdfPart];

    let promptText = `
      Analyze the provided PDF document to generate a mock test.
      Identify all multiple-choice questions, their respective options, and determine the correct answer.
      
      CRITICAL INSTRUCTION FOR TEXT FLOW:
      - **Verbatim Transcription**: Extract text exactly as it appears.
      - **Preserve Lines**: Keep original line breaks.
      - **Fix Broken Sentences**: Join split lines to form complete sentences.
      - **Comma Handling**: Do NOT break a line immediately after a comma.
      
      CRITICAL INSTRUCTION FOR MATH:
      - **Always Use LaTeX**: Wrap ALL math expressions in single dollar signs ($...$).
      - **Fractions**: Use $\\displaystyle \\frac{a}{b}$ for vertical stacking.
      - **Display Math**: Use double dollar signs ($$...$$) for standalone equations.
      
      CRITICAL INSTRUCTION FOR FIGURES & DIAGRAMS:
      - Do NOT try to generate SVG code or ASCII art for diagrams.
      - Instead, explicitly mention that there is a diagram and describe it briefly in the 'question' text.
      - Example: "Question text... [Refer to the diagram in original document showing three intersecting circles A, B, C...]"
      
      CRITICAL INSTRUCTION FOR LANGUAGES:
      - If the PDF contains questions in BOTH English and Hindi, extract BOTH.
      - Map English text to 'question' and 'options'.
      - Map Hindi text to 'questionHindi' and 'optionsHindi'.
      - If only one language is present, leave the *Hindi fields empty.
    `;

    if (answerSheetFile) {
        const answerSheetPart = await fileToGenerativePart(answerSheetFile);
        parts.push(answerSheetPart);
        promptText += " I have also attached an Answer Sheet (image or PDF). Please reference this second file to strictly determine the correct option for each question found in the first PDF.";
    }

    parts.push({ text: promptText });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              questionHindi: { type: Type.STRING, description: "Question text in Hindi if available" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              optionsHindi: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Options in Hindi if available"
              },
              correctOption: {
                type: Type.INTEGER,
                description: 'The index (0-based) of the correct option in the options array.',
              }
            },
            required: ['question', 'options', 'correctOption'],
          },
        },
      },
    });

    const jsonString = response.text;
    if (!jsonString) throw new Error("No text returned from Gemini");
    const parsedData = JSON.parse(jsonString);
    return parsedData as Question[];

  } catch (error: any) {
    console.error("Error analyzing PDF with Gemini:", error);
    throw new Error(`Failed to generate mock test from PDF: ${error.message || "Unknown error"}`);
  }
};


export const getQuestionAnalysis = async (question: Question, userAnswerIndex: number | null): Promise<string> => {
    try {
        const userAnswer = userAnswerIndex !== null ? question.options[userAnswerIndex] : "Not Answered";
        const correctAnswer = question.options[question.correctOption];

        const prompt = `
        Analyze the following question and provide a very short, concise explanation (max 3-4 sentences) in BOTH English and Hindi.
        
        Question: "${question.question}"
        Options: 
        ${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}
        
        Correct Answer: "${correctAnswer}"
        
        Instructions:
        1. First, provide the explanation in English.
        2. Then, provide the same explanation translated into Hindi.
        3. Directly state the key fact or reasoning for the correct answer.
        4. Do not write long introductions like "Here is the analysis".
        5. Keep it to the point and helpful for quick revision.
        6. If there is MATH: Use inline LaTeX with single $ delimiters. For fractions, use $\\displaystyle \\frac{a}{b}$.
        
        Format the response using markdown like this:
        **English:** [English Explanation]
        
        **Hindi:** [Hindi Explanation]
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-flash-lite-latest', // Using flash-lite for low-latency responses
          contents: prompt,
        });

        return response.text || "No explanation available.";

    } catch (error: any) {
        console.error("Error getting question analysis from Gemini:", error);
        throw new Error(`Failed to get analysis: ${error.message || "Unknown error"}`);
    }
};

export const getDetailedQuestionAnalysis = async (question: Question, userAnswerIndex: number | null): Promise<string> => {
    try {
        const correctAnswer = question.options[question.correctOption];

        const prompt = `
        Provide a DETAILED yet SIMPLE and EASY TO UNDERSTAND solution for the following question. 
        
        Question: "${question.question}"
        Options: 
        ${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}
        
        Correct Answer: "${correctAnswer}"
        
        Instructions:
        1. Break down the solution into simple steps.
        2. Avoid complex jargon. Explain it as if teaching a beginner.
        3. If it involves calculation, show every step clearly.
        4. Provide the explanation in BOTH English and Hindi.
        5. Use inline LaTeX with single $ delimiters for all math. For fractions, use $\\displaystyle \\frac{a}{b}$ to ensure they stack properly but stay inline.
        
        Format:
        **Detailed Solution (English):**
        [Simple, step-by-step explanation]

        **Detailed Solution (Hindi):**
        [Simple, step-by-step explanation]
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return response.text || "No detailed explanation available.";

    } catch (error: any) {
        console.error("Error getting detailed analysis from Gemini:", error);
        throw new Error(`Failed to get detailed analysis: ${error.message || "Unknown error"}`);
    }
};

export const translateContent = async (text: string, options: string[], targetLanguage: 'Hindi' | 'English'): Promise<{ question: string, options: string[] }> => {
    try {
        const prompt = `
        Translate the following Question and its Options from their current language to ${targetLanguage}.
        
        Question: "${text}"
        Options: ${JSON.stringify(options)}

        Ensure the translation is accurate for an academic/exam context.
        Use inline LaTeX for Math ($\\displaystyle \\frac{a}{b}$) if present.

        Return ONLY a JSON object with the following structure:
        {
          "question": "Translated question text",
          "options": ["Translated option 1", "Translated option 2", ...]
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['question', 'options']
                }
            }
        });

        const jsonString = response.text;
        if(!jsonString) throw new Error("Empty response from translation");
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Translation failed:", error);
        // Return original as fallback
        return { question: text, options: options };
    }
};

export const chatWithAssistant = async (history: { role: 'user' | 'model', text: string }[], newMessage: string, imageFile?: File): Promise<string> => {
    try {
        const parts: any[] = [];

        // Add system instruction to context
        let prompt = `You are MockTest AI Assistant. Your goal is to help students prepare for exams. 
        You solve problems, explain concepts, and provide motivation. 
        Keep answers concise, educational, and easy to understand.
        If the user provides an image of a question, solve it step-by-step.
        Use inline LaTeX ($ ... $) for math formulas. For fractions, use $\\displaystyle \\frac{a}{b}$.
        
        Conversation History:
        ${history.map(h => `${h.role === 'user' ? 'Student' : 'AI'}: ${h.text}`).join('\n')}
        
        Student: ${newMessage}`;

        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parts.push(imagePart);
            prompt += "\n[Attached Image]";
        }

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", // Using gemini-3-pro-preview for advanced reasoning and problem solving
            contents: { parts }
        });

        return response.text || "I'm sorry, I couldn't understand that. Could you please try again?";

    } catch (error) {
        console.error("Chat error:", error);
        return "I'm having trouble connecting right now. Please check your internet connection.";
    }
};
