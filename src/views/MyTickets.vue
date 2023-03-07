<template>
    <main class="w-full h-full overflow-auto">
        <div
            class="mx-auto max-w-7xl pb-10 pt-4 lg:py-4 px-4 lg:px-8 overflow-auto"
        >
            <div class="flex flex-col gap-8">
                <div>
                    <h2 class="text-2xl font-bold mb-2">Reservations</h2>
                    <ul
                        role="list"
                        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <GameCardComponent
                            v-for="res in confirmedReservations"
                            :reservation="res"
                            @selectReservation="selectReservation(res)"
                        ></GameCardComponent>
                    </ul>
                </div>
                <div>
                    <h2 class="text-2xl font-bold mb-2">Waitlist</h2>
                    <ul
                        role="list"
                        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <GameCardComponent
                            v-for="res in waitlistReservations"
                            :reservation="res"
                            @selectReservation="selectReservation(res)"
                        ></GameCardComponent>
                    </ul>
                </div>
                <div>
                    <h2 class="text-2xl font-bold mb-2">Interests</h2>
                    <ul
                        role="list"
                        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <GameCardComponent
                            v-for="res in interestsReservations"
                            :reservation="res"
                            @selectReservation="selectReservation(res)"
                        ></GameCardComponent>
                    </ul>
                </div>
            </div>
        </div>
    </main>
    <GameDialogComponent
        v-if="reservations && reservations.length && selectedReservation"
        :selectedGame="selectedReservation?.game"
        :modalOpen="viewGameOpen"
        :selectedGameWaitlist="selectedGameWaitlist"
        :selectedGameWeather="selectedReservationWeather"
        :selectedGameLoading="selectedReservationLoading"
        :userGameStatus="userGameStatus"
        :componentKey="componentKey"
        @close="closeSelectedGameDialog"
        @action="gameActionClicked"
    ></GameDialogComponent>
</template>

<script lang="ts">
import { onMounted, ref, computed, type ComputedRef, type PropType } from "vue";
import { supabase } from "../core/functions/supabase";
import type {
    Game,
    Reservation,
    UserGameStatus,
    WeatherResponse,
} from "../core/types/games.model";
import { useAuthStore } from "../store/auth";
import { formatDate } from "../core/functions/date-format";
import {
    getWeather,
    gameAction,
    getUserGameStatus,
} from "../core/functions/games";
import GameDialogComponent from "../components/GameDialogComponent.vue";
import GameCardComponent from "../components/GameCardComponent.vue";

export default {
    components: { GameDialogComponent, GameCardComponent },
    props: {
        userId: {
            type: String,
            required: false,
        },
    },
    setup(props) {
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

        const userGameStatus: ComputedRef<UserGameStatus> = computed(() => {
            return getUserGameStatus(selectedReservation.value?.game, user);
        });

        const selectedGameWaitlist = computed(() => {
            if (selectedReservation.value?.game && selectedReservation.value) {
                const waitlist =
                    selectedReservation.value?.game.reservations.filter(
                        (res: Reservation) => res.status === "pending"
                    );
                return waitlist;
            } else return undefined;
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
                        res.profile.id === (props.userId ?? user?.id) &&
                        res.status === "confirmed"
                );
                return res;
            });

        const waitlistReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                const res = reservations.value?.filter((res: Reservation) => {
                    return (
                        confirmedGames.value.includes(res.game.id) &&
                        res.profile.id === (props.userId ?? user?.id) &&
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
                        res.profile.id === (props.userId ?? user?.id)
                );

                return res;
            });

        const declinedReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                return reservations.value?.filter(
                    (res: Reservation) =>
                        res.status === "declined" &&
                        res.profile.id === (props.userId ?? user?.id)
                );
            });

        async function getReservations(resetSelected?: boolean) {
            try {
                let { data, error, status } = await supabase.from(
                    "reservations"
                ).select(`
                        *,
                        profile(*),
                        game(*, away_team(*), reservations(*, profile(*)))
                    `);
                if (error && status !== 406) throw error;
                if (data) {
                    reservations.value = data;
                    if (resetSelected)
                        selectedReservation.value = data.find(
                            (e: Reservation) =>
                                e.id === selectedReservation.value?.id
                        );
                }
            } catch (error: any) {
                alert(error.message);
            } finally {
                selectedReservationLoading.value = false;
            }
            componentKey.value++;
        }

        async function selectReservation(reservation: Reservation) {
            if (reservation) {
                selectedReservation.value = reservation;
                viewGameOpen.value = true;

                selectedReservationWeather.value = await getWeather(
                    formatDate(reservation.game.date.toString(), "yyyy-MM-dd")
                );
            }
        }

        async function gameActionClicked() {
            selectedReservationLoading.value = true;
            await gameAction(
                userGameStatus.value,
                selectedReservation.value,
                selectedReservation.value?.game,
                user
            );
            await getReservations(true);
        }

        function closeSelectedGameDialog() {
            viewGameOpen.value = false;
            selectedReservation.value = undefined;
            selectedReservationWeather.value = undefined;
        }

        return {
            reservations,
            confirmedReservations,
            waitlistReservations,
            interestsReservations,
            confirmedGames,
            selectedReservation,
            selectedReservationWeather,
            viewGameOpen,
            componentKey,
            userGameStatus,
            selectedReservationLoading,
            selectedGameWaitlist,
            formatDate,
            selectReservation,
            gameActionClicked,
            closeSelectedGameDialog,
        };
    },
};
</script>
