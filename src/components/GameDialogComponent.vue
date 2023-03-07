<template>
    <DialogComponent
        v-if="selectedGame"
        title=""
        :isOpen="modalOpen"
        @closeModal="closeSelectedGameDialog()"
    >
        <div>
            <dl class="mt-6 mb-20 divide-y divide-neutral-500 overflow-hidden">
                <div
                    class="flex justify-between items-center py-3 text-sm font-medium"
                >
                    <dt class="shrink-0 mr-4">Away Team</dt>
                    <dd class="text-right">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 shrink-0">
                                <img
                                    class="w-full h-full"
                                    :src="selectedGame.away_team.logo_url"
                                />
                            </div>
                            <div class="opacity-80">
                                {{ selectedGame?.away_team.location }}
                                {{ selectedGame?.away_team.name }}
                            </div>
                        </div>
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt>Date</dt>
                    <dd class="whitespace-nowrap opacity-80">
                        {{
                            formatDate(
                                selectedGame?.date.toString(),
                                "MMMM dd, yyyy"
                            )
                        }}
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt>Time</dt>
                    <dd class="whitespace-nowrap opacity-80">
                        {{
                            formatDate(
                                selectedGame?.date.toString(),
                                "h:mm aaa"
                            )
                        }}
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt>Day of week</dt>
                    <dd class="whitespace-nowrap opacity-80">
                        {{ formatDate(selectedGame?.date.toString(), "EEEE") }}
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt>Status</dt>
                    <dd class="whitespace-nowrap">
                        <span>{{ getGameStatus(selectedGame, false) }}</span>
                        <span class="opacity-80"
                            >({{
                                getGameStatus(selectedGame, true, true)
                            }})</span
                        >
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt>Tickets</dt>
                    <dd class="whitespace-nowrap flex items-center gap-2">
                        <div class="opacity-80">{{ selectedGame.seats }}</div>
                        <button @click="previewDialogOpen = true">
                            <EyeIcon
                                class="h-5 cursor-pointer text-secondary hover:text-secondary-focus"
                            ></EyeIcon>
                        </button>
                    </dd>
                </div>
                <div
                    class="flex justify-between py-3 text-sm font-medium"
                    v-if="selectedGame.ticket_price"
                >
                    <dt>Price per ticket</dt>
                    <dd class="whitespace-nowrap">
                        <div class="opacity-80">
                            {{ formatter.format(selectedGame.ticket_price) }}
                        </div>
                    </dd>
                </div>
                <div
                    class="flex justify-between py-3 text-sm font-medium"
                    v-if="selectedGame.notes"
                >
                    <dt>Notes</dt>
                    <dd class="whitespace-nowrap">
                        <div class="opacity-80">
                            {{ selectedGame.notes }}
                        </div>
                    </dd>
                </div>
                <div
                    class="flex justify-between py-3 text-sm font-medium items-center"
                    v-if="selectedGameWeather"
                >
                    <dt>Weather</dt>
                    <dd class="whitespace-nowrap flex items-center gap-2">
                        <img :src="getWeatherIcon().toString()" class="h-7" />
                        <div class="opacity-80">
                            {{ selectedGameWeather?.days![0].temp }}°
                        </div>
                    </dd>
                </div>
                <div
                    class="flex justify-between py-3 text-sm font-medium items-start"
                    v-if="selectedGameWaitlist && selectedGameWaitlist.length"
                >
                    <dt>Waitlist</dt>
                    <dd
                        class="whitespace-nowrap opacity-80 flex items-center gap-2"
                    >
                        <ol class="list-decimal">
                            <template
                                v-for="reservation in selectedGameWaitlist"
                            >
                                <li v-if="reservation.status === 'pending'">
                                    {{
                                        reservation.profile.username ??
                                        `${reservation.profile.first_name} ${reservation.profile.last_name}`
                                    }}
                                </li>
                            </template>
                        </ol>
                    </dd>
                </div>
            </dl>
            <div class="flex" :key="componentKey">
                <ButtonComponent
                    class="flex-1"
                    :style="'primary'"
                    @click="action"
                    :disabled="
                        userGameStatus === 'Unavailable' ||
                        userGameStatus === 'Request Cancellation'
                    "
                    :loading="selectedGameLoading"
                >
                    <span v-if="userGameStatus !== 'Request Cancellation'">{{
                        userGameStatus
                    }}</span>
                    <span v-if="userGameStatus === 'Request Cancellation'"
                        >Contact to request cancellation</span
                    >
                    <span
                        v-if="userGameStatus === 'Express Interest'"
                        class="ml-2"
                        >👀</span
                    >
                </ButtonComponent>
                <!-- <button
                    @click="toggleFavorite"
                    type="button"
                    class="ml-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <HeartIcon v-if="!userFavorite" class="h-5"></HeartIcon>
                    <div v-else>❤️</div>
                </button> -->
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
            class="mt-4 mb-1 mx-auto w-max rounded-md flex items-center border border-gray-300 bg-base-100 py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
            <div>View Full Preview</div>
            <ArrowUpOnSquareIcon class="h-4 ml-1 -mt-0.5"></ArrowUpOnSquareIcon>
        </a>
    </DialogComponent>
</template>

<script lang="ts">
import { ArrowUpOnSquareIcon } from "@heroicons/vue/24/outline";
import { EyeIcon } from "@heroicons/vue/24/solid";

import { ref, type PropType } from "vue";
import { formatDate } from "../core/functions/date-format";
import { getGameStatus } from "../core/functions/games";
import type {
    Game,
    Reservation,
    UserGameStatus,
    WeatherResponse,
} from "../core/types/games.model";
import DialogComponent from "../components/DialogComponent.vue";
import ButtonComponent from "../components/ButtonComponent.vue";
import { formatter } from "../core/functions/currency-format";

export default {
    props: {
        modalOpen: {
            type: Boolean,
            required: true,
        },
        selectedGame: {
            type: Object as PropType<Game | undefined>,
            required: true,
        },
        selectedGameWeather: {
            type: Object as PropType<WeatherResponse | undefined>,
            required: false,
        },
        selectedGameWaitlist: {
            type: Array as PropType<Reservation[] | undefined>,
            required: false,
        },
        userGameStatus: {
            type: String as PropType<UserGameStatus>,
            required: true,
        },
        componentKey: {
            type: Number,
            required: true,
        },
        selectedGameLoading: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        DialogComponent,
        ButtonComponent,
        EyeIcon,
        ArrowUpOnSquareIcon,
    },
    emits: ["close", "action"],
    setup(props, { emit }) {
        const previewDialogOpen = ref<boolean>(false);

        function closeSelectedGameDialog() {
            emit("close");
        }

        function action() {
            emit("action");
        }

        function getWeatherIcon() {
            return new URL(
                `../assets/weather-icons/${
                    props.selectedGameWeather?.days![0].icon
                }.svg`,
                import.meta.url
            );
        }

        return {
            previewDialogOpen,
            formatter,
            closeSelectedGameDialog,
            formatDate,
            getGameStatus,
            getWeatherIcon,
            action,
        };
    },
};
</script>
