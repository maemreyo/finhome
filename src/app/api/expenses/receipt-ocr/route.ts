// src/app/api/expenses/receipt-ocr/route.ts
// OCR endpoint for extracting data from receipt images using Gemini AI API
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Request validation schema
const ocrRequestSchema = z.object({
  imageUrl: z.string().url(),
  userId: z.string().uuid().optional(), // For validation purposes
});

// OCR response type
interface OCRResult {
  success: boolean;
  data?: {
    amount?: number;
    merchant_name?: string;
    transaction_date?: string;
    description?: string;
    category_suggestion?: string;
  };
  error?: string;
  confidence?: number;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl } = ocrRequestSchema.parse(body);

    // Validate image URL is from our storage
    if (!imageUrl.includes("supabase.co") && !imageUrl.includes("receipts")) {
      return NextResponse.json(
        {
          error: "Invalid image URL. Only uploaded receipt images are allowed.",
        },
        { status: 400 }
      );
    }

    // Process image with Gemini AI
    const result = await processReceiptWithGemini(imageUrl);

    return NextResponse.json(result);
  } catch (error) {
    console.error("OCR processing error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to process receipt image",
      },
      { status: 500 }
    );
  }
}

async function processReceiptWithGemini(imageUrl: string): Promise<OCRResult> {
  try {
    // Fetch image data
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Create Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Craft prompt for Vietnamese receipt extraction
    const prompt = `
Analyze this Vietnamese receipt/invoice image and extract the following information in JSON format:

Please extract:
1. "amount" - The total amount as a number (without currency symbols)
2. "merchant_name" - The store/business name
3. "transaction_date" - Date in YYYY-MM-DD format (if available)
4. "description" - Brief description of the purchase or main items
5. "category_suggestion" - Suggest a category from: food_dining, transportation, shopping, bills_utilities, entertainment, healthcare, education, travel, gifts_charity, personal_care, other

Rules:
- Return ONLY valid JSON format
- If information is not found, use null for that field
- For amounts, extract only numbers (remove VND, đ, commas, dots used as thousands separators)
- For dates, convert to YYYY-MM-DD format
- For categories, choose the most appropriate one based on the merchant/items
- For Vietnamese text, maintain Vietnamese characters in merchant names and descriptions

Example output:
{
  "amount": 125000,
  "merchant_name": "Cửa hàng ABC",
  "transaction_date": "2025-01-15",
  "description": "Mua sắm tạp hóa",
  "category_suggestion": "food_dining"
}
`;

    // Process image with Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const extractedData = JSON.parse(jsonMatch[0]);

      // Validate and clean extracted data
      const cleanedData = {
        amount: extractedData.amount ? Number(extractedData.amount) : null,
        merchant_name: extractedData.merchant_name || null,
        transaction_date: extractedData.transaction_date || null,
        description: extractedData.description || null,
        category_suggestion: extractedData.category_suggestion || null,
      };

      // Remove null values
      const finalData = Object.fromEntries(
        Object.entries(cleanedData).filter(([_, value]) => value !== null)
      );

      return {
        success: true,
        data: finalData,
        confidence: 0.85, // Estimated confidence for Gemini AI
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return {
        success: false,
        error: "Failed to parse OCR results from AI response",
      };
    }
  } catch (error) {
    console.error("Gemini AI processing error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to process image with AI",
    };
  }
}

// GET method for testing purposes (development only)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Method not allowed in production" },
      { status: 405 }
    );
  }

  return NextResponse.json({
    message: "OCR API endpoint is working",
    supportedMethods: ["POST"],
    expectedBody: {
      imageUrl: "string (URL to uploaded receipt image)",
    },
    response: {
      success: "boolean",
      data: {
        amount: "number",
        merchant_name: "string",
        transaction_date: "string (YYYY-MM-DD)",
        description: "string",
        category_suggestion: "string",
      },
      confidence: "number (0-1)",
    },
  });
}
