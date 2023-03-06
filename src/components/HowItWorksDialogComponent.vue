<template>
    <DialogComponent
        title="How it works"
        :isOpen="modalOpen"
        maxWidth="w-[600px]"
        @closeModal="closeHowItWorksDialog()"
    >
        <!-- <div>
            <ul
                class="px-4 py-8 text-lg flex flex-col divide-y divide-base-200"
            >
                <li class="py-8 flex flex-col items-center">
                    <img
                        src="../assets/images/hiw-1.png"
                        class="w-full border"
                    />
                    <div class="text-neutral-500 text-center mt-4">
                        Click a date on the calendar with a game
                    </div>
                </li>
                <li class="py-8 flex flex-col items-center">
                    <img
                        src="../assets/images/hiw-2.png"
                        class="w-full border"
                    />
                    <div class="text-neutral-500 text-center mt-4">
                        Click "Express Interest"
                    </div>
                </li>
            </ul>
        </div> -->
        <div class="carousel w-full mt-8">
            <div id="item1" class="carousel-item w-full flex-col">
                <img src="../assets/images/hiw-1.png" class="w-full border" />
                <div class="text-neutral-500 text-center mt-4">
                    Click a date on the calendar with a game
                </div>
            </div>
            <div id="item2" class="carousel-item w-full flex-col">
                <img src="../assets/images/hiw-2.png" class="w-full border" />
                <div class="text-neutral-500 text-center mt-4">
                    Click "Express Interest"
                </div>
            </div>
            <div id="item3" class="carousel-item w-full flex-col">
                <img src="../assets/images/hiw-3.png" class="w-full border" />
                <div class="text-neutral-500 text-center mt-4">
                    Manage your games on the "My Games" page
                </div>
            </div>
        </div>
        <div class="flex justify-center w-full pt-8 gap-4">
            <a href="#item1" class="btn btn-sm !rounded-md">1</a>
            <a href="#item2" class="btn btn-sm !rounded-md">2</a>
            <a href="#item3" class="btn btn-sm !rounded-md">3</a>
        </div>
    </DialogComponent>
</template>

<script lang="ts">
import DialogComponent from "./DialogComponent.vue";
import ButtonComponent from "./ButtonComponent.vue";

export default {
    props: {
        modalOpen: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        DialogComponent,
        ButtonComponent,
    },
    emits: ["close"],
    setup(props, { emit }) {
        function closeHowItWorksDialog() {
            emit("close");
        }

        return {
            closeHowItWorksDialog,
        };
    },
};
</script>
