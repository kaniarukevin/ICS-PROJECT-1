import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [message, setMessage] = useState('');
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
        } else {
          setTours([]);
        }
      } catch (err) {
        console.error('Error loading school/tours:', err);
        setMessage('Error loading data');
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
  }, [id]);

  const handleLoginPrompt = () => {
    alert('Please log in to continue.');
    navigate('/login');
  };

  const handleBookTour = async (tourId) => {
    if (!isLoggedIn) return handleLoginPrompt();

    const numberOfGuests = guestCounts[tourId] || 1;

    const tour = tours.find(t => t._id === tourId);
    if (!tour) return setMessage('Tour not found.');
    if (isTourBooked(tourId)) return setMessage('You have already booked this tour.');
    if (tour.availableSpots < numberOfGuests) {
      return setMessage(`Only ${tour.availableSpots} spots available.`);
    }

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
          numberOfGuests: parseInt(numberOfGuests)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Booking successful!');
        // Refresh data
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
      } else {
        setMessage(data.message || 'Booking failed.');
      }
    } catch (err) {
      setMessage('Error booking tour.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/parents/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Booking cancelled.');
        setMyBookings(myBookings.filter(b => b._id !== bookingId));
        fetchData();
      } else {
        setMessage(data.message || 'Failed to cancel.');
      }
    } catch (err) {
      setMessage('Error cancelling booking.');
    }
  };

  const handleAddToCompare = () => {
    if (!isLoggedIn) return handleLoginPrompt();
    const existing = JSON.parse(localStorage.getItem('compareSchools')) || [];
    const updated = Array.from(new Set([...existing, id]));
    localStorage.setItem('compareSchools', JSON.stringify(updated));
    setMessage('Added to compare list.');
  };

  const handleRatingSubmit = async () => {
    if (!isLoggedIn) return handleLoginPrompt();

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
        setMessage('Rating submitted!');
        setSchool(data.school);
      } else {
        setMessage(data.message || 'Rating failed.');
      }
    } catch (err) {
      setMessage('Error submitting rating.');
    }
  };

  const isTourBooked = (tourId) => myBookings.some(b => b.tourId === tourId);
  const getBookingIdForTour = (tourId) => myBookings.find(b => b.tourId === tourId)?._id;

  if (loading) return <p>Loading school details...</p>;
  if (!school) return <p>School not found.</p>;

  return (
    <div className="school-details-container">
      <h1>{school.name}</h1>
      <p><strong>Type:</strong> {school.schoolType}</p>
      <p>{school.description}</p>

      <h3>Location</h3>
      <p>{school.location?.address}, {school.location?.city}, {school.location?.state}</p>

      <h3>Ratings</h3>
      <ul className="ratings-list">
        <li>Overall: {school.ratings?.overall?.toFixed(1) || 'N/A'}</li>
        <li>Academic: {school.ratings?.academic || 'N/A'}</li>
        <li>Facilities: {school.ratings?.facilities || 'N/A'}</li>
        <li>Teachers: {school.ratings?.teachers || 'N/A'}</li>
        <li>Environment: {school.ratings?.environment || 'N/A'}</li>
      </ul>

      <h3>Facilities</h3>
      <ul>{school.facilities?.map((f, i) => <li key={i}>{f.name}</li>)}</ul>

      <h3>Fees</h3>
      <p>KES {school.fees?.tuition?.minAmount} - {school.fees?.tuition?.maxAmount} per term</p>

      <h3>Contact</h3>
      <p>Phone: {school.contact?.phone}</p>
      <p>Email: {school.contact?.email}</p>

      <h3>Available Tours</h3>
      {tours.length === 0 ? (
        <p>No upcoming tours.</p>
      ) : (
        <ul>
          {tours.map(t => (
            <li key={t._id}>
              <strong>{t.title}</strong> on {new Date(t.date).toLocaleDateString()}<br />
              {t.startTime} – {t.endTime} | {t.tourType}<br />
              Spots Left: {t.availableSpots}<br />
              {isTourBooked(t._id) ? (
                <button onClick={() => handleCancelBooking(getBookingIdForTour(t._id))}>
                  Cancel Booking
                </button>
              ) : isLoggedIn ? (
                <>
                  <label>Guests:</label>
                  <select
                    value={guestCounts[t._id] || 1}
                    onChange={(e) => setGuestCounts({ ...guestCounts, [t._id]: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: Math.max(1, t.availableSpots) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button onClick={() => handleBookTour(t._id)}>Book Tour</button>
                </>
              ) : (
                <button onClick={handleLoginPrompt}>Login to Book</button>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3>Compare School</h3>
      <button onClick={isLoggedIn ? handleAddToCompare : handleLoginPrompt}>
        {isLoggedIn ? 'Add to Compare' : 'Login to Compare'}
      </button>

      <h3>Rate School</h3>
      {isLoggedIn ? (
        <div className="rate-section">
          {['overall', 'academic', 'facilities', 'teachers', 'environment'].map(field => (
            <div key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <select
                value={rating[field]}
                onChange={(e) => setRating({ ...rating, [field]: parseInt(e.target.value) })}
              >
                <option value={0}>Select</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          ))}
          <textarea
            placeholder="Your comment..."
            value={rating.comment}
            onChange={(e) => setRating({ ...rating, comment: e.target.value })}
          />
          <button onClick={handleRatingSubmit}>Submit Rating</button>
        </div>
      ) : (
        <button onClick={handleLoginPrompt}>Login to Rate</button>
      )}

      {message && <p className="feedback">{message}</p>}
    </div>
  );
}

export default SchoolDetails;
