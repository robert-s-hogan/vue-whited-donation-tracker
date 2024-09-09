import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/";
import { createPinia } from "pinia";

const app = createApp(App);

// Create a Pinia instance
const pinia = createPinia();

// Use Pinia and Router in your app
app.use(pinia);
app.use(router);

// Mount the app
app.mount("#app");
