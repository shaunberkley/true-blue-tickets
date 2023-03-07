import type { Profile } from "./user.model";

export interface League {
    id: number;
    created_at: Date;
    updated_at: Date;
    name: string;
    abbreviation: string;
}

export interface Division {
    id: number;
    created_at: Date;
    updated_at: Date;
    name: string;
    name_short: string;
    league: number | League;
}

export interface Team {
    id: number;
    created_at: Date;
    updated_at: Date;
    abbreviation: string;
    name: string;
    location: string;
    logo_url: string;
    full_logo_url: string;
    league: League;
    division: Division;
}

export interface Interest {
    id: string;
    created_at: Date;
    updated_at: Date;
    game: number | Game;
    profile: Profile;
}

export type UserGameStatus =
    | "Express Interest"
    | "Request Cancellation"
    | "Join Waitlist"
    | "Leave Waitlist"
    | "Cancel Interest"
    | "Unavailable";

export interface Reservation {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: "pending" | "confirmed" | "declined";
    game: Game;
    profile: Profile;
}

export interface Favorite {
    id: string;
    created_at: Date;
    profile: Profile;
    game: Game;
}

export interface Game {
    id: number;
    created_at: Date;
    updated_at: Date;
    date: Date;
    away_team: Team;
    home_team: Team;
    seats: string;
    interests: Interest[];
    reservations: Reservation[];
    favorites: Favorite[];
    seat_view: string;
    blackout: boolean;
    ticket_price?: number;
    notes?: string;
}

export interface WeatherResponse {
    queryCost: number;
    latitude: number;
    longitude: number;
    resolvedAddress: string;
    address: string;
    timezone: string;
    tzoffset: number;
    days?: DaysEntity[] | null;
}

export interface DaysEntity {
    datetime: string;
    datetimeEpoch: number;
    tempmax: number;
    tempmin: number;
    temp: number;
    feelslikemax: number;
    feelslikemin: number;
    feelslike: number;
    dew: number;
    humidity: number;
    precip: number;
    precipprob: number;
    precipcover: number;
    preciptype?: null;
    snow?: null;
    snowdepth?: null;
    windgust: number;
    windspeed: number;
    winddir: number;
    pressure: number;
    cloudcover: number;
    visibility: number;
    solarradiation?: null;
    solarenergy?: null;
    uvindex?: null;
    sunrise: string;
    sunriseEpoch: number;
    sunset: string;
    sunsetEpoch: number;
    moonphase: number;
    conditions: string;
    description: string;
    icon:
        | "snow"
        | "snow-showers-day"
        | "snow-showers-night"
        | "thunder-rain"
        | "thunder-showers-day"
        | "thunder-showers-night"
        | "rain"
        | "showers-day"
        | "showers-night"
        | "fog"
        | "wind"
        | "cloudy"
        | "partly-cloudy-day"
        | "partly-cloudy-night"
        | "clear-day"
        | "clear-night";
    stations?: null;
    source: string;
    normal: Normal;
}

export interface Normal {
    tempmax?: number[] | null;
    tempmin?: number[] | null;
    feelslike?: number[] | null;
    precip?: number[] | null;
    humidity?: number[] | null;
    snowdepth?: null[] | null;
    windspeed?: number[] | null;
    windgust?: number[] | null;
    winddir?: number[] | null;
    cloudcover?: number[] | null;
}
