import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Register.module.css"

function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      navigate("/home");  // ✅ Redirect
    } else {
      alert(data.detail || "Registration failed");
    }
  };

   return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Register</h2>
      <input
        name="first_name"
        placeholder="First Name"
        onChange={handleChange}
        className={styles.input}
      />
      <input
        name="last_name"
        placeholder="Last Name"
        onChange={handleChange}
        className={styles.input}
      />
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
      <button onClick={handleRegister} className={styles.button}>
        Register
      </button>
      <p style={{ marginTop: '10px' }}>
        Already have an account?
        <Link to="/login" style={{ color: '#4f46e5', marginLeft: '6px' }}>Login</Link>
      </p>
    </div>
  );
}

export default Register;
