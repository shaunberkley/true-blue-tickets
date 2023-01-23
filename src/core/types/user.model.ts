export type UserRole =
    | "ce7c9953-9ea6-47c8-bf6f-9ffd9a1a6ab8"
    | "97c08d44-4712-4c7e-b470-f29e1db25522";

export type UserRoleName = "Admin" | "Guest";

export interface Profile {
    id: string;
    created_at: Date;
    avatar_url?: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone?: string;
    updated_at: Date;
    role: {
        id: UserRole;
        name: UserRoleName;
    };
}

export interface InvitedUser {
    role: {
        id: UserRole;
        name: UserRoleName;
    };
    email: string;
}
