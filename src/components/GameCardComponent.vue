<template>
    <li
        :key="reservation.id"
        tabindex="0"
        class="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow cursor-pointer"
        @click="selectReservation()"
        @keyup.enter="selectReservation()"
    >
        <div class="flex w-full items-center justify-between space-x-6 p-6">
            <img
                class="h-10 w-10 flex-shrink-0"
                :src="reservation.game.away_team.logo_url"
                alt=""
            />
            <div class="flex-1 truncate">
                <div class="flex items-center space-x-3">
                    <h3 class="truncate text-sm font-medium text-gray-900">
                        {{ reservation.game.away_team.name }}
                    </h3>
                </div>
                <time
                    :attr.datetime="`${reservation.game.date}`"
                    class="mt-1 truncate text-sm text-gray-500"
                    >{{
                        formatDate(
                            reservation.game.date.toString(),
                            "MMMM dd, yyyy h:mm aaa"
                        )
                    }}</time
                >
            </div>
        </div>
    </li>
</template>

<script lang="ts">
import type { PropType } from "vue";
import formatDate from "../core/functions/date-format";
import type { Reservation } from "../core/types/games.model";

export default {
    props: {
        reservation: {
            type: Object as PropType<Reservation>,
            required: true,
        },
    },
    components: {},
    emits: ["selectReservation"],
    setup(props, { emit }) {
        function selectReservation() {
            emit("selectReservation", props.reservation);
        }

        return {
            formatDate,
            selectReservation,
        };
    },
};
</script>
