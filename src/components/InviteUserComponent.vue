<template>
    <div class="flex flex-col gap-4 mt-4 p-0.5">
        <div>
            <div
                class="flex flex-col items-center gap-4 w-full justify-between"
            >
                <div class="w-full">
                    <InputComponent
                        class="w-full"
                        label="Email"
                        id="email"
                        name="email"
                        :required="true"
                        :type="'email'"
                        autocomplete="email"
                        v-model="inviteUserEmail"
                    ></InputComponent>
                </div>
                <div class="w-full mb-20">
                    <SelectComponent
                        id="role"
                        name="role"
                        label="Role"
                        :required="true"
                        :items="profileRoles"
                        v-model="inviteUserRole"
                    ></SelectComponent>
                </div>
            </div>
        </div>
    </div>
    <div class="flex justify-end gap-4 p-1 mt-6">
        <div class="flex gap-4">
            <ButtonComponent @click="cancelInviteUser" :style="'secondary'"
                >Cancel</ButtonComponent
            >
            <ButtonComponent
                @click="inviteUser"
                :style="'primary'"
                :disabled="saveDisabled"
                >Create</ButtonComponent
            >
        </div>
    </div>
</template>

<script lang="ts">
import { computed, onMounted, ref, type PropType } from "vue";
import InputComponent from "../components/InputComponent.vue";
import ButtonComponent from "../components/ButtonComponent.vue";
import SelectComponent, {
    type SelectItem,
} from "../components/SelectComponent.vue";
import DatepickerComponent from "../components/DatepickerComponent.vue";
import type { InvitedUser, UserRoleName } from "../core/types/user.model";

export default {
    components: {
        InputComponent,
        SelectComponent,
        DatepickerComponent,
        ButtonComponent,
    },
    props: {
        profileRoles: {
            type: Array as PropType<SelectItem[] | undefined>,
            required: true,
        },
    },
    emits: ["close", "save"],
    setup(props, { emit }) {
        const inviteUserEmail = ref<string>();
        const inviteUserRole = ref<SelectItem>();

        const saveDisabled = computed(() => {
            if (!inviteUserEmail.value || !inviteUserRole.value) return true;
            else return false;
        });

        function cancelInviteUser() {
            emit("close");
        }

        async function inviteUser() {
            const newUser: InvitedUser = {
                email: inviteUserEmail.value ?? "",
                role: {
                    id: inviteUserRole.value?.value ?? "",
                    name: inviteUserRole.value?.label as UserRoleName,
                },
            };

            emit("save", newUser);
        }

        return {
            inviteUserEmail,
            inviteUserRole,
            saveDisabled,
            cancelInviteUser,
            inviteUser,
        };
    },
};
</script>
