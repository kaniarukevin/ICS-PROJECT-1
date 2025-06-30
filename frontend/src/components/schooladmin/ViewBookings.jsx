import React, { useState, useEffect } from 'react';

const ViewBookings = () => {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchBookings();
	}, []);

	const fetchBookings = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/school-admin/bookings', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			setBookings(data);
		} catch (error) {
			console.error('Error fetching bookings:', error);
		} finally {
			setLoading(false);
		}
	};

	const updateBookingStatus = async (bookingId, newStatus) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/school-admin/bookings/${bookingId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (response.ok) {
				fetchBookings();
				alert(`Booking ${newStatus}!`);
			}
		} catch (error) {
			console.error('Error updating booking status:', error);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'confirmed': return 'green';
			case 'pending': return 'orange';
			case 'cancelled': return 'red';
			default: return 'gray';
		}
	};

	if (loading) {
		return <div className="loading">Loading bookings...</div>;
	}

	return (
		<div className="view-bookings">
			<h1>School Bookings</h1>
			
			{bookings.length === 0 ? (
				<p>No bookings found.</p>
			) : (
				<div className="bookings-table">
					<table>
						<thead>
							<tr>
								<th>Student Name</th>
								<th>Parent</th>
								<th>Tour</th>
								<th>Date</th>
								<th>Guests</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{bookings.map(booking => (
								<tr key={booking._id}>
									<td>{booking.studentName}</td>
									<td>
										{booking.parentId?.name}<br/>
										<small>{booking.parentId?.email}</small>
									</td>
									<td>{booking.tourId?.title}</td>
									<td>
										{new Date(booking.tourId?.date).toLocaleDateString()}<br/>
										<small>{booking.tourId?.startTime}</small>
									</td>
									<td>{booking.numberOfGuests}</td>
									<td>
										<span 
											className="status-badge"
											style={{ color: getStatusColor(booking.status) }}
										>
											{booking.status.toUpperCase()}
										</span>
									</td>
									<td>
										{booking.status === 'pending' && (
											<div className="action-buttons">
												<button
													className="btn-success"
													onClick={() => updateBookingStatus(booking._id, 'confirmed')}
												>
													Confirm
												</button>
												<button
													className="btn-danger"
													onClick={() => updateBookingStatus(booking._id, 'cancelled')}
												>
													Cancel
												</button>
											</div>
										)}
										{booking.status === 'confirmed' && (
											<button
												className="btn-danger"
												onClick={() => updateBookingStatus(booking._id, 'cancelled')}
											>
												Cancel
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default ViewBookings;