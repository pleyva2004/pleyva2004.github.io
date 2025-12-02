import { NextRequest, NextResponse } from "next/server";
import { executeToolCall, type ParsedToolCall } from "@/lib/realtime/tool-executor";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const toolCall = (await req.json()) as ParsedToolCall;

        if (!toolCall.name) {
            return NextResponse.json(
                { error: "INVALID_REQUEST", message: "Tool name is required." },
                { status: 400 }
            );
        }

        console.log(`[Tools Route] Executing tool: ${toolCall.name}`);
        const result = await executeToolCall(toolCall);
        console.log(`[Tools Route] Tool execution completed: ${toolCall.name}`);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[Tools Route] Error executing tool:", error);
        return NextResponse.json(
            { error: "INTERNAL_ERROR", message: "Failed to execute tool." },
            { status: 500 }
        );
    }
}

