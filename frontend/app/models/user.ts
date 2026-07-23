
export interface User {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

// Utility function to transform the api data to an instance of User
export function parseToUser(data: Record<string, any>): User {
    return {
        id: data.id,
        username: data.username,
        email: data.email,
        isAdmin: data.isAdmin,
        isDeleted: data.isDeleted,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    }
}

export interface SimpleUser {
    id: number;
    username: string;
    isDeleted: boolean;
}

export function parseToSimpleUser(data: Record<string, any>): SimpleUser {
    return {
        id: data.id,
        username: data.username,
        isDeleted: data.isDeleted
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
