<template>
    <DialogComponent
        title="How it works"
        :isOpen="modalOpen"
        maxWidth="w-[600px]"
        @closeModal="closeHowItWorksDialog()"
    >
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
                    We'll send you an email if your request has been accepted or
                    declined. If accepted, you have 48 hours to send payment for
                    your tickets.
                </div>
            </div>
            <div id="item4" class="carousel-item w-full flex-col">
                <img src="../assets/images/hiw-4.png" class="w-full border" />
                <div class="text-neutral-500 text-center mt-4">
                    Manage your games on the "My Games" page
                </div>
            </div>
        </div>
        <div class="flex justify-center w-full pt-8 gap-4">
            <a href="#item1" class="btn btn-sm !rounded-md">1</a>
            <a href="#item2" class="btn btn-sm !rounded-md">2</a>
            <a href="#item3" class="btn btn-sm !rounded-md">3</a>
            <a href="#item4" class="btn btn-sm !rounded-md">4</a>
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
