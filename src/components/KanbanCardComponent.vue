<template>
    <li
        class="relative flex flex-col items-start p-4 mt-3 bg-white rounded-lg cursor-pointer bg-opacity-90 group hover:bg-opacity-100"
    >
        <button
            class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 mt-3 mr-2 text-gray-500 rounded hover:bg-gray-200 hover:text-gray-700 group-hover:flex"
        >
            <svg
                class="w-4 h-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                />
            </svg>
        </button>
        <div class="flex items-center text-xs font-semibold rounded-full">
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 shrink-0">
                    <img
                        class="w-full h-full"
                        :src="reservation.game.away_team.logo_url"
                    />
                </div>
                <div class="text-gray-900">
                    {{ reservation.game.away_team.location }}
                    {{ reservation.game.away_team.name }}
                </div>
            </div>
        </div>
        <div class="flex items-center gap-1 text-xs text-gray-400 my-2">
            <AvatarComponent
                :imageUrl="reservation.profile.avatar_url"
                :name="`${reservation.profile.first_name} ${reservation.profile.last_name}`"
                cssClasses="w-5 h-5 rounded-full"
            ></AvatarComponent>
            <div>
                {{ reservation.profile.first_name }}
                {{ reservation.profile.last_name }}
            </div>
        </div>
        <div class="flex items-center w-full text-xs text-gray-400 gap-2">
            <div class="flex items-center">
                🗓️
                <span class="ml-1 leading-none">{{
                    formatDate(reservation.game?.date.toString(), "EE MM/dd/yy")
                }}</span>
            </div>
            <div class="relative flex items-center ml-3">
                ⏰
                <span class="ml-1 leading-none">{{
                    formatDate(reservation.game.date.toString(), "h:mm aaa")
                }}</span>
            </div>
            <div class="flex items-center ml-3">
                👀
                <span class="ml-1 leading-none">1</span>
            </div>
        </div>
    </li>
</template>

<script lang="ts">
import type { PropType } from "vue";
import type { Reservation } from "../core/types/games.model";
import { formatDate } from "../core/functions/date-format";
import { CalendarIcon, ClockIcon } from "@heroicons/vue/24/solid";
import AvatarComponent from "./AvatarComponent.vue";

export default {
    components: {
        CalendarIcon,
        ClockIcon,
        AvatarComponent,
    },
    props: {
        reservation: {
            type: Object as PropType<Reservation>,
            required: true,
        },
    },
    setup() {
        return {
            formatDate,
        };
    },
};
</script>
