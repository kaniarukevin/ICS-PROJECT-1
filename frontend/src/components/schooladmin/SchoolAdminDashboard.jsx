// frontend/src/components/schooladmin/SchoolAdminDashboard.jsx (Enhanced)
import React, { useState, useEffect } from 'react';

const SchoolAdminDashboard = ({ onNavigate }) => {
	const [dashboardData, setDashboardData] = useState({
		school: {
			name: '',
			type: '',
			isVerified: false
		},
		statistics: {
			totalTours: 0,
			activeTours: 0,
			upcomingTours: 0,
			totalBookings: 0,
			pendingBookings: 0,
			confirmedBookings: 0,
			todaysBookings: 0
		},
		recentBookings: [],
		upcomingTours: []
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/school-admin/dashboard', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch dashboard data');
			}

			const data = await response.json();
			setDashboardData(data);
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
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
				⏳ Loading dashboard...
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ 
				padding: '2rem', 
				textAlign: 'center',
				color: '#dc3545'
			}}>
				❌ Error loading dashboard: {error}
				<br />
				<button 
					onClick={fetchDashboardData}
					style={{
						marginTop: '1rem',
						padding: '0.5rem 1rem',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					🔄 Retry
				</button>
			</div>
		);
	}

	const { school, statistics, recentBookings, upcomingTours } = dashboardData;

	const statCardStyle = {
		backgroundColor: 'white',
		padding: '1.5rem',
		borderRadius: '8px',
		border: '1px solid #e0e0e0',
		boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
		textAlign: 'center',
		transition: 'transform 0.2s',
		cursor: 'pointer'
	};

	const statNumberStyle = {
		fontSize: '2rem',
		fontWeight: 'bold',
		margin: '0.5rem 0',
		color: '#007bff'
	};

	const quickActionButtonStyle = {
		padding: '0.75rem 1.5rem',
		margin: '0.5rem',
		border: 'none',
		borderRadius: '6px',
		cursor: 'pointer',
		fontSize: '0.95rem',
		fontWeight: '500',
		transition: 'all 0.2s'
	};

	const primaryButtonStyle = {
		...quickActionButtonStyle,
		backgroundColor: '#007bff',
		color: 'white'
	};

	const secondaryButtonStyle = {
		...quickActionButtonStyle,
		backgroundColor: '#6c757d',
		color: 'white'
	};

	return (
		<div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			{/* Header */}
			<div style={{ marginBottom: '2rem' }}>
				<h1 style={{ color: '#333', marginBottom: '0.5rem' }}>
					📊 {school.name} Dashboard
				</h1>
				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
					<span style={{ 
						padding: '0.3rem 0.8rem', 
						backgroundColor: '#e3f2fd', 
						color: '#1565c0',
						borderRadius: '20px',
						fontSize: '0.9rem'
					}}>
						{school.type}
					</span>
					{school.isVerified && (
						<span style={{ 
							padding: '0.3rem 0.8rem', 
							backgroundColor: '#e8f5e8', 
							color: '#2e7d2e',
							borderRadius: '20px',
							fontSize: '0.9rem'
						}}>
							✅ Verified
						</span>
					)}
				</div>
			</div>

			{/* Statistics Grid */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
				gap: '1.5rem',
				marginBottom: '2rem'
			}}>
				<div style={statCardStyle} onClick={() => onNavigate('tours')}>
					<h3 style={{ margin: 0, color: '#666' }}>Total Tours</h3>
					<div style={statNumberStyle}>{statistics.totalTours}</div>
					<p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>All time</p>
				</div>
				
				<div style={statCardStyle} onClick={() => onNavigate('tours')}>
					<h3 style={{ margin: 0, color: '#666' }}>Active Tours</h3>
					<div style={{ ...statNumberStyle, color: '#28a745' }}>{statistics.activeTours}</div>
					<p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Currently accepting bookings</p>
				</div>
				
				<div style={statCardStyle} onClick={() => onNavigate('tours')}>
					<h3 style={{ margin: 0, color: '#666' }}>Upcoming Tours</h3>
					<div style={{ ...statNumberStyle, color: '#ffc107' }}>{statistics.upcomingTours}</div>
					<p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Scheduled ahead</p>
				</div>
				
				<div style={statCardStyle} onClick={() => onNavigate('bookings')}>
					<h3 style={{ margin: 0, color: '#666' }}>Total Bookings</h3>
					<div style={statNumberStyle}>{statistics.totalBookings}</div>
					<p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>All time</p>
				</div>
				
				<div style={statCardStyle} onClick={() => onNavigate('bookings')}>
					<h3 style={{ margin: 0, color: '#666' }}>Pending Bookings</h3>
					<div style={{ ...statNumberStyle, color: '#ffc107' }}>{statistics.pendingBookings}</div>
					<p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Awaiting confirmation</p>
				</div>
				
				<div style={statCardStyle} onClick={() => onNavigate('bookings')}>
					<h3 style={{ margin: 0, color: '#666' }}>Confirmed Bookings</h3>
					<div style={{ ...statNumberStyle, color: '#28a745' }}>{statistics.confirmedBookings}</div>
					<p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Ready to tour</p>
				</div>
				
				<div style={statCardStyle}>
					<h3 style={{ margin: 0, color: '#666' }}>Today's Bookings</h3>
					<div style={{ ...statNumberStyle, color: '#17a2b8' }}>{statistics.todaysBookings}</div>
					<p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>New today</p>
				</div>
			</div>

			{/* Quick Actions */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '1.5rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<h2 style={{ marginBottom: '1rem', color: '#333' }}>⚡ Quick Actions</h2>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
					<button 
						style={primaryButtonStyle}
						onClick={() => onNavigate('tours')}
					>
						🎯 Create New Tour
					</button>
					<button 
						style={secondaryButtonStyle}
						onClick={() => onNavigate('bookings')}
					>
						📋 View All Bookings
					</button>
					<button 
						style={secondaryButtonStyle}
						onClick={() => onNavigate('profile')}
					>
						🏛️ Edit School Profile
					</button>
				</div>
			</div>

			{/* Recent Activity */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
				{/* Recent Bookings */}
				<div style={{ 
					backgroundColor: 'white', 
					padding: '1.5rem', 
					borderRadius: '8px',
					border: '1px solid #e0e0e0'
				}}>
					<h3 style={{ marginBottom: '1rem', color: '#333' }}>📅 Recent Bookings</h3>
					{recentBookings.length > 0 ? (
						<div>
							{recentBookings.slice(0, 5).map((booking, index) => (
								<div key={booking._id} style={{ 
									padding: '0.75rem', 
									borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
									fontSize: '0.9rem'
								}}>
									<div style={{ fontWeight: '500', color: '#333' }}>
										{booking.studentName}
									</div>
									<div style={{ color: '#666', fontSize: '0.8rem' }}>
										{booking.tourId?.title} - {new Date(booking.createdAt).toLocaleDateString()}
									</div>
									<span style={{ 
										padding: '0.2rem 0.5rem',
										borderRadius: '12px',
										fontSize: '0.75rem',
										backgroundColor: booking.status === 'confirmed' ? '#e8f5e8' : 
														booking.status === 'pending' ? '#fff3cd' : '#f8d7da',
										color: booking.status === 'confirmed' ? '#2e7d2e' : 
											   booking.status === 'pending' ? '#856404' : '#721c24'
									}}>
										{booking.status.toUpperCase()}
									</span>
								</div>
							))}
						</div>
					) : (
						<p style={{ color: '#888', fontStyle: 'italic' }}>No recent bookings</p>
					)}
					<button 
						onClick={() => onNavigate('bookings')}
						style={{
							marginTop: '1rem',
							padding: '0.5rem 1rem',
							backgroundColor: 'transparent',
							color: '#007bff',
							border: '1px solid #007bff',
							borderRadius: '4px',
							cursor: 'pointer',
							fontSize: '0.9rem'
						}}
					>
						View All Bookings →
					</button>
				</div>

				{/* Upcoming Tours */}
				<div style={{ 
					backgroundColor: 'white', 
					padding: '1.5rem', 
					borderRadius: '8px',
					border: '1px solid #e0e0e0'
				}}>
					<h3 style={{ marginBottom: '1rem', color: '#333' }}>🎯 Upcoming Tours</h3>
					{upcomingTours.length > 0 ? (
						<div>
							{upcomingTours.slice(0, 5).map((tour, index) => (
								<div key={tour._id} style={{ 
									padding: '0.75rem', 
									borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
									fontSize: '0.9rem'
								}}>
									<div style={{ fontWeight: '500', color: '#333' }}>
										{tour.title}
									</div>
									<div style={{ color: '#666', fontSize: '0.8rem' }}>
										{new Date(tour.date).toLocaleDateString()} at {tour.startTime}
									</div>
									<div style={{ color: '#888', fontSize: '0.8rem' }}>
										Capacity: {tour.currentBookings}/{tour.maxCapacity}
									</div>
								</div>
							))}
						</div>
					) : (
						<p style={{ color: '#888', fontStyle: 'italic' }}>No upcoming tours scheduled</p>
					)}
					<button 
						onClick={() => onNavigate('tours')}
						style={{
							marginTop: '1rem',
							padding: '0.5rem 1rem',
							backgroundColor: 'transparent',
							color: '#007bff',
							border: '1px solid #007bff',
							borderRadius: '4px',
							cursor: 'pointer',
							fontSize: '0.9rem'
						}}
					>
						Manage Tours →
					</button>
				</div>
			</div>
		</div>
	);
};

export default SchoolAdminDashboard;