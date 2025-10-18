import { useState, useEffect } from "react";
import authApi from "../api/authApi";
import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Guard: localStorage may contain the literal string 'undefined' or empty values
    const isValidUserString =
      userData && userData !== "undefined" && userData !== "null";

    if (token && isValidUserString) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Failed to parse user data:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login(email, password);
      // backend may return token plus user fields at top-level or a nested `user` object
      const { token } = response.data;
      const user = response.data.user || {
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
      };

      // ensure we have a proper user object
      const safeUser = user && Object.keys(user).length ? user : null;

      if (token) localStorage.setItem("token", token);
      if (safeUser) {
        localStorage.setItem("user", JSON.stringify(safeUser));
        setUser(safeUser);
      }

      return { success: true, token, user: safeUser };
    } catch (err) {
      console.error("Login API error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      const response = await authApi.register(username, email, password);
      // backend may return token plus user fields at top-level or a nested `user` object
      const { token } = response.data;
      const user = response.data.user || {
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
      };

      const safeUser = user && Object.keys(user).length ? user : null;

      if (token) localStorage.setItem("token", token);
      if (safeUser) {
        localStorage.setItem("user", JSON.stringify(safeUser));
        setUser(safeUser);
      }

      return { success: true, token, user: safeUser };
    } catch (err) {
      console.error("Registration API error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setUser,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
