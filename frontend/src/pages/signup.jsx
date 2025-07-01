//frontend/src/pages/signup.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import './signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const fullName = `${formData.firstName} ${formData.lastName}`;
  try {
    await authService.register({
      name: fullName,
      email: formData.email,
      password: formData.password,
      role: 'school_admin', // 👈 Add this
    });
    toast.success('Registered successfully!');
    navigate('/login');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Signup failed');
  }
};


  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="firstName" type="text" placeholder="First Name" onChange={handleChange} required />
        <input name="lastName" type="text" placeholder="Last Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
        <div className='login-section'><p>Already have an account? <a href="/login">Login</a></p></div>
      </form>
    </div>
  );
};

export default Signup;
