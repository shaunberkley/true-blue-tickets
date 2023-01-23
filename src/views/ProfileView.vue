<template>
    <main class="w-full h-full overflow-auto">
        <div class="mx-auto max-w-7xl pb-10 lg:py-12 lg:px-8 overflow-auto">
            <div class="lg:grid lg:grid-cols-12 lg:gap-x-5">
                <!-- Account -->
                <div class="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                    <ProfileComponent></ProfileComponent>
                </div>
            </div>
        </div>
    </main>
</template>

<script lang="ts">
import ProfileComponent from "../components/ProfileComponent.vue";

export default {
    components: {
        ProfileComponent,
    },
    setup() {},
};
</script>
