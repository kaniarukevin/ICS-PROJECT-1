import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // 👈 Add this
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        if (data.user.role === 'school_admin') navigate('/school-admin');
        else if (data.user.role === 'system_admin') navigate('/system-admin');
        else if (data.user.role === 'parent') navigate('/home');
        else navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    const credentials = {
      school_admin: { email: 'schooladmin@test.com', password: 'password123' },
      system_admin: { email: 'systemadmin@test.com', password: 'password123' },
      parent: { email: 'parent@test.com', password: 'password123' }
    };
    setFormData(credentials[role]);
  };

  return (
    <div className="lg-wrapper">
      <div className="lg-container">
        {/* Header */}
        <div className="lg-header">
          <h1 className="lg-title">EduSearch</h1>
          <p className="lg-subtitle">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="lg-form-card">
          <form onSubmit={handleSubmit} className="lg-form">
            <div className="lg-form-group">
              <label className="lg-label">📧 Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                className="lg-input"
              />
            </div>

            <div className="lg-form-group">
              <label className="lg-label">🔒 Password</label>
              <div className="lg-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="lg-input"
                />
                <button
                  type="button"
                  className="lg-toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈 Hide' : '👁️ Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="lg-error">
                <span className="lg-error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`lg-btn lg-btn-primary ${loading ? 'lg-btn-loading' : ''}`}
            >
              {loading ? '⏳ Signing In...' : '🔐 Sign In'}
            </button>

            <div className="lg-forgot-password">
              <button type="button" className="lg-forgot-link">
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

        {/* Registration Options */}
        <div className="lg-register-card">
          <h3 className="lg-register-title">Don't have an account?</h3>
          <div className="lg-register-options">
            <button
              onClick={() => navigate('/select-role')}
              className="lg-btn lg-btn-success lg-btn-main"
            >
              🚀 Get Started - Choose Your Role
            </button>
            <div className="lg-role-buttons">
              <button
                onClick={() => navigate('/register/parent')}
                className="lg-btn lg-btn-outline lg-btn-parent"
              >
                👨‍👩‍👧‍👦 Parent
              </button>
              <button
                onClick={() => navigate('/register/school-admin')}
                className="lg-btn lg-btn-outline lg-btn-school"
              >
                🏫 School Admin
              </button>
            </div>
          </div>
        </div>

        {/* Quick Login for Testing */}
        <div className="lg-testing-card">
          <h4 className="lg-testing-title">🧪 Quick Login (For Testing)</h4>
          <div className="lg-test-buttons">
            <button
              onClick={() => handleQuickLogin('parent')}
              className="lg-test-btn lg-test-parent"
            >
              👨‍👩‍👧‍👦 Parent
            </button>
            <button
              onClick={() => handleQuickLogin('school_admin')}
              className="lg-test-btn lg-test-school"
            >
              🏫 School Admin
            </button>
            <button
              onClick={() => handleQuickLogin('system_admin')}
              className="lg-test-btn lg-test-system"
            >
              ⚙️ System Admin
            </button>
          </div>
          <div className="lg-test-info">
            <p className="lg-test-text">
              <strong>Test Accounts:</strong><br />
              parent@test.com | schooladmin@test.com | systemadmin@test.com<br />
              <em>Password: password123</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
