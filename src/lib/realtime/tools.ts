// lib/realtime/tools.ts
/**
 * Tool argument types (TypeScript) for internal use.
 * These are NOT sent to the model directly, but we base the JSON schema on them.
 */

export interface CheckAvailabilityArgs {
  date: string;      // YYYY-MM-DD
  timezone: string;  // IANA time zone (e.g. "America/New_York")
}

/**
 * We'll reuse ScheduleMeetingRequest for book_meeting arguments:
 * - selectedDate
 * - selectedTime
 * - timezone
 * - name
 * - email
 * - companyName
 * - companyNiche
 */


/**
 * OpenAI tool schema for check_availability.
 * This describes the input JSON the model must provide for the function call.
 */
export const checkAvailabilityTool = {
  type: "function",
  name: "check_availability",
  description: "Check my available meeting slots for a specific date and timezone.",
  parameters: {
    type: "object",
    properties: {
      date: {
        type: "string",
        description: "The date to check in YYYY-MM-DD format (e.g. '2025-12-03')."
      },
      timezone: {
        type: "string",
        description: "IANA timezone identifier (e.g. 'America/New_York')."
      }
    },
    required: ["date", "timezone"]
  }
} as const;

/**
 * OpenAI tool schema for book_meeting.
 * The arguments line up with ScheduleMeetingRequest.
 */
export const bookMeetingTool = {
  type: "function",
  name: "book_meeting",
  description: "Book a meeting using Cal.com. IMPORTANT: Before calling this function, you must first ask the user for their name, email, and a description of the meeting (including purpose, attendees, and agenda). Only call this function once you have collected all required information: date, time, timezone, name, email, and description.",
  parameters: {
    type: "object",
    properties: {
      selectedDate: {
        type: "string",
        description: "The date for the meeting in YYYY-MM-DD format."
      },
      selectedTime: {
        type: "string",
        description: "The start time in HH:MM 24-hour format in the user's timezone."
      },
      timezone: {
        type: "string",
        description: "IANA timezone for the attendee, e.g. 'America/New_York'."
      },
      name: {
        type: "string",
        description: "Name of the attendee to appear on the booking."
      },
      email: {
        type: "string",
        description: "Email of the attendee for calendar invite."
      },
      descriptionOfMeeting: {
        type: "string",
        description: "A description of the meeting, including the purpose of the meeting, the attendees, and the agenda."
      }
    },
    required: [
      "selectedDate",
      "selectedTime",
      "timezone",
      "name",
      "email",
      "descriptionOfMeeting"
    ]
  }
} as const;

/**
 * Export an array of tools to attach to the Realtime session.
 */
export const realtimeTools = [checkAvailabilityTool, bookMeetingTool];
