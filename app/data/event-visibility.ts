export function todayInLisbon(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

export function isCurrentEvent(event: { startDate: string; endDate: string | null }, today = todayInLisbon()): boolean {
  return (event.endDate ?? event.startDate) >= today;
}
