const API_URL = "http://127.0.0.1:8000";

export { API_URL };

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  let accessToken = localStorage.getItem("access_token");

  const makeRequest = async (token: string | null) => {
    const headers = new Headers(options.headers);

    const isFormData = options.body instanceof FormData;

    if (isFormData) {
      headers.delete("Content-Type");
    } else {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    } else {
      headers.delete("Authorization");
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status !== 401) {
    return response;
  }

  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    return response;
  }

  const refreshResponse = await fetch(
    `${API_URL}/api/accounts/token/refresh/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    }
  );

  if (!refreshResponse.ok) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    return response;
  }

  const refreshData = await refreshResponse.json();

  localStorage.setItem(
    "access_token",
    refreshData.access
  );

  if (refreshData.refresh) {
    localStorage.setItem(
      "refresh_token",
      refreshData.refresh
    );
  }

  accessToken = refreshData.access;

  return makeRequest(accessToken);
}