import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/userAuth";
import { useNotification } from "../notifications/NotificationProvider";
import AuthShell from "../auth/AuthShell";
import AuthField from "../auth/AuthField";
import AuthFeedback from "../auth/AuthFeedback";
import { validateLoginForm } from "../auth/authValidators";

const Login = () => {
  const userRef = useRef();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/chess";
  const successMessage = typeof location.state?.message === "string" ? location.state.message : "";
  const { notify } = useNotification();

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  const handleFieldChange = (setter, fieldName) => (event) => {
    setter(event.target.value);
    setStatusMessage("");
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const processSignin = async (event) => {
    event.preventDefault();

    const nextErrors = validateLoginForm({ username, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await login(username.trim(), password);
      setUserName("");
      setPassword("");
      navigate(from, { replace: true });
      notify({ message: "Logged in successfully", type: "success" });
    } catch (err) {
      const message = err?.message || "Login failed. Please try again.";
      setStatusMessage(message);
      notify({ message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign In"
      description="Use your ChessApp account to continue to your board, settings, and saved experience."
      footer={
        <>
          <p className="auth-footer__text">Don't have an account?</p>
          <Link to="/register" className="auth-link-button auth-link-button--secondary">
            Create Account
          </Link>
        </>
      }
    >
      <AuthFeedback message={statusMessage} tone="error" />
      {!statusMessage && successMessage ? <AuthFeedback message={successMessage} tone="success" /> : null}
      <form onSubmit={processSignin} className="auth-form" noValidate>
        <AuthField
          id="username"
          label="Username"
          inputRef={userRef}
          value={username}
          onChange={handleFieldChange(setUserName, "username")}
          autoComplete="username"
          required
          error={errors.username}
          disabled={isSubmitting}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={handleFieldChange(setPassword, "password")}
          autoComplete="current-password"
          required
          error={errors.password}
          disabled={isSubmitting}
        />
        <button type="submit" className="auth-submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
