import { todayInLisbon } from "./event-visibility.ts";

function addDays(date: string, days: number): string {
  const calendarDate = new Date(`${date}T12:00:00Z`);
  calendarDate.setUTCDate(calendarDate.getUTCDate() + days);
  return calendarDate.toISOString().slice(0, 10);
}

function weekday(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function dateRangeInLisbon(filter: string, now = new Date()): [string, string] | null {
  const today = todayInLisbon(now);
  if (/^\d{4}-\d{2}-\d{2}$/.test(filter)) return [filter, filter];
  if (filter === "hoje") return [today, today];
  if (filter === "amanha") {
    const tomorrow = addDays(today, 1);
    return [tomorrow, tomorrow];
  }
  if (filter === "7-dias") return [today, addDays(today, 6)];
  if (filter === "fim-de-semana") {
    const day = weekday(today);
    const saturday = addDays(today, day === 0 ? -1 : (6 - day));
    return [day === 0 ? today : saturday, addDays(saturday, 1)];
  }
  return null;
}

export function nextSevenDaysInLisbon(now = new Date()): { date: string; day: string; label: string; detail: string }[] {
  const today = todayInLisbon(now);
  const weekdayLabel = new Intl.DateTimeFormat("pt-PT", { weekday: "short", timeZone: "UTC" });
  const monthLabel = new Intl.DateTimeFormat("pt-PT", { month: "short", timeZone: "UTC" });
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index);
    const value = new Date(`${date}T12:00:00Z`);
    return {
      date,
      day: date.slice(8),
      label: index === 0 ? "HOJE" : index === 1 ? "AMANHÃ" : weekdayLabel.format(value).replace(".", "").toLocaleUpperCase("pt-PT"),
      detail: index === 0 ? "Agenda" : monthLabel.format(value).replace(".", "").toLocaleUpperCase("pt-PT"),
    };
  });
}
