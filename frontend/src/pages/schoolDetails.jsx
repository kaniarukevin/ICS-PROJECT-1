import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './schoolDetail.css'; // Custom styling

function SchoolDetails() {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [rating, setRating] = useState({
    overall: 0,
    academic: 0,
    facilities: 0,
    teachers: 0,
    environment: 0,
    comment: ''
  });
  const [message, setMessage] = useState('');
  const isLoggedIn = !!localStorage.getItem('token');

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
      const enrichedTours = toursData.map(tour => ({
        ...tour,
        availableSpots: tour.maxCapacity - tour.currentBookings
      }));
      setTours(enrichedTours.filter(t => t.availableSpots > 0));
    } else {
      setTours([]); // fallback in case backend sends non-array
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
  }
};


    fetchData();
  }, [id]);

  const handleBookTour = async (tourId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/parents/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tourId, schoolId: id })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Tour booked successfully!');
        setTours(prev =>
          prev.map(t =>
            t._id === tourId
              ? {
                  ...t,
                  currentBookings: t.currentBookings + 1,
                  availableSpots: t.maxCapacity - (t.currentBookings + 1)
                }
              : t
          )
        );
      } else {
        setMessage(data.message || 'Booking failed.');
      }
    } catch (error) {
      setMessage('Error booking tour.');
    }
  };

  const handleAddToCompare = () => {
    const current = JSON.parse(localStorage.getItem('compareSchools')) || [];
    const updated = [...new Set([...current, id])];
    localStorage.setItem('compareSchools', JSON.stringify(updated));
    setCompareList(updated);
    setMessage('School added to compare list.');
  };

  const handleRatingSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
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
      <p>Overall: {school.ratings?.overall || 'N/A'}</p>
      <p>Academic: {school.ratings?.academic || 'N/A'}</p>
      <p>Facilities: {school.ratings?.facilities || 'N/A'}</p>
      <p>Teachers: {school.ratings?.teachers || 'N/A'}</p>
      <p>Environment: {school.ratings?.environment || 'N/A'}</p> 

      <h3>Facilities</h3>
      <ul>
        {school.facilities?.map((f, index) => (
          <li key={index}>{f.name}</li>
        ))}
      </ul>

      <h3>Fees (KES)</h3>
      <p>From {school.fees?.tuition?.minAmount} to {school.fees?.tuition?.maxAmount} per term</p>

      <h3>Contact</h3>
      <p>Phone: {school.contact?.phone}</p>
      <p>Email: {school.contact?.email}</p>

      {isLoggedIn && (
        <>
          <h3>Available Tours</h3>
          {tours.length === 0 ? (
            <p>No tours available.</p>
          ) : (
            <ul>
              {tours.map(tour => (
                <li key={tour._id}>
                  <strong>{tour.title}</strong> on {new Date(tour.date).toLocaleDateString()} from {tour.startTime} to {tour.endTime} ({tour.tourType})<br />
                  <small>{tour.availableSpots} spots left</small><br />
                  <button
                    disabled={tour.availableSpots <= 0}
                    onClick={() => handleBookTour(tour._id)}
                  >
                    Book Tour
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3>Compare School</h3>
          <button onClick={handleAddToCompare}>Add to Compare</button>

          <h3>Rate School</h3>
          <div className="rate-section">
            {['overall', 'academic', 'facilities', 'teachers', 'environment'].map(field => (
              <div key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <select
                  value={rating[field]}
                  onChange={(e) => setRating({ ...rating, [field]: parseInt(e.target.value) })}
                >
                  <option value={0}>Select</option>
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            ))}
            <textarea
              placeholder="Comment"
              value={rating.comment}
              onChange={(e) => setRating({ ...rating, comment: e.target.value })}
            />
            <button onClick={handleRatingSubmit}>Submit Rating</button>
          </div>
        </>
      )}

      {message && <p className="feedback">{message}</p>}
    </div>
  );
}

export default SchoolDetails;
