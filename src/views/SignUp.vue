<template>
    <div
        class="w-full flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <img
                class="mx-auto h-12 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
                alt="Your Company"
            />
            <h2 class="mt-6 text-center text-3xl font-bold tracking-tight">
                Sign up for your account
            </h2>
            <p class="mt-2 text-center text-sm">
                Or
                {{ " " }}
                <router-link
                    :to="'/sign-in'"
                    class="font-medium text-blue-600 hover:text-blue-500"
                    >Sign In</router-link
                >
            </p>
        </div>

        <div v-if="signedUp" class="flex justify-center">
            <div class="mt-8 mx-auto inline-block">
                <div
                    class="bg-blue-600 text-white text-center py-8 px-4 shadow rounded-lg sm:px-10 flex flex-col items-center gap-4"
                >
                    <div class="bg-base-300 rounded-full p-4">
                        <HandThumbUpIcon
                            class="h-6 w-6 text-blue-600"
                            aria-hidden="true"
                        />
                    </div>
                    <div class="text-lg max-w-[300px]">
                        You're all set! A link to verify your account was sent
                        to your email.
                    </div>
                </div>
            </div>
        </div>

        <div
            v-if="!formLoading && !signedUp"
            class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
            <div class="bg-base-300 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form class="space-y-6" action="#" method="POST">
                    <div>
                        <label for="firstName" class="block text-sm font-medium"
                            >First Name</label
                        >
                        <div class="mt-1">
                            <InputComponent
                                v-model="firstName"
                                id="firstName"
                                name="firstName"
                                type="text"
                                autocomplete="firstName"
                            />
                        </div>
                    </div>

                    <div>
                        <label for="lastName" class="block text-sm font-medium"
                            >Last Name</label
                        >
                        <div class="mt-1">
                            <InputComponent
                                v-model="lastName"
                                id="lastName"
                                name="lastName"
                                type="text"
                                autocomplete="lastName"
                            />
                        </div>
                    </div>

                    <div>
                        <label for="lastName" class="block text-sm font-medium"
                            >Username
                            <span class="text-xs"
                                >(If you would like to remain anonymous)</span
                            ></label
                        >
                        <div class="mt-1">
                            <InputComponent
                                v-model="username"
                                id="username"
                                name="username"
                                type="text"
                                autocomplete="username"
                            />
                        </div>
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium"
                            >Email address</label
                        >
                        <div class="mt-1">
                            <InputComponent
                                v-model="email"
                                id="email"
                                name="email"
                                type="email"
                                autocomplete="email"
                                :disabled="true"
                            />
                        </div>
                    </div>

                    <div>
                        <ButtonComponent
                            :style="'primary'"
                            :disabled="!firstName || !lastName || !email"
                            :cssClasses="'w-full border rounded-md px-4 py-2 text-sm font-medium shadow-sm'"
                            @click="signUp()"
                            >Sign Up</ButtonComponent
                        >
                    </div>
                </form>
            </div>
        </div>
    </div>

    <BannerComponent
        :isOpen="bannerOpen"
        :message="errorMessage"
        :timer="bannerTimer"
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
import { computed, onMounted, ref } from "vue";
import { supabase } from "../core/functions/supabase";
import ButtonComponent from "../components/ButtonComponent.vue";
import BannerComponent from "../components/BannerComponent.vue";
import ExclamationTriangleIcon from "@heroicons/vue/24/outline/ExclamationTriangleIcon";
import { useRoute, RouterLink } from "vue-router";
import InputComponent from "../components/InputComponent.vue";
import { HandThumbUpIcon } from "@heroicons/vue/24/outline";
import type { Profile } from "../core/types/user.model";
import type {
    SendEmailItem,
    SendEmailRequest,
} from "../core/types/email.model";
import { admin } from "../core/guards/auth";
import { sendEmail } from "../core/functions/email";
import { useAuthStore } from "../store/auth";
import type { Role } from "./Users.vue";

export interface PendingInvite {
    id: string;
    created_at: Date;
    invited_by: Profile;
    activated: boolean;
    role: string;
    email: string;
}

