import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "SERVER_CONFIG_ERROR", message: "OPENAI_API_KEY is not set." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime=v1"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        modalities: ["text", "audio"]
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("[Session Route] Failed to create session:", response.status, details);
      return NextResponse.json(
        { error: "OPENAI_SESSION_ERROR", message: "Failed to create OpenAI session." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const clientSecret = data?.client_secret?.value ?? data?.client_secret ?? null;

    if (!clientSecret) {
      console.error("[Session Route] Missing client_secret in response:", data);
      return NextResponse.json(
        { error: "OPENAI_SESSION_ERROR", message: "No client secret returned from OpenAI." },
        { status: 500 }
      );
    }

    return NextResponse.json({ clientSecret });
  } catch (error) {
    console.error("[Session Route] Unexpected error:", error);
    return NextResponse.json(
      { error: "OPENAI_SESSION_ERROR", message: "Unexpected error creating session." },
      { status: 500 }
    );
  }
}

