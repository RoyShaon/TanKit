import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms) {
      return NextResponse.json(
        { error: "Symptoms are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const prompt = `Based on the following symptoms in Bengali, suggest homeopathic remedies. Please analyze the symptoms and provide:

1. Top remedy from Materia Medica with detailed explanation
2. List of other potential remedies
3. Categorized symptoms analysis

Symptoms: ${symptoms}

Please respond in JSON format with the following structure:
{
  "topRemedyFromMateriaMedica": {
    "name": "Remedy name",
    "description": "Detailed description in Bengali",
    "potency": "Suggested potency",
    "dosage": "Dosage instructions in Bengali"
  },
  "remedies": [
    {
      "name": "Remedy name",
      "confidence": "percentage",
      "reasoning": "Why this remedy matches in Bengali"
    }
  ],
  "categorizedSymptoms": {
    "mental": ["mental symptoms"],
    "physical": ["physical symptoms"],
    "general": ["general symptoms"]
  }
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "Failed to get remedy suggestions",
      );
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Try to parse JSON from response
    let suggestions;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      suggestions = {
        topRemedyFromMateriaMedica: {
          name: "Arsenicum Album",
          description: "সাধারণ উদ্বেগ ও অস্থিরতার জন্য কার্যকর",
          potency: "30C",
          dosage: "দিনে ৩ বার ৫ ফোঁটা",
        },
        remedies: [
          {
            name: "Arsenicum Album",
            confidence: "High",
            reasoning: "উদ্বেগ ও অস্থিরতার জন্য উপযুক্ত",
          },
        ],
        categorizedSymptoms: {
          mental: [],
          physical: [],
          general: [],
        },
      };
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Remedy suggestion error:", error);
    return NextResponse.json(
      {
        error:
          "সাজেশন আনতে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার সংযোগ বা API কী পরীক্ষা করে আবার চেষ্টা করুন।",
      },
      { status: 500 },
    );
  }
}
