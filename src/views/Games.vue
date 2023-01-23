<template>
    <main class="w-full h-full overflow-auto">
        <div class="mx-auto max-w-7xl pb-10 lg:py-12 lg:px-8 overflow-auto">
            <CalendarComponent
                v-if="games && games.length"
                :games="games"
                @selectGame="selectGame"
                :startMonth="startMonth - 1"
                :startYear="startYear"
            ></CalendarComponent>
        </div>
    </main>

    <DialogComponent
        v-if="games && games.length && selectedGame"
        title=""
        :isOpen="viewGameOpen"
        @closeModal="closeSelectedGameDialog()"
    >
        <div class="flex items-center gap-4">
            <div class="w-20 h-20 border border-gray-100 p-3 rounded-full">
                <img
                    class="w-full h-full"
                    :src="selectedGame.away_team.logo_url"
                />
            </div>
            <h2 class="text-xl">
                {{ selectedGame?.away_team.location }}
                {{ selectedGame?.away_team.name }}
            </h2>
        </div>
        <div class="mt-6">
            <h3 class="font-medium text-gray-900">Game Information</h3>
            <dl
                class="mt-3 mb-20 divide-y divide-gray-200 border-t border-b border-gray-200"
            >
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt class="text-gray-500">Status</dt>
                    <dd class="whitespace-nowrap text-gray-900">
                        {{ getGameStatus(selectedGame.reservations) }}
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt class="text-gray-500">Date</dt>
                    <dd class="whitespace-nowrap text-gray-900">
                        {{
                            formatDate(
                                selectedGame?.date.toString(),
                                "MMMM dd, yyyy"
                            )
                        }}
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt class="text-gray-500">Time</dt>
                    <dd class="whitespace-nowrap text-gray-900">
                        {{
                            formatDate(
                                selectedGame?.date.toString(),
                                "h:mm aaa"
                            )
                        }}
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt class="text-gray-500">Day of week</dt>
                    <dd class="whitespace-nowrap text-gray-900">
                        {{ formatDate(selectedGame?.date.toString(), "EEEE") }}
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt class="text-gray-500">Tickets</dt>
                    <dd
                        class="whitespace-nowrap text-gray-900 flex items-center gap-2"
                    >
                        <div>{{ selectedGame.seats }}</div>
                        <EyeIcon
                            @click="previewDialogOpen = true"
                            class="h-5 cursor-pointer text-indigo-600 hover:text-indigo-500"
                        ></EyeIcon>
                    </dd>
                </div>
                <div
                    class="flex justify-between py-3 text-sm font-medium items-center"
                    v-if="selectedGameWeather"
                >
                    <dt class="text-gray-500">Weather</dt>
                    <dd
                        class="whitespace-nowrap text-gray-900 flex items-center gap-2"
                    >
                        <img :src="getWeatherIcon().toString()" class="h-7" />
                        <div>{{ selectedGameWeather?.days![0].temp }}°</div>
                    </dd>
                </div>
            </dl>
            <div class="flex">
                <button
                    @click="gameAction"
                    type="button"
                    class="flex-1 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {{ userGameStatus }}
                </button>
                <button
                    @click="toggleFavorite"
                    type="button"
                    class="ml-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <HeartIcon v-if="!userFavorite" class="h-6 w-6"></HeartIcon>
                    <SolidHeartIcon
                        v-else
                        class="h-6 w-6 text-red-500"
                    ></SolidHeartIcon>
                </button>
            </div>
        </div>
    </DialogComponent>

    <DialogComponent
        title="Seat Preview"
        :isOpen="previewDialogOpen"
        @closeModal="previewDialogOpen = false"
        maxWidth="w-max"
    >
        <div
            class="overflow-auto max-h-[calc(100vh-8rem)] flex justify-center flex-col"
        >
            <div class="h-max w-max max-w-5xl mx-auto my-4">
                <img src="../assets/seat-preview.png" />
            </div>
        </div>
        <a
            :href="selectedGame?.seat_view"
            target="_blank"
            type="button"
            class="mt-4 mb-1 mx-auto w-max rounded-md flex items-center border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
            <div>View Full Preview</div>
            <ArrowUpOnSquareIcon class="h-4 ml-1 -mt-0.5"></ArrowUpOnSquareIcon>
        </a>
    </DialogComponent>
</template>

<script lang="ts">
import { computed, onMounted, ref, toRefs } from "vue";
import CalendarComponent from "../components/Calendar.vue";
import DialogComponent from "../components/DialogComponent.vue";
import formatDate from "../core/functions/date-format";
import {
    favoriteGame,
    getGameStatus,
    getWeather,
    removeFavoriteGame,
    removeReservation,
    requestGame,
} from "../core/functions/games";
import { supabase } from "../core/functions/supabase";
import type {
    Favorite,
    Game,
    Reservation,
    WeatherResponse,
} from "../core/types/games.model";
import { userSessionStore } from "../store";
import { HeartIcon, ArrowUpOnSquareIcon } from "@heroicons/vue/24/outline";
import { HeartIcon as SolidHeartIcon, EyeIcon } from "@heroicons/vue/24/solid";
import { useAuthStore } from "../store/auth";
import { useRoute } from "vue-router";
import router from "../router";

export default {
    components: {
        CalendarComponent,
        DialogComponent,
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
        const previewDialogOpen = ref<boolean>(false);

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
                    name: "game date",
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

        const userGameStatus = computed(() => {
            if (selectedGame.value) {
                const userGame = selectedGame.value.reservations.find(
                    (res: Reservation) => res.profile.id === user?.id
                );
                if (userGame) {
                    switch (userGame?.status) {
                        case "confirmed":
                            return "Cancel Interest";
                        case "pending":
                            return "Cancel Interest";
                        case "declined":
                            return "Unavailable";
                    }
                } else return "Express Interest";
            } else return "Express Interest";
        });

        async function getGames() {
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
                }
            } catch (error: any) {
                alert(error.message);
            } finally {
                loading.value = false;
            }
        }

        async function gameAction() {
            if (userGameStatus.value === "Express Interest") {
                await requestGame(selectedGame.value, user?.id ?? "");
            }

            if (userGameStatus.value === "Cancel Interest") {
                await removeReservation(userReservation.value?.id ?? "");
            }

            getGames();
        }

        function toggleFavorite() {
            if (userFavorite.value) removeFavoriteGame(userFavorite.value?.id);
            else {
                if (selectedGame.value)
                    favoriteGame(selectedGame.value, user?.id ?? "");
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

        function getWeatherIcon() {
            return new URL(
                `../assets/weather-icons/${
                    selectedGameWeather.value?.days![0].icon
                }.svg`,
                import.meta.url
            );
        }

        return {
            games,
            selectedGame,
            viewGameOpen,
            userGameStatus,
            userFavorite,
            previewDialogOpen,
            selectedGameWeather,
            startMonth,
            startYear,
            formatDate,
            selectGame,
            getGameStatus,
            gameAction,
            toggleFavorite,
            getWeatherIcon,
            closeSelectedGameDialog,
        };
    },
};
</script>
