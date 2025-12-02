// lib/types.ts

export interface ScheduleMeetingRequest {
  selectedDate: string;   // "YYYY-MM-DD"
  selectedTime: string;   // "HH:MM"
  timezone: string;       // IANA
  name: string;
  email: string;
  companyName: string;
  companyNiche: string;
  notes?: string;         // Optional notes for the booking
}
