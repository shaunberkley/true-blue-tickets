<template>
    <DirectoryComponent
        v-if="users && users.length"
        :items="users"
        :activeItemId="userId ?? ''"
        :sortMode="'lastName'"
        :itemsLabel="'Users'"
        :itemLabel="'User'"
    >
        <UserView :userId="userId" v-if="userId"></UserView>
    </DirectoryComponent>
</template>

<script lang="ts">
import DirectoryComponent from "../components/DirectoryComponent.vue";
import UserView from "../views/User.vue";
import { computed, onMounted, ref } from "vue";
import { supabase } from "../core/functions/supabase";
import { useRoute } from "vue-router";
import type { DirectoryItem } from "../components/DirectoryComponent.vue";

export interface Role {
    id: string;
    created_at: string;
    name: string;
}

export interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    created_at: string;
    updated_at: string;
    role: Role;
    avatar_url?: string;
    email?: string;
    phone?: string;
}

export default {
    components: {
        DirectoryComponent,
        UserView,
    },

    setup(props) {
        let users: any = ref<DirectoryItem[] | null>(null);

        const route = useRoute();
        const userId = computed(() =>
            route.params && route.params.id ? route.params.id.toString() : null
        );

        onMounted(async () => {
            initializeData();
        });

        async function initializeData() {
            const { data, error } = await supabase.from("profiles").select(`
                    id,
                    first_name,
                    last_name,
                    created_at,
                    updated_at, 
                    avatar_url,                   
                    role(*)
          `);

            const userItems = data as Profile[];

            users.value = userItems.map((val: Profile) => {
                return {
                    id: val.id,
                    name: `${val.first_name} ${val.last_name}`,
                    subheading: val.role?.name,
                    imageUrl: val.avatar_url,
                };
            });
        }

        return {
            users,
            UserView,
            userId,
        };
    },
};
</script>
