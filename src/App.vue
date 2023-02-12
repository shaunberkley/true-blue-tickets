<template>
    <div class="flex flex-col h-full">
        <header
            class="bg-white sticky top-0 z-30"
            v-if="authStore.currentUser?.user?.id"
        >
            <div class="mx-auto px-4 lg:px-8">
                <Popover class="flex h-16 justify-between" v-slot="{ open }">
                    <div class="flex px-2 lg:px-0">
                        <div class="flex flex-shrink-0 items-center">
                            <img
                                class="h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
                                alt="Guardians Hub"
                            />
                        </div>
                        <nav
                            aria-label="Global"
                            class="hidden lg:ml-5 lg:flex lg:items-center lg:space-x-4"
                        >
                            <div v-for="item in navigation">
                                <router-link
                                    v-if="item.visible"
                                    :key="item.name"
                                    :to="item.link"
                                    active-class="bg-gray-100"
                                    class="px-3 py-2 text-sm font-medium text-black hover:bg-gray-100 rounded-full"
                                    >{{ item.name }}</router-link
                                >
                            </div>
                        </nav>
                    </div>
                    <div
                        class="flex flex-1 items-center pl-2 lg:ml-6 justify-end"
                    ></div>
                    <TransitionRoot as="template" :show="open">
                        <div class="lg:hidden">
                            <TransitionChild
                                as="template"
                                enter="duration-150 ease-out"
                                enter-from="opacity-0"
                                enter-to="opacity-100"
                                leave="duration-150 ease-in"
                                leave-from="opacity-100"
                                leave-to="opacity-0"
                            >
                                <PopoverOverlay
                                    class="fixed inset-0 z-20 bg-black bg-opacity-25"
                                    aria-hidden="true"
                                />
                            </TransitionChild>

                            <TransitionChild
                                as="template"
                                enter="duration-150 ease-out"
                                enter-from="opacity-0 scale-95"
                                enter-to="opacity-100 scale-100"
                                leave="duration-150 ease-in"
                                leave-from="opacity-100 scale-100"
                                leave-to="opacity-0 scale-95"
                            >
                                <PopoverPanel
                                    focus
                                    class="absolute top-0 right-0 z-30 w-full max-w-none origin-top transform p-2 transition"
                                >
                                    <div
                                        class="divide-y divide-gray-200 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                                    >
                                        <div class="pt-3 pb-2">
                                            <div
                                                class="flex items-center justify-between px-4"
                                            >
                                                <div>
                                                    <img
                                                        class="h-8 w-auto"
                                                        src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
                                                        alt="Your Company"
                                                    />
                                                </div>
                                                <div class="-mr-2">
                                                    <PopoverButton
                                                        class="inline-flex items-center justify-center rounded-md p-2 bg-white text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                                    >
                                                        <span class="sr-only"
                                                            >Close menu</span
                                                        >
                                                        <XMarkIcon
                                                            class="h-6 w-6"
                                                            aria-hidden="true"
                                                        />
                                                    </PopoverButton>
                                                </div>
                                            </div>
                                            <div class="mt-3 space-y-1 px-2">
                                                <router-link
                                                    v-for="item in navigation"
                                                    :key="item.name"
                                                    :to="item.link"
                                                    active-class="bg-gray-100 text-white"
                                                    class="block rounded-md px-3 py-2 text-base font-medium bg-white text-black hover:bg-gray-100"
                                                    >{{
                                                        item.name
                                                    }}</router-link
                                                >
                                            </div>
                                        </div>
                                        <div class="pt-4 pb-2">
                                            <div class="flex items-center px-5">
                                                <div class="flex-shrink-0">
                                                    <AvatarComponent
                                                        :name="`${user?.first_name} ${user?.last_name}`"
                                                        :imageUrl="
                                                            user?.avatar_url
                                                        "
                                                        cssClasses="h-10 w-10"
                                                    ></AvatarComponent>
                                                </div>
                                                <div class="ml-3">
                                                    <div
                                                        class="text-base font-medium text-white"
                                                    >
                                                        {{ user?.first_name }}
                                                        {{ user?.last_name }}
                                                    </div>
                                                    <div
                                                        class="text-sm font-medium text-gray-500"
                                                    >
                                                        {{ user?.email }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mt-3 space-y-1 px-2">
                                                <router-link
                                                    to="/profile"
                                                    class="block cursor-pointer rounded-md px-3 py-2 text-base font-medium bg-white text-black hover:bg-gray-100"
                                                >
                                                    Profile
                                                </router-link>
                                            </div>
                                            <div class="space-y-1 px-2">
                                                <div
                                                    @click="signOut"
                                                    class="block cursor-pointer rounded-md px-3 py-2 text-base font-medium bg-white text-black hover:bg-gray-100"
                                                >
                                                    Sign out
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverPanel>
                            </TransitionChild>
                        </div>
                    </TransitionRoot>
                    <div class="ml-4 flex items-center gap-4">
                        <!-- Notifications -->
                        <NotificationsComponent></NotificationsComponent>

                        <!-- Profile dropdown -->
                        <ProfileDropdownComponent
                            :user="user"
                            v-if="user"
                            @sign-out="signOut"
                        ></ProfileDropdownComponent>
                    </div>
                    <div class="flex items-center lg:hidden ml-">
                        <!-- Mobile menu button -->
                        <PopoverButton
                            class="inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span class="sr-only">Open main menu</span>
                            <Bars3Icon
                                class="block h-6 w-6"
                                aria-hidden="true"
                            />
                        </PopoverButton>
                    </div>
                </Popover>
            </div>
        </header>

        <div
            class="h-full overflow-y-auto relative z-0"
            :key="authStore.currentUser?.user?.id"
        >
            <RouterView />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
    TransitionChild,
    TransitionRoot,
    Popover,
    PopoverButton,
    PopoverOverlay,
    PopoverPanel,
} from "@headlessui/vue";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import { supabase } from "./core/functions/supabase";
import { userSessionStore, userProfileStore } from "./store/index";
import AvatarComponent from "./components/AvatarComponent.vue";
import NotificationsComponent from "./components/NotificationsComponent.vue";
import ProfileDropdownComponent from "./components/ProfileDropdownComponent.vue";
import { canEdit, setProfileData } from "./core/functions/user";
import {
    type RouteLocationRaw,
    RouterLink,
    RouterView,
    useRouter,
} from "vue-router";
import { useAuthStore } from "./store/auth";

