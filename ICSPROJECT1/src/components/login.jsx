import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./authentication.css"; // Assuming you have a CSS file for styling

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // allow cookies if used
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
      } else {
        setMessage("✅ Login successful!");
        // Optionally store token
        localStorage.setItem("token", data.token);
        navigate("/dashboard"); // Redirect after login
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Something went wrong.");
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" name="password" required value={formData.password} onChange={handleChange} />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p className="login-message">{message}</p>}

      <div className="signup-link">
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
    </div>
  );
};

export default Login;
