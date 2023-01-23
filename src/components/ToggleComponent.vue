<template>
    <Switch
        :modelValue="modelValue"
        @update:modelValue="(value) => updated(value)"
        :class="[
            modelValue ? 'bg-blue-600' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        ]"
    >
        <span class="sr-only">Use setting</span>
        <span
            aria-hidden="true"
            :class="[
                modelValue ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            ]"
        />
    </Switch>
</template>

<script lang="ts">
import { ref } from "vue";
import { Switch } from "@headlessui/vue";

export default {
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        Switch,
    },
    setup(props, { emit }) {
        const enabled = ref(false);
        function updated(value: any) {
            emit("update:modelValue", value);
            emit("updated", value);
        }

        return {
            enabled,
            emit,
            updated,
        };
    },
};
</script>
