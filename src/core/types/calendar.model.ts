import type { Game } from "./games.model";

export interface Day {
    day: number;
    date: Date;
}

export interface CalendarObject {
    calendar: CalendarItem[];
    days: number;
    firstWeekday: number;
    lastWeekday: number;
    month: string;
    monthAbbr: string;
    weekdays: string[];
    weekdaysAbbr: string[];
    year: string;
    yearAbbr: string;
}

export interface CalendarItem {
    day: number;
    date: Date;
    games: Game[];
}
