import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { createVuesticEssential, VaDataTable } from "vuestic-ui";

import "@vuepic/vue-datepicker/dist/main.css";

const app = createApp(App);

app.use(createPinia());

app.use(
    createVuesticEssential({
        components: { VaDataTable },
    })
);

app.use(router);

app.mount("#app");
