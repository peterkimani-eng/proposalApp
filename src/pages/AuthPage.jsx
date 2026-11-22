import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthPage.module.css";
import { usePageSeo } from "../hooks/usePageSeo";




export const AuthPage = () => {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  usePageSeo({
  title: "Sign In — Custom Proposals",
  description: "Sign in or create an account to manage your interactive proposal links.",
  noindex: true,
  });

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        await register({
          name: name.trim(),
          username: username.trim(),
          password,
        });
      } else {
        await login({
          username: username.trim(),
          password,
        });
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Proposal Links</h1>
          <p className={styles.subtitle}>
            {mode === "login"
              ? "Sign in to manage your proposal links."
              : "Create a creator account to build your first proposal link."}
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`${styles.tab} ${mode === "login" ? styles.activeTab : ""}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`${styles.tab} ${mode === "register" ? styles.activeTab : ""}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "register" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alexdev"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={styles.submitBtn}
          >
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};