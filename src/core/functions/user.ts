import router from "../../router";
import { userProfileStore, userSessionStore } from "../../store";
import { useAuthStore } from "../../store/auth";
import type { SendEmailRequest } from "../types/email.model";
import type {
    InvitedUser,
    Profile,
    UserRole,
    UserRoleName,
} from "../types/user.model";
import { sendEmail } from "./email";
import { supabase } from "./supabase";

export async function inviteUser(invitedUser: InvitedUser) {
    const { data, error } = await supabase
        .from("invitations")
        .insert({
            role: invitedUser.role.id,
            email: invitedUser.email,
            invited_by: useAuthStore().currentUser?.user?.id,
        })
        .select()
        .limit(1)
        .single();

    const ctaLink: string = `https://truebluetickets.com/sign-up?inviteCode=${data?.id}`;
    const bodyText: string = `${userProfileStore()?.profile?.first_name} ${
        userProfileStore()?.profile?.last_name
    } has given you exclusive access to purchase Los Angeles Dodgers tickets from their full-season package. Create your account to view tickets available for purchase.`;
    const cta: string = "Sign Up";
    const heading: string = `You have been invited to join True Blue Tickets ${
        invitedUser.role?.id === "ce7c9953-9ea6-47c8-bf6f-9ffd9a1a6ab8"
            ? ""
            : ""
    }`;

    const sendEmailRequest: SendEmailRequest = {
        sendEmail: [
            {
                email: invitedUser.email,
                name: "",
            },
        ],
        subject: heading,
        sendName: "",
        header: heading,
        heading: heading,
        bodyText: bodyText,
        cta: cta,
        ctaLink: ctaLink,
    };

    await sendEmail(
        useAuthStore().currentUser?.access_token ?? "",
        sendEmailRequest
    );

    return;
}

export function canEdit() {
    if (
        ["ce7c9953-9ea6-47c8-bf6f-9ffd9a1a6ab8"].includes(
            userProfileStore().profile?.role.id ?? ""
        )
    )
        return true;
    else return false;
}

export function getRoleFromRoleId(roleId: UserRole): string | undefined {
    return {
        "ce7c9953-9ea6-47c8-bf6f-9ffd9a1a6ab8": "Admin",
        "97c08d44-4712-4c7e-b470-f29e1db25522": "Guest",
    }[roleId];
}

export async function setProfileData(userId?: string) {
    const { data } = await supabase
        .from("profiles")
        .select(
            `
                id,
                first_name,
                last_name,
                email,
                username,
                avatar_url,
                created_at,
                updated_at,
                role(id, name)
            `
        )
        .eq("id", userId ?? useAuthStore().currentUser?.user?.id)
        .limit(1)
        .single();
    userProfileStore().profile = data as Profile;
    return data;
}