const user = ref();

const router = useRouter();
const authStore = useAuthStore();

if (router.currentRoute.value.meta.isAuthenticated) authStore.loadUser();

let navigation = ref([
    {
        name: "Schedule",
        link: "/",
        isAuthenticated: true,
        visible: true,
    },
    {
        name: "My Games",
        link: "/my-games",
        isAuthenticated: true,
        visible: true,
    },
    {
        name: "Admin",
        link: "/admin",
        isAuthenticated: true,
        visible: false,
    },
]);

const userCanEdit = ref<boolean>(false);

async function signOut() {
    authStore.clearUser();
    await supabase.auth.signOut().then(() => router.push("/sign-in"));
}

supabase.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_IN") {
        await authStore.loadUser();
        authStore.loadRedirectRoute();
        setProfileData();
    } else if (event === "SIGNED_OUT") {
        authStore.clearUser();
    }
});

authStore.$onAction(({ name, store, after }) => {
    if (name === "loadRedirectRoute") {
        after(async () => {
            const redirectRoute = store.redirectRoute;
            if (redirectRoute) {
                await router.isReady();
                await router.replace(redirectRoute as RouteLocationRaw);
                authStore.clearRedirectRoute();
            }
        });
    }
});

onMounted(async () => {
    console.log(useAuthStore().currentUser?.user?.id);
    if (useAuthStore().currentUser?.user?.id) {
        user.value = await setProfileData();
        if (canEdit()) userCanEdit.value = true;
    }
});

userProfileStore().$subscribe((e) => {
    user.value = userProfileStore().profile;
    if (canEdit()) userCanEdit.value = true;
    if (userCanEdit.value) {
        navigation.value[2].visible = true;
    }
});
</script>
