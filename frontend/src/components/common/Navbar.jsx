import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleLogoClick = () => {
    if (token && user) {
      if (user.role === 'school_admin') navigate('/school-admin');
      else if (user.role === 'system_admin') navigate('/system-admin');
      else if (user.role === 'parent') navigate('/home');
      else navigate('/home');
    } else {
      navigate('/home');
    }
  };

  const goToMyBookings = () => {
    navigate('/my-bookings');
  };

  return (
    <nav
      style={{
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {/* Left - Logo */}
      <div
        onClick={handleLogoClick}
        style={{
          cursor: 'pointer',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'black'
        }}
      >
        EduSearch
      </div>

      {/* Center - Home */}
      <div
        onClick={handleLogoClick}
        style={{
          cursor: 'pointer',
          color: '#007bff',
          textDecoration: 'none',
          fontSize: '1.1rem'
        }}
      >
        Home
      </div>

      {/* Right - User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {token && user ? (
          <>
            <span>Hello, {user.name}</span>

            {user.role === 'parent' && (
              <button
                onClick={goToMyBookings}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                My Bookings
              </button>
            )}

            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
