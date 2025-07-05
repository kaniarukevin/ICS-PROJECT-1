// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// function MyBookings() {
//   const [bookings, setBookings] = useState([]);
//   const [message, setMessage] = useState('');
//   const token = localStorage.getItem('token');
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!token) return navigate('/login');
//     fetchBookings();
//   }, []);

//   const fetchBookings = async () => {
//     try {
//       const res = await fetch('http://localhost:5000/api/parents/bookings', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setBookings(data);
//       } else {
//         setMessage(data.message || 'Error loading bookings.');
//       }
//     } catch (err) {
//       setMessage('Error fetching bookings.');
//     }
//   };

//   const cancelBooking = async (bookingId) => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/parents/bookings/${bookingId}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setMessage('Booking cancelled successfully!');
//         fetchBookings();
//       } else {
//         setMessage(data.message || 'Failed to cancel booking.');
//       }
//     } catch (err) {
//       setMessage('Error cancelling booking.');
//     }
//   };

//   // Calculate top rated schools from bookings
//   const schoolRatings = {};
//   bookings.forEach(b => {
//     const school = b.tourId?.schoolId;
//     const rating = b.tourId?.schoolId?.rating || 0;
//     if (school) {
//       if (!schoolRatings[school._id]) {
//         schoolRatings[school._id] = { ...school, rating, count: 1 };
//       } else {
//         schoolRatings[school._id].count += 1;
//       }
//     }
//   });
//   // Sort by rating descending
//   const topRatedSchools = Object.values(schoolRatings)
//     .sort((a, b) => b.rating - a.rating)
//     .slice(0, 3); // Top 3

//   return (
//     <div>
//       <h2>My Tour Bookings</h2>
//       {message && <p>{message}</p>}
//       <h3>Top Rated Schools You've Booked</h3>
//       {topRatedSchools.length === 0 ? (
//         <p>No rated schools found from your bookings.</p>
//       ) : (
//         <ul>
//           {topRatedSchools.map(school => (
//             <li key={school._id}>
//               <strong>{school.name}</strong> - Rating: {school.rating}
//             </li>
//           ))}
//         </ul>
//       )}
//       <h3>Your Bookings</h3>
//       {bookings.length === 0 ? (
//         <p>You have no bookings.</p>
//       ) : (
//         <ul>
//           {bookings.map(b => (
//             <li key={b._id}>
//               <strong>{b.tourId?.title}</strong> on {new Date(b.tourId?.date).toLocaleDateString()}<br />
//               Status: {b.status}<br />
//               <button onClick={() => cancelBooking(b._id)}>Cancel Booking</button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default MyBookings;
