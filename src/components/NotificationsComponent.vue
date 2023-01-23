<template>
    <Menu
        as="div"
        class="relative inline-block text-left"
        @vnode-updated="readNotifications"
    >
        <div>
            <MenuButton
                class="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
                <span class="sr-only">View notifications</span>
                <BellIcon class="h-6 w-6" aria-hidden="true" />
            </MenuButton>
            <div
                v-if="
                    notifications && notifications.length && unreadNotifications
                "
                class="absolute top-1 right-1 flex justify-center items-center w-2 h-2 rounded-full bg-red-600 text-white text-[10px] pointer-events-none"
            ></div>
        </div>

        <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
        >
            <MenuItems
                v-if="notifications?.length"
                class="absolute right-0 mt-2 w-80 sm:w-96 h-content max-h-[500px] origin-top-right divide-y divide-gray-100 rounded-md overflow-auto bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
                <div
                    class="flex items-center justify-between px-4 py-2 border-b"
                >
                    <h2>Notifications</h2>
                    <ButtonComponent
                        @click="clearNotifications()"
                        :style="'secondary'"
                        >Clear</ButtonComponent
                    >
                </div>
                <div v-for="notification in notifications">
                    <MenuItem v-slot="{ active }">
                        <div
                            class="pointer-events-auto flex w-full max-w-md bg-white ring-opacity-5"
                        >
                            <div class="w-0 flex-1 p-4">
                                <div class="flex items-start">
                                    <div class="ml-3 w-0 flex-1">
                                        <p
                                            class="text-sm font-medium text-gray-900"
                                        >
                                            {{ notification.message }}
                                        </p>
                                        <p class="mt-1 text-sm text-gray-500">
                                            {{
                                                formatDate(
                                                    notification.created_at,
                                                    "MM/dd/yy h:mmaaa"
                                                )
                                            }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex border-l border-gray-200">
                                <router-link
                                    :to="notification.router_link"
                                    class="flex w-full items-center justify-center rounded-none border border-transparent p-4 text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ring-inset"
                                    >{{
                                        notification.action ?? "Dismiss"
                                    }}</router-link
                                >
                            </div>
                        </div>
                    </MenuItem>
                </div>
            </MenuItems>
            <MenuItems
                v-else
                class="absolute right-0 mt-2 w-80 sm:w-96 h-content max-h-[500px] origin-top-right divide-y divide-gray-100 rounded-md overflow-auto bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
                <MenuItem v-slot="{ active }">
                    <div class="p-4">No notifications</div>
                </MenuItem>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { Menu, MenuItem, MenuItems, MenuButton } from "@headlessui/vue";

import { BellIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "../store/auth";

import { supabase } from "../core/functions/supabase";
import { userSessionStore, userProfileStore } from "../store/index";

import ButtonComponent from "../components/ButtonComponent.vue";
import type { CaseNotification } from "../core/types/notifications.model";
import formatDate from "../core/functions/date-format";

const notifications = ref();

const notificationsOpen = ref<boolean | null>(null);

const userSession = userSessionStore();

const unreadNotifications = computed(() => {
    return (
        notifications.value.filter(
            (notification: CaseNotification) => !notification.viewed
        ).length > 0
    );
});

onMounted(() => {
    getNotifications();
});

async function getNotifications() {
    const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile", useAuthStore().currentUser?.user?.id)
        .order("id", { ascending: true });
    notifications.value = data;
}

async function clearNotifications() {
    const { data } = await supabase
        .from("notifications")
        .delete()
        .eq("profile", useAuthStore().currentUser?.user?.id);

    getNotifications();
}

async function readNotifications() {
    if (notificationsOpen.value === null) notificationsOpen.value = true;
    else if (notificationsOpen.value !== null) {
        notificationsOpen.value = !notificationsOpen.value;

        if (notificationsOpen.value === true && notifications.value.length) {
            const { data } = await supabase
                .from("notifications")
                .update({ viewed: true })
                .eq("profile", useAuthStore().currentUser?.user?.id);

            getNotifications();
        }
    }
}
</script>
