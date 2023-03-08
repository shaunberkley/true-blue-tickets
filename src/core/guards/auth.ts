import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import { userProfileStore } from "../../store";
import { useAuthStore } from "../../store/auth";
import { setProfileData } from "../functions/user";

export const admin = "ce7c9953-9ea6-47c8-bf6f-9ffd9a1a6ab8";

export const admins = [admin];

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

export const roleGuard = async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    // Check if the profile is already stored in Pinia state
    if (!userProfileStore().profile) {
        // Store the profile in Pinia state
        await setProfileData();
    }

    const roleId = userProfileStore()?.profile?.role.id ?? "";
    const allowedRoles = to.meta.allowedRoles as string[];

    // Check the current user's role
    if (allowedRoles?.length && !allowedRoles.includes(roleId)) {
        // Redirect the user if they do not have the required role
        const roleRoute = admins.includes(roleId)
            ? `/${userProfileStore().profile?.role.name.toLowerCase()}`
            : `/`;
        next(roleRoute);
    } else {
        // Allow the user to proceed if they have the required role
        next();
    }
};
