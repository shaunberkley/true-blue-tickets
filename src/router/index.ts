import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "../core/guards/auth";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0, behavior: "smooth" };
        }
    },
    routes: [
        {
            path: "/sign-in",
            name: "sign in",
            meta: {
                authRequired: false,
            },
            component: () => import("../views/Login.vue"),
        },
        {
            path: "/",
            name: "games",
            meta: {
                authRequired: true,
            },
            component: () => import("../views/Games.vue"),
            children: [
                {
                    path: ":date",
                    name: "game date",
                    meta: {
                        authRequired: true,
                    },
                    component: () => import("../views/Games.vue"),
                },
            ],
        },
        {
            path: "/my-tickets",
            name: "My Tickets",
            meta: {
                authRequired: true,
            },
            component: () => import("../views/MyTickets.vue"),
        },
        {
            path: "/profile",
            name: "profile",
            meta: {
                authRequired: true,
            },
            component: () => import("../views/ProfileView.vue"),
        },
    ],
});

router.beforeEach(async (to, from, next) => {
    await authGuard(to, from, next);
});

export default router;
