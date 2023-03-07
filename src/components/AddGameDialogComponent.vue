<template>
    <DialogComponent
        title="Add Game"
        :isOpen="modalOpen"
        @closeModal="closeAddGameDialog()"
    >
        <form class="space-y-6 mt-8" @submit.prevent="handleSubmit">
            <div class="mt-1">
                <DatepickerComponent
                    :enableDateTime="false"
                    v-model="date"
                    id="date"
                    name="date"
                    label="Date"
                ></DatepickerComponent>
            </div>

            <div class="mt-1">
                <SelectComponent
                    id="away_team"
                    name="away_team"
                    label="Away Team"
                    :required="true"
                    :items="allTeams"
                    v-model="away_team"
                ></SelectComponent>
            </div>

            <div class="mt-1">
                <InputComponent
                    v-model="ticket_price"
                    id="ticket_price"
                    name="ticket_price"
                    type="number"
                    autocomplete="ticket_price"
                    label="Ticket Price"
                    :required="true"
                ></InputComponent>
            </div>

            <div class="mt-1">
                <InputComponent
                    v-model="notes"
                    id="notes"
                    name="notes"
                    type="text"
                    autocomplete="notes"
                    label="Notes"
                    :required="false"
                ></InputComponent>
            </div>

            <div class="mt-1">
                <ToggleComponent
                    v-model="blackout"
                    label="Blackout"
                    name="blackout"
                    id="blackout"
                ></ToggleComponent>
            </div>

            <div>
                <ButtonComponent
                    :disabled="!formValid"
                    :style="'primary'"
                    class="w-full"
                    @click="handleSubmit"
                    >Add Game</ButtonComponent
                >
            </div>
        </form>
    </DialogComponent>
</template>

<script lang="ts">
import { computed, onMounted, ref, type PropType } from "vue";
import formatDate from "../core/functions/date-format";
import { supabase } from "../core/functions/supabase";
import DialogComponent from "../components/DialogComponent.vue";
import ButtonComponent from "../components/ButtonComponent.vue";
import InputComponent from "../components/InputComponent.vue";
import SelectComponent from "../components/SelectComponent.vue";
import DatepickerComponent from "../components/DatepickerComponent.vue";
import ToggleComponent from "../components/ToggleComponent.vue";

import { formatter } from "../core/functions/currency-format";
import type { Team } from "../core/types/games.model";
import type { SelectItem } from "./SelectComponent.vue";

export default {
    props: {
        modalOpen: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        DialogComponent,
        ButtonComponent,
        SelectComponent,
        InputComponent,
        DatepickerComponent,
        ToggleComponent,
    },
    emits: ["close", "gameAdded"],
    setup(props, { emit }) {
        const blackout = ref<boolean>(false);
        const notes = ref<string>();
        const ticket_price = ref<string>("170");
        const away_team = ref<SelectItem>();
        const date = ref<Date>();

        const allTeams = ref<SelectItem[]>();

        const formValid = computed(() => {
            return away_team.value && date.value;
        });

        onMounted(async () => {
            await getAllTeams();
            console.log(allTeams.value);
        });

        async function handleSubmit() {
            const { data, error } = await supabase
                .from("games")
                .insert({
                    date: date.value,
                    away_team: away_team.value?.value,
                    home_team: 119,
                    blackout: blackout.value,
                    ticket_price: parseInt(ticket_price.value),
                    notes: notes.value,
                })
                .select()
                .limit(1)
                .single();

            closeAddGameDialog();
            gameAdded();
            return;
        }

        async function getAllTeams() {
            try {
                let { data, error, status } = await supabase
                    .from("teams")
                    .select(
                        `
                        *                        
                    `
                    )
                    .order("location", { ascending: true });
                if (error && status !== 406) throw error;
                if (data) {
                    allTeams.value = data.map((team: Team) => {
                        return {
                            value: team.id,
                            label: `${team.location} ${team.name}`,
                        };
                    });
                }
            } catch (error: any) {
                alert(error.message);
            }
        }

        function closeAddGameDialog() {
            emit("close");
        }

        function gameAdded() {
            emit("gameAdded");
        }

        return {
            formatter,
            formValid,
            allTeams,
            away_team,
            notes,
            blackout,
            date,
            ticket_price,
            closeAddGameDialog,
            handleSubmit,
            formatDate,
        };
    },
};
</script>
