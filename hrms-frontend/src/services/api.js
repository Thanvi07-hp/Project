import { authHeader, handleAuthResponse } from './authUtils';

const API_BASE_URL = "http://localhost:5000"; // Change this if needed

export async function login(email, password, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server returned an invalid response");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data; // { token, role }
  } catch (error) {
    throw new Error(error.message);
  }
}

// Helper function for authenticated API requests
const authenticatedRequest = async (url, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    // Handle auth errors (401 Unauthorized)
    handleAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Export common API methods with authentication
export const api = {
  get: (url) => authenticatedRequest(url),
  post: (url, data) => authenticatedRequest(url, 'POST', data),
  put: (url, data) => authenticatedRequest(url, 'PUT', data),
  delete: (url) => authenticatedRequest(url, 'DELETE'),
};
