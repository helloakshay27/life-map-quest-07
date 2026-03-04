export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://life-api.lockated.com",
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    return response;
  } catch (error) {
    // Handle network errors gracefully
    console.warn(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};
