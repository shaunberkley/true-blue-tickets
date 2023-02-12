<template>
    <SettingsPanelComponent
        title="Profile"
        description="Update your user profile"
        sectionId="userProfile"
        :enableFooter="true"
        :loading="false"
        @save="save"
    >
        <form v-if="userProfile">
            <div class="grid grid-cols-4 gap-6 px-4 sm:p-6">
                <div class="col-span-4 sm:col-span-2">
                    <InputComponent
                        id="firstName"
                        name="firstName"
                        type="text"
                        autocomplete="firstName"
                        label="First Name"
                        v-model="firstName"
                    ></InputComponent>
                </div>

                <div class="col-span-4 sm:col-span-2">
                    <InputComponent
                        id="lastName"
                        name="lastName"
                        type="text"
                        autocomplete="lastName"
                        label="Last Name"
                        v-model="lastName"
                    ></InputComponent>
                </div>

                <div class="col-span-4 sm:col-span-2">
                    <InputComponent
                        id="role"
                        name="email"
                        type="email"
                        autocomplete="email"
                        label="Email"
                        v-model="email"
                        :readOnly="true"
                    ></InputComponent>
                </div>

                <div class="col-span-4 sm:col-span-2">
                    <InputComponent
                        id="username"
                        name="username"
                        type="text"
                        autocomplete="username"
                        label="Username"
                        v-model="username"
                    ></InputComponent>
                </div>

                <div class="col-span-4 sm:col-span-2">
                    <InputComponent
                        id="role"
                        name="role"
                        type="text"
                        autocomplete="role"
                        label="Role"
                        v-model="role"
                        :readOnly="true"
                        :cssClasses="'border'"
                    ></InputComponent>
                </div>

                <div class="sm:col-span-4">
                    <label
                        for="photo"
                        class="block text-sm font-medium text-gray-700"
                        >Avatar</label
                    >
                    <div class="mt-1 flex items-center">
                        <AvatarComponent
                            :imageUrl="avatarUrl"
                            :name="`${firstName} ${lastName}`"
                            cssClasses="w-12 h-12 bg-white border p-0.5"
                        ></AvatarComponent>
                        <div class="ml-4 flex">
                            <input
                                class="block w-full appearance-none rounded-md border placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                id="file_input"
                                type="file"
                                accept="image/png, image/jpeg, image/gif"
                                @change="updateAvatar"
                            />
                            <ButtonComponent
                                v-if="avatarUrl"
                                :style="'secondary'"
                                class="ml-4"
                                >Remove</ButtonComponent
                            >
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </SettingsPanelComponent>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "../core/functions/supabase";
import { userProfileStore, userSessionStore } from "../store";
import { useAuthStore } from "../store/auth";
import AvatarComponent from "./AvatarComponent.vue";
import ButtonComponent from "./ButtonComponent.vue";
import InputComponent from "./InputComponent.vue";
import SettingsPanelComponent from "./SettingsPanelComponent.vue";

export default {
    components: {
        SettingsPanelComponent,
        InputComponent,
        AvatarComponent,
        ButtonComponent,
    },
    setup() {
        const userProfile = userProfileStore();
        const userSession = userSessionStore();

        const firstName = ref<string>();
        const lastName = ref<string>();
        const email = ref<string>();
        const username = ref<string>();
        const avatarUrl = ref<string>();
        const role = ref<string>();

        const avatarFile = ref();

        userProfileStore().$subscribe((e) => {
            setProfileData();
        });

        onMounted(() => {
            setProfileData();
        });

        function setProfileData() {
            firstName.value = userProfile.profile?.first_name ?? "";
            lastName.value = userProfile.profile?.last_name ?? "";
            email.value = useAuthStore().currentUser?.user?.email ?? "";
            username.value = userProfile.profile?.username ?? "";
            avatarUrl.value = userProfile.profile?.avatar_url ?? "";
            role.value = userProfile.profile?.role.name ?? "";
        }

        async function save() {
            updateProfile();
            // Disabling until proper updateUser implementation
            // updateUser();
        }

        async function updateProfile() {
            const updatedProfile = await supabase
                .from("profiles")
                .update({
                    first_name: firstName.value,
                    last_name: lastName.value,
                    username: username.value,
                    updated_at: new Date(),
                })
                .eq("id", useAuthStore().currentUser?.user?.id ?? "")
                .single();

            if (updatedProfile.data) userProfile.profile = updatedProfile;
        }

        async function updateUser() {
            const updatedUser = await supabase.auth
                .updateUser({ email: email.value })
                .catch((error) => {
                    // Handle error
                    console.error(error);
                });
        }

        async function updateAvatar(event: Event) {
            const input = event.target as HTMLInputElement;

            // Check if event.target is null
            if (!input) return;

            // Check if input.files is null
            if (!input.files) return;

            // Get the selected file from the event object
            const file = input.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${Math.random()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (!data) return;
            const avatarUrl = await supabase.storage
                .from("avatars")
                .getPublicUrl(data?.path ?? "");
            if (avatarUrl.data?.publicUrl)
                await supabase
                    .from("profiles")
                    .update({ avatar_url: avatarUrl.data?.publicUrl })
                    .eq("id", useAuthStore().currentUser?.user?.id ?? "");
            location.reload();
        }

        return {
            save,
            firstName,
            lastName,
            email,
            username,
            avatarUrl,
            role,
            userProfile,
            avatarFile,
            updateAvatar,
        };
    },
};
</script>
