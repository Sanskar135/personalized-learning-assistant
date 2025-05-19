import React, { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });

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
      alert("Registered Successfully!");
      localStorage.setItem("token", data.token);
    } else {
      alert(data.detail || "Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input name="first_name" placeholder="First Name" onChange={handleChange} />
      <input name="last_name" placeholder="Last Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
