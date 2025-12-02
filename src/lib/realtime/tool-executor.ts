// lib/realtime/tool-executor.ts
import { getAvailableSlots } from "@/lib/cal-availability";
import { createCalBooking } from "@/lib/cal-api";
import type { ScheduleMeetingRequest } from "@/lib/types";
import type { CheckAvailabilityArgs } from "./tools";

/**
 * Shape of a parsed tool call we accumulate from events.
 */
export interface ParsedToolCall {
  id: string;
  name: string;
  argumentsJson: string; // raw JSON string from the model
}

/**
 * Execute a tool call by name with JSON arguments.
 *
 * @param toolCall Parsed tool call with id, name, and argumentsJson
 * @returns A plain JS object that will be JSON.stringified and sent back to the model
 */
export async function executeToolCall(
  toolCall: ParsedToolCall
): Promise<unknown> {
  // 1. Parse the JSON arguments sent by the model
  let parsedArgs: unknown;
  try {
    parsedArgs = JSON.parse(toolCall.argumentsJson || "{}");
  } catch (err) {
    console.error("[Tool Executor] Failed to parse tool arguments:", err, {
      raw: toolCall.argumentsJson
    });
    return {
      error: "INVALID_TOOL_ARGUMENTS",
      message: "Could not parse tool arguments as JSON."
    };
  }

  // 2. Dispatch based on tool name
  switch (toolCall.name) {
    case "check_availability":
      return handleCheckAvailability(parsedArgs as CheckAvailabilityArgs);

    case "book_meeting":
      return handleBookMeeting(parsedArgs as ScheduleMeetingRequest);

    default:
      console.warn("[Tool Executor] Unknown tool name:", toolCall.name);
      return {
        error: "UNKNOWN_TOOL",
        message: `No handler implemented for tool: ${toolCall.name}`
      };
  }
}

/**
 * Handle check_availability tool.
 */
async function handleCheckAvailability(
  args: CheckAvailabilityArgs
): Promise<{
  date: string;
  timezone: string;
  availableSlots: string[];
}> {
  const { date, timezone } = args;

  if (!date || !timezone) {
    return {
      date: date ?? "",
      timezone: timezone ?? "",
      availableSlots: []
    };
  }

  console.log("[Tool Executor] check_availability called with:", args);

  const availableSlots = await getAvailableSlots(date, timezone);

  return {
    date,
    timezone,
    availableSlots
  };
}

/**
 * Handle book_meeting tool.
 */
async function handleBookMeeting(
  args: ScheduleMeetingRequest
): Promise<{
  meetingId?: string;
  success: boolean;
  error?: string;
}> {
  console.log("[Tool Executor] book_meeting called with:", args);

  try {
    const meetingId = await createCalBooking(args);

    return {
      success: true,
      meetingId
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown booking error";

    console.error("[Tool Executor] book_meeting error:", error);

    return {
      success: false,
      error: message
    };
  }
}
