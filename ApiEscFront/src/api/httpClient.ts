// src/api/httpClient.ts

const API_URL = "http://localhost:8000";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const httpClient = {
  async get(path: string) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const auth = getAuthHeader();
    if (auth.Authorization) headers.append("Authorization", auth.Authorization);

    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers,
    });

    return await res.json();
  },

  async post(path: string, body: any) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const auth = getAuthHeader();
    if (auth.Authorization) headers.append("Authorization", auth.Authorization);

    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    return await res.json();
  },

  async patch(path: string, body: any) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const auth = getAuthHeader();
    if (auth.Authorization) headers.append("Authorization", auth.Authorization);

    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });

    return await res.json();
  },

  async delete(path: string) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const auth = getAuthHeader();
    if (auth.Authorization) headers.append("Authorization", auth.Authorization);

    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers,
    });

    return await res.json();
  },
};
