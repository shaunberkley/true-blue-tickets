import type { Session } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import type { Profile } from "../views/UsersView.vue";

export const useCounterStore = defineStore("counter", {
    state: () => ({ count: 0 }),
    getters: {
        double: (state) => state.count * 2,
    },
    actions: {
        increment() {
            this.count++;
        },
    },
});

export const userSessionStore = defineStore({
    id: "userSession",
    state: () => ({
        session: null as Session | null,
    }),
});

export const userProfileStore = defineStore({
    id: "userProfile",
    state: () => ({
        profile: null as Profile | null,
    }),
});

export const dropboxTokenStore = defineStore({
    id: "dropboxToken",
    state: () => ({
        access_token: "",
        expires_in: 14400,
        token_type: "bearer",
    }),
});
