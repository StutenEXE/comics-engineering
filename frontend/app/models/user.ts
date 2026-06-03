import type { MRT_ColumnDef } from "material-react-table";
import type { ColumnDef } from "~/components/tables/GenericTable";
import { useTranslation } from "~/i18n/i18n";

export interface User {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Utility function to transform the api data to an instance of User
export function parseToUser(data: Record<string, any>): User {
    return {
        id: data.id,
        username: data.username,
        email: data.email,
        isAdmin: data.isAdmin,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
    }
}

export interface SimpleUser {
    id: number;
    username: string;
}

export function parseToSimpleUser(data: Record<string, any>): SimpleUser {
    return {
        id: data.id,
        username: data.username
    }
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}
