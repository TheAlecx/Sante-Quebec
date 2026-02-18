export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return res;
}
