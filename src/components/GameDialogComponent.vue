<template>
    <DialogComponent
        v-if="selectedGame"
        title=""
        :isOpen="modalOpen"
        @closeModal="closeSelectedGameDialog()"
    >
        <div>
            <dl
                class="mt-6 mb-20 divide-y divide-gray-200 border-gray-200 overflow-hidden"
            >
                <div
                    class="flex justify-between items-center py-3 text-sm font-medium"
                >
                    <dt class="text-gray-500 shrink-0 mr-4">Away Team</dt>
                    <dd class="text-right text-gray-900">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 shrink-0">
                                <img
                                    class="w-full h-full"
                                    :src="selectedGame.away_team.logo_url"
                                />
                            </div>
                            <div class="text-gray-900">
                                {{ selectedGame?.away_team.location }}
                                {{ selectedGame?.away_team.name }}
                            </div>
                        </div>
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
                    <dt class="text-gray-500">Status</dt>
                    <dd class="whitespace-nowrap text-gray-900">
                        {{ getGameStatus(selectedGame, true) }}
                    </dd>
                </div>
                <div class="flex justify-between py-3 text-sm font-medium">
                    <dt class="text-gray-500">Tickets</dt>
                    <dd
                        class="whitespace-nowrap text-gray-900 flex items-center gap-2"
                    >
                        <div>{{ selectedGame.seats }}</div>
                        <button @click="previewDialogOpen = true">
                            <EyeIcon
                                class="h-5 cursor-pointer text-indigo-600 hover:text-indigo-500"
                            ></EyeIcon>
                        </button>
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
                <div
                    class="flex justify-between py-3 text-sm font-medium items-start"
                    v-if="selectedGameWaitlist && selectedGameWaitlist.length"
                >
                    <dt class="text-gray-500">Waitlist</dt>
                    <dd
                        class="whitespace-nowrap text-gray-900 flex items-center gap-2"
                    >
                        <ol class="list-decimal">
                            <template
                                v-for="reservation in selectedGameWaitlist"
                            >
                                <li v-if="reservation.status === 'pending'">
                                    {{ reservation.profile.username }}
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
                    :disabled="userGameStatus === 'Unavailable'"
                    :loading="selectedGameLoading"
                >
                    <span>{{ userGameStatus }}</span>
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
            class="mt-4 mb-1 mx-auto w-max rounded-md flex items-center border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
import formatDate from "../core/functions/date-format";
import { getGameStatus } from "../core/functions/games";
import type {
    Game,
    Reservation,
    UserGameStatus,
    WeatherResponse,
} from "../core/types/games.model";
import DialogComponent from "../components/DialogComponent.vue";
import ButtonComponent from "../components/ButtonComponent.vue";

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
            closeSelectedGameDialog,
            formatDate,
            getGameStatus,
            getWeatherIcon,
            action,
        };
    },
};
</script>
