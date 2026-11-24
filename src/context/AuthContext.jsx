import { createContext, useContext, useState } from "react";
import { apiRequest } from "../api/apiClient";
import { safeStorage } from "../utils/safeStorage";

const STORAGE_KEY = "proposal_creator_auth";
const EMPTY_AUTH = { token: null, user: null };
const AuthContext = createContext(null);

const loadStoredAuth = () => {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_AUTH;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.token) {
      return EMPTY_AUTH;
    }

    return {
      token: parsed.token,
      user: parsed.user || null,
    };
  } catch {
    safeStorage.removeItem(STORAGE_KEY);
    return EMPTY_AUTH;
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadStoredAuth);

  const persistAuth = (data) => {
    const token = data && typeof data === "object" ? data.token || null : null;
    const user = data && typeof data === "object" ? data.user || null : null;
    const next = { token, user };

    setAuth(next);

    if (token) {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      safeStorage.removeItem(STORAGE_KEY);
    }

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
    setAuth(EMPTY_AUTH);
    safeStorage.removeItem(STORAGE_KEY);
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