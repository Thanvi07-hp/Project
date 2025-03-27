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
