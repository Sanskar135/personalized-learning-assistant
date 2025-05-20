import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css"

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      const response = await axios.post("http://127.0.0.1:8000/login", form, {
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h2 className={styles.heading}>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className={styles.input}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
        <p style={{ marginTop: "10px" }}>
          Don't have an account?
          <Link to="/" style={{ color: "#4f46e5", marginLeft: "6px" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