export default {
    components: {
        ButtonComponent,
        BannerComponent,
        InputComponent,
        ExclamationTriangleIcon,
        HandThumbUpIcon,
    },
    setup(props) {
        // Create a single supabase client for interacting with your database

        const firstName = ref<string>("");
        const lastName = ref<string>("");
        const username = ref<string>("");
        const email = ref<string>("");
        const password = ref<string>("");

        const roles = ref<Role[]>();

        const errorMessage = ref<any>("");
        const bannerOpen = ref<boolean>(false);
        const bannerTimer = ref<number | undefined>();

        const pendingInvite = ref<PendingInvite>();

        const signedUp = ref<boolean>(false);

        const formLoading = ref<boolean>(false);

        const route = useRoute();

        const inviteCode = computed(() =>
            route.query && route.query.inviteCode
                ? route.query.inviteCode.toString()
                : null
        );

        onMounted(async () => {
            formLoading.value = true;
            if (inviteCode.value) {
                const { data, error } = await supabase
                    .from("invitations")
                    .select(
                        `
                        *,
                        role_details:roles(*)
                    `
                    )
                    .eq("id", inviteCode.value)
                    .limit(1)
                    .single();

                pendingInvite.value = data as unknown as PendingInvite;

                if (!pendingInvite.value) {
                    errorMessage.value =
                        "Invalid invite code. Please request an invitation.";
                    bannerTimer.value = undefined;
                    bannerOpen.value = true;
                } else {
                    formLoading.value = false;
                    email.value = pendingInvite.value.email;
                }
            } else {
                errorMessage.value =
                    "Missing invite code. Please request an invitation.";
                bannerTimer.value = undefined;
                bannerOpen.value = true;
            }

            // const { data } = await supabase.from("roles").select();
            // roles.value = data as Role[];
        });

        async function signUp() {
            const randomPassword = new Array(10)
                .fill(
                    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
                )
                .map((x) =>
                    (function (chars) {
                        let umax = Math.pow(2, 32),
                            r = new Uint32Array(1),
                            max = umax - (umax % chars.length);
                        do {
                            crypto.getRandomValues(r);
                        } while (r[0] > max);
                        return chars[r[0] % chars.length];
                    })(x)
                )
                .join("");

            const signUpRes = await supabase.auth.signUp({
                email: email.value,
                password: randomPassword,
            });

            if (signUpRes.error) {
                errorMessage.value = signUpRes.error.message;
                bannerTimer.value = 5000;
                bannerOpen.value = true;

                return;
            }

            await supabase.from("profiles").insert({
                id: signUpRes.data.user?.id,
                first_name: firstName.value.trim(),
                last_name: lastName.value.trim(),
                username: username.value ? username.value.trim() : undefined,
                email: email.value.trim(),
                role: pendingInvite.value?.role,
            });

            await supabase
                .from("invitations")
                .update({ activated: true })
                .eq("id", inviteCode.value);

            signedUp.value = true;

            // try {
            //     let getAdmins = await supabase
            //         .from("profiles")
            //         .select()
            //         .eq("role", admin);

            //     const admins: SendEmailItem[] | undefined = getAdmins.data?.map(
            //         (profile: Profile) => {
            //             return {
            //                 email: profile.email,
            //                 name: `${profile.first_name} ${profile.last_name}`,
            //             } as SendEmailItem;
            //         }
            //     );

            //     const heading = `${firstName.value} ${lastName.value} has accepted their invitation`;

            //     const role = roles.value?.find(
            //         (role: Role) => role.id === pendingInvite.value?.role
            //     )?.name;

            //     const bodyText = `The user has joined with the following role: ${role}`;

            //     if (getAdmins.error) throw getAdmins.error;

            //     const sendEmailRequest: SendEmailRequest = {
            //         sendEmail: admins ?? [],
            //         subject: heading,
            //         sendName: "",
            //         header: heading,
            //         heading: heading,
            //         bodyText: bodyText,
            //         cta: `View user`,
            //         ctaLink: `https://truebluetickets.com/users/${signUpRes.data.user?.id}`,
            //     };

            //     await sendEmail(
            //         useAuthStore().currentUser?.access_token ?? "",
            //         sendEmailRequest
            //     );
            // } catch (error: any) {
            //     alert(error.message);
            //     return error;
            // }
        }

        return {
            signUp,
            email,
            password,
            firstName,
            lastName,
            username,
            bannerOpen,
            bannerTimer,
            errorMessage,
            formLoading,
            signedUp,
        };
    },
};
</script>
