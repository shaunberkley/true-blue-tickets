<template>
    <div class="container p-32">
        <Account v-if="session" :session="session" />
        <Login v-else />
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Account from "./views/Account.vue";
import Login from "./views/Login.vue";
import { supabase } from "./core/functions/supabase";

const session = ref();

onMounted(() => {
    supabase.auth.getSession().then(({ data }) => {
        session.value = data.session;
    });

    supabase.auth.onAuthStateChange((_, _session) => {
        session.value = _session;
    });
});
</script>
