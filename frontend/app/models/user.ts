import { API_PUB_BASE_URL, postRequest } from "~/services/api";

export type User = {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function signUp(data: Partial<User>): Promise<User> {
    const SIGNUP_URL = API_PUB_BASE_URL + "/signup";
    return postRequest<User>(SIGNUP_URL, data);
}

export async function logIn(data: Partial<User>): Promise<User> {
    const LOGIN_URL = API_PUB_BASE_URL + "/login";
    return postRequest<User>(LOGIN_URL, data);
}
