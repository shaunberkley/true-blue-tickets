import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import { userProfileStore } from "../../store";
import { useAuthStore } from "../../store/auth";

export async function authGuard(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): Promise<void> {
    const authStore = useAuthStore();
    const profileStore = userProfileStore();

    if (!authStore.currentUser) await authStore.loadUser();
    if (!to.meta.authRequired || authStore.isAuthenticated) {
        return next();
    } else {
        authStore.saveRedirectRoute(to);
        return next({ name: "sign in" });
    }
}
