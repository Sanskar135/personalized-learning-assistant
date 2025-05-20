import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"

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
      navigate("/dashboard");  // ✅ Redirect
    } else {
      alert(data.detail || "Login failed");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <button onClick={handleLogin}>Login</button>
      <p style={{ marginTop: "10px" }}>
        Don’t have an account?
        <Link to="/" style={{ color: "#4f46e5", marginLeft: "6px" }}>Register</Link>
      </p>
    </div>
  );
}

export default Login;
