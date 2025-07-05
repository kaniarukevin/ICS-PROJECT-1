import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import './myBookings.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });
  const [cancelingId, setCancelingId] = useState(null);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });
  };

  useEffect(() => {
    if (!token) {
      showModal('info', 'Login Required', 'Please log in to view your bookings.', () => {
        navigate('/login');
      });
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
    showModal('warning', 'Cancel Booking', `Cancel your booking for "${tourTitle}"?`, async () => {
      setCancelingId(bookingId);
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
          showModal('success', 'Booking Cancelled', 'The booking was cancelled successfully.');
        } else {
          showModal('error', 'Cancellation Failed', data.message || 'Could not cancel booking.');
        }
      } catch (err) {
        showModal('error', 'Error', 'Something went wrong while cancelling.');
      } finally {
        setCancelingId(null);
      }
    });
  };

  if (loading) return <div className="loading">Loading your bookings...</div>;

  return (
    <div className="my-bookings-container">
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="no-bookings">You have no tour bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <h3>{booking.schoolId?.name || 'Unknown School'}</h3>
              <p><strong>Location:</strong> {booking.schoolId?.location?.city}</p>
              <p><strong>Tour:</strong> {booking.tourId?.title}</p>
              <p><strong>Date:</strong> {new Date(booking.tourId?.date).toLocaleDateString()}</p>
              <p><strong>Guests:</strong> {booking.numberOfGuests}</p>
              <p><strong>Status:</strong> <span className={booking.status === 'cancelled' ? 'cancelled' : 'confirmed'}>{booking.status}</span></p>
              
              {booking.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancel(booking._id, booking.tourId?.title)}
                  disabled={cancelingId === booking._id}
                  className="cancel-btn"
                >
                  {cancelingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modal.isOpen && (
        <Modal
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default MyBookings;
