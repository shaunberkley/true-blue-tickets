<template>
    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <div class="mx-auto text-center text-5xl w-auto">⚾️</div>
            <h2
                class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900"
            >
                Sign in to your account
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Enter your email and we'll send you a link to sign in
            </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form class="space-y-6" @submit.prevent="handleLogin">
                    <div class="mt-1">
                        <InputComponent
                            v-model="email"
                            id="email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            label="Email address"
                            :required="true"
                            :disabled="sent"
                        ></InputComponent>
                    </div>

                    <div>
                        <ButtonComponent
                            :disabled="sent"
                            :style="'primary'"
                            class="w-full"
                            @click="handleLogin"
                            >{{
                                sent ? "Please check your email" : "Submit"
                            }}</ButtonComponent
                        >
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ButtonComponent from "../components/ButtonComponent.vue";
import InputComponent from "../components/InputComponent.vue";
import { supabase } from "../core/functions/supabase";

const sent = ref(false);
const email = ref("");

const base_url = window.location.origin;

const handleLogin = async () => {
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email: email.value,
            options: {
                emailRedirectTo: base_url,
            },
        });
        if (error) throw error;
        sent.value = true;
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        }
    } finally {
    }
};
</script>
