import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

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
                  text: `Please punctuate and properly format the following Bengali text, maintaining its meaning and adding appropriate punctuation marks (দাড়ি, কমা, etc.). Only return the corrected text without any additional explanation:

${text}`,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to punctuate text");
    }

    const punctuatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ punctuatedText });
  } catch (error) {
    console.error("Punctuation error:", error);
    return NextResponse.json(
      { error: "Failed to punctuate text" },
      { status: 500 },
    );
  }
}
