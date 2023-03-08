<template>
    <main
        class="relative z-0 flex-1 overflow-y-auto focus:outline-none xl:order-last py-2 xl:py-10"
    >
        <!-- Page header -->
        <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div class="">
                <nav
                    class="xl:hidden w-full mx-auto flex items-center justify-between py-3 mb-4"
                    aria-label="Breadcrumb"
                >
                    <router-link
                        :to="'/users'"
                        class="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
                    >
                        <ChevronLeftIcon
                            class="-ml-2 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                        <span>Directory</span>
                    </router-link>
                    <ButtonComponent
                        class="sm:hidden block"
                        :style="'primary'"
                        @click="openInviteUser"
                        >Invite User</ButtonComponent
                    >
                </nav>
                <div class="w-full flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <AvatarComponent
                            :imageUrl="user?.avatar_url"
                            :name="`${user?.first_name} ${user?.last_name}`"
                            :cssClasses="'h-24 w-24 text-gray-500 border p-3 text-2xl'"
                        ></AvatarComponent>
                        <div>
                            <h1
                                v-if="user"
                                class="text-2xl font-bold text-gray-900"
                            >
                                {{ user.first_name }} {{ user.last_name }}
                            </h1>
                            <LoadingPulseBarComponent
                                v-if="!user?.first_name"
                                :cssClasses="'h-5 bg-gray-200 dark:bg-gray-700 w-48 mb-3'"
                            ></LoadingPulseBarComponent>
                            <p
                                v-if="user?.created_at"
                                class="text-sm font-medium text-gray-500"
                            >
                                Created:
                                {{
                                    formatDate(
                                        user?.created_at.toString(),
                                        "MM/dd/yyyy"
                                    )
                                }}
                            </p>
                            <LoadingPulseBarComponent
                                v-if="!user?.created_at"
                                :cssClasses="'h-2.5 bg-gray-200 dark:bg-gray-700 w-32'"
                            ></LoadingPulseBarComponent>
                        </div>
                    </div>
                    <ButtonComponent
                        class="hidden sm:block"
                        :style="'primary'"
                        @click="openInviteUser"
                        >Invite User</ButtonComponent
                    >
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div>
            <div
                class="relative block mx-auto mt-6 max-w-3xl px-4 sm:px-6 lg:max-w-7xl"
            >
                <nav class="flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <router-link
                        v-for="tab in tabs"
                        :key="tab.name"
                        :to="tab.link"
                        active-class="bg-gray-50 text-gray-900"
                        exact-active-class="bg-gray-50 text-gray-900"
                        :class="[
                            tab.link === currentTab
                                ? 'bg-base-100 text-gray-700'
                                : 'text-gray-500 hover:text-gray-700',
                            'px-3 py-2 font-medium text-sm rounded-md flex-shrink-0',
                        ]"
                        :aria-current="
                            tab.link === currentTab ? 'page' : undefined
                        "
                        >{{ tab.name }}</router-link
                    >
                </nav>
                <!-- <div
                    class="sm:hidden absolute top-0 right-0 bg-gradient-to-r from-white/50 to-white/100 w-28 h-16 pointer-events-none"
                ></div> -->
            </div>
        </div>

        <!-- Content -->
        <div class="mx-auto mt-8 max-w-3xl lg:max-w-7xl">
            <div class="space-y-6 lg:col-span-2">
                <MyTicketsVue
                    :user="user"
                    v-if="currentTab === 'games'"
                ></MyTicketsVue>
            </div>
        </div>
    </main>

    <DialogComponent
        :isOpen="inviteUserDialogOpen"
        :title="'Invite User'"
        :disableClose="true"
        maxWidth="w-[500px]"
    >
        <InviteUserComponent
            v-if="profileRoles"
            :profileRoles="profileRoles"
            @save="initiateInviteUser"
            @close="inviteUserDialogOpen = false"
        >
        </InviteUserComponent>
    </DialogComponent>

    <BannerComponent
        :isOpen="bannerOpen"
        :message="errorMessage"
        :timer="5000"
        @close="bannerOpen = false"
    >
        <template v-slot:icon>
            <ExclamationTriangleIcon
                class="h-6 w-6 text-white"
                aria-hidden="true"
            />
        </template>
    </BannerComponent>
</template>

