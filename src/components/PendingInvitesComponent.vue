<template>
    <SettingsPanelComponent
        title="Pending Invites"
        description="View all pending invites to True Blue Tickets"
        sectionId="pendingInvites"
        :enableFooter="false"
        :editMode="false"
    >
        <Transition
            mode="out-in"
            enter-from-class="opacity-0"
            enter-active-class="transition duration-1000"
        >
            <TransitionGroup
                tag="ul"
                role="list"
                class="divide-y divide-gray-200 p-4 sm:px-6"
                enter-active-class="transform-gpu"
                enter-class="opacity-0 -translate-x-full"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="absolute transform-gpu"
                leave-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-full"
            >
                <va-data-table
                    v-if="pendingInvites && pendingInvites.length"
                    :items="pendingInvites"
                    :columns="columns"
                    :clickable="true"
                    :animated="true"
                >
                    <template #cell(invite_link)="{ value, rowData }">
                        <span
                            @click="
                                copyToClipboard(
                                    `https://truebluetickets.com/sign-up?inviteCode=${rowData.id}`,
                                    rowData
                                )
                            "
                            class="cursor-pointer text-blue-500 hover:text-blue-600"
                            >Copy</span
                        >
                    </template>
                    <template #cell(created_at)="{ value }">{{
                        formatDate(value, "MM/dd/yy h:mmaaa")
                    }}</template>
                    <template #cell(invited_by_details)="{ value, rowData }">
                        {{ rowData.invited_by_details.first_name }}
                        {{ rowData.invited_by_details.last_name }}
                    </template>
                    <template #cell(id)="{ value }">
                        <span
                            class="cursor-pointer text-blue-500 hover:text-blue-600"
                            @click="deletePendingInvite(value)"
                            >Delete</span
                        >
                    </template>
                </va-data-table>
                <LoaderComponent
                    v-if="pendingInvitesLoading"
                    cssClasses="!my-8"
                ></LoaderComponent>
                <div
                    class="flex justify-center text-sm text-gray-500"
                    v-if="
                        !pendingInvitesLoading &&
                        pendingInvites &&
                        !pendingInvites.length
                    "
                >
                    No pending invites
                </div>
            </TransitionGroup>
        </Transition>
    </SettingsPanelComponent>
</template>

<script lang="ts">
import {
    ref,
    onMounted,
    Transition,
    TransitionGroup,
    computed,
    shallowRef,
} from "vue";
import { supabase } from "../core/functions/supabase";
import { userSessionStore } from "../store";
import ButtonComponent from "../components/ButtonComponent.vue";
import InputComponent from "../components/InputComponent.vue";
import SelectComponent, {
    type SelectItem,
} from "../components/SelectComponent.vue";
import LoaderComponent from "../components/LoaderComponent.vue";
import BannerComponent from "../components/BannerComponent.vue";

import DialogComponent from "../components/DialogComponent.vue";
import CheckboxGroupComponent, {
    type CheckboxItem,
} from "../components/CheckboxGroupComponent.vue";

import {
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon,
    ChevronRightIcon,
    CalendarIcon,
} from "@heroicons/vue/20/solid";
import {
    Bars3Icon,
    BellIcon,
    CogIcon,
    CreditCardIcon,
    KeyIcon,
    SquaresPlusIcon,
    UserCircleIcon,
    XMarkIcon,
    TrashIcon,
} from "@heroicons/vue/24/outline";
import SettingsPanelComponent from "./SettingsPanelComponent.vue";
import type { DataTableColumn } from "vuestic-ui";
import type { PendingInvite } from "../views/SignUp.vue";
import { formatDate } from "../core/functions/date-format";

export default {
    components: {
        ButtonComponent,
        InputComponent,
        LoaderComponent,
        DialogComponent,
        SelectComponent,
        CheckboxGroupComponent,
        SettingsPanelComponent,
        BannerComponent,
        MagnifyingGlassIcon,
        QuestionMarkCircleIcon,
        Bars3Icon,
        BellIcon,
        CogIcon,
        CreditCardIcon,
        KeyIcon,
        SquaresPlusIcon,
        UserCircleIcon,
        XMarkIcon,
        ChevronRightIcon,
        CalendarIcon,
        TrashIcon,
    },
    setup() {
        const pendingInvites = ref<PendingInvite[]>();
        const pendingInvitesLoading = ref<boolean>(false);
        const error = ref<any>();

        const clipboardBannerOpen = ref<boolean>(false);
        const clipboardMessage = ref<string>();

        const columns: DataTableColumn[] = [
            { key: "email", sortable: true },
            { key: "invite_link", label: "Invite Link", sortable: true },
            { key: "role_details.name", label: "Role", sortable: true },
            { key: "invited_by_details", label: "Invited By", sortable: true },
            { key: "created_at", label: "Invite Date", sortable: true },
            { key: "id", label: " ", sortable: false },
        ];

        onMounted(() => {
            initializeData();
        });

        async function initializeData() {
            pendingInvitesLoading.value = true;
            await getPendingInvites();
            pendingInvitesLoading.value = false;
        }

        async function getPendingInvites() {
            const { data, error } = await supabase
                .from("invitations")
                .select(
                    `
                        *,
                        role_details:roles(*),
                        invited_by_details:profiles(*)
                    `
                )
                .eq("activated", "false")
                .order("created_at");

            pendingInvites.value = data as PendingInvite[];
        }

        async function deletePendingInvite(id: string) {
            const { data, error } = await supabase
                .from("invitations")
                .delete()
                .eq("id", id);

            await getPendingInvites();
            pendingInvitesLoading.value = false;
        }

        function copyToClipboard(text: string, rowData: any) {
            navigator.clipboard.writeText(text).then(
                () => {
                    alert(`Invite code copied for ${rowData.email}`);
                },
                (err) => {
                    alert(`ERROR: Invite code copied could not be copied`);
                }
            );
        }

        return {
            pendingInvitesLoading,
            pendingInvites,
            columns,
            clipboardBannerOpen,
            clipboardMessage,
            formatDate,
            deletePendingInvite,
            copyToClipboard,
        };
    },
};
</script>
