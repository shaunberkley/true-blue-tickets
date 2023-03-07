import type { User } from "@supabase/supabase-js";
import type { Game, Reservation, UserGameStatus } from "../types/games.model";
import { supabase } from "./supabase";

export function getGameStatus(
    game: Game,
    showText?: boolean,
    onlyText?: boolean
) {
    if (!game.blackout) {
        if (
            game.reservations.filter(
                (res: Reservation) => res.status === "confirmed"
            ).length
        )
            if (onlyText) return "Reserved";
            else return `🚫 ${showText ? "(Reserved)" : ""}`;
        const numberOfInterests: number = game.reservations.filter(
            (res: Reservation) => res.status === "pending"
        ).length;
        if (numberOfInterests > 0)
            return `${!onlyText ? "👀 " : ""}${numberOfInterests} ${
                showText ? "interested" : ""
            }`;
        return `${!onlyText ? "✅ " : ""}${showText ? "Available" : ""}`;
    } else {
        if (onlyText) return "Blackout";
        else return `⚫️ ${showText ? "(Blackout)" : ""}`;
    }
}

export async function gameAction(
    userGameStatus: UserGameStatus,
    userReservation: Reservation | undefined,
    selectedGame: Game | undefined,
    user: User | undefined
) {
    if (
        userGameStatus === "Express Interest" ||
        userGameStatus === "Join Waitlist"
    ) {
        await requestGame(selectedGame, user?.id ?? "");
    }

    if (
        userGameStatus === "Cancel Interest" ||
        userGameStatus === "Request Cancellation" ||
        userGameStatus === "Leave Waitlist"
    ) {
        await removeReservation(userReservation?.id ?? "");
    }

    return;
}

export function getUserGameStatus(
    selectedGame: Game | undefined,
    user: User | undefined
): UserGameStatus {
    if (selectedGame) {
        const userGame = selectedGame.reservations.find(
            (res: Reservation) => res.profile.id === user?.id
        );
        if (!selectedGame.blackout) {
            if (userGame) {
                console.log(userGame.status);
                switch (userGame?.status) {
                    case "confirmed":
                        return "Request Cancellation";
                    case "pending":
                        if (
                            selectedGame.reservations.filter(
                                (res: Reservation) => res.status === "confirmed"
                            ).length
                        ) {
                            return "Leave Waitlist";
                        } else return "Cancel Interest";
                    case "declined":
                        return "Unavailable";
                }
            } else {
                if (
                    selectedGame.reservations.filter(
                        (res: Reservation) => res.status === "confirmed"
                    ).length
                ) {
                    return "Join Waitlist";
                } else return "Express Interest";
            }
        } else return "Unavailable";
    } else return "Express Interest";
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
