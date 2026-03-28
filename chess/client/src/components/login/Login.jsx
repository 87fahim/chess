import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import useAuth from "../../hooks/userAuth";
import { useNotification } from "../notifications/NotificationProvider"; // ✅ use the hook, not the provider

const Login = () => {
  const userRef = useRef();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  // ✅ get notify/confirm from the hook
  const { notify, confirm } = useNotification();

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  const processSignin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password); // sets user/roles in context; cookie set by server
      setUserName("");
      setPassword("");
      navigate(from, { replace: true });

      notify({ message: "Logged in successfully", type: "success" });
    } catch (err) {
      notify({ message: err?.message || "Login failed. Please try again.", type: "error" });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login">
        <form onSubmit={processSignin} className="sign-in-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            ref={userRef}
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="sign-in-button">Sign In</button>

          <p className="not-have-account">Don't have an account?</p>
          <Link to="/register" className="register-link">
            <button className="register-button-login" type="button">Register</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