<script lang="ts">
import { supabase } from "../core/functions/supabase";
import { computed, onMounted, ref, watch } from "vue";
import {
    CheckIcon,
    HandThumbUpIcon,
    HashtagIcon,
    QuestionMarkCircleIcon,
    UserIcon,
    PlusCircleIcon,
    ChevronLeftIcon,
    ExclamationTriangleIcon,
} from "@heroicons/vue/20/solid";
import { useRoute } from "vue-router";
import { formatDate } from "../core/functions/date-format";
import AvatarComponent from "../components/AvatarComponent.vue";
import LoadingPulseBarComponent from "../components/LoadingPulseBarComponent.vue";
import ButtonComponent from "../components/ButtonComponent.vue";
import AutocompleteComponent from "../components/AutocompleteComponent.vue";
import DialogComponent from "../components/DialogComponent.vue";
import BannerComponent from "../components/BannerComponent.vue";
import InviteUserComponent from "../components/InviteUserComponent.vue";

import SelectComponent, {
    type SelectItem,
} from "../components/SelectComponent.vue";
import router from "../router";

import type { SendEmailRequest } from "../core/types/email.model";
import { userSessionStore } from "../store";
import { sendEmail } from "../core/functions/email";
import { inviteUser } from "../core/functions/user";
import type { InvitedUser, Profile } from "../core/types/user.model";
import type { Role } from "./Users.vue";
import MyTicketsVue from "./MyTickets.vue";

export interface Tab {
    name: string;
    link: string;
    relativeLink: string;
}

export default {
    components: {
        CheckIcon,
        HandThumbUpIcon,
        PlusCircleIcon,
        QuestionMarkCircleIcon,
        UserIcon,
        HashtagIcon,
        ChevronLeftIcon,
        ExclamationTriangleIcon,
        AvatarComponent,
        LoadingPulseBarComponent,
        ButtonComponent,
        AutocompleteComponent,
        SelectComponent,
        DialogComponent,
        BannerComponent,
        InviteUserComponent,
        MyTicketsVue,
    },
    props: {
        userId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        let user = ref<Profile | null>();

        const legalCase = ref<any | null>();
        const editMode = ref<boolean>(false);

        const profileRoles = ref<SelectItem[]>();

        const tabs = ref<Tab[] | []>([]);

        const inviteUserDialogOpen = ref<boolean>(false);

        const bannerOpen = ref<boolean>(false);
        const errorMessage = ref<any>("");

        const userSession = userSessionStore();

        onMounted(async () => {
            getUser();
            getProfileRoles();
        });

        watch(props, () => {
            getUser();
        });

        async function getUser() {
            user.value = null;
            const { data, error } = await supabase
                .from("profiles")
                .select(
                    `
                    id,
                    first_name,
                    last_name,
                    username,
                    email,
                    username,
                    created_at,
                    updated_at,           
                    avatar_url,         
                    role(*)
          `
                )
                .eq("id", props.userId)
                .limit(1)
                .single();

            user.value = data;

            tabs.value = [
                {
                    name: "User Info",
                    link: `/users/${user.value?.id}`,
                    relativeLink: "user-info",
                },
                {
                    name: "Games",
                    link: `/users/${user.value?.id}/games`,
                    relativeLink: "user-games",
                },
            ];
        }

        const route = useRoute();
        const currentTab = computed(() =>
            route.params && route.params.tab
                ? route.params.tab.toString()
                : null
        );

        const currentTabSelect = computed(() =>
            route.params && route.params.tab
                ? tabs.value.find((t: Tab) => {
                      return t.link === route.params.tab.toString();
                  })
                : null
        );

        async function getProfileRoles() {
            const { data, error } = await supabase.from("roles").select(`*`);
            profileRoles.value = data?.map((role: Role) => {
                return { label: role.name, value: role.id };
            }) as SelectItem[];
        }

        async function initiateInviteUser(invitedUser: InvitedUser) {
            await inviteUser(invitedUser);
            inviteUserDialogOpen.value = false;
        }

        async function openInviteUser() {
            inviteUserDialogOpen.value = true;
        }

        return {
            legalCase,
            user,
            formatDate,
            editMode,
            profileRoles,
            tabs,
            currentTab,
            currentTabSelect,
            router,
            inviteUserDialogOpen,
            bannerOpen,
            errorMessage,
            openInviteUser,
            initiateInviteUser,
        };
    },
};
</script>
