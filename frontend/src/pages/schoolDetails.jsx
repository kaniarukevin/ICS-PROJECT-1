import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import './schoolDetail.css';

function SchoolDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [rating, setRating] = useState({
    overall: 0,
    academic: 0,
    facilities: 0,
    teachers: 0,
    environment: 0,
    comment: ''
  });
  const [guestCounts, setGuestCounts] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({});
  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolRes, toursRes] = await Promise.all([
          fetch(`http://localhost:5000/api/parents/schools/${id}`),
          fetch(`http://localhost:5000/api/parents/tours?schoolId=${id}`)
        ]);

        const schoolData = await schoolRes.json();
        const toursData = await toursRes.json();

        setSchool(schoolData);

        if (Array.isArray(toursData)) {
          const enriched = toursData.map(tour => ({
            ...tour,
            availableSpots: tour.maxCapacity - (tour.currentBookings || 0)
          }));
          setTours(enriched);

          const defaultSlots = {};
          enriched.forEach(tour => {
            if (tour.timeSlots?.length > 0) {
              defaultSlots[tour._id] = tour.timeSlots[0].startTime;
            }
          });
          setSelectedSlots(defaultSlots);
        } else {
          setTours([]);
        }
      } catch (err) {
        console.error('Error loading school/tours:', err);
        showModal('Error', 'Failed to load school data. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    const fetchMyBookings = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await fetch(`http://localhost:5000/api/parents/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setMyBookings(data);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };

    fetchData();
    fetchMyBookings();
  }, [id, isLoggedIn, token]);

  const showModal = (title, message, type = 'info', onConfirm = null, confirmText = 'OK', cancelText = 'Cancel') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: onConfirm ? () => {
        onConfirm();
        closeModal();
      } : () => closeModal(),
      onCancel: () => closeModal(),
      confirmText,
      cancelText
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleLoginPrompt = () => {
    showModal(
      'Login Required', 
      'Please log in to continue with this action.', 
      'warning',
      () => navigate('/login'),
      'Go to Login',
      'Cancel'
    );
  };

  const handleBookTour = async (tourId) => {
    if (!isLoggedIn) return handleLoginPrompt();

    const numberOfGuests = guestCounts[tourId] || 1;
    const selectedStartTime = selectedSlots[tourId];

    const tour = tours.find(t => t._id === tourId);
    if (!tour) return showModal('Error', 'Tour not found.', 'error');
    if (!selectedStartTime) return showModal('Error', 'Please select a time slot.', 'error');

    const selectedSlot = tour.timeSlots.find(slot => slot.startTime === selectedStartTime);
    if (!selectedSlot) return showModal('Error', 'Invalid time slot selected.', 'error');

    if (isTourBooked(tourId)) return showModal('Already Booked', 'You have already booked this tour.', 'warning');
    if (tour.availableSpots < numberOfGuests) {
      return showModal('Insufficient Spots', `Only ${tour.availableSpots} spots available.`, 'warning');
    }

    showModal(
      'Confirm Booking',
      `Are you sure you want to book "${tour.title}" for ${numberOfGuests} guest(s) on ${new Date(tour.date).toLocaleDateString()} at ${selectedSlot.startTime}?`,
      'confirm',
      () => confirmBookTour(tourId, numberOfGuests, selectedSlot),
      'Book Now',
      'Cancel'
    );
  };

  const confirmBookTour = async (tourId, numberOfGuests, selectedSlot) => {
    try {
      const res = await fetch(`http://localhost:5000/api/parents/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tourId,
          schoolId: id,
          numberOfGuests: parseInt(numberOfGuests),
          selectedTimeSlot: selectedSlot
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh bookings and tours
        const res2 = await fetch(`http://localhost:5000/api/parents/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyBookings(await res2.json());
        
        const res3 = await fetch(`http://localhost:5000/api/parents/tours?schoolId=${id}`);
        const toursData = await res3.json();
        setTours(toursData.map(t => ({
          ...t,
          availableSpots: t.maxCapacity - (t.currentBookings || 0)
        })));

        showModal('Success!', 'Your tour has been booked successfully!', 'success');
      } else {
        showModal('Booking Failed', data.message || 'Failed to book tour. Please try again.', 'error');
      }
    } catch (err) {
      showModal('Error', 'An error occurred while booking the tour. Please try again.', 'error');
    }
  };

  const handleCancelBooking = async (bookingId, tourTitle) => {
    showModal(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for "${tourTitle}"?`,
      'confirm',
      () => confirmCancelBooking(bookingId),
      'Yes, Cancel',
      'Keep Booking'
    );
  };

  const confirmCancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/parents/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        setMyBookings(myBookings.filter(b => b._id !== bookingId));
        showModal('Cancelled', 'Your booking has been cancelled successfully.', 'success');
      } else {
        showModal('Cancellation Failed', data.message || 'Failed to cancel booking.', 'error');
      }
    } catch (err) {
      showModal('Error', 'An error occurred while cancelling the booking.', 'error');
    }
  };

 const handleAddToCompare = () => {
  if (!isLoggedIn) return handleLoginPrompt();
  
  const existing = JSON.parse(localStorage.getItem('compareSchools')) || [];
  
  if (existing.includes(id)) {
    showModal(
      'Already Added', 
      'This school is already in your compare list.', 
      'info',
      () => navigate('/compare')  // Added navigation option
    );
    return;
  }
  
  const updated = Array.from(new Set([...existing, id]));
  
  // Limit to 4 schools for comparison (adjust as needed)
  if (updated.length > 4) {
    showModal(
      'Comparison Limit', 
      'You can compare up to 4 schools at a time. Please remove some schools from your comparison list first.',
      'warning'
    );
    return;
  }
  
  localStorage.setItem('compareSchools', JSON.stringify(updated));
  
  showModal(
    'Added to Compare', 
    'School has been added to your compare list! Would you like to view your comparison now?', 
    'confirm',
    () => navigate('/compare'),  // Confirm action navigates to compare
    'View Comparison',
    'Continue Browsing'
  );
};

  const handleRatingSubmit = async () => {
    if (!isLoggedIn) return handleLoginPrompt();

    const { overall, academic, facilities, teachers, environment } = rating;
    if (!overall || !academic || !facilities || !teachers || !environment) {
      showModal('Incomplete Rating', 'Please provide ratings for all categories.', 'warning');
      return;
    }

    showModal(
      'Submit Rating',
      'Are you sure you want to submit this rating? You may not be able to change it later.',
      'confirm',
      confirmRatingSubmit,
      'Submit Rating',
      'Cancel'
    );
  };

  const confirmRatingSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/parents/schools/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rating)
      });
      
      const data = await res.json();
      if (res.ok) {
        setSchool(data.school);
        setRating({
          overall: 0,
          academic: 0,
          facilities: 0,
          teachers: 0,
          environment: 0,
          comment: ''
        });
        showModal('Thank You!', 'Your rating has been submitted successfully!', 'success');
      } else {
        showModal('Rating Failed', data.message || 'Failed to submit rating.', 'error');
      }
    } catch (err) {
      showModal('Error', 'An error occurred while submitting your rating.', 'error');
    }
  };

  const isTourBooked = (tourId) => myBookings.some(b => b.tourId === tourId);
  const getBookingForTour = (tourId) => myBookings.find(b => b.tourId === tourId);

  if (loading) return <div className="loading">Loading school details...</div>;
  if (!school) return <div className="loading">School not found.</div>;

  return (
    <div className="school-details-container">
      <h1>{school.name}</h1>
      <p><strong>Type:</strong> {school.schoolType}</p>
      <p>{school.description}</p>

      <h3>Location</h3>
      <div className="location-info">
        <p>{school.location?.city}, {school.location?.state}</p>
      </div>

      <h3>Ratings</h3>
      <ul className="ratings-list">
        <li>Overall: {school.ratings?.overall?.toFixed(1) || 'N/A'}</li>
        <li>Academic: {school.ratings?.academic?.toFixed(1) || 'N/A'}</li>
        <li>Facilities: {school.ratings?.facilities?.toFixed(1) || 'N/A'}</li>
        <li>Teachers: {school.ratings?.teachers?.toFixed(1) || 'N/A'}</li>
        <li>Environment: {school.ratings?.environment?.toFixed(1) || 'N/A'}</li>
      </ul>

      <h3>Facilities</h3>
      <ul className="facilities">
        {school.facilities?.map((f, i) => <li key={i}>{f.name}</li>)}
      </ul>

      <h3>Fees</h3>
      <div className="fees-info">
        <p>KES {school.fees?.tuition?.minAmount?.toLocaleString()} - {school.fees?.tuition?.maxAmount?.toLocaleString()} per term</p>
      </div>

      <h3>Contact</h3>
      <div className="contact-info">
        <p><strong>Phone:</strong> {school.contact?.phone}</p>
        <p><strong>Email:</strong> {school.contact?.email}</p>
      </div>

      <h3>Available Tours</h3>
      {tours.length === 0 ? (
        <p>No upcoming tours available.</p>
      ) : (
        <ul className="tours-list">
          {tours.map(tour => {
            const booking = getBookingForTour(tour._id);
            const isBooked = !!booking;
            const spotsClass = tour.availableSpots <= 5 ? 'low-spots' : tour.availableSpots === 0 ? 'no-spots' : '';
            
            return (
              <li key={tour._id}>
                <div className="tour-header">
                  <h4 className="tour-title">{tour.title}</h4>
                  <span className={`tour-spots ${spotsClass}`}>
                    {tour.availableSpots} spots left
                  </span>
                </div>
                
                <div className="tour-details">
                  <div className="tour-detail-item">
                    <label>Date:</label>
                    <span>{new Date(tour.date).toLocaleDateString()}</span>
                  </div>
                  <div className="tour-detail-item">
                    <label>Type:</label>
                    <span>{tour.tourType}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Time Slot:</label>
                  <select
                    value={selectedSlots[tour._id] || ''}
                    onChange={(e) => setSelectedSlots({ ...selectedSlots, [tour._id]: e.target.value })}
                    disabled={isBooked}
                  >
                    <option value="" disabled>Select a time slot</option>
                    {tour.timeSlots?.map(slot => (
                      <option key={slot.startTime} value={slot.startTime}>
                        {slot.startTime} – {slot.endTime}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="booking-actions">
                  {isBooked ? (
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleCancelBooking(booking._id, tour.title)}
                    >
                      Cancel Booking
                    </button>
                  ) : isLoggedIn ? (
                    <>
                      <div className="guests-selector">
                        <label>Guests:</label>
                        <select
                          value={guestCounts[tour._id] || 1}
                          onChange={(e) => setGuestCounts({ ...guestCounts, [tour._id]: parseInt(e.target.value) })}
                        >
                          {Array.from({ length: Math.max(1, tour.availableSpots) }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleBookTour(tour._id)}
                        disabled={tour.availableSpots === 0}
                      >
                        {tour.availableSpots === 0 ? 'Fully Booked' : 'Book Tour'}
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-secondary" onClick={handleLoginPrompt}>
                      Login to Book
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

     <h3>Compare School</h3>
      <div className="compare-section">
    <p>Add this school to your comparison list to compare with other schools.</p>
       <div className="compare-actions">
    <button 
      className="btn btn-warning"
      onClick={handleAddToCompare}
    >
      {isLoggedIn ? 'Add to Compare' : 'Login to Compare'}
    </button>
    {isLoggedIn && (
      <button 
        className="btn btn-outline"
        onClick={() => navigate('/compare')}
      >
        View My Comparison
      </button>
    )}
  </div>
</div>

      <h3>Rate This School</h3>
      {isLoggedIn ? (
        <div className="rate-section">
          <p>Share your experience with this school to help other parents make informed decisions.</p>
          
          <div className="rating-grid">
            {['overall', 'academic', 'facilities', 'teachers', 'environment'].map(field => (
              <div key={field} className="rating-item">
                <label>{field.charAt(0).toUpperCase() + field.slice(1)} Rating:</label>
                <select
                  value={rating[field]}
                  onChange={(e) => setRating({ ...rating, [field]: parseInt(e.target.value) })}
                >
                  <option value={0}>Select Rating</option>
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Star' : 'Stars'}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Your Comments (Optional):</label>
            <textarea
              placeholder="Share your thoughts about this school..."
              value={rating.comment}
              onChange={(e) => setRating({ ...rating, comment: e.target.value })}
              rows="4"
            />
          </div>

          <button 
            className="btn btn-success"
            onClick={handleRatingSubmit}
          >
            Submit Rating
          </button>
        </div>
      ) : (
        <div className="rate-section">
          <p>Please log in to rate this school and share your experience.</p>
          <button className="btn btn-secondary" onClick={handleLoginPrompt}>
            Login to Rate
          </button>
        </div>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />
    </div>
  );
}

export default SchoolDetails;