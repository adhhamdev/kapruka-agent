/** Sri Lanka local time — used for delivery dates and occasion timing. */
export const AGENT_TIMEZONE = 'Asia/Colombo';

export function buildDateTimeContextMessage(now: Date = new Date()): string {
  const localDateTime = new Intl.DateTimeFormat('en-LK', {
    timeZone: AGENT_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(now);

  const isoDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: AGENT_TIMEZONE,
  }).format(now);

  return `[SYSTEM STATUS / CURRENT DATE AND TIME]
Current local time (${AGENT_TIMEZONE}): ${localDateTime}
Today's date (ISO): ${isoDate}
Use this for delivery dates, occasion timing (e.g. "tomorrow", "next week"), and any time-sensitive guidance. Do not guess the date or time.`;
}
