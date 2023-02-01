<template>
    <!-- Component Start -->
    <div
        class="flex flex-col w-screen h-full overflow-y-hidden text-gray-700 bg-gray-50"
    >
        <div class="flex flex-grow px-10 mt-4 space-x-6">
            <div
                class="flex flex-col flex-shrink-0 w-full max-w-[300px] h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden"
            >
                <div class="flex items-center flex-shrink-0 h-10 px-2">
                    <span class="block text-sm font-semibold">Interests</span>
                    <span
                        class="flex items-center justify-center w-5 h-5 ml-2 text-sm font-semibold text-indigo-500 bg-white rounded bg-opacity-30"
                        >{{ interestsReservations?.length }}</span
                    >
                </div>
                <div class="flex flex-col pb-2 overflow-auto pr-2">
                    <ul class="flex flex-col pb-2 overflow-auto pr-2">
                        <KanbanCardComponent
                            v-for="reservation in interestsReservations"
                            :reservation="reservation"
                        ></KanbanCardComponent>
                    </ul>
                </div>
            </div>
            <div
                class="flex flex-col flex-shrink-0 w-full max-w-[300px] h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden"
            >
                <div class="flex items-center flex-shrink-0 h-10 px-2">
                    <span class="block text-sm font-semibold"
                        >Confirmed Reservations</span
                    >
                    <span
                        class="flex items-center justify-center w-5 h-5 ml-2 text-sm font-semibold text-indigo-500 bg-white rounded bg-opacity-30"
                        >{{ confirmedReservations?.length }}</span
                    >
                </div>
                <div class="flex flex-col pb-2 overflow-auto">
                    <ul class="flex flex-col pb-2 overflow-auto pr-2">
                        <KanbanCardComponent
                            v-for="reservation in confirmedReservations"
                            :reservation="reservation"
                        ></KanbanCardComponent>
                    </ul>
                </div>
            </div>
            <div
                class="flex flex-col flex-shrink-0 w-full max-w-[300px] h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden"
            >
                <div class="flex items-center flex-shrink-0 h-10 px-2">
                    <span class="block text-sm font-semibold"
                        >Declined Reservations</span
                    >
                    <span
                        class="flex items-center justify-center w-5 h-5 ml-2 text-sm font-semibold text-indigo-500 bg-white rounded bg-opacity-30"
                        >{{ declinedReservations?.length }}</span
                    >
                </div>
                <div class="flex flex-col pb-2 overflow-auto">
                    <ul class="flex flex-col pb-2 overflow-auto pr-2">
                        <KanbanCardComponent
                            v-for="reservation in declinedReservations"
                            :reservation="reservation"
                        ></KanbanCardComponent>
                    </ul>
                </div>
            </div>
            <div class="flex-shrink-0 w-6"></div>
        </div>
    </div>
    <!-- Component End -->
</template>

<script lang="ts">
import { computed, onMounted, ref, type ComputedRef } from "vue";
import KanbanCardComponent from "../components/KanbanCardComponent.vue";
import { supabase } from "../core/functions/supabase";
import type { Reservation, WeatherResponse } from "../core/types/games.model";

export default {
    components: {
        KanbanCardComponent,
    },
    setup() {
        const reservations = ref<Reservation[]>();
        const selectedReservation = ref<Reservation>();
        const selectedReservationWeather = ref<WeatherResponse>();
        const selectedReservationLoading = ref<boolean>(false);

        const componentKey = ref<number>(0);

        const confirmedGames: ComputedRef<number[]> = computed(() => {
            const res = reservations.value
                ?.filter((res: Reservation) => res.status === "confirmed")
                .map((res: Reservation) => res.game.id) as number[];
            return [...new Set(res)];
        });

        const confirmedReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                const res = reservations.value?.filter(
                    (res: Reservation) => res.status === "confirmed"
                );
                return res;
            });

        const waitlistReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                const res = reservations.value?.filter((res: Reservation) => {
                    return (
                        confirmedGames.value.includes(res.game.id) &&
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
                        res.status === "pending"
                );

                return res;
            });

        const declinedReservations: ComputedRef<Reservation[] | undefined> =
            computed(() => {
                return reservations.value?.filter(
                    (res: Reservation) => res.status === "declined"
                );
            });

        onMounted(() => {
            getReservations();
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
            interestsReservations,
            confirmedReservations,
            declinedReservations,
        };
    },
};
</script>

<style lang="scss">
.moving-card {
    @apply opacity-50 bg-gray-100 border border-blue-500;
}
</style>
