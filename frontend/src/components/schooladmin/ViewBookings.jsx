import React, { useState, useEffect } from 'react';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [tourFilter, setTourFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Blue theme colors
  const colors = {
    primaryBlue: '#007bff',
    darkBlue: '#0056b3',
    lightBlue: '#e3f2fd',
    successGreen: '#28a745',
    warningYellow: '#ffc107',
    dangerRed: '#dc3545',
    infoTeal: '#17a2b8',
    graySecondary: '#6c757d',
    darkGray: '#2d2d2d',
    lightGray: '#f8f9fa',
    white: '#ffffff',
    borderGray: '#e0e0e0'
  };

  useEffect(() => {
    fetchBookings();
    fetchTours();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/school-admin/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/school-admin/tours', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch tours');
      const data = await response.json();
      setTours(data);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/school-admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          adminNotes: adminNotes 
        })
      });

      if (!response.ok) throw new Error('Failed to update booking status');
      await fetchBookings();
      setShowDetails(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;
    if (filter !== 'all') filtered = filtered.filter(booking => booking.status === filter);
    if (tourFilter !== 'all') filtered = filtered.filter(booking => booking.tourId?._id === tourFilter);
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return colors.successGreen;
      case 'pending': return colors.warningYellow;
      case 'cancelled': return colors.dangerRed;
      case 'completed': return colors.infoTeal;
      case 'no-show': return colors.graySecondary;
      default: return colors.graySecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      case 'completed': return '🎉';
      case 'no-show': return '👻';
      default: return '❓';
    }
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.adminNotes || '');
    setShowDetails(true);
  };

  // Styling objects
  const wrapperStyle = {
    padding: '2rem',
    backgroundColor: '#f9fafe',
    minHeight: '100vh',
    fontFamily: '"Segoe UI", sans-serif'
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const headerStyle = {
    marginBottom: '2rem',
    background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
    color: colors.white,
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 123, 255, 0.3)'
  };

  const headerTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  const headerSubtitleStyle = {
    fontSize: '1.2rem',
    margin: 0,
    opacity: 0.9
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  const getStatCardStyle = (color) => ({
    backgroundColor: colors.white,
    padding: '1.5rem',
    borderRadius: '12px',
    border: `1px solid ${colors.borderGray}`,
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  });

  const statNumberStyle = (color) => ({
    fontSize: '2.5rem',
    fontWeight: '700',
    color: color,
    margin: '0.5rem 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  });

  const statLabelStyle = {
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const filtersCardStyle = {
    backgroundColor: colors.white,
    padding: '2rem',
    borderRadius: '12px',
    border: `1px solid ${colors.borderGray}`,
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const filtersContainerStyle = {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    alignItems: 'end'
  };

  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '200px'
  };

  const labelStyle = {
    fontWeight: '600',
    color: colors.darkGray,
    fontSize: '0.95rem'
  };

  const selectStyle = {
    padding: '0.75rem 1rem',
    border: `2px solid #e1e5e9`,
    borderRadius: '8px',
    fontSize: '0.9rem',
    background: colors.white,
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const refreshButtonStyle = {
    padding: '0.75rem 1.5rem',
    background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const bookingsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
    gap: '2rem'
  };

  const bookingCardStyle = {
    backgroundColor: colors.white,
    padding: '2rem',
    borderRadius: '12px',
    border: `1px solid ${colors.borderGray}`,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    position: 'relative'
  };

  const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem'
  };

  const parentNameStyle = {
    margin: 0,
    color: colors.darkGray,
    fontSize: '1.3rem',
    fontWeight: '700'
  };

  const getStatusBadgeStyle = (status) => ({
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: getStatusColor(status) + '20',
    color: getStatusColor(status),
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  });

  const bookingDetailsStyle = {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '1.5rem'
  };

  const detailItemStyle = {
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem'
  };

  const detailLabelStyle = {
    fontWeight: '600',
    color: colors.darkGray,
    minWidth: '80px'
  };

  const specialRequestStyle = {
    backgroundColor: colors.lightBlue,
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: `1px solid ${colors.primaryBlue}20`
  };

  const adminNotesStyle = {
    backgroundColor: '#fff3cd',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #ffc107'
  };

  const actionsContainerStyle = {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  };

  const getActionButtonStyle = (type) => {
    const styles = {
      view: {
        background: `linear-gradient(135deg, ${colors.infoTeal} 0%, #138496 100%)`,
        boxShadow: '0 2px 4px rgba(23, 162, 184, 0.3)'
      },
      confirm: {
        background: `linear-gradient(135deg, ${colors.successGreen} 0%, #1e7e34 100%)`,
        boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)'
      },
      cancel: {
        background: `linear-gradient(135deg, ${colors.dangerRed} 0%, #c82333 100%)`,
        boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)'
      },
      complete: {
        background: `linear-gradient(135deg, ${colors.infoTeal} 0%, #138496 100%)`,
        boxShadow: '0 2px 4px rgba(23, 162, 184, 0.3)'
      },
      noshow: {
        background: `linear-gradient(135deg, ${colors.graySecondary} 0%, #495057 100%)`,
        boxShadow: '0 2px 4px rgba(108, 117, 125, 0.3)'
      }
    };

    return {
      padding: '0.6rem 1rem',
      color: colors.white,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      ...styles[type]
    };
  };

  const emptyStateStyle = {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: colors.white,
    borderRadius: '12px',
    border: `1px solid ${colors.borderGray}`,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  };

  const modalContentStyle = {
    backgroundColor: colors.white,
    padding: '2.5rem',
    borderRadius: '12px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px rgba(0,0,0,0.3)',
    position: 'relative'
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: `2px solid ${colors.lightBlue}`
  };

  const modalTitleStyle = {
    margin: 0,
    color: colors.darkGray,
    fontSize: '1.8rem',
    fontWeight: '700'
  };

  const closeButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.8rem',
    cursor: 'pointer',
    color: '#666',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  };

  const sectionTitleStyle = {
    color: colors.primaryBlue,
    marginTop: '1.5rem',
    marginBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: '700',
    borderBottom: `2px solid ${colors.lightBlue}`,
    paddingBottom: '0.5rem'
  };

  const textareaStyle = {
    width: '100%',
    padding: '1rem',
    border: `2px solid #e1e5e9`,
    borderRadius: '8px',
    fontSize: '0.9rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    background: '#fafbfc',
    boxSizing: 'border-box'
  };

  const modalActionsStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${colors.borderGray}`
  };

  const loadingStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    fontSize: '1.2rem',
    color: '#666',
    background: colors.white,
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    gap: '1rem'
  };

  if (loading) {
    return (
      <div className="vb-wrapper" style={wrapperStyle}>
        <div className="vb-container" style={containerStyle}>
          <div className="vb-loading" style={loadingStyle}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: `4px solid ${colors.primaryBlue}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            ⏳ Loading bookings...
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  return (
    <div className="vb-wrapper" style={wrapperStyle}>
      <div className="vb-container" style={containerStyle}>
        {/* Header */}
        <div className="vb-header" style={headerStyle}>
          <h1 className="vb-header-title" style={headerTitleStyle}>
            📅 View Bookings
          </h1>
          <p className="vb-header-subtitle" style={headerSubtitleStyle}>
            Manage and track all tour bookings
          </p>
        </div>

        {/* Statistics */}
        <div className="vb-stats-grid" style={statsGridStyle}>
          <div 
            className="vb-stat-card"
            style={getStatCardStyle(colors.primaryBlue)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div className="vb-stat-number" style={statNumberStyle(colors.primaryBlue)}>
              {stats.total}
            </div>
            <div className="vb-stat-label" style={statLabelStyle}>Total Bookings</div>
          </div>

          <div 
            className="vb-stat-card"
            style={getStatCardStyle(colors.warningYellow)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div className="vb-stat-number" style={statNumberStyle(colors.warningYellow)}>
              {stats.pending}
            </div>
            <div className="vb-stat-label" style={statLabelStyle}>Pending</div>
          </div>

          <div 
            className="vb-stat-card"
            style={getStatCardStyle(colors.successGreen)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div className="vb-stat-number" style={statNumberStyle(colors.successGreen)}>
              {stats.confirmed}
            </div>
            <div className="vb-stat-label" style={statLabelStyle}>Confirmed</div>
          </div>

          <div 
            className="vb-stat-card"
            style={getStatCardStyle(colors.infoTeal)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div className="vb-stat-number" style={statNumberStyle(colors.infoTeal)}>
              {stats.completed}
            </div>
            <div className="vb-stat-label" style={statLabelStyle}>Completed</div>
          </div>

          <div 
            className="vb-stat-card"
            style={getStatCardStyle(colors.dangerRed)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div className="vb-stat-number" style={statNumberStyle(colors.dangerRed)}>
              {stats.cancelled}
            </div>
            <div className="vb-stat-label" style={statLabelStyle}>Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="vb-filters-card" style={filtersCardStyle}>
          <div className="vb-filters-container" style={filtersContainerStyle}>
            <div className="vb-filter-group" style={filterGroupStyle}>
              <label className="vb-label" style={labelStyle}>
                Filter by Status:
              </label>
              <select
                className="vb-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={selectStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primaryBlue;
                  e.target.style.boxShadow = `0 0 0 3px rgba(0, 123, 255, 0.15)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All Statuses ({stats.total})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="confirmed">Confirmed ({stats.confirmed})</option>
                <option value="cancelled">Cancelled ({stats.cancelled})</option>
                <option value="completed">Completed ({stats.completed})</option>
              </select>
            </div>

            <div className="vb-filter-group" style={filterGroupStyle}>
              <label className="vb-label" style={labelStyle}>
                Filter by Tour:
              </label>
              <select
                className="vb-select"
                value={tourFilter}
                onChange={(e) => setTourFilter(e.target.value)}
                style={selectStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primaryBlue;
                  e.target.style.boxShadow = `0 0 0 3px rgba(0, 123, 255, 0.15)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All Tours</option>
                {tours.map(tour => (
                  <option key={tour._id} value={tour._id}>
                    {tour.title} - {new Date(tour.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <button
                className="vb-refresh-btn"
                onClick={fetchBookings}
                style={refreshButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 123, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="vb-bookings-grid" style={bookingsGridStyle}>
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => (
              <div 
                key={booking._id} 
                className="vb-booking-card" 
                style={bookingCardStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                <div className="vb-card-header" style={cardHeaderStyle}>
                  <h3 className="vb-parent-name" style={parentNameStyle}>
                    {booking.parentId?.name || 'Parent'}
                  </h3>
                  <span className="vb-status-badge" style={getStatusBadgeStyle(booking.status)}>
                    {getStatusIcon(booking.status)} {booking.status}
                  </span>
                </div>

                <div className="vb-booking-details" style={bookingDetailsStyle}>
                  <div className="vb-detail-item" style={detailItemStyle}>
                    <span style={detailLabelStyle}>📧 Email:</span>
                    <span>{booking.parentEmail}</span>
                  </div>
                  <div className="vb-detail-item" style={detailItemStyle}>
                    <span style={detailLabelStyle}>📱 Phone:</span>
                    <span>{booking.parentPhone}</span>
                  </div>
                  <div className="vb-detail-item" style={detailItemStyle}>
                    <span style={detailLabelStyle}>🎯 Tour:</span>
                    <span>{booking.tourId?.title || 'Tour not found'}</span>
                  </div>
                  <div className="vb-detail-item" style={detailItemStyle}>
                    <span style={detailLabelStyle}>📅 Date:</span>
                    <span>{booking.tourId ? new Date(booking.tourId.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="vb-detail-item" style={detailItemStyle}>
                    <span style={detailLabelStyle}>⏰ Time:</span>
                    <span>{booking.selectedTimeSlot?.startTime || 'N/A'} - {booking.selectedTimeSlot?.endTime || 'N/A'}</span>
                  </div>
                  <div className="vb-detail-item" style={detailItemStyle}>
                    <span style={detailLabelStyle}>👥 Guests:</span>
                    <span>{booking.numberOfGuests}</span>
                  </div>
                  <div className="vb-detail-item" style={detailItemStyle}>
                    <span style={detailLabelStyle}>📝 Booked:</span>
                    <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="vb-special-requests" style={specialRequestStyle}>
                    <strong style={{ fontSize: '0.9rem', color: colors.primaryBlue }}>💬 Special Requests:</strong>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                      {booking.specialRequests}
                    </p>
                  </div>
                )}

                {booking.adminNotes && (
                  <div className="vb-admin-notes" style={adminNotesStyle}>
                    <strong style={{ fontSize: '0.9rem', color: '#856404' }}>📝 Admin Notes:</strong>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#856404' }}>
                      {booking.adminNotes}
                    </p>
                  </div>
                )}

                <div className="vb-actions-container" style={actionsContainerStyle}>
                  <button 
                    className="vb-view-btn"
                    onClick={() => showBookingDetails(booking)}
                    style={getActionButtonStyle('view')}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(23, 162, 184, 0.3)';
                    }}
                  >
                    👁️ View Details
                  </button>

                  {booking.status === 'pending' && (
                    <>
                      <button 
                        className="vb-confirm-btn"
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        style={getActionButtonStyle('confirm')}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 4px rgba(40, 167, 69, 0.3)';
                        }}
                      >
                        ✅ Confirm
                      </button>
                      <button 
                        className="vb-cancel-btn"
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        style={getActionButtonStyle('cancel')}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.3)';
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <button 
                        className="vb-complete-btn"
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        style={getActionButtonStyle('complete')}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 4px rgba(23, 162, 184, 0.3)';
                        }}
                      >
                        🎉 Mark Complete
                      </button>
                      <button 
                        className="vb-noshow-btn"
                        onClick={() => handleStatusUpdate(booking._id, 'no-show')}
                        style={getActionButtonStyle('noshow')}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.3)';
                        }}
                      >
                        👻 No Show
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="vb-empty-state" style={emptyStateStyle}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.6 }}>📅</div>
              <h3 style={{ color: colors.darkGray, marginBottom: '0.5rem' }}>No bookings found</h3>
              <p style={{ color: '#666' }}>
                {filter === 'all' && tourFilter === 'all' 
                  ? 'No bookings have been made yet.' 
                  : 'No bookings match your current filters.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {showDetails && selectedBooking && (
          <div className="vb-modal-overlay" style={modalOverlayStyle}>
            <div className="vb-modal-content" style={modalContentStyle}>
              <div className="vb-modal-header" style={modalHeaderStyle}>
                <h2 className="vb-modal-title" style={modalTitleStyle}>
                  📋 Booking Details
                </h2>
                <button
                  className="vb-close-btn"
                  onClick={() => setShowDetails(false)}
                  style={closeButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.color = colors.dangerRed;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#666';
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ lineHeight: '1.6' }}>
                <h3 style={sectionTitleStyle}>👤 Parent Information</h3>
                <div style={detailItemStyle}><strong>Name:</strong> {selectedBooking.parentId?.name || 'N/A'}</div>
                <div style={detailItemStyle}><strong>Email:</strong> {selectedBooking.parentEmail}</div>
                <div style={detailItemStyle}><strong>Phone:</strong> {selectedBooking.parentPhone}</div>
                
                <h3 style={sectionTitleStyle}>🎯 Tour Information</h3>
                <div style={detailItemStyle}><strong>Tour:</strong> {selectedBooking.tourId?.title || 'Tour not found'}</div>
                {selectedBooking.tourId && (
                  <>
                    <div style={detailItemStyle}><strong>Date:</strong> {new Date(selectedBooking.tourId.date).toLocaleDateString()}</div>
                    <div style={detailItemStyle}><strong>Time:</strong> {selectedBooking.selectedTimeSlot?.startTime || 'N/A'} - {selectedBooking.selectedTimeSlot?.endTime || 'N/A'}</div>
                  </>
                )}
                <div style={detailItemStyle}><strong>Number of Guests:</strong> {selectedBooking.numberOfGuests}</div>
                
                <h3 style={sectionTitleStyle}>📊 Booking Status</h3>
                <div style={detailItemStyle}>
                  <strong>Status:</strong>
                  <span style={{
                    marginLeft: '0.5rem',
                    ...getStatusBadgeStyle(selectedBooking.status)
                  }}>
                    {getStatusIcon(selectedBooking.status)} {selectedBooking.status.toUpperCase()}
                  </span>
                </div>
                <div style={detailItemStyle}><strong>Booked On:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
                {selectedBooking.confirmedAt && (
                  <div style={detailItemStyle}><strong>Confirmed On:</strong> {new Date(selectedBooking.confirmedAt).toLocaleString()}</div>
                )}
                {selectedBooking.cancelledAt && (
                  <div style={detailItemStyle}><strong>Cancelled On:</strong> {new Date(selectedBooking.cancelledAt).toLocaleString()}</div>
                )}
              </div>

              {selectedBooking.specialRequests && (
                <div style={specialRequestStyle}>
                  <strong style={{ color: colors.primaryBlue }}>💬 Special Requests:</strong>
                  <p style={{ margin: '0.5rem 0 0 0' }}>{selectedBooking.specialRequests}</p>
                </div>
              )}

              <div style={{ margin: '1.5rem 0' }}>
                <label style={labelStyle}>
                  📝 Admin Notes:
                </label>
                <textarea
                  className="vb-admin-textarea"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this booking..."
                  rows="3"
                  style={textareaStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryBlue;
                    e.target.style.boxShadow = `0 0 0 3px rgba(0, 123, 255, 0.15)`;
                    e.target.style.background = colors.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#fafbfc';
                  }}
                />
              </div>

              <div className="vb-modal-actions" style={modalActionsStyle}>
                {selectedBooking.status === 'pending' && (
                  <>
                    <button 
                      className="vb-modal-confirm-btn"
                      onClick={() => handleStatusUpdate(selectedBooking._id, 'confirmed')}
                      style={{...getActionButtonStyle('confirm'), padding: '0.75rem 1.5rem'}}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(40, 167, 69, 0.3)';
                      }}
                    >
                      ✅ Confirm Booking
                    </button>
                    <button 
                      className="vb-modal-cancel-btn"
                      onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                      style={{...getActionButtonStyle('cancel'), padding: '0.75rem 1.5rem'}}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.3)';
                      }}
                    >
                      ❌ Cancel Booking
                    </button>
                  </>
                )}

                {selectedBooking.status === 'confirmed' && (
                  <>
                    <button 
                      className="vb-modal-complete-btn"
                      onClick={() => handleStatusUpdate(selectedBooking._id, 'completed')}
                      style={{...getActionButtonStyle('complete'), padding: '0.75rem 1.5rem'}}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(23, 162, 184, 0.3)';
                      }}
                    >
                      🎉 Mark as Completed
                    </button>
                    <button 
                      className="vb-modal-noshow-btn"
                      onClick={() => handleStatusUpdate(selectedBooking._id, 'no-show')}
                      style={{...getActionButtonStyle('noshow'), padding: '0.75rem 1.5rem'}}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.3)';
                      }}
                    >
                      👻 Mark as No-Show
                    </button>
                  </>
                )}

                <button
                  className="vb-modal-close-btn"
                  onClick={() => setShowDetails(false)}
                  style={{...getActionButtonStyle('noshow'), padding: '0.75rem 1.5rem'}}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.3)';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .vb-stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
          }
          
          .vb-bookings-grid {
            grid-template-columns: 1fr !important;
          }
          
          .vb-filters-container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          .vb-filter-group {
            min-width: 100% !important;
          }
          
          .vb-header {
            padding: 1.5rem !important;
          }
          
          .vb-header-title {
            font-size: 2rem !important;
          }
        }

        @media (max-width: 480px) {
          .vb-wrapper {
            padding: 1rem !important;
          }
          
          .vb-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .vb-booking-card {
            padding: 1.5rem !important;
          }
          
          .vb-modal-content {
            padding: 2rem !important;
            width: 95% !important;
          }
          
          .vb-actions-container {
            flex-direction: column !important;
          }
          
          .vb-modal-actions {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewBookings;