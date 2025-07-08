// ===== UPDATED FRONTEND: ViewBookings.jsx =====

import React, { useState, useEffect } from 'react';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tourFilter, setTourFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchBookings(), fetchTours()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch('http://localhost:5000/api/school-admin/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication failed');
      if (response.status === 403) throw new Error('Access denied');
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Fetched bookings:', data);
    setBookings(Array.isArray(data) ? data : []);
  };

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/school-admin/tours', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTours(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log('Tours fetch failed:', err);
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
        body: JSON.stringify({ status: newStatus, adminNotes })
      });
      
      if (!response.ok) throw new Error('Failed to update booking status');
      
      await fetchBookings();
      setShowDetails(false);
      setAdminNotes('');
      
      // Show success message
      showSuccessMessage(`✅ Booking ${newStatus} successfully! Parent has been notified.`);
    } catch (error) {
      showErrorMessage(`❌ Error updating booking: ${error.message}`);
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;
    if (filter !== 'all') filtered = filtered.filter(b => b.status === filter);
    if (tourFilter !== 'all') filtered = filtered.filter(b => b.tourId?._id === tourFilter);
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.adminNotes || '');
    setShowDetails(true);
  };

  // Helper functions to safely get parent data
  const getParentName = (booking) => {
    return booking.parentId?.name || 'Parent Name Not Available';
  };

  const getParentEmail = (booking) => {
    return booking.parentId?.email || 'Email not available';
  };

  const getParentPhone = (booking) => {
    return booking.parentId?.phone || 'Phone not available';
  };

  const getParentInfo = (booking) => {
    const parent = booking.parentId;
    if (!parent) return null;
    
    return {
      name: parent.name || 'Name not available',
      email: parent.email || 'Email not available',
      phone: parent.phone || 'Phone not available',
      role: parent.role || 'Role not available',
      isActive: parent.isActive !== undefined ? parent.isActive : true,
      joinedDate: parent.createdAt ? new Date(parent.createdAt).toLocaleDateString() : 'Date not available',
      lastLogin: parent.lastLogin ? new Date(parent.lastLogin).toLocaleDateString() : 'Never',
      childrenCount: parent.children?.length || 0,
      hasCompleteProfile: !!(parent.name && parent.email && parent.phone)
    };
  };

  // Helper functions for tour data
  const getTourTitle = (booking) => {
    return booking.tourId?.title || 'Tour not found';
  };

  const getTourDate = (booking) => {
    return booking.tourId?.date ? new Date(booking.tourId.date).toLocaleDateString() : 'N/A';
  };

  const getTourTime = (booking) => {
    const slot = booking.selectedTimeSlot;
    if (!slot) return 'Time not available';
    return `${slot.startTime || 'N/A'} - ${slot.endTime || 'N/A'}`;
  };

  // Message functions
  const showSuccessMessage = (message) => {
    // You can replace this with your toast notification system
    alert(message);
  };

  const showErrorMessage = (message) => {
    // You can replace this with your toast notification system  
    alert(message);
  };

  if (loading) {
    return (
      <div className="bookings-wrapper">
        <div className="loading-container">⏳ Loading bookings...</div>
        <style>{bookingStyles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-wrapper">
        <div className="error-container">
          <h2>❌ Error Loading Bookings</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">🔄 Try Again</button>
        </div>
        <style>{bookingStyles}</style>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="bookings-wrapper">
      <div className="bookings-container">
        {/* Header */}
        <div className="bookings-header">
          <h1>📅 View Bookings</h1>
          <p>Manage and track all tour bookings</p>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && bookings.length > 0 && (
          <div className="debug-info">
            <details style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔍 Debug Info</summary>
              <pre style={{ fontSize: '0.8rem', marginTop: '1rem', overflow: 'auto' }}>
                Sample booking structure:
                {JSON.stringify({
                  id: bookings[0]._id,
                  parentId: bookings[0].parentId,
                  parentName: getParentName(bookings[0]),
                  parentEmail: getParentEmail(bookings[0]),
                  tourTitle: getTourTitle(bookings[0]),
                  status: bookings[0].status
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.confirmed}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-card">
          <div className="filters-container">
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                <option value="all">All Statuses ({stats.total})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="confirmed">Confirmed ({stats.confirmed})</option>
                <option value="cancelled">Cancelled ({stats.cancelled})</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Tour:</label>
              <select value={tourFilter} onChange={(e) => setTourFilter(e.target.value)} className="filter-select">
                <option value="all">All Tours</option>
                {tours.map(tour => (
                  <option key={tour._id} value={tour._id}>
                    {tour.title} - {new Date(tour.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={fetchData} className="refresh-btn">🔄 Refresh</button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bookings-grid">
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => {
              const parentInfo = getParentInfo(booking);
              
              return (
                <div key={booking._id} className="booking-card">
                  <div className="card-header">
                    <div>
                      <h3>{getParentName(booking)}</h3>
                      {parentInfo && !parentInfo.hasCompleteProfile && (
                        <small style={{ color: '#ff6b35', fontSize: '0.8rem' }}>
                          ⚠️ Incomplete parent profile
                        </small>
                      )}
                    </div>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status === 'confirmed' ? '✅' : 
                       booking.status === 'pending' ? '⏳' : 
                       booking.status === 'cancelled' ? '❌' : '❓'} {booking.status}
                    </span>
                  </div>

                  <div className="booking-details">
                    <div><strong>📧 Email:</strong> {getParentEmail(booking)}</div>
                    <div><strong>📱 Phone:</strong> {getParentPhone(booking)}</div>
                    <div><strong>🎯 Tour:</strong> {getTourTitle(booking)}</div>
                    <div><strong>📅 Date:</strong> {getTourDate(booking)}</div>
                    <div><strong>⏰ Time:</strong> {getTourTime(booking)}</div>
                    <div><strong>👥 Guests:</strong> {booking.numberOfGuests}</div>
                    <div><strong>📝 Booked:</strong> {new Date(booking.createdAt).toLocaleDateString()}</div>
                    
                    {parentInfo && (
                      <>

                      </>
                    )}
                  </div>

                  {booking.adminNotes && (
                    <div className="admin-notes">
                      <strong>📝 Admin Notes:</strong>
                      <p>{booking.adminNotes}</p>
                    </div>
                  )}

                  <div className="actions-container">
                    <button onClick={() => showBookingDetails(booking)} className="action-btn view">
                      👁️ View Details
                    </button>

                    {booking.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(booking._id, 'confirmed')} className="action-btn confirm">
                          ✅ Confirm
                        </button>
                        <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')} className="action-btn cancel">
                          ❌ Cancel
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')} className="action-btn cancel">
                        ❌ Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No bookings found</h3>
              <p>{filter === 'all' && tourFilter === 'all' ? 'No bookings have been made yet.' : 'No bookings match your current filters.'}</p>
            </div>
          )}
        </div>

        {/* Enhanced Modal */}
        {showDetails && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📋 Booking Details</h2>
                <button onClick={() => setShowDetails(false)} className="close-btn">✕</button>
              </div>

              <div className="modal-body">
                <h3>👤 Parent Information</h3>
                {(() => {
                  const parentInfo = getParentInfo(selectedBooking);
                  return parentInfo ? (
                    <>
                      <div><strong>Full Name:</strong> {parentInfo.name}</div>
                      <div><strong>Email:</strong> {parentInfo.email}</div>
                      <div><strong>Phone:</strong> {parentInfo.phone}</div>
                      <div><strong>Account Status:</strong> {parentInfo.isActive ? '✅ Active' : '❌ Inactive'}</div>
                    </>
                  ) : (
                    <div style={{ color: '#dc3545', fontStyle: 'italic' }}>
                      ⚠️ Parent information not available. This might indicate a data issue.
                    </div>
                  );
                })()}
                
                <h3>🎯 Tour Information</h3>
                <div><strong>Tour Title:</strong> {getTourTitle(selectedBooking)}</div>
                <div><strong>Tour Date:</strong> {getTourDate(selectedBooking)}</div>
                <div><strong>Time Slot:</strong> {getTourTime(selectedBooking)}</div>
                <div><strong>Number of Guests:</strong> {selectedBooking.numberOfGuests}</div>
                {selectedBooking.tourId?.meetingPoint && (
                  <div><strong>Meeting Point:</strong> {selectedBooking.tourId.meetingPoint}</div>
                )}
                
                <h3>📊 Booking Information</h3>
                <div><strong>Status:</strong> 
                  <span className={`status-badge ${selectedBooking.status}`} style={{ marginLeft: '0.5rem' }}>
                    {selectedBooking.status === 'confirmed' ? '✅' : 
                     selectedBooking.status === 'pending' ? '⏳' : 
                     selectedBooking.status === 'cancelled' ? '❌' : '❓'} {selectedBooking.status.toUpperCase()}
                  </span>
                </div>
                <div><strong>Booking Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
                {selectedBooking.confirmedAt && (
                  <div><strong>Confirmed On:</strong> {new Date(selectedBooking.confirmedAt).toLocaleString()}</div>
                )}
                {selectedBooking.cancelledAt && (
                  <div><strong>Cancelled On:</strong> {new Date(selectedBooking.cancelledAt).toLocaleString()}</div>
                )}

                <div className="admin-notes-section">
                  <label><strong>📝 Admin Notes:</strong></label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this booking..."
                    rows="3"
                    className="admin-textarea"
                  />
                </div>
              </div>

              <div className="modal-actions">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatusUpdate(selectedBooking._id, 'confirmed')} className="action-btn confirm">
                      ✅ Confirm Booking
                    </button>
                    <button onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')} className="action-btn cancel">
                      ❌ Cancel Booking
                    </button>
                  </>
                )}

                {selectedBooking.status === 'confirmed' && (
                  <button onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')} className="action-btn cancel">
                    ❌ Cancel Booking
                  </button>
                )}

                <button onClick={() => setShowDetails(false)} className="action-btn close">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{bookingStyles}</style>
    </div>
  );
};

// Same styles as before
const bookingStyles = `
.bookings-wrapper { padding: 2rem; background: #f9fafe; min-height: 100vh; font-family: "Segoe UI", sans-serif; }
.bookings-container { max-width: 1400px; margin: 0 auto; }
.loading-container, .error-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 400px; font-size: 1.2rem; color: #666; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); gap: 1rem; }
.bookings-header { margin-bottom: 2rem; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 2rem; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3); }
.bookings-header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
.bookings-header p { font-size: 1.2rem; margin: 0; opacity: 0.9; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e0e0e0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.stat-number { font-size: 2.5rem; font-weight: 700; color: #007bff; margin: 0.5rem 0; }
.stat-label { color: #666; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; }
.filters-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e0e0e0; margin-bottom: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.filters-container { display: flex; gap: 2rem; flex-wrap: wrap; align-items: end; }
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; min-width: 200px; }
.filter-group label { font-weight: 600; color: #2d2d2d; font-size: 0.95rem; }
.filter-select { padding: 0.75rem 1rem; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 0.9rem; background: white; transition: all 0.3s ease; cursor: pointer; }
.filter-select:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15); }
.refresh-btn { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3); }
.refresh-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4); }
.bookings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 2rem; }
.booking-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.booking-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.card-header h3 { margin: 0; color: #2d2d2d; font-size: 1.3rem; font-weight: 700; }
.status-badge { padding: 0.5rem 1rem; border-radius: 25px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.status-badge.confirmed { background: #e8f5e8; color: #2e7d2e; }
.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.cancelled { background: #f8d7da; color: #721c24; }
.booking-details { font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; }
.booking-details div { margin-bottom: 0.5rem; }
.admin-notes { background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid rgba(0, 123, 255, 0.2); }
.admin-notes p { margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #666; }
.actions-container { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.action-btn { padding: 0.6rem 1rem; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s ease; }
.action-btn.view { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); }
.action-btn.confirm { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); }
.action-btn.cancel { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }
.action-btn.close { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); }
.action-btn:hover { transform: translateY(-2px); }
.empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.6; }
.empty-state h3 { color: #2d2d2d; margin-bottom: 0.5rem; }
.empty-state p { color: #666; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2.5rem; border-radius: 12px; max-width: 700px; width: 90%; max-height: 85vh; overflow: auto; box-shadow: 0 20px 25px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e3f2fd; }
.modal-header h2 { margin: 0; color: #2d2d2d; font-size: 1.8rem; font-weight: 700; }
.close-btn { background: transparent; border: none; font-size: 1.8rem; cursor: pointer; color: #666; padding: 0.5rem; border-radius: 50%; transition: all 0.3s ease; }
.close-btn:hover { background: #f0f0f0; color: #dc3545; }
.modal-body h3 { color: #007bff; margin: 1.5rem 0 1rem 0; font-size: 1.2rem; font-weight: 700; border-bottom: 2px solid #e3f2fd; padding-bottom: 0.5rem; }
.modal-body div { margin: 0.5rem 0; line-height: 1.6; }
.admin-notes-section { margin: 1.5rem 0; }
.admin-notes-section label { display: block; font-weight: 600; color: #2d2d2d; margin-bottom: 0.5rem; }
.admin-textarea { width: 100%; padding: 1rem; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 0.9rem; resize: vertical; font-family: inherit; transition: all 0.3s ease; background: #fafbfc; box-sizing: border-box; }
.admin-textarea:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15); background: white; }
.modal-actions { display: flex; gap: 1rem; justify-content: flex-end; flex-wrap: wrap; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e0e0e0; }
.retry-btn { padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.3s ease; }
.retry-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4); }
@media (max-width: 768px) {
  .bookings-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
  .filters-container { flex-direction: column; align-items: stretch; }
  .filter-group { min-width: 100%; }
  .bookings-header { padding: 1.5rem; }
  .bookings-header h1 { font-size: 2rem; }
}
@media (max-width: 480px) {
  .bookings-wrapper { padding: 1rem; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .booking-card { padding: 1.5rem; }
  .modal-content { padding: 2rem; width: 95%; }
  .actions-container { flex-direction: column; }
  .modal-actions { flex-direction: column; }
}
`;

export default ViewBookings;