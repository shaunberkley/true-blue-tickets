<template>
    <main class="w-full h-full overflow-auto">
        <div class="mx-auto max-w-7xl pb-10 lg:py-4 px-2 lg:px-8 overflow-auto">
            <div class="mb-6">
                <h1 class="font-bold text-xl">
                    2023 Season - Los Angeles Dodgers
                </h1>
            </div>
            <CalendarComponent
                v-if="games && games.length"
                :games="games"
                @selectGame="selectGame"
                :startMonth="startMonth - 1"
                :startYear="startYear"
                :key="componentKey"
            ></CalendarComponent>
        </div>
    </main>

    <GameDialogComponent
        v-if="games && games.length && selectedGame"
        :modalOpen="viewGameOpen"
        :selectedGame="selectedGame"
        :selectedGameWaitlist="selectedGameWaitlist"
        :selectedGameWeather="selectedGameWeather"
        :selectedGameLoading="selectedGameLoading"
        :userGameStatus="userGameStatus"
        :componentKey="componentKey"
        @close="closeSelectedGameDialog"
        @action="gameActionClicked()"
    ></GameDialogComponent>
</template>

<script lang="ts">
import { computed, onMounted, ref, toRefs, type ComputedRef } from "vue";
import CalendarComponent from "../components/Calendar.vue";
import DialogComponent from "../components/DialogComponent.vue";
import formatDate from "../core/functions/date-format";
import {
    favoriteGame,
    gameAction,
    getGameStatus,
    getWeather,
    removeFavoriteGame,
    removeReservation,
    requestGame,
    getUserGameStatus,
} from "../core/functions/games";
import { supabase } from "../core/functions/supabase";
import type {
    Favorite,
    Game,
    Reservation,
    UserGameStatus,
    WeatherResponse,
} from "../core/types/games.model";
import { userSessionStore } from "../store";
import { HeartIcon, ArrowUpOnSquareIcon } from "@heroicons/vue/24/outline";
import { HeartIcon as SolidHeartIcon, EyeIcon } from "@heroicons/vue/24/solid";
import { useAuthStore } from "../store/auth";
import { useRoute } from "vue-router";
import router from "../router";
import ButtonComponent from "../components/ButtonComponent.vue";
import GameDialogComponent from "../components/GameDialogComponent.vue";

export default {
    components: {
        CalendarComponent,
        DialogComponent,
        ButtonComponent,
        GameDialogComponent,
        HeartIcon,
        SolidHeartIcon,
        EyeIcon,
        ArrowUpOnSquareIcon,
    },
    setup() {
        const loading = ref(true);
        const games = ref<Game[]>();
        const ƒavorites = ref<Favorite[]>();

        const selectedGame = ref<Game>();
        const selectedGameWeather = ref<WeatherResponse>();
        const viewGameOpen = ref<boolean>(false);
        const selectedGameLoading = ref<boolean>(false);

        const componentKey = ref<number>(0);

        const startMonth = ref<number>(2);
        const startYear = ref<number>(new Date().getFullYear());

        const user = useAuthStore().currentUser?.user;

        const route = useRoute();
        const currentDateRoute = computed(() =>
            route.params && route.params.date
                ? route.params.date.toString()
                : null
        );

        onMounted(() => {
            getGames();
            const yearFromRoute = parseInt(
                currentDateRoute.value?.split("-")[0] ?? ""
            );
            const monthFromRoute = parseInt(
                currentDateRoute.value?.split("-")[1] ?? ""
            );

            if (route.params.date) {
                startMonth.value = monthFromRoute < 3 ? 3 : monthFromRoute;
                startYear.value = yearFromRoute;
            } else {
                let currentMonth = new Date().getMonth();
                startMonth.value = currentMonth < 3 ? 3 : currentMonth;
                router.push({
                    name: "schedule date",
                    params: { date: `${startYear.value}-${startMonth.value}` },
                });
            }
        });

        const userFavorite = computed(() => {
            if (selectedGame.value) {
                const userFavorite = selectedGame.value.favorites.find(
                    (fav: Favorite) => fav.profile.id === user?.id
                );
                return userFavorite;
            } else return undefined;
        });

        const userReservation = computed(() => {
            if (selectedGame.value) {
                const userGame = selectedGame.value.reservations.find(
                    (res: Reservation) => res.profile.id === user?.id
                );
                return userGame;
            } else return undefined;
        });

        const selectedGameReservation = computed(() => {
            if (selectedGame.value) {
                const reservation = selectedGame.value.reservations.find(
                    (res: Reservation) => res.status === "confirmed"
                );
                return reservation;
            } else return undefined;
        });

        const selectedGameWaitlist = computed(() => {
            if (selectedGame.value && selectedGameReservation.value) {
                const waitlist = selectedGame.value.reservations.filter(
                    (res: Reservation) => res.status === "pending"
                );
                return waitlist;
            } else return undefined;
        });

        const userGameStatus: ComputedRef<UserGameStatus> = computed(() => {
            return getUserGameStatus(selectedGame.value, user);
        });

        async function getGames(resetSelected?: boolean) {
            try {
                loading.value = true;
                let { data, error, status } = await supabase.from("games")
                    .select(`
                *,
                reservations(
                    *,
                    profile(*)
                ),
                favorites(
                    *,
                    profile(*),
                    game(*)
                ),
                away_team:teams!games_away_team_fkey(
                    *,
                    league:leagues(*),
                    division:divisions(*)                
                )                
            `);
                if (error && status !== 406) throw error;
                if (data) {
                    games.value = data;
                    if (resetSelected)
                        selectedGame.value = data.find(
                            (e: Game) => e.id === selectedGame.value?.id
                        );
                }
            } catch (error: any) {
                alert(error.message);
            } finally {
                loading.value = false;
                selectedGameLoading.value = false;
            }
            componentKey.value++;
        }

        function toggleFavorite() {
            if (userFavorite.value)
                removeFavoriteGame(userFavorite.value?.id).then(() =>
                    getGames(true)
                );
            else {
                if (selectedGame.value)
                    favoriteGame(selectedGame.value, user?.id ?? "").then(() =>
                        getGames(true)
                    );
            }
        }

        async function selectGame(game: Game) {
            if (game) {
                selectedGame.value = game;
                viewGameOpen.value = true;

                selectedGameWeather.value = await getWeather(
                    formatDate(game.date.toString(), "yyyy-MM-dd")
                );
            }
        }

        function closeSelectedGameDialog() {
            viewGameOpen.value = false;
            selectedGame.value = undefined;
            selectedGameWeather.value = undefined;
        }

        async function gameActionClicked() {
            selectedGameLoading.value = true;
            await gameAction(
                userGameStatus.value,
                userReservation.value,
                selectedGame.value,
                user
            );
            await getGames(true);
        }

        return {
            games,
            selectedGame,
            viewGameOpen,
            userGameStatus,
            userFavorite,
            selectedGameWeather,
            startMonth,
            startYear,
            selectedGameLoading,
            componentKey,
            selectedGameWaitlist,
            userReservation,
            user,
            formatDate,
            selectGame,
            getGameStatus,
            toggleFavorite,
            closeSelectedGameDialog,
            gameActionClicked,
        };
    },
};
</script>
