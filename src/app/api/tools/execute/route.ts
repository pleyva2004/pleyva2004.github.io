import { NextRequest, NextResponse } from "next/server";
import { executeToolCall, type ParsedToolCall } from "@/lib/realtime/tool-executor";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: {
    id?: string;
    name?: string;
    arguments?: string | Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch (error) {
    console.error("[Tools Execute] Failed to parse request body:", error);
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (!body?.name) {
    return NextResponse.json(
      { error: "MISSING_NAME", message: "Tool name is required." },
      { status: 400 }
    );
  }

  const parsedToolCall: ParsedToolCall = {
    id: body.id ?? "client_tool_call",
    name: body.name,
    argumentsJson:
      typeof body.arguments === "string"
        ? body.arguments
        : JSON.stringify(body.arguments ?? {})
  };

  try {
    const result = await executeToolCall(parsedToolCall);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[Tools Execute] Tool execution failed:", error);
    return NextResponse.json(
      { error: "TOOL_EXECUTION_FAILED", message: "Tool execution failed." },
      { status: 500 }
    );
  }
}

