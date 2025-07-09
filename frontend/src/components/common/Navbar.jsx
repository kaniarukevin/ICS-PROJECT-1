// frontend/src/components/common/Navbar.jsx
import React, { useState, useEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && user) {
      fetchUnreadCount();
      // Set up interval to check for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowLogoutModal(false);
    navigate('/login');
  };
  const cancelLogout = () => setShowLogoutModal(false);

  const handleLogoClick = () => {
    if (token && user) {
      if (user.role === 'school_admin') navigate('/school-admin');
      else if (user.role === 'system_admin') navigate('/system-admin');
      else if (user.role === 'parent') navigate('/home');
      else navigate('/home');
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const goToMyBookings = () => {
    navigate('/my-bookings');
    setIsMenuOpen(false);
  };

  const goToMyComparisons = () => {
    navigate('/compare');
    setIsMenuOpen(false);
  };

  const goToMessages = () => {
    navigate('/messages');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [hoveredLink, setHoveredLink] = useState(null);

  // Inline styles
  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: '#ffffff',
    borderBottom: '2px solid #d1d5db',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px',
  };

  const logoStyle = {
    cursor: 'pointer',
    fontSize: '1.75rem',
    fontWeight: '700',
    transition: 'all 0.3s ease',
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const navLinkStyle = {
    background: 'none',
    border: 'none',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#1f2937',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const navLinkHoverStyle = {
    background: '#16a34a',
    color: '#ffffff',
    transform: 'translateY(-1px)',
  };

  const messagesBadgeStyle = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  };

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const userGreetingStyle = {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#1f2937',
  };

  const loginBtnStyle = {
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#16a34a',
    color: '#ffffff',
  };

  const logoutBtnStyle = {
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#000000',
    color: '#ffffff',
  };

  const mobileMenuBtnStyle = {
    display: window.innerWidth <= 768 ? 'flex' : 'none',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '25px',
    height: '25px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 1001,
  };

  const hamburgerLineStyle = {
    width: '100%',
    height: '3px',
    background: '#000000',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
    transformOrigin: '1px',
  };

  const mobileMenuStyle = {
    position: 'fixed',
    top: '70px',
    left: 0,
    right: 0,
    background: '#ffffff',
    borderBottom: '2px solid #d1d5db',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    transform: isMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
    transition: 'all 0.3s ease',
    opacity: isMenuOpen ? 1 : 0,
    visibility: isMenuOpen ? 'visible' : 'hidden',
    zIndex: 999,
  };

  const mobileNavLinkStyle = {
    display: 'block',
    width: '100%',
    padding: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#1f2937',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    borderBottom: '1px solid #d1d5db',
    position: 'relative'
  };

  const mobileUserSectionStyle = {
    padding: '1rem',
    borderTop: '2px solid #d1d5db',
    background: '#f9fafb',
  };

  const mobileUserGreetingStyle = {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '0.75rem',
  };

  const mobileLoginBtnStyle = {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#16a34a',
    color: '#ffffff',
  };

  const mobileLogoutBtnStyle = {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#000000',
    color: '#ffffff',
  };

  return (
    <>
      <style>
        {`
          body {
            padding-top: 70px;
          }
          @media (max-width: 768px) {
            body {
              padding-top: 60px;
            }
          }
        `}
      </style>

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? 'rgba(255, 255, 255, 0.85)' : '#ffffff',
          backdropFilter: scrolled ? 'blur(8px) saturate(180%)' : 'none',
          borderBottom: '2px solid #d1d5db',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '70px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              cursor: 'pointer',
              fontSize: '1.75rem',
              fontWeight: '700',
              transition: 'all 0.3s ease',
            }}
            onClick={handleLogoClick}
          >
            <span style={{ color: '#16a34a' }}>Edu</span>
            <span style={{ color: '#000000' }}>Search</span>
          </div>
          <button
              style={
                hoveredLink === 'back'
                  ? navLinkHoverStyle
                  : navLinkStyle
              }
              onClick={goBack}
              onMouseEnter={() => setHoveredLink('back')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              ← Back
            </button>

          {/* Desktop nav */}
          <div
            style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
             <button
              style={
                hoveredLink === 'home'
                  ? navLinkHoverStyle
                  : navLinkStyle
              }
              onClick={handleLogoClick}
              onMouseEnter={() => setHoveredLink('home')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Home
            </button> 
            <button
              style={
                hoveredLink === 'all'
                  ? navLinkHoverStyle
                  : navLinkStyle
              }
              onClick={goToAllSchools}
              onMouseEnter={() => setHoveredLink('all')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              All Schools
            </button>
            
            {token && user && (
              <>
                {user.role === 'parent' && (
                  <>
                    <button 
                      style={hoveredLink === 'bookings' ? { ...navLinkStyle, ...navLinkHoverStyle } : navLinkStyle}
                      onClick={goToMyBookings}
                      onMouseEnter={() => setHoveredLink('bookings')}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      My Bookings
                    </button>
                    <button 
                      style={hoveredLink === 'comparisons' ? { ...navLinkStyle, ...navLinkHoverStyle } : navLinkStyle}
                      onClick={goToMyComparisons}
                      onMouseEnter={() => setHoveredLink('comparisons')}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      My Comparisons
                    </button>
                    <button 
                      style={hoveredLink === 'messages' ? { ...navLinkStyle, ...navLinkHoverStyle } : navLinkStyle}
                      onClick={goToMessages}
                      onMouseEnter={() => setHoveredLink('messages')}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      💬 Messages
                      {unreadCount > 0 && (
                        <span style={messagesBadgeStyle}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* User actions */}
          <div
            style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {token && user ? (
              <>
                <span style={userGreetingStyle}>Hello, {user.name}</span>
                <button
                  style={logoutBtnStyle}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                style={loginBtnStyle}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            style={{
              display: isMobile ? 'flex' : 'none',
              flexDirection: 'column',
              justifyContent: 'space-around',
              width: '25px',
              height: '25px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              zIndex: 1001,
            }}
            onClick={toggleMenu}
          >
            <span
              style={{
                ...hamburgerLineStyle,
                transform: isMenuOpen ? 'rotate(45deg)' : 'none',
              }}
            />
            <span
              style={{
                ...hamburgerLineStyle,
                opacity: isMenuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                ...hamburgerLineStyle,
                transform: isMenuOpen ? 'rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div style={mobileMenuStyle}>
          <button 
            style={mobileNavLinkStyle}
            onClick={handleLogoClick}
            onMouseEnter={(e) => { e.target.style.background = '#16a34a'; e.target.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#1f2937'; }}
          >
            Home
          </button>
          
          {token && user && (
            <>
              {user.role === 'parent' && (
                <>
                  <button 
                    style={mobileNavLinkStyle}
                    onClick={goToMyBookings}
                    onMouseEnter={(e) => { e.target.style.background = '#16a34a'; e.target.style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#1f2937'; }}
                  >
                    My Bookings
                  </button>
                  <button 
                    style={mobileNavLinkStyle}
                    onClick={goToMyComparisons}
                    onMouseEnter={(e) => { e.target.style.background = '#16a34a'; e.target.style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#1f2937'; }}
                  >
                    My Comparisons
                  </button>
                  <button 
                    style={mobileNavLinkStyle}
                    onClick={goToMessages}
                    onMouseEnter={(e) => { e.target.style.background = '#16a34a'; e.target.style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#1f2937'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>💬 Messages</span>
                      {unreadCount > 0 && (
                        <span style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                </>
              )}
            </>
          )}

          <div style={mobileUserSectionStyle}>
            {token && user ? (
              <>
                <span style={mobileUserGreetingStyle}>Hello, {user.name}</span>
                <button 
                  style={mobileLogoutBtnStyle}
                  onClick={handleLogout}
                  onMouseEnter={(e) => e.target.style.background = '#1f2937'}
                  onMouseLeave={(e) => e.target.style.background = '#000000'}
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                style={mobileLoginBtnStyle}
                onClick={() => navigate('/login')}
                onMouseEnter={(e) => e.target.style.background = '#15803d'}
                onMouseLeave={(e) => e.target.style.background = '#16a34a'}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Modal */}
      <Modal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        type="confirm"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
};

// Reusable styles
const navLinkStyle = {
  background: 'none',
  border: 'none',
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  fontWeight: '500',
  color: '#1f2937',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'all 0.3s ease',
};

const navLinkHoverStyle = {
  ...navLinkStyle,
  background: '#16a34a',
  color: '#ffffff',
  transform: 'translateY(-1px)',
};

const logoutBtnStyle = {
  ...navLinkStyle,
  background: '#000000',
  color: '#ffffff',
};

const loginBtnStyle = {
  ...navLinkStyle,
  background: '#16a34a',
  color: '#ffffff',
};

const userGreetingStyle = {
  fontSize: '0.95rem',
  fontWeight: '500',
  color: '#1f2937',
};

const hamburgerLineStyle = {
  width: '100%',
  height: '3px',
  background: '#000000',
  borderRadius: '2px',
  transition: 'all 0.3s ease',
  transformOrigin: '1px',
};

const mobileMenuStyle = (isOpen) => ({
  position: 'fixed',
  top: '70px',
  left: 0,
  right: 0,
  background: '#ffffff',
  borderBottom: '2px solid #d1d5db',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
  transition: 'all 0.3s ease',
  opacity: isOpen ? 1 : 0,
  visibility: isOpen ? 'visible' : 'hidden',
  zIndex: 999,
});

const mobileNavLinkStyle = {
  display: 'block',
  width: '100%',
  padding: '1rem',
  border: 'none',
  fontSize: '1rem',
  fontWeight: '500',
  color: '#1f2937',
  cursor: 'pointer',
  textAlign: 'left',
  borderBottom: '1px solid #d1d5db',
  background: 'none',
};

const mobileUserSectionStyle = {
  padding: '1rem',
  borderTop: '2px solid #d1d5db',
  background: '#f9fafb',
};

const mobileUserGreetingStyle = {
  display: 'block',
  fontSize: '0.95rem',
  fontWeight: '500',
  color: '#1f2937',
  marginBottom: '0.75rem',
};

const mobileLoginBtnStyle = {
  width: '100%',
  padding: '0.75rem',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  background: '#16a34a',
  color: '#ffffff',
};

const mobileLogoutBtnStyle = {
  ...mobileLoginBtnStyle,
  background: '#000000',
};

export default Navbar;
