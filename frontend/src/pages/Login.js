import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css"

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      navigate("/home");  // ✅ Redirect
    } else {
      alert(data.detail || "Login failed");
    }
  };

  return (
    <div className={styles.pageContainer}>
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Login</h2>
      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className={styles.input}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className={styles.input}
      />
      <button onClick={handleLogin} className={styles.button}>
        Login
      </button>
      <p style={{ marginTop: "10px" }}>
        Don't have an account?
        <Link to="/" style={{ color: "#4f46e5", marginLeft: "6px" }}>Register</Link>
      </p>
    </div>
    </div>
  );
}

export default Login;
