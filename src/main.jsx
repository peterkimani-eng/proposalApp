import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

(() => {
  const memory = new Map();
  const makeFallback = () => ({
    getItem: (k) => (memory.has(k) ? memory.get(k) : null),
    setItem: (k, v) => memory.set(k, String(v)),
    removeItem: (k) => memory.delete(k),
    clear: () => memory.clear(),
    key: (i) => Array.from(memory.keys())[i] ?? null,
    get length() {
      return memory.size;
    },
  });

  const fallback = makeFallback();

  for (const prop of ["localStorage", "sessionStorage"]) {
    try {
      void window[prop];
    } catch {
      try {
        Object.defineProperty(window, prop, {
          configurable: true,
          get: () => fallback,
        });
      } catch {
        // Ignore if non-configurable in this browser environment
      }
    }
  }
})();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);