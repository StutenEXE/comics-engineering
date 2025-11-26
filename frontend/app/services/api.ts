
export const API_PUB_BASE_URL = "http://localhost:8080/api/comics/pub";
export const API_PVT_BASE_URL = "http://localhost:8080/api/comics/prv";

export async function postRequest<T>(url: string, body: any): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}

export async function getRequest<T>(url: string, params: any): Promise<T> {
    const urlWithParams = new URL(url + '?' + new URLSearchParams(params).toString());
    const response = await fetch(urlWithParams.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    
    return response.json();
}