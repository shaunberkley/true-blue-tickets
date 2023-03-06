<template>
    <Menu as="div" class="hidden relative lg:inline-block text-left">
        <div>
            <MenuButton
                class="rounded-full p-1 hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-base-300 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
                <span class="sr-only">Open user menu</span>
                <AvatarComponent
                    :name="`${user?.first_name} ${user?.last_name}`"
                    :imageUrl="user?.avatar_url"
                    cssClasses="h-8 w-8"
                ></AvatarComponent>
            </MenuButton>
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
                class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-base-100 shadow-xl ring-1 ring-base-300 ring-opacity-5 focus:outline-none"
            >
                <div class="px-1 py-1">
                    <MenuItem v-slot="{ active }">
                        <router-link
                            :to="'/profile'"
                            active-class="bg-base-200"
                            exact-active-class="bg-base-200"
                            :class="[
                                active ? 'bg-base-200' : '',
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                            ]"
                            >Profile</router-link
                        >
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button
                            :class="[
                                active ? 'bg-base-100' : '',
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                            ]"
                            @click="signOut"
                        >
                            Sign out
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { Menu, MenuItem, MenuItems, MenuButton } from "@headlessui/vue";

import AvatarComponent from "../components/AvatarComponent.vue";

import { RouterLink } from "vue-router";
import type { Profile } from "../core/types/user.model";

defineProps({
    user: Object as PropType<Profile | null>,
});

const emit = defineEmits(["signOut"]);

function signOut() {
    emit("signOut");
}
</script>
