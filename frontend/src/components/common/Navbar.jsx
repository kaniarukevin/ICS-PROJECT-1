// frontend/src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle screen resizing
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    if (token && user) {
      fetchUnreadCount();
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

  const goToAllSchools = () => {
    navigate('/results');
    setIsMenuOpen(false);
  };

  const goBack = () => {
    navigate(-1);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const navLinkHoverStyle = {
    background: '#16a34a',
    color: '#ffffff',
    transform: 'translateY(-1px)'
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
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px'
        }}>
          {/* Logo */}
          <div
            onClick={handleLogoClick}
            style={{
              cursor: 'pointer',
              fontSize: '1.75rem',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              color: '#000'
            }}
          >
            <span style={{ color: '#16a34a' }}>Edu</span>
            <span>Search</span>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                style={hoveredLink === 'back' ? { ...navLinkStyle, ...navLinkHoverStyle } : navLinkStyle}
                onClick={goBack}
                onMouseEnter={() => setHoveredLink('back')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                ← Back
              </button>
              <button
                style={hoveredLink === 'home' ? { ...navLinkStyle, ...navLinkHoverStyle } : navLinkStyle}
                onClick={handleLogoClick}
                onMouseEnter={() => setHoveredLink('home')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Home
              </button>
              <button
                style={hoveredLink === 'all' ? { ...navLinkStyle, ...navLinkHoverStyle } : navLinkStyle}
                onClick={goToAllSchools}
                onMouseEnter={() => setHoveredLink('all')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                All Schools
              </button>

              {token && user && user.role === 'parent' && (
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
                    {unreadCount > 0 && <span style={messagesBadgeStyle}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Auth Actions */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {token && user ? (
                <>
                  <span style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1f2937' }}>
                    Hello, {user.name}
                  </span>
                  <button
                    style={{ ...navLinkStyle, background: '#000', color: '#fff' }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  style={{ ...navLinkStyle, background: '#16a34a', color: '#fff' }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button onClick={toggleMenu} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <span style={{ width: '25px', height: '3px', background: '#000', display: 'block', margin: '4px 0' }} />
              <span style={{ width: '25px', height: '3px', background: '#000', display: 'block', margin: '4px 0' }} />
              <span style={{ width: '25px', height: '3px', background: '#000', display: 'block', margin: '4px 0' }} />
            </button>
          )}
        </div>

        {/* Optional: Mobile Menu dropdown logic can go here */}
      </nav>

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

export default Navbar;
