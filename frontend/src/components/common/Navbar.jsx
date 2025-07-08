import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => setShowLogoutModal(true);
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

  const goToAllSchools = () => {
    navigate('/results');
    setIsMenuOpen(false);
  };

  const goBack = () => {
    navigate(-1);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const [hoveredLink, setHoveredLink] = useState(null);

  const isMobile = window.innerWidth <= 768;

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
            
            {token && user?.role === 'parent' && (
              <>
                <button
                  style={
                    hoveredLink === 'bookings'
                      ? navLinkHoverStyle
                      : navLinkStyle
                  }
                  onClick={goToMyBookings}
                  onMouseEnter={() => setHoveredLink('bookings')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  My Bookings
                </button>
                <button
                  style={
                    hoveredLink === 'comparisons'
                      ? navLinkHoverStyle
                      : navLinkStyle
                  }
                  onClick={goToMyComparisons}
                  onMouseEnter={() => setHoveredLink('comparisons')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  My Comparisons
                </button>
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
        {isMobile && (
          <div style={mobileMenuStyle(isMenuOpen)}>
            <button style={mobileNavLinkStyle} onClick={goToAllSchools}>
              All Schools
            </button>
            <button style={mobileNavLinkStyle} onClick={goBack}>
              ← Back
            </button>
            {token && user?.role === 'parent' && (
              <>
                <button style={mobileNavLinkStyle} onClick={goToMyBookings}>
                  My Bookings
                </button>
                <button style={mobileNavLinkStyle} onClick={goToMyComparisons}>
                  My Comparisons
                </button>
              </>
            )}
            <div style={mobileUserSectionStyle}>
              {token && user ? (
                <>
                  <span style={mobileUserGreetingStyle}>
                    Hello, {user.name}
                  </span>
                  <button
                    style={mobileLogoutBtnStyle}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  style={mobileLoginBtnStyle}
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
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
