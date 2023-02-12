import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "../core/guards/auth";

export const admin = "ce7c9953-9ea6-47c8-bf6f-9ffd9a1a6ab8";
export const guest = "97c08d44-4712-4c7e-b470-f29e1db25522";

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
            path: "/sign-up",
            name: "sign up",
            meta: {
                authRequired: false,
            },
            component: () => import("../views/SignUp.vue"),
        },
        {
            path: "/",
            name: "schedule",
            meta: {
                authRequired: true,
            },
            component: () => import("../views/Games.vue"),
            children: [
                {
                    path: ":date",
                    name: "schedule date",
                    meta: {
                        authRequired: true,
                    },
                    component: () => import("../views/Games.vue"),
                },
            ],
        },
        {
            path: "/my-games",
            name: "My Games",
            meta: {
                authRequired: true,
            },
            component: () => import("../views/MyTickets.vue"),
        },
        {
            path: "/admin",
            name: "Admin",
            meta: {
                authRequired: true,
                allowedRoles: admin,
            },
            component: () => import("../views/Admin.vue"),
        },
        {
            path: "/users",
            name: "Users",
            meta: {
                authRequired: true,
            },
            component: () => import("../views/Users.vue"),
            children: [
                {
                    path: ":id",
                    name: "user page",
                    meta: {
                        authRequired: false,
                        allowedRoles: admin,
                    },
                    component: () => import("../views/Users.vue"),
                },
            ],
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
