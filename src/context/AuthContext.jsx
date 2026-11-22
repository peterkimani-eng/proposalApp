import { createContext, useContext, useState } from "react";
import { apiRequest } from "../api/apiClient";

const STORAGE_KEY = "proposal_creator_auth";
const AuthContext = createContext(null);

const loadStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: null, user: null };
    }
    const parsed = JSON.parse(raw);
    if (!parsed?.token) {
      return { token: null, user: null };
    }
    return {
      token: parsed.token,
      user: parsed.user || null,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadStoredAuth);

  const persistAuth = (data) => {
    const next = {
      token: data.token,
      user: data.user || null,
    };
    setAuth(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  const register = async (payload) => {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: payload,
    });
    return persistAuth(data);
  };

  const login = async (payload) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: payload,
    });
    return persistAuth(data);
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        user: auth.user,
        isAuthenticated: Boolean(auth.token),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};