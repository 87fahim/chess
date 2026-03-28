// utils/token.js
export const isTokenExpired = (token) => {
    try {
        const { exp } = JSON.parse(atob(token.split(".")[1]));
        return Math.floor(Date.now() / 1000) >= exp;
    } catch (err) {
        console.error("Error parsing token:", err);
        return true;
    }
};

export const refreshAuthToken = async (oldToken) => {
    try {
        const response = await fetch("http://localhost:5050/api/auth/refresh", {
            method: "POST",
            headers: { Authorization: `Bearer ${oldToken}` },
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem("authToken", result.token);
            return result.token;
        } else {
            console.error("Failed to refresh token:", result.message);
            return null;
        }
    } catch (err) {
        console.error("Error refreshing token:", err);
        return null;
    }
};
