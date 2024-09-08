import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue"; // Import Home component

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home, // Render the Home component when user is at '/'
  },
  // You can add more routes here as needed
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
