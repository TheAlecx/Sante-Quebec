

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiFetch(
    url: string,
    options: RequestInit = {}
){
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }
    return res;
}