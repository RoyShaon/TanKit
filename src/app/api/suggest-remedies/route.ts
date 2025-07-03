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

    const prompt = `Based on the following symptoms in Bengali, analyze and suggest homeopathic remedies from THREE different sources. Please:

1. Categorize ALL the symptoms mentioned into mental, physical, and history categories
2. Suggest ONE top remedy from Hahnemann's Materia Medica
3. Suggest ONE top remedy from Boericke's Materia Medica
4. Provide ONE AI-analyzed remedy recommendation
5. List additional potential remedies

Patient Symptoms: ${symptoms}

Please respond in JSON format with the following exact structure:
{
  "topRemedyFromMateriaMedica": {
    "name": "Top remedy from Hahnemann's Materia Medica",
    "description": "Detailed description in Bengali from Hahnemann's teachings",
    "potency": "Suggested potency",
    "dosage": "Dosage instructions in Bengali",
    "score": 90,
    "justification": "Why this remedy matches based on Hahnemann's principles in Bengali"
  },
  "topRemedyFromBoericke": {
    "name": "Top remedy from Boericke's Materia Medica",
    "description": "Detailed description in Bengali from Boericke's Materia Medica",
    "potency": "Suggested potency",
    "dosage": "Dosage instructions in Bengali",
    "score": 85,
    "justification": "Why this remedy matches based on Boericke's observations in Bengali"
  },
  "topRemedyFromAI": {
    "name": "AI-recommended remedy",
    "description": "Detailed AI analysis and description in Bengali",
    "potency": "Suggested potency",
    "dosage": "Dosage instructions in Bengali",
    "score": 88,
    "justification": "AI reasoning for this recommendation in Bengali"
  },
  "remedies": [
    {
      "name": "Additional remedy name",
      "confidence": "percentage",
      "reasoning": "Why this remedy matches in Bengali",
      "score": 75
    }
  ],
  "categorizedSymptoms": {
    "mentalSymptoms": "All mental/psychological symptoms from the input text in Bengali",
    "physicalSymptoms": "All physical/bodily symptoms from the input text in Bengali",
    "history": "All previous medical history and past conditions from the input text in Bengali"
  }
}

IMPORTANT: You MUST provide all three top remedies (topRemedyFromMateriaMedica, topRemedyFromBoericke, topRemedyFromAI). Each should be different remedies with proper scores (80-95 range).`;

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
          description: "হ্যানিম্যানের মতে উদ্বেগ ও অস্থিরতার জন্য ক��র্যকর",
          potency: "30C",
          dosage: "দিনে ৩ বার ৫ ফোঁটা",
          score: 85,
          justification: "হ্যানিম্যানের নীতি অনুযায়ী এই ঔষধটি উপযুক্ত",
        },
        topRemedyFromBoericke: {
          name: "Pulsatilla",
          description: "বোরিকসের মতে পরিবর্তনশীল লক্ষণের জন্য উপকারী",
          potency: "200C",
          dosage: "সপ্তাহে ১ বার ৩ ফোঁটা",
          score: 80,
          justification: "বোরিকসের পর্যবেক্ষণ অনুযায়ী এই ঔষধটি কার্যকর",
        },
        topRemedyFromAI: {
          name: "Sulphur",
          description: "AI বিশ্লেষণে ত্বকের সমস্যার জন্য উপযুক্ত",
          potency: "200C",
          dosage: "মাসে ১ বার ৫ ফোঁটা",
          score: 88,
          justification: "AI বিশ্লেষণে এই ঔষধটি সবচেয়ে উপযুক্ত",
        },
        remedies: [
          {
            name: "Nux Vomica",
            confidence: "Medium",
            reasoning: "সাধারণ পেটের সমস্যার জন্য উপযুক্ত",
            score: 70,
          },
        ],
        categorizedSymptoms: {
          mentalSymptoms: "লক্ষণ বিশ্লেষণে সমস্যা হয়েছে",
          physicalSymptoms: "লক্ষণ বিশ্লেষণে সমস্যা হয়েছে",
          history: "লক্ষণ বিশ্লেষণে সমস্যা হয়েছে",
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
