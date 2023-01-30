import type { Game, Reservation } from "../types/games.model";
import { supabase } from "./supabase";

export function getGameStatus(
    reservations: Reservation[],
    showText?: boolean,
    onlyText?: boolean
) {
    if (
        reservations.filter((res: Reservation) => res.status === "confirmed")
            .length
    )
        if (onlyText) return "Reserved";
        else return `🚫 ${showText ? "(Reserved)" : ""}`;
    const numberOfInterests: number = reservations.filter(
        (res: Reservation) => res.status === "pending"
    ).length;
    if (numberOfInterests > 0)
        return `👀 ${numberOfInterests} ${showText ? "interested" : ""}`;
    return `✅ ${showText ? "(Available)" : ""}`;
}

export async function requestGame(game: Game | undefined, profile: string) {
    if (game) {
        try {
            let { error, status } = await supabase.from("reservations").insert({
                game: game.id,
                profile: profile,
            });

            if (error && status !== 406) throw error;

            return status;
        } catch (error: any) {
            alert(error.message);
            return error;
        }
    }
}

export async function removeReservation(id: string) {
    if (id) {
        try {
            let { error, status } = await supabase
                .from("reservations")
                .delete()
                .eq("id", id);

            if (error && status !== 406) throw error;
            return status;
        } catch (error: any) {
            alert(error.message);
            return error;
        }
    }
}

export async function favoriteGame(game: Game, profile: string) {
    try {
        let { error, status } = await supabase.from("favorites").insert({
            game: game.id,
            profile: profile,
        });

        if (error && status !== 406) throw error;
        return;
    } catch (error: any) {
        alert(error.message);
        return;
    }
}

export async function removeFavoriteGame(id: string) {
    try {
        let { error, status } = await supabase
            .from("favorites")
            .delete()
            .eq("id", id);

        if (error && status !== 406) throw error;
        return status;
    } catch (error: any) {
        alert(error.message);
        return error;
    }
}

export async function getWeather(date: string) {
    const getUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/1000%20Vin%20Scully%20Ave%2C%20Los%20Angeles%2C%20CA%2090012/${date}/${date}?unitGroup=us&key=496RGPG78RWLSHABBQLP6D6AE&contentType=json`;
    try {
        return await fetch(getUrl, {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((responseJSON) => {
                // do stuff with responseJSON here...
                console.log(responseJSON);
                return responseJSON;
            });
    } catch (e) {
        console.error(e);
        return null;
    }
}

export function getWeatherDescriptionFromIconId(
    iconId: string
): string | undefined {
    return {
        snow: "Amount of snow is greater than zero",
        "snow-showers-day": "Periods of snow during the day",
        "snow-showers-night": "Periods of snow during the night",
        "thunder-rain": "Thunderstorms throughout the day or night",
        "thunder-showers-day": "Possible thunderstorms throughout the day",
        "thunder-showers-night": "Possible thunderstorms throughout the night",
        rain: "Amount of rainfall is greater than zero",
        "showers-day": "Rain showers during the day",
        "showers-night": "Rain showers during the night",
        fog: "Visibility is low (lower than one kilometer or mile)",
        wind: "Wind speed is high (greater than 30 kph or mph)",
        cloudy: "Cloud cover is greater than 90% cover",
        "partly-cloudy-day":
            "Cloud cover is greater than 20% cover during day time.",
        "partly-cloudy-night":
            "Cloud cover is greater than 20% cover during night time.",
        "clear-day": "Cloud cover is less than 20% cover during day time",
        "clear-night": "Cloud cover is less than 20% cover during night time",
    }[iconId];
}
