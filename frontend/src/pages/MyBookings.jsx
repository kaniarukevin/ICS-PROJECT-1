import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import './myBookings.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const showModal = (type, title, message, onConfirm = null, confirmText = 'OK', cancelText = 'Cancel') => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: onConfirm ? () => {
        onConfirm();
        closeModal();
      } : () => closeModal(),
      confirmText,
      cancelText
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: null,
      confirmText: 'OK',
      cancelText: 'Cancel'
    });
  };

  useEffect(() => {
    if (!token) {
      showModal('warning', 'Login Required', 'Please log in to view your bookings.', () => {
        navigate('/login');
      }, 'Go to Login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/parents/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          showModal('error', 'Error', data.message || 'Failed to load bookings.');
        }
      } catch (err) {
        showModal('error', 'Error', 'Could not fetch bookings. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token, navigate]);

  const handleCancel = (bookingId, tourTitle) => {
    showModal(
      'warning',
      'Cancel Booking',
      `Are you sure you want to cancel your booking for "${tourTitle}"? This action cannot be undone.`,
      async () => {
        setProcessingId(bookingId);
        try {
          const res = await fetch(`http://localhost:5000/api/parents/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();

          if (res.ok) {
            setBookings(prev =>
              prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
            );
            showModal('success', 'Booking Cancelled', 'Your booking has been cancelled successfully.');
          } else {
            showModal('error', 'Cancellation Failed', data.message || 'Could not cancel booking.');
          }
        } catch (err) {
          showModal('error', 'Error', 'Something went wrong while cancelling.');
        } finally {
          setProcessingId(null);
        }
      },
      'Yes, Cancel',
      'Keep Booking'
    );
  };

  const handleDelete = (bookingId, tourTitle) => {
    showModal(
      'warning',
      'Delete Booking Record',
      `Are you sure you want to permanently delete the booking record for "${tourTitle}"? This action cannot be undone.`,
      async () => {
        setProcessingId(bookingId);
        try {
          const res = await fetch(`http://localhost:5000/api/parents/delete/${bookingId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();

          if (res.ok) {
            setBookings(prev => prev.filter(b => b._id !== bookingId));
            showModal('success', 'Booking Deleted', 'The booking record has been permanently deleted.');
          } else {
            showModal('error', 'Delete Failed', data.message || 'Could not delete booking.');
          }
        } catch (err) {
          showModal('error', 'Error', 'Something went wrong while deleting the booking.');
        } finally {
          setProcessingId(null);
        }
      },
      'Yes, Delete',
      'Cancel'
    );
  };

  const handleRebook = (booking) => {
    showModal(
      'confirm',
      'Rebook Tour',
      `Would you like to rebook the tour "${booking.tourId?.title}" at ${booking.schoolId?.name}?`,
      () => {
        navigate(`/school/${booking.schoolId?._id}?rebook=true&tourType=${booking.tourId?.tourType}`);
      },
      'Rebook Now',
      'Cancel'
    );
  };

  const canRebook = (booking) => {
    if (booking.status !== 'cancelled') return false;
    const tourDate = new Date(booking.tourId?.date);
    const today = new Date();
    const daysDifference = Math.ceil((tourDate - today) / (1000 * 60 * 60 * 24));
    return daysDifference >= 2;
  };

  const getFilteredBookings = () => {
    if (activeTab === 'all') return bookings;
    return bookings.filter(booking => {
      switch (activeTab) {
        case 'confirmed':
          return booking.status === 'confirmed' || booking.status === 'active';
        case 'pending':
          return booking.status === 'pending';
        case 'cancelled':
          return booking.status === 'cancelled';
        case 'completed':
          return booking.status === 'completed';
        default:
          return true;
      }
    });
  };

  const getStatusCounts = () => ({
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed' || b.status === 'active').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return '✅';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      case 'completed':
        return '🏁';
      default:
        return '📋';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return 'mb-status-confirmed';
      case 'pending':
        return 'mb-status-pending';
      case 'cancelled':
        return 'mb-status-cancelled';
      case 'completed':
        return 'mb-status-completed';
      default:
        return 'mb-status-default';
    }
  };

  if (loading) {
    return (
      <div className="mb-wrapper">
        <div className="mb-loading">
          <div className="mb-loading-spinner"></div>
          <p>🔍 Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const statusCounts = getStatusCounts();

  return (
    <div className="mb-wrapper">
      <div className="mb-container">
        <div className="mb-header">
          <h1 className="mb-title">📅 My Bookings</h1>
          <p className="mb-subtitle">Manage your school tour bookings and view detailed information</p>
        </div>

        {/* Tabs */}
        <div className="mb-tabs">
          <button className={`mb-tab ${activeTab === 'all' ? 'mb-tab-active' : ''}`} onClick={() => setActiveTab('all')}>📋 All Bookings ({statusCounts.all})</button>
          <button className={`mb-tab ${activeTab === 'confirmed' ? 'mb-tab-active' : ''}`} onClick={() => setActiveTab('confirmed')}>✅ Confirmed ({statusCounts.confirmed})</button>
          <button className={`mb-tab ${activeTab === 'pending' ? 'mb-tab-active' : ''}`} onClick={() => setActiveTab('pending')}>⏳ Pending ({statusCounts.pending})</button>
          <button className={`mb-tab ${activeTab === 'cancelled' ? 'mb-tab-active' : ''}`} onClick={() => setActiveTab('cancelled')}>❌ Cancelled ({statusCounts.cancelled})</button>
          <button className={`mb-tab ${activeTab === 'completed' ? 'mb-tab-active' : ''}`} onClick={() => setActiveTab('completed')}>🏁 Completed ({statusCounts.completed})</button>
        </div>

        {/* Content */}
        {filteredBookings.length === 0 ? (
          <div className="mb-empty-state">
            <div className="mb-empty-content">
              <span className="mb-empty-icon">{getStatusIcon(activeTab)}</span>
              <h3 className="mb-empty-title">
                No {activeTab === 'all' ? '' : activeTab} bookings found
              </h3>
              <p className="mb-empty-description">
                {activeTab === 'all'
                  ? "You haven't made any tour bookings yet. Start exploring schools to book your first tour!"
                  : `You don't have any ${activeTab} bookings at the moment.`}
              </p>
              {activeTab === 'all' && (
                <button onClick={() => navigate('/results')} className="mb-btn mb-btn-primary">
                  🔍 Browse Schools
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-bookings-grid">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="mb-booking-card">
                <div className="mb-card-header">
                  <div className="mb-school-info">
                    <h3 className="mb-school-name">{booking.schoolId?.name || 'Unknown School'}</h3>
                    <p className="mb-school-location">📍 {booking.schoolId?.location?.city}, {booking.schoolId?.location?.state}</p>
                  </div>
                  <span className={`mb-status-badge ${getStatusClass(booking.status)}`}>
                    {getStatusIcon(booking.status)} {booking.status}
                  </span>
                </div>

                <div className="mb-card-content">
                  <div className="mb-booking-details">
                    <div className="mb-detail-item"><span className="mb-detail-icon">🎯</span> <span className="mb-detail-label">Tour:</span> <span className="mb-detail-value">{booking.tourId?.title}</span></div>
                    <div className="mb-detail-item"><span className="mb-detail-icon">📅</span> <span className="mb-detail-label">Date:</span> <span className="mb-detail-value">{new Date(booking.tourId?.date).toLocaleDateString()}</span></div>
                    <div className="mb-detail-item"><span className="mb-detail-icon">🕐</span> <span className="mb-detail-label">Time:</span> <span className="mb-detail-value">{booking.selectedTimeSlot?.startTime} - {booking.selectedTimeSlot?.endTime}</span></div>
                    <div className="mb-detail-item"><span className="mb-detail-icon">👥</span> <span className="mb-detail-label">Guests:</span> <span className="mb-detail-value">{booking.numberOfGuests}</span></div>
                    <div className="mb-detail-item"><span className="mb-detail-icon">📋</span> <span className="mb-detail-label">Booking ID:</span> <span className="mb-detail-value mb-booking-id">{booking._id}</span></div>
                  </div>

                  <div className="mb-expand-section">
                    <button className="mb-expand-btn" onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}>
                      {expandedBooking === booking._id ? '🔼 Hide Details' : '🔽 View Full Details'}
                    </button>

                    {expandedBooking === booking._id && (
                      <div className="mb-expanded-details">
                        <div className="mb-expanded-section">
                          <h4 className="mb-expanded-title">⏱️ Tour Information</h4>
                          <div className="mb-info-grid">
                            <div className="mb-info-item">
                              <span className="mb-info-label">Tour Type:</span>
                              <span className="mb-info-value">{booking.tourId?.tourType || 'General Tour'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mb-expanded-section">
                          <h4 className="mb-expanded-title">📋 Tour Requirements</h4>
                          <ul className="mb-requirements-list">
                            {(booking.tourId?.requirements || []).map((req, index) => (
                              <li key={index} className="mb-requirement-item">• {req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-card-actions">
                  <button onClick={() => navigate(`/school/${booking.schoolId?._id}`)} className="mb-btn mb-btn-outline mb-btn-small">🏫 View School</button>

                  {booking.status === 'confirmed' || booking.status === 'active' ? (
                    <button onClick={() => handleCancel(booking._id, booking.tourId?.title)} disabled={processingId === booking._id} className="mb-btn mb-btn-danger mb-btn-small">
                      {processingId === booking._id ? '⏳ Cancelling...' : '❌ Cancel Booking'}
                    </button>
                  ) : booking.status === 'cancelled' ? (
                    <div className="mb-cancelled-actions">
                      {/* //{canRebook(booking) && (
                        <button onClick={() => handleRebook(booking)} className="mb-btn mb-btn-success mb-btn-small">🔄 Rebook Tour</button>
                      )} */}
                      <button onClick={() => handleDelete(booking._id, booking.tourId?.title)} disabled={processingId === booking._id} className="mb-btn mb-btn-danger mb-btn-small">
                        {processingId === booking._id ? '⏳ Deleting...' : '🗑️ Delete Record'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </div>
  );
}

export default MyBookings;
