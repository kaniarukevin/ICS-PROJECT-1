// frontend/src/components/schooladmin/ViewBookings.jsx
import React, { useState, useEffect } from 'react';

const ViewBookings = () => {
	const [bookings, setBookings] = useState([]);
	const [tours, setTours] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
	const [tourFilter, setTourFilter] = useState('all');
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [showDetails, setShowDetails] = useState(false);
	const [updateStatus, setUpdateStatus] = useState(false);
	const [adminNotes, setAdminNotes] = useState('');

	useEffect(() => {
		fetchBookings();
		fetchTours();
	}, []);

	const fetchBookings = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/school-admin/bookings', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch bookings');
			}

			const data = await response.json();
			setBookings(data);
		} catch (error) {
			console.error('Error fetching bookings:', error);
			alert('Error fetching bookings: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchTours = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/school-admin/tours', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch tours');
			}

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

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to update booking status');
			}

			await fetchBookings();
			setShowDetails(false);
			setUpdateStatus(false);
			setAdminNotes('');
			alert(`Booking ${newStatus} successfully!`);
		} catch (error) {
			console.error('Error updating booking status:', error);
			alert('Error updating booking status: ' + error.message);
		}
	};

	const getFilteredBookings = () => {
		let filtered = bookings;

		if (filter !== 'all') {
			filtered = filtered.filter(booking => booking.status === filter);
		}

		if (tourFilter !== 'all') {
			filtered = filtered.filter(booking => booking.tourId?._id === tourFilter);
		}

		return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'confirmed': return '#28a745';
			case 'pending': return '#ffc107';
			case 'cancelled': return '#dc3545';
			case 'completed': return '#17a2b8';
			case 'no-show': return '#6c757d';
			default: return '#6c757d';
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

	if (loading) {
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				height: '400px',
				fontSize: '1.1rem'
			}}>
				⏳ Loading bookings...
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
		<div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			{/* Header */}
			<div style={{ marginBottom: '2rem' }}>
				<h1 style={{ color: '#333', marginBottom: '0.5rem' }}>📅 View Bookings</h1>
				<p style={{ color: '#666', margin: 0 }}>Manage and track all tour bookings</p>
			</div>

			{/* Statistics */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
				gap: '1rem',
				marginBottom: '2rem'
			}}>
				<div style={{ 
					backgroundColor: 'white', 
					padding: '1rem', 
					borderRadius: '8px',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#007bff' }}>
						{stats.total}
					</div>
					<div style={{ color: '#666', fontSize: '0.9rem' }}>Total Bookings</div>
				</div>
				<div style={{ 
					backgroundColor: 'white', 
					padding: '1rem', 
					borderRadius: '8px',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffc107' }}>
						{stats.pending}
					</div>
					<div style={{ color: '#666', fontSize: '0.9rem' }}>Pending</div>
				</div>
				<div style={{ 
					backgroundColor: 'white', 
					padding: '1rem', 
					borderRadius: '8px',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#28a745' }}>
						{stats.confirmed}
					</div>
					<div style={{ color: '#666', fontSize: '0.9rem' }}>Confirmed</div>
				</div>
				<div style={{ 
					backgroundColor: 'white', 
					padding: '1rem', 
					borderRadius: '8px',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#17a2b8' }}>
						{stats.completed}
					</div>
					<div style={{ color: '#666', fontSize: '0.9rem' }}>Completed</div>
				</div>
				<div style={{ 
					backgroundColor: 'white', 
					padding: '1rem', 
					borderRadius: '8px',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc3545' }}>
						{stats.cancelled}
					</div>
					<div style={{ color: '#666', fontSize: '0.9rem' }}>Cancelled</div>
				</div>
			</div>

			{/* Filters */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '1.5rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
					<div>
						<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
							Filter by Status:
						</label>
						<select
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							style={{
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '0.9rem'
							}}
						>
							<option value="all">All Statuses ({stats.total})</option>
							<option value="pending">Pending ({stats.pending})</option>
							<option value="confirmed">Confirmed ({stats.confirmed})</option>
							<option value="cancelled">Cancelled ({stats.cancelled})</option>
							<option value="completed">Completed ({stats.completed})</option>
						</select>
					</div>

					<div>
						<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
							Filter by Tour:
						</label>
						<select
							value={tourFilter}
							onChange={(e) => setTourFilter(e.target.value)}
							style={{
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '0.9rem'
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
							onClick={fetchBookings}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#007bff',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
								fontSize: '0.9rem'
							}}
						>
							🔄 Refresh
						</button>
					</div>
				</div>
			</div>

			{/* Bookings List */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
				gap: '1.5rem'
			}}>
				{filteredBookings.length > 0 ? (
					filteredBookings.map(booking => (
						<div key={booking._id} style={{ 
							backgroundColor: 'white', 
							padding: '1.5rem', 
							borderRadius: '8px',
							border: '1px solid #e0e0e0',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
						}}>
							<div style={{ 
								display: 'flex', 
								justifyContent: 'space-between', 
								alignItems: 'flex-start',
								marginBottom: '1rem'
							}}>
								<h3 style={{ margin: 0, color: '#333' }}>
									{booking.studentName}
								</h3>
								<span style={{ 
									padding: '0.3rem 0.7rem',
									borderRadius: '12px',
									fontSize: '0.8rem',
									fontWeight: '500',
									backgroundColor: getStatusColor(booking.status) + '20',
									color: getStatusColor(booking.status)
								}}>
									{getStatusIcon(booking.status)} {booking.status.toUpperCase()}
								</span>
							</div>

							<div style={{ 
								fontSize: '0.9rem',
								lineHeight: '1.5',
								marginBottom: '1rem'
							}}>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>🎯 Tour:</strong> {booking.tourId?.title || 'Tour not found'}
								</div>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>📅 Date:</strong> {booking.tourId ? new Date(booking.tourId.date).toLocaleDateString() : 'N/A'}
								</div>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>⏰ Time:</strong> {booking.tourId ? `${booking.tourId.startTime} - ${booking.tourId.endTime}` : 'N/A'}
								</div>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>👨‍👩‍👧‍👦 Parent:</strong> {booking.parentId?.name || 'N/A'}
								</div>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>📧 Email:</strong> {booking.parentEmail}
								</div>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>📱 Phone:</strong> {booking.parentPhone}
								</div>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>🎂 Student Age:</strong> {booking.studentAge} years
								</div>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>👥 Guests:</strong> {booking.numberOfGuests}
								</div>
								<div style={{ marginBottom: '0.5rem' }}>
									<strong>📝 Booked:</strong> {new Date(booking.createdAt).toLocaleDateString()}
								</div>
							</div>

							{booking.specialRequests && (
								<div style={{ 
									backgroundColor: '#f8f9fa',
									padding: '0.75rem',
									borderRadius: '4px',
									marginBottom: '1rem'
								}}>
									<strong style={{ fontSize: '0.9rem' }}>💬 Special Requests:</strong>
									<p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
										{booking.specialRequests}
									</p>
								</div>
							)}

							{booking.adminNotes && (
								<div style={{ 
									backgroundColor: '#fff3cd',
									padding: '0.75rem',
									borderRadius: '4px',
									marginBottom: '1rem'
								}}>
									<strong style={{ fontSize: '0.9rem' }}>📝 Admin Notes:</strong>
									<p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#856404' }}>
										{booking.adminNotes}
									</p>
								</div>
							)}

							<div style={{ 
								display: 'flex', 
								gap: '0.5rem', 
								flexWrap: 'wrap'
							}}>
								<button 
									onClick={() => showBookingDetails(booking)}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: '#17a2b8',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '0.9rem'
									}}
								>
									👁️ View Details
								</button>

								{booking.status === 'pending' && (
									<>
										<button 
											onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
											style={{
												padding: '0.5rem 1rem',
												backgroundColor: '#28a745',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '0.9rem'
											}}
										>
											✅ Confirm
										</button>
										<button 
											onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
											style={{
												padding: '0.5rem 1rem',
												backgroundColor: '#dc3545',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '0.9rem'
											}}
										>
											❌ Cancel
										</button>
									</>
								)}

								{booking.status === 'confirmed' && (
									<>
										<button 
											onClick={() => handleStatusUpdate(booking._id, 'completed')}
											style={{
												padding: '0.5rem 1rem',
												backgroundColor: '#17a2b8',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '0.9rem'
											}}
										>
											🎉 Mark Complete
										</button>
										<button 
											onClick={() => handleStatusUpdate(booking._id, 'no-show')}
											style={{
												padding: '0.5rem 1rem',
												backgroundColor: '#6c757d',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '0.9rem'
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
					<div style={{ 
						gridColumn: '1 / -1',
						textAlign: 'center', 
						padding: '3rem',
						color: '#666'
					}}>
						<h3>No bookings found</h3>
						<p>
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
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0,0,0,0.5)',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 1000
				}}>
					<div style={{
						backgroundColor: 'white',
						padding: '2rem',
						borderRadius: '8px',
						maxWidth: '600px',
						width: '90%',
						maxHeight: '80vh',
						overflow: 'auto'
					}}>
						<div style={{ 
							display: 'flex', 
							justifyContent: 'space-between', 
							alignItems: 'center',
							marginBottom: '1.5rem'
						}}>
							<h2 style={{ margin: 0, color: '#333' }}>
								📋 Booking Details
							</h2>
							<button
								onClick={() => setShowDetails(false)}
								style={{
									backgroundColor: 'transparent',
									border: 'none',
									fontSize: '1.5rem',
									cursor: 'pointer',
									color: '#666'
								}}
							>
								✕
							</button>
						</div>

						<div style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
							<h3 style={{ color: '#007bff', marginBottom: '1rem' }}>Student Information</h3>
							<div><strong>Name:</strong> {selectedBooking.studentName}</div>
							<div><strong>Age:</strong> {selectedBooking.studentAge} years</div>
							{selectedBooking.currentGrade && <div><strong>Grade:</strong> {selectedBooking.currentGrade}</div>}
							
							<h3 style={{ color: '#007bff', marginTop: '1.5rem', marginBottom: '1rem' }}>Parent Information</h3>
							<div><strong>Name:</strong> {selectedBooking.parentId?.name || 'N/A'}</div>
							<div><strong>Email:</strong> {selectedBooking.parentEmail}</div>
							<div><strong>Phone:</strong> {selectedBooking.parentPhone}</div>
							
							<h3 style={{ color: '#007bff', marginTop: '1.5rem', marginBottom: '1rem' }}>Tour Information</h3>
							<div><strong>Tour:</strong> {selectedBooking.tourId?.title || 'Tour not found'}</div>
							{selectedBooking.tourId && (
								<>
									<div><strong>Date:</strong> {new Date(selectedBooking.tourId.date).toLocaleDateString()}</div>
									<div><strong>Time:</strong> {selectedBooking.tourId.startTime} - {selectedBooking.tourId.endTime}</div>
								</>
							)}
							<div><strong>Number of Guests:</strong> {selectedBooking.numberOfGuests}</div>
							
							<h3 style={{ color: '#007bff', marginTop: '1.5rem', marginBottom: '1rem' }}>Booking Status</h3>
							<div><strong>Status:</strong> 
								<span style={{
									marginLeft: '0.5rem',
									padding: '0.3rem 0.7rem',
									borderRadius: '12px',
									fontSize: '0.8rem',
									backgroundColor: getStatusColor(selectedBooking.status) + '20',
									color: getStatusColor(selectedBooking.status)
								}}>
									{getStatusIcon(selectedBooking.status)} {selectedBooking.status.toUpperCase()}
								</span>
							</div>
							<div><strong>Booked On:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
							{selectedBooking.confirmedAt && (
								<div><strong>Confirmed On:</strong> {new Date(selectedBooking.confirmedAt).toLocaleString()}</div>
							)}
							{selectedBooking.cancelledAt && (
								<div><strong>Cancelled On:</strong> {new Date(selectedBooking.cancelledAt).toLocaleString()}</div>
							)}
						</div>

						{selectedBooking.specialRequests && (
							<div style={{ 
								backgroundColor: '#f8f9fa',
								padding: '1rem',
								borderRadius: '4px',
								marginBottom: '1rem'
							}}>
								<strong>💬 Special Requests:</strong>
								<p style={{ margin: '0.5rem 0 0 0' }}>{selectedBooking.specialRequests}</p>
							</div>
						)}

						<div style={{ marginBottom: '1rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
								📝 Admin Notes:
							</label>
							<textarea
								value={adminNotes}
								onChange={(e) => setAdminNotes(e.target.value)}
								placeholder="Add notes about this booking..."
								rows="3"
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '0.9rem',
									resize: 'vertical'
								}}
							/>
						</div>

						<div style={{ 
							display: 'flex', 
							gap: '1rem',
							justifyContent: 'flex-end',
							flexWrap: 'wrap'
						}}>
							{selectedBooking.status === 'pending' && (
								<>
									<button 
										onClick={() => handleStatusUpdate(selectedBooking._id, 'confirmed')}
										style={{
											padding: '0.75rem 1.5rem',
											backgroundColor: '#28a745',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '0.9rem'
										}}
									>
										✅ Confirm Booking
									</button>
									<button 
										onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
										style={{
											padding: '0.75rem 1.5rem',
											backgroundColor: '#dc3545',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '0.9rem'
										}}
									>
										❌ Cancel Booking
									</button>
								</>
							)}

							{selectedBooking.status === 'confirmed' && (
								<>
									<button 
										onClick={() => handleStatusUpdate(selectedBooking._id, 'completed')}
										style={{
											padding: '0.75rem 1.5rem',
											backgroundColor: '#17a2b8',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '0.9rem'
										}}
									>
										🎉 Mark as Completed
									</button>
									<button 
										onClick={() => handleStatusUpdate(selectedBooking._id, 'no-show')}
										style={{
											padding: '0.75rem 1.5rem',
											backgroundColor: '#6c757d',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '0.9rem'
										}}
									>
										👻 Mark as No-Show
									</button>
								</>
							)}

							<button
								onClick={() => setShowDetails(false)}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '0.9rem'
								}}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ViewBookings;