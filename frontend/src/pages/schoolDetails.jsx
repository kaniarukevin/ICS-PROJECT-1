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

  // Placeholder images for schools
  const getPlaceholderImage = (schoolType) => {
    const images = {
      'University': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop',
      'High School': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop',
      'TVET': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop'
    };
    return images[schoolType] || images.default;
  };

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
            availableSpots: tour.maxCapacity - (tour.currentBookings || 0),
            // Add sample requirements if not present
            requirements: tour.requirements || [
              'Valid ID required',
              'Comfortable walking shoes recommended',
              'Photography may be restricted in some areas'
            ]
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
        () => navigate('/compare')
      );
      return;
    }
    
    const updated = Array.from(new Set([...existing, id]));
    
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
      () => navigate('/compare'),
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

  if (loading) return <div className="sd-loading">🔍 Loading school details...</div>;
  if (!school) return <div className="sd-loading">❌ School not found.</div>;

  return (
    <div className="sd-wrapper">
      <div className="sd-container">
        {/* Hero Section with School Image */}
        <div className="sd-hero">
          <div className="sd-hero-image">
            <img 
              src={getPlaceholderImage(school.schoolType)} 
              alt={school.name}
              className="sd-school-image"
            />
            <div className="sd-hero-overlay">
              <div className="sd-hero-content">
                <h1 className="sd-school-title">{school.name}</h1>
                <div className="sd-school-meta">
                  <span className="sd-school-type">🏫 {school.schoolType}</span>
                  <span className="sd-school-location">📍 {school.location?.city}, {school.location?.state}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="sd-content">
          {/* School Overview */}
          <section className="sd-section">
            <h2 className="sd-section-title">📋 School Overview</h2>
            <div className="sd-overview-card">
              <p className="sd-description">{school.description}</p>
            </div>
          </section>

          {/* Ratings Section */}
          <section className="sd-section">
            <h2 className="sd-section-title">⭐ Ratings & Reviews</h2>
            <div className="sd-ratings-grid">
              {[
                { key: 'overall', label: '🌟 Overall', icon: '🌟' },
                { key: 'academic', label: '📚 Academic', icon: '📚' },
                { key: 'facilities', label: '🏢 Facilities', icon: '🏢' },
                { key: 'teachers', label: '👨‍🏫 Teachers', icon: '👨‍🏫' },
                { key: 'environment', label: '🌱 Environment', icon: '🌱' }
              ].map(({ key, label, icon }) => (
                <div key={key} className="sd-rating-card">
                  <div className="sd-rating-icon">{icon}</div>
                  <div className="sd-rating-content">
                    <h4 className="sd-rating-label">{label}</h4>
                    <div className="sd-rating-value">
                      {school.ratings?.[key]?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Facilities Section */}
          <section className="sd-section">
            <h2 className="sd-section-title">🏢 Facilities</h2>
            <div className="sd-facilities-grid">
              {school.facilities?.map((facility, index) => (
                <div key={index} className="sd-facility-item">
                  <span className="sd-facility-icon">✅</span>
                  <span className="sd-facility-name">{facility.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Fees Section */}
          <section className="sd-section">
            <h2 className="sd-section-title">💰 Fees Information</h2>
            <div className="sd-fees-card">
              <div className="sd-fees-content">
                <div className="sd-fees-range">
                  <span className="sd-fees-label">Tuition per term:</span>
                  <span className="sd-fees-amount">
                    KES {school.fees?.tuition?.minAmount?.toLocaleString()} - {school.fees?.tuition?.maxAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="sd-section">
            <h2 className="sd-section-title">📞 Contact Information</h2>
            <div className="sd-contact-grid">
              <div className="sd-contact-item">
                <span className="sd-contact-icon">📞</span>
                <div className="sd-contact-content">
                  <span className="sd-contact-label">Phone</span>
                  <span className="sd-contact-value">{school.contact?.phone}</span>
                </div>
              </div>
              <div className="sd-contact-item">
                <span className="sd-contact-icon">📧</span>
                <div className="sd-contact-content">
                  <span className="sd-contact-label">Email</span>
                  <span className="sd-contact-value">{school.contact?.email}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tours Section */}
          <section className="sd-section">
            <h2 className="sd-section-title">🎯 Available Tours</h2>
            {tours.length === 0 ? (
              <div className="sd-no-tours">
                <div className="sd-no-tours-content">
                  <span className="sd-no-tours-icon">📅</span>
                  <h3>No upcoming tours available</h3>
                  <p>Check back later for new tour schedules.</p>
                </div>
              </div>
            ) : (
              <div className="sd-tours-grid">
                {tours.map(tour => {
                  const booking = getBookingForTour(tour._id);
                  const isBooked = !!booking;
                  const spotsClass = tour.availableSpots <= 5 ? 'sd-low-spots' : tour.availableSpots === 0 ? 'sd-no-spots' : '';
                  
                  return (
                    <div key={tour._id} className="sd-tour-card">
                      <div className="sd-tour-header">
                        <h4 className="sd-tour-title">{tour.title}</h4>
                        <span className={`sd-tour-spots ${spotsClass}`}>
                          {tour.availableSpots} spots left
                        </span>
                      </div>
                      
                      <div className="sd-tour-details">
                        <div className="sd-tour-detail-item">
                          <span className="sd-tour-detail-icon">📅</span>
                          <span className="sd-tour-detail-label">Date:</span>
                          <span className="sd-tour-detail-value">{new Date(tour.date).toLocaleDateString()}</span>
                        </div>
                        <div className="sd-tour-detail-item">
                          <span className="sd-tour-detail-icon">🎯</span>
                          <span className="sd-tour-detail-label">Type:</span>
                          <span className="sd-tour-detail-value">{tour.tourType}</span>
                        </div>
                      </div>

                      {/* Tour Requirements */}
                      <div className="sd-tour-requirements">
                        <h5 className="sd-requirements-title">📋 Requirements:</h5>
                        <ul className="sd-requirements-list">
                          {tour.requirements?.map((req, index) => (
                            <li key={index} className="sd-requirement-item">
                              <span className="sd-requirement-bullet">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="sd-tour-form">
                        <div className="sd-form-group">
                          <label className="sd-form-label">🕐 Time Slot:</label>
                          <select
                            className="sd-form-select"
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

                        <div className="sd-booking-actions">
                          {isBooked ? (
                            <button 
                              className="sd-btn sd-btn-danger"
                              onClick={() => handleCancelBooking(booking._id, tour.title)}
                            >
                              🗑️ Cancel Booking
                            </button>
                          ) : isLoggedIn ? (
                            <div className="sd-booking-controls">
                              <div className="sd-guests-selector">
                                <label className="sd-form-label">👥 Guests:</label>
                                <select
                                  className="sd-form-select sd-guests-select"
                                  value={guestCounts[tour._id] || 1}
                                  onChange={(e) => setGuestCounts({ ...guestCounts, [tour._id]: parseInt(e.target.value) })}
                                >
                                  {Array.from({ length: Math.max(1, tour.availableSpots) }, (_, i) => i + 1).map(n => (
                                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                                  ))}
                                </select>
                              </div>
                              <button 
                                className="sd-btn sd-btn-primary"
                                onClick={() => handleBookTour(tour._id)}
                                disabled={tour.availableSpots === 0}
                              >
                                {tour.availableSpots === 0 ? '❌ Fully Booked' : '🎫 Book Tour'}
                              </button>
                            </div>
                          ) : (
                            <button className="sd-btn sd-btn-secondary" onClick={handleLoginPrompt}>
                              🔐 Login to Book
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Compare Section */}
          <section className="sd-section">
            <h2 className="sd-section-title">🔄 Compare School</h2>
            <div className="sd-compare-card">
              <p className="sd-compare-description">Add this school to your comparison list to compare with other schools.</p>
              <div className="sd-compare-actions">
                <button 
                  className="sd-btn sd-btn-warning"
                  onClick={handleAddToCompare}
                >
                  {isLoggedIn ? '➕ Add to Compare' : '🔐 Login to Compare'}
                </button>
                {isLoggedIn && (
                  <button 
                    className="sd-btn sd-btn-outline"
                    onClick={() => navigate('/compare')}
                  >
                    👁️ View My Comparison
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Rating Section */}
          <section className="sd-section">
            <h2 className="sd-section-title">⭐ Rate This School</h2>
            {isLoggedIn ? (
              <div className="sd-rate-card">
                <p className="sd-rate-description">Share your experience with this school to help other parents make informed decisions.</p>
                
                <div className="sd-rating-grid-form">
                  {[
                    { key: 'overall', label: 'Overall', icon: '🌟' },
                    { key: 'academic', label: 'Academic', icon: '📚' },
                    { key: 'facilities', label: 'Facilities', icon: '🏢' },
                    { key: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
                    { key: 'environment', label: 'Environment', icon: '🌱' }
                  ].map(({ key, label, icon }) => (
                    <div key={key} className="sd-rating-form-item">
                      <label className="sd-rating-form-label">
                        <span className="sd-rating-form-icon">{icon}</span>
                        {label}:
                      </label>
                      <select
                        className="sd-form-select"
                        value={rating[key]}
                        onChange={(e) => setRating({ ...rating, [key]: parseInt(e.target.value) })}
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

                <div className="sd-form-group">
                  <label className="sd-form-label">💬 Your Comments (Optional):</label>
                  <textarea
                    className="sd-form-textarea"
                    placeholder="Share your thoughts about this school..."
                    value={rating.comment}
                    onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                    rows="4"
                  />
                </div>

                <button 
                  className="sd-btn sd-btn-success"
                  onClick={handleRatingSubmit}
                >
                  🌟 Submit Rating
                </button>
              </div>
            ) : (
              <div className="sd-rate-card">
                <p className="sd-rate-description">Please log in to rate this school and share your experience.</p>
                <button className="sd-btn sd-btn-secondary" onClick={handleLoginPrompt}>
                  🔐 Login to Rate
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

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