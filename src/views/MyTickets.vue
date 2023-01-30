<template>
    <main class="w-full h-full overflow-auto">
        <div
            class="mx-auto max-w-7xl pb-10 pt-4 lg:py-12 px-4 lg:px-8 overflow-auto"
        >
            <div class="flex flex-col gap-8">
                <div>
                    <h2 class="text-2xl font-bold">Reservations</h2>
                    <ul
                        role="list"
                        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <li
                            v-for="res in confirmedReservations"
                            :key="res.id"
                            class="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
                        >
                            <div
                                class="flex w-full items-center justify-between space-x-6 p-6"
                            >
                                <img
                                    class="h-10 w-10 flex-shrink-0"
                                    :src="res.game.away_team.logo_url"
                                    alt=""
                                />
                                <div class="flex-1 truncate">
                                    <div class="flex items-center space-x-3">
                                        <h3
                                            class="truncate text-sm font-medium text-gray-900"
                                        >
                                            {{ res.game.away_team.name }}
                                        </h3>
                                    </div>
                                    <time
                                        :attr.datetime="`${res.game.date}`"
                                        class="mt-1 truncate text-sm text-gray-500"
                                        >{{
                                            formatDate(
                                                res.game.date.toString(),
                                                "MMMM dd, yyyy h:mm aaa"
                                            )
                                        }}</time
                                    >
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div>
                    <h2 class="text-2xl font-bold">Waitlist</h2>
                    <ul
                        role="list"
                        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <li
                            v-for="res in waitlistReservations"
                            :key="res.id"
                            class="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
                        >
                            <div
                                class="flex w-full items-center justify-between space-x-6 p-6"
                            >
                                <img
                                    class="h-10 w-10 flex-shrink-0"
                                    :src="res.game.away_team.logo_url"
                                    alt=""
                                />
                                <div class="flex-1 truncate">
                                    <div class="flex items-center space-x-3">
                                        <h3
                                            class="truncate text-sm font-medium text-gray-900"
                                        >
                                            {{ res.game.away_team.name }}
                                        </h3>
                                    </div>
                                    <time
                                        :attr.datetime="`${res.game.date}`"
                                        class="mt-1 truncate text-sm text-gray-500"
                                        >{{
                                            formatDate(
                                                res.game.date.toString(),
                                                "MMMM dd, yyyy h:mm aaa"
                                            )
                                        }}</time
                                    >
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div>
                    <h2 class="text-2xl font-bold">Interests</h2>
                    <ul
                        role="list"
                        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <li
                            v-for="res in interestsReservations"
                            :key="res.id"
                            class="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
                        >
                            <div
                                class="flex w-full items-center justify-between space-x-6 p-6"
                            >
                                <img
                                    class="h-10 w-10 flex-shrink-0"
                                    :src="res.game.away_team.logo_url"
                                    alt=""
                                />
                                <div class="flex-1 truncate">
                                    <div class="flex items-center space-x-3">
                                        <h3
                                            class="truncate text-sm font-medium text-gray-900"
                                        >
                                            {{ res.game.away_team.name }}
                                        </h3>
                                    </div>
                                    <time
                                        :attr.datetime="`${res.game.date}`"
                                        class="mt-1 truncate text-sm text-gray-500"
                                        >{{
                                            formatDate(
                                                res.game.date.toString(),
                                                "MMMM dd, yyyy h:mm aaa"
                                            )
                                        }}</time
                                    >
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </main>
</template>

<script lang="ts">
import { onMounted, ref, computed, type ComputedRef } from "vue";
import { supabase } from "../core/functions/supabase";
import type {
    Game,
    Reservation,
    WeatherResponse,
} from "../core/types/games.model";
import { useAuthStore } from "../store/auth";
import formatDate from "../core/functions/date-format";

export default {
    components: {},
    setup() {
        const user = useAuthStore().currentUser?.user;

        const reservations = ref<Reservation[]>();
        const games = ref<Game[]>();
        const userGames = ref<Game[]>();
        const selectedReservation = ref<Reservation>();
        const selectedReservationWeather = ref<WeatherResponse>();
        const viewGameOpen = ref<boolean>(false);
        const selectedReservationLoading = ref<boolean>(false);
        const previewDialogOpen = ref<boolean>(false);

        const componentKey = ref<number>(0);

        onMounted(() => {
            getReservations();
        });

        const confirmedGames: ComputedRef<number[]> = computed(() => {
            const res = reservations.value
                ?.filter((res: Reservation) => res.status === "confirmed")
                .map((res: Reservation) => res.game.id) as number[];
            return [...new Set(res)];
        });

        const confirmedReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                const res = reservations.value?.filter(
                    (res: Reservation) =>
                        res.profile.id === user?.id &&
                        res.status === "confirmed"
                );
                return res;
            });

        const waitlistReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                const res = reservations.value?.filter((res: Reservation) => {
                    return (
                        confirmedGames.value.includes(res.game.id) &&
                        res.profile.id === user?.id &&
                        res.status === "pending"
                    );
                });
                return res;
            });

        const interestsReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                const res = reservations.value?.filter(
                    (res: Reservation) =>
                        !confirmedGames.value.includes(res.game.id) &&
                        res.status === "pending" &&
                        res.profile.id === user?.id
                );

                return res;
            });

        const declinedReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                return reservations.value?.filter(
                    (res: Reservation) =>
                        res.status === "declined" && res.profile.id === user?.id
                );
            });

        async function getReservations(resetSelected?: boolean) {
            try {
                let { data, error, status } = await supabase.from(
                    "reservations"
                ).select(`
                        *,
                        profile(*),
                        game(*, away_team(*))
                    `);
                if (error && status !== 406) throw error;
                if (data) {
                    reservations.value = data;
                }
            } catch (error: any) {
                alert(error.message);
            } finally {
                selectedReservationLoading.value = false;
            }
            componentKey.value++;
        }

        return {
            confirmedReservations,
            waitlistReservations,
            interestsReservations,
            confirmedGames,
            formatDate,
        };
    },
};
</script>
