export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

// Utility function to transform the api data to an instance of User
export function parseDataToUser(data: Record<string, any>): User {
    return {
        id: data.id,
        username: data.username,
        email: data.email,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
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