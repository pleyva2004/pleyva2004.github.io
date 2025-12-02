// lib/cal-availability.ts

type CalSlot = { time?: string } | string;

interface CalAvailabilityResponse {
  data?: {
    slots?: Record<string, CalSlot[]>;
  };
}

/**
 * Get available meeting slots from Cal.com for a specific date and timezone.
 *
 * @param date - Date in YYYY-MM-DD format
 * @param timezone - IANA timezone identifier (e.g., "America/New_York")
 * @returns Array of available time slots in HH:MM format
 */
export async function getAvailableSlots(
  date: string,
  timezone: string
): Promise<string[]> {
  const apiKey = process.env.CAL_API_KEY;
  const eventTypeId = process.env.CAL_EVENT_TYPE_ID;
  const apiVersion = process.env.CAL_API_VERSION || "2024-08-13";

  if (!apiKey || !eventTypeId) {
    console.error("[Cal.com] Missing CAL_API_KEY or CAL_EVENT_TYPE_ID");
    return [];
  }

  console.log(`[Cal.com] Fetching availability for ${date} in ${timezone}`);

  try {
    // Cal.com API v2 endpoint for availability
    const url = new URL("https://api.cal.com/v2/slots/available");
    url.searchParams.append("startTime", `${date}T00:00:00`);
    url.searchParams.append("endTime", `${date}T23:59:59`);
    url.searchParams.append("eventTypeId", eventTypeId);
    url.searchParams.append("timeZone", timezone);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "cal-api-version": apiVersion,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error(`[Cal.com] API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[Cal.com] Error details:`, errorText);
      return [];
    }

    const data = (await response.json()) as CalAvailabilityResponse;
    console.log("[Cal.com] Availability response:", data);

    // Extract time slots from the response
    // Cal.com returns slots organized by date: { "2025-12-05": [...] }
    const slotsData = data.data?.slots ?? {};

    // Get slots for the specific date
    const slotsForDate = slotsData[date] ?? [];

    console.log(`[Cal.com] Slots for ${date}:`, slotsForDate);

    // Extract just the time from each slot
    const timeSlots = slotsForDate
      .map((slot) => {
        const timeString = typeof slot === "string" ? slot : slot.time;
        if (!timeString) {
          return null;
        }

        const time = new Date(timeString);

        return time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: timezone
        });
      })
      .filter((slot): slot is string => Boolean(slot));

    console.log(`[Cal.com] Found ${timeSlots.length} available slots:`, timeSlots);

    return timeSlots;
  } catch (error) {
    console.error("[Cal.com] Error fetching availability:", error);
    return [];
  }
}
