import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import './App.css'

function App() {
  return (
    <div className="container">
      <h1>Login and Register</h1>
      <Register />
      <Login />
    </div>
  );
}

export default App;
