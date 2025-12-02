// app/api/realtime/route.ts
import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws";
import { buildSessionConfig, type SessionMode } from "@/lib/realtime/session-config";
import { executeToolCall, type ParsedToolCall } from "@/lib/realtime/tool-executor";
import type { RealtimeEvent } from "@/lib/realtime/types";

export const runtime = "nodejs"; // Ensure Node runtime (needed for ws)

/**
 * Request body shape for this example.
 * You can extend this to include userId, initial prompt, etc.
 */
interface RealtimeRequestBody {
  mode?: SessionMode;     // "text" | "voice"
  userInput: string;      // initial text query from the user
  conversationHistory?: ConversationMessage[];  // previous messages in the conversation
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Atomic Step 1:
 * We expose a POST endpoint that will:
 * - parse the request
 * - connect to OpenAI Realtime WS
 * - send a single userInput
 * - capture all responses (text, tool calls, etc.)
 * - return them in a structured JSON format (for debugging / initial integration).
 *
 * Later, you can evolve this into a persistent WS or streaming interface.
 */
export async function POST(req: NextRequest) {
  // STEP 1: Parse request body safely
  let body: RealtimeRequestBody;
  try {
    body = (await req.json()) as RealtimeRequestBody;
  } catch (err) {
    console.error("[Realtime Route] Failed to parse JSON body:", err);
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  console.log("--------------------------------");
  console.log("Realtime Route called");
  console.log("Mode:", body.mode);
  console.log("User Input:", body.userInput);
  console.log("--------------------------------");

  const mode: SessionMode = body.mode ?? "text";
  const userInput = body.userInput;
  const conversationHistory = body.conversationHistory || [];

  if (!userInput || typeof userInput !== "string") {
    return NextResponse.json(
      { error: "MISSING_USER_INPUT", message: "userInput is required as a string." },
      { status: 400 }
    );
  }

  console.log(`[Realtime Route] Conversation history: ${conversationHistory.length} messages`);

  // STEP 2: Connect to OpenAI Realtime WebSocket
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[Realtime Route] Missing OPENAI_API_KEY env var");
    return NextResponse.json(
      { error: "SERVER_CONFIG_ERROR", message: "OPENAI_API_KEY is not set." },
      { status: 500 }
    );
  }

  const model = "gpt-4o-realtime-preview";

  console.log("[Realtime Route] Connecting to OpenAI Realtime API...");

  // We'll collect events into an array for returning in the HTTP response (demo).
  const collectedEvents: RealtimeEvent[] = [];

  // We'll wrap the entire WS session in a Promise so we can await it in the POST handler.
  const sessionPromise = new Promise<void>((resolve, reject) => {
    // Create a new WebSocket connection to OpenAI Realtime
    const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=${model}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

    // Keep track of an in-progress tool call (if any)
    let currentToolCall: ParsedToolCall | null = null;
    let toolExecuting = false; // Track if a tool is actively executing (async in progress)
    let lastResponseWasFunctionCall = false; // Track if the last response was a function call

    // STEP 3: On open, configure session + send user input
    ws.on("open", () => {
      console.log("[Realtime Route] ✅ WebSocket connected to OpenAI");

      // 3a. Build session config based on mode (text/voice) with tools attached
      const sessionConfig = buildSessionConfig({ mode });

      console.log("[Realtime Route] Sending session config and conversation history...");

      // 3b. Send session.update to configure tools, modalities, etc.
      ws.send(
        JSON.stringify({
          type: "session.update",
          session: sessionConfig
        })
      );

      // 3c. Add conversation history (previous messages)
      for (const msg of conversationHistory) {
        ws.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: msg.role,
              content: [
                {
                  type: "text", // Use "text" for completed messages in history
                  text: msg.content
                }
              ]
            }
          })
        );
      }

      // 3d. Add the current user message
      ws.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: userInput
              }
            ]
          }
        })
      );

      // 3e. Trigger the assistant to respond
      ws.send(
        JSON.stringify({
          type: "response.create"
        })
      );
    });

    // STEP 4: Handle incoming events from OpenAI
    ws.on("message", async (rawData: WebSocket.RawData) => {
      const messageString = rawData.toString("utf-8");
      let event: RealtimeEvent;

      try {
        event = JSON.parse(messageString) as RealtimeEvent;
      } catch (err) {
        console.error("[Realtime Route] Failed to parse OpenAI event JSON:", err, {
          raw: messageString
        });
        return;
      }

      // Log event type for debugging
      console.log("[Realtime Route] Received event:", event.type);

      // Log errors in detail
      if (event.type === "error") {
        console.error("[Realtime Route] ❌ OpenAI Error:", JSON.stringify(event, null, 2));
      }

      // Push every raw event for debugging purposes
      collectedEvents.push(event);

      // 4a. Handle text deltas (assistant output)
      if (event.type === "response.text.delta") {
        const textDelta = event.delta ?? "";
        process.stdout.write(textDelta); // server-side logging
      }

      // 4b. Handle audio deltas (voice mode) - you would buffer or stream this externally
      if (event.type === "response.audio.delta") {
        const audioDelta = event.delta; // base64 string or binary depending on config
        // For now, we just log that audio arrived.
        console.log("[Realtime Route] Received audio delta (length):", audioDelta?.length);
      }

      // 4c. Handle function call argument streaming
      if (event.type === "response.function_call_arguments.delta") {
        const delta = event.delta;

        // Initialize currentToolCall if we haven't yet
        if (!currentToolCall) {
          // Log the full event to see structure
          console.log("[Realtime Route] First function call delta event:", JSON.stringify(event, null, 2));

          currentToolCall = {
            id: event.item_id || event.call_id || "",
            name: event.name || event.function_name || "",
            argumentsJson: ""
          };

          console.log("[Realtime Route] Initialized tool call:", currentToolCall);
        }

        // Append new chunk of arguments JSON
        currentToolCall.argumentsJson += delta ?? "";
      }

      // 4d. When an output item is done, check if it's a function_call and execute tool
      if (event.type === "response.output_item.done") {
        const item = event.item;

        console.log("[Realtime Route] Output item done:", JSON.stringify(event, null, 2));

        if (item && item.type === "function_call" && currentToolCall) {
          toolExecuting = true; // Mark tool as actively executing
          lastResponseWasFunctionCall = true; // This response is a function call

          // If we still don't have a name, try to get it from the item
          if (!currentToolCall.name && item.name) {
            currentToolCall.name = item.name;
          }
          if (!currentToolCall.id && item.call_id) {
            currentToolCall.id = item.call_id;
          }

          console.log("[Realtime Route] Executing tool:", currentToolCall.name);
          console.log("[Realtime Route] Tool arguments:", currentToolCall.argumentsJson);

          // Execute the tool using our executor
          const toolResult = await executeToolCall(currentToolCall);

          console.log("[Realtime Route] Tool execution completed:", currentToolCall.name);
          toolExecuting = false; // Tool execution finished

          // Send result back via conversation.item.create with function_call_output
          ws.send(
            JSON.stringify({
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: item?.call_id,
                output: JSON.stringify(toolResult)
              }
            })
          );

          // Trigger another response to process the tool result
          ws.send(
            JSON.stringify({
              type: "response.create"
            })
          );

          // Clear the currentToolCall
          currentToolCall = null;
        } else if (item && item.type === "message") {
          // This is a text message response, not a function call
          lastResponseWasFunctionCall = false;
        }
      }

      // 4e. When the model indicates the response is done, we can end session
      if (event.type === "response.done") {
        // Don't close if a tool is currently executing
        if (toolExecuting) {
          console.log("\n[Realtime Route] Response done, but tool is still executing. Waiting...");
        }
        // If the last response was a function call, wait for the next response (after tool result)
        else if (lastResponseWasFunctionCall) {
          console.log("\n[Realtime Route] Function call completed, waiting for next response...");
        }
        // This is a text message response - we're done!
        else {
          console.log("\n[Realtime Route] ✅ Realtime response completed.");
          ws.close();
        }
      }
    });

    // STEP 5: Handle WS close & error
    ws.on("close", (code, reason) => {
      console.log("[Realtime Route] WebSocket closed:", { code, reason: reason.toString() });
      resolve();
    });

    ws.on("error", (err) => {
      console.error("[Realtime Route] WebSocket error:", err);
      reject(err);
    });
  });

  // Wait for the session to complete
  try {
    await sessionPromise;
  } catch (err) {
    console.error("[Realtime Route] Session error:", err);
    return NextResponse.json({ error: "SESSION_ERROR" }, { status: 500 });
  }

  console.log(`[Realtime Route] ✅ Session complete. Collected ${collectedEvents.length} events`);

  // Return all collected events for debugging/integration
  return NextResponse.json(
    {
      mode,
      userInput,
      events: collectedEvents
    },
    { status: 200 }
  );
}
