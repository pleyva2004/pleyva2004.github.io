// lib/cal-api.ts
import type { ScheduleMeetingRequest } from "./types";

/**
 * Create a booking on Cal.com.
 *
 * @param eventData - Meeting booking details
 * @returns Meeting ID/UID from Cal.com
 */
export async function createCalBooking(
  eventData: ScheduleMeetingRequest
): Promise<string> {
  const apiKey = process.env.CAL_API_KEY;
  const eventTypeId = process.env.CAL_EVENT_TYPE_ID;
  const apiVersion = process.env.CAL_API_VERSION || "2024-08-13";

  if (!apiKey || !eventTypeId) {
    throw new Error("Missing CAL_API_KEY or CAL_EVENT_TYPE_ID environment variables");
  }

  console.log("[Cal.com] Creating booking with data:", eventData);

  // Validate required fields
  if (!eventData.selectedDate || !eventData.selectedTime) {
    throw new Error("Missing required fields: selectedDate or selectedTime");
  }

  if (!eventData.email || !eventData.name) {
    throw new Error("Missing required fields: email or name");
  }

  try {
    // Combine date and time into ISO format with timezone
    // Create a proper ISO timestamp in the user's timezone
    const dateTimeString = `${eventData.selectedDate}T${eventData.selectedTime}:00`;
    const dateInTz = new Date(dateTimeString);

    // Format as ISO string that Cal.com expects
    const startTime = dateInTz.toISOString();

    console.log(`[Cal.com] Start time: ${startTime} (from ${dateTimeString} in ${eventData.timezone})`);

    // Generate notes from company info if not provided
    const notes = eventData.notes ||
      `Company: ${eventData.companyName}\nNiche: ${eventData.companyNiche}`;

    // Prepare booking data for Cal.com API v2
    const bookingData = {
      eventTypeId: parseInt(eventTypeId),
      start: startTime,
      attendee: {
        name: eventData.name,
        email: eventData.email,
        timeZone: eventData.timezone,
        language: "en"
      },
      bookingFieldsResponses: {
        notes: notes
      }
    };

    console.log("[Cal.com] Sending booking request:", bookingData);

    const response = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "cal-api-version": apiVersion,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Cal.com] Booking failed: ${response.status} ${response.statusText}`);
      console.error(`[Cal.com] Error details:`, errorText);
      throw new Error(`Cal.com booking failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[Cal.com] Booking created successfully:", data);

    // Extract booking ID/UID from response
    const bookingId = data.data?.id || data.data?.uid || data.id || data.uid;

    if (!bookingId) {
      console.error("[Cal.com] No booking ID in response:", data);
      throw new Error("No booking ID returned from Cal.com");
    }

    console.log(`[Cal.com] ✅ Booking created with ID: ${bookingId}`);

    return bookingId.toString();
  } catch (error) {
    console.error("[Cal.com] Error creating booking:", error);
    throw error;
  }
}
