export const PrivateNavLinks = [
  { imageUrl: "/assets/events.png", route: "/events", label: "My Events" },
  {
    imageUrl: "/assets/schedule.png",
    route: "/schedule",
    label: "My Schedule",
  },
  { imageUrl: "/assets/profile.png", route: "/book", label: "Public Profile" },
] as const;

// Common timezones for easier selection
export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
] as const;

// Day display names
export const DAY_NAMES = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
} as const;

// Helper function to get timezone offset display (e.g., "UTC+8", "UTC-5")
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    });

    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((part) => part.type === "timeZoneName");

    if (offsetPart?.value) {
      // Convert GMT±XX:XX to UTC±XX format
      return offsetPart.value.replace("GMT", "UTC").replace(":00", "");
    }

    return "UTC+0";
  } catch {
    return "";
  }
}

// Helper function to format timezone for display
export function formatTimezoneDisplay(timezone: string): string {
  const offset = getTimezoneOffset(timezone);
  const cityName = timezone.split("/").pop()?.replace(/_/g, " ") || timezone;
  return `${cityName} (${offset})`;
}
