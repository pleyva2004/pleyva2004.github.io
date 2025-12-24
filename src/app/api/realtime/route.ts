import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Realtime Route] Missing OPENAI_API_KEY env var");
      return NextResponse.json(
        { error: "SERVER_CONFIG_ERROR", message: "OPENAI_API_KEY is not set." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Realtime Route] OpenAI API error: ${response.status}`, errorText);
      return NextResponse.json(
        { error: "OPENAI_API_ERROR", message: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("[Realtime Route] Error generating session:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to generate session." },
      { status: 500 }
    );
  }
}
