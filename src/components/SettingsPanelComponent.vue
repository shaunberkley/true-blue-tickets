<template>
    <section
        class="shadow sm:overflow-hidden sm:rounded-md"
        :aria-labelledby="sectionId"
    >
        <div
            class="px-4 py-6 sm:px-6 border-b border-gray-200 flex items-center justify-between sticky -top-2 xl:-top-[2.5rem]"
        >
            <div class="">
                <h2
                    :id="sectionId"
                    class="text-lg font-medium leading-6 text-gray-900"
                >
                    {{ title }}
                </h2>
                <p class="mt-1 text-sm text-gray-500">
                    {{ description }}
                </p>
            </div>
        </div>

        <Transition
            mode="out-in"
            enter-from-class="opacity-0"
            enter-active-class="transition duration-1000"
        >
            <LoaderComponent
                v-if="loading"
                cssClasses="!my-8"
            ></LoaderComponent>

            <div v-else>
                <slot></slot>
                <div
                    v-if="enableFooter"
                    class="border-t border-gray-200 bg-gray-50 px-4 py-2 text-right sm:px-6"
                >
                    <ButtonComponent :style="'primary'" @click="save"
                        >Save</ButtonComponent
                    >
                </div>
            </div>
        </Transition>
    </section>
</template>

<script lang="ts">
import { ref, Transition } from "vue";
import ButtonComponent from "../components/ButtonComponent.vue";
import InputComponent from "../components/InputComponent.vue";
import LoaderComponent from "../components/LoaderComponent.vue";

export default {
    components: {
        ButtonComponent,
        InputComponent,
        LoaderComponent,
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        sectionId: {
            type: String,
            required: true,
        },
        loading: {
            type: Boolean,
        },
        enableFooter: {
            type: Boolean,
        },
        primaryButtonEnabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        secondaryButtonEnabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        primaryLoading: {
            type: Boolean,
            required: false,
            default: false,
        },
        secondaryLoading: {
            type: Boolean,
            required: false,
            default: false,
        },
        disableHeader: {
            type: Boolean,
            required: false,
            default: false,
        },
        editMode: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    setup(props, { emit }) {
        let editMode = ref<boolean>(props.editMode);

        function save() {
            emit("save");
        }

        function primaryEmit() {
            emit("primaryClicked");
        }

        function secondaryEmit() {
            emit("secondaryClicked");
        }

        return {
            editMode,
            save,
            primaryEmit,
            secondaryEmit,
        };
    },
};
</script>
