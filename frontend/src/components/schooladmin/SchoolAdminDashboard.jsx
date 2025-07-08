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

	// Blue theme colors
	const colors = {
		primaryBlue: '#007bff',
		darkBlue: '#0056b3',
		lightBlue: '#e3f2fd',
		successGreen: '#28a745',
		warningYellow: '#ffc107',
		dangerRed: '#dc3545',
		infoTeal: '#17a2b8',
		darkGray: '#2d2d2d',
		lightGray: '#f8f9fa',
		white: '#ffffff',
		borderGray: '#e0e0e0'
	};

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

	// Styling objects
	const wrapperStyle = {
		padding: '2rem',
		backgroundColor: '#f9fafe',
		minHeight: '100vh',
		fontFamily: '"Segoe UI", sans-serif'
	};

	const containerStyle = {
		maxWidth: '1400px',
		margin: '0 auto'
	};

	const headerStyle = {
		marginBottom: '2rem',
		background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
		color: colors.white,
		padding: '2rem',
		borderRadius: '12px',
		boxShadow: '0 8px 25px rgba(0, 123, 255, 0.3)'
	};

	const headerTitleStyle = {
		fontSize: '2.5rem',
		fontWeight: '700',
		marginBottom: '1rem',
		textShadow: '0 2px 4px rgba(0,0,0,0.2)'
	};

	const badgeContainerStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: '1rem',
		flexWrap: 'wrap'
	};

	const getBadgeStyle = (type) => {
		const styles = {
			type: {
				background: 'rgba(255, 255, 255, 0.2)',
				color: colors.white,
				border: '1px solid rgba(255, 255, 255, 0.3)'
			},
			verified: {
				background: 'rgba(40, 167, 69, 0.2)',
				color: colors.white,
				border: '1px solid rgba(40, 167, 69, 0.4)'
			}
		};

		return {
			padding: '0.5rem 1rem',
			borderRadius: '25px',
			fontSize: '0.9rem',
			fontWeight: '600',
			backdropFilter: 'blur(10px)',
			...styles[type]
		};
	};

	const statsGridStyle = {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
		gap: '1.5rem',
		marginBottom: '2rem'
	};

	const getStatCardStyle = (isClickable) => ({
		backgroundColor: colors.white,
		padding: '2rem',
		borderRadius: '12px',
		border: `1px solid ${colors.borderGray}`,
		boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
		textAlign: 'center',
		transition: 'all 0.3s ease',
		cursor: isClickable ? 'pointer' : 'default',
		position: 'relative',
		overflow: 'hidden'
	});

	const statCardHeaderStyle = {
		margin: '0 0 1rem 0',
		color: '#666',
		fontSize: '1rem',
		fontWeight: '600'
	};

	const getStatNumberStyle = (color) => ({
		fontSize: '2.5rem',
		fontWeight: '700',
		margin: '0.5rem 0',
		color: color || colors.primaryBlue,
		textShadow: '0 2px 4px rgba(0,0,0,0.1)'
	});

	const statDescriptionStyle = {
		margin: 0,
		color: '#888',
		fontSize: '0.85rem',
		fontWeight: '500'
	};

	const quickActionsStyle = {
		backgroundColor: colors.white,
		padding: '2rem',
		borderRadius: '12px',
		border: `1px solid ${colors.borderGray}`,
		marginBottom: '2rem',
		boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
		position: 'relative'
	};

	const quickActionsTitleStyle = {
		marginBottom: '1.5rem',
		color: colors.darkGray,
		fontSize: '1.5rem',
		fontWeight: '700'
	};

	const quickActionsContainerStyle = {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '1rem'
	};

	const getQuickActionButtonStyle = (type) => {
		const styles = {
			primary: {
				background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
				color: colors.white,
				boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
			},
			secondary: {
				background: `linear-gradient(135deg, #6c757d 0%, #495057 100%)`,
				color: colors.white,
				boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
			}
		};

		return {
			padding: '1rem 1.5rem',
			border: 'none',
			borderRadius: '10px',
			cursor: 'pointer',
			fontSize: '0.95rem',
			fontWeight: '600',
			transition: 'all 0.3s ease',
			display: 'flex',
			alignItems: 'center',
			gap: '0.5rem',
			...styles[type]
		};
	};

	const activityGridStyle = {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: '2rem'
	};

	const activityCardStyle = {
		backgroundColor: colors.white,
		padding: '2rem',
		borderRadius: '12px',
		border: `1px solid ${colors.borderGray}`,
		boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
		position: 'relative'
	};

	const activityTitleStyle = {
		marginBottom: '1.5rem',
		color: colors.darkGray,
		fontSize: '1.3rem',
		fontWeight: '700'
	};

	const activityItemStyle = {
		padding: '1rem',
		borderBottom: '1px solid #f0f0f0',
		fontSize: '0.9rem',
		transition: 'all 0.3s ease'
	};

	const activityItemNameStyle = {
		fontWeight: '600',
		color: colors.darkGray,
		marginBottom: '0.25rem'
	};

	const activityItemDetailStyle = {
		color: '#666',
		fontSize: '0.85rem',
		marginBottom: '0.5rem'
	};

	const getStatusBadgeStyle = (status) => {
		const styles = {
			confirmed: {
				backgroundColor: '#e8f5e8',
				color: '#2e7d2e'
			},
			pending: {
				backgroundColor: '#fff3cd',
				color: '#856404'
			},
			cancelled: {
				backgroundColor: '#f8d7da',
				color: '#721c24'
			}
		};

		return {
			padding: '0.25rem 0.75rem',
			borderRadius: '12px',
			fontSize: '0.75rem',
			fontWeight: '600',
			textTransform: 'uppercase',
			...styles[status]
		};
	};

	const viewAllButtonStyle = {
		marginTop: '1.5rem',
		padding: '0.75rem 1.25rem',
		backgroundColor: 'transparent',
		color: colors.primaryBlue,
		border: `2px solid ${colors.primaryBlue}`,
		borderRadius: '8px',
		cursor: 'pointer',
		fontSize: '0.9rem',
		fontWeight: '600',
		transition: 'all 0.3s ease',
		width: '100%'
	};

	const loadingStyle = {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		height: '400px',
		fontSize: '1.2rem',
		color: '#666',
		background: colors.white,
		borderRadius: '12px',
		boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
		gap: '1rem'
	};

	const errorStyle = {
		padding: '2rem',
		textAlign: 'center',
		color: colors.dangerRed,
		background: colors.white,
		borderRadius: '12px',
		boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
		border: `2px solid ${colors.dangerRed}20`
	};

	const retryButtonStyle = {
		marginTop: '1rem',
		padding: '0.75rem 1.5rem',
		background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
		color: colors.white,
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		fontSize: '0.9rem',
		fontWeight: '600',
		transition: 'all 0.3s ease'
	};

	if (loading) {
		return (
			<div className="sad-wrapper" style={wrapperStyle}>
				<div className="sad-container" style={containerStyle}>
					<div className="sad-loading" style={loadingStyle}>
						<div style={{
							width: '40px',
							height: '40px',
							border: '4px solid #f3f3f3',
							borderTop: `4px solid ${colors.primaryBlue}`,
							borderRadius: '50%',
							animation: 'spin 1s linear infinite'
						}}></div>
						⏳ Loading dashboard...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="sad-wrapper" style={wrapperStyle}>
				<div className="sad-container" style={containerStyle}>
					<div className="sad-error" style={errorStyle}>
						❌ Error loading dashboard: {error}
						<br />
						<button 
							className="sad-retry-btn"
							onClick={fetchDashboardData}
							style={retryButtonStyle}
							onMouseEnter={(e) => {
								e.target.style.transform = 'translateY(-2px)';
								e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = 'none';
							}}
						>
							🔄 Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	const { school, statistics, recentBookings, upcomingTours } = dashboardData;

	return (
		<div className="sad-wrapper" style={wrapperStyle}>
			<div className="sad-container" style={containerStyle}>
				{/* Header */}
				<div className="sad-header" style={headerStyle}>
					<h1 className="sad-header-title" style={headerTitleStyle}>
						📊 {school.name} Dashboard
					</h1>
					<div className="sad-badges" style={badgeContainerStyle}>
						<span className="sad-badge sad-type-badge" style={getBadgeStyle('type')}>
							{school.type}
						</span>
						{school.isVerified && (
							<span className="sad-badge sad-verified-badge" style={getBadgeStyle('verified')}>
								✅ Verified School
							</span>
						)}
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="sad-stats-grid" style={statsGridStyle}>
					<div 
						className="sad-stat-card sad-clickable" 
						style={getStatCardStyle(true)}
						onClick={() => onNavigate('tours')}
						onMouseEnter={(e) => {
							e.target.style.transform = 'translateY(-4px)';
							e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
						}}
					>
						<h3 className="sad-stat-header" style={statCardHeaderStyle}>🎯 Total Tours</h3>
						<div className="sad-stat-number" style={getStatNumberStyle(colors.primaryBlue)}>
							{statistics.totalTours}
						</div>
						<p className="sad-stat-description" style={statDescriptionStyle}>All time tours created</p>
					</div>
					
					<div 
						className="sad-stat-card sad-clickable" 
						style={getStatCardStyle(true)}
						onClick={() => onNavigate('tours')}
						onMouseEnter={(e) => {
							e.target.style.transform = 'translateY(-4px)';
							e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
						}}
					>
						<h3 className="sad-stat-header" style={statCardHeaderStyle}>🟢 Active Tours</h3>
						<div className="sad-stat-number" style={getStatNumberStyle(colors.successGreen)}>
							{statistics.activeTours}
						</div>
						<p className="sad-stat-description" style={statDescriptionStyle}>Currently accepting bookings</p>
					</div>
					
					<div 
						className="sad-stat-card sad-clickable" 
						style={getStatCardStyle(true)}
						onClick={() => onNavigate('tours')}
						onMouseEnter={(e) => {
							e.target.style.transform = 'translateY(-4px)';
							e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
						}}
					>
						<h3 className="sad-stat-header" style={statCardHeaderStyle}>⏰ Upcoming Tours</h3>
						<div className="sad-stat-number" style={getStatNumberStyle(colors.warningYellow)}>
							{statistics.upcomingTours}
						</div>
						<p className="sad-stat-description" style={statDescriptionStyle}>Scheduled ahead</p>
					</div>
					
					<div 
						className="sad-stat-card sad-clickable" 
						style={getStatCardStyle(true)}
						onClick={() => onNavigate('bookings')}
						onMouseEnter={(e) => {
							e.target.style.transform = 'translateY(-4px)';
							e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
						}}
					>
						<h3 className="sad-stat-header" style={statCardHeaderStyle}>📋 Total Bookings</h3>
						<div className="sad-stat-number" style={getStatNumberStyle(colors.primaryBlue)}>
							{statistics.totalBookings}
						</div>
						<p className="sad-stat-description" style={statDescriptionStyle}>All time bookings</p>
					</div>
					
					<div 
						className="sad-stat-card sad-clickable" 
						style={getStatCardStyle(true)}
						onClick={() => onNavigate('bookings')}
						onMouseEnter={(e) => {
							e.target.style.transform = 'translateY(-4px)';
							e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
						}}
					>
						<h3 className="sad-stat-header" style={statCardHeaderStyle}>⏳ Pending Bookings</h3>
						<div className="sad-stat-number" style={getStatNumberStyle(colors.warningYellow)}>
							{statistics.pendingBookings}
						</div>
						<p className="sad-stat-description" style={statDescriptionStyle}>Awaiting confirmation</p>
					</div>
					
					<div 
						className="sad-stat-card sad-clickable" 
						style={getStatCardStyle(true)}
						onClick={() => onNavigate('bookings')}
						onMouseEnter={(e) => {
							e.target.style.transform = 'translateY(-4px)';
							e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
						}}
					>
						<h3 className="sad-stat-header" style={statCardHeaderStyle}>✅ Confirmed Bookings</h3>
						<div className="sad-stat-number" style={getStatNumberStyle(colors.successGreen)}>
							{statistics.confirmedBookings}
						</div>
						<p className="sad-stat-description" style={statDescriptionStyle}>Ready to tour</p>
					</div>
					
					<div className="sad-stat-card" style={getStatCardStyle(false)}>
						<h3 className="sad-stat-header" style={statCardHeaderStyle}>📅 Today's Bookings</h3>
						<div className="sad-stat-number" style={getStatNumberStyle(colors.infoTeal)}>
							{statistics.todaysBookings}
						</div>
						<p className="sad-stat-description" style={statDescriptionStyle}>New bookings today</p>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="sad-quick-actions" style={quickActionsStyle}>
					<h2 className="sad-quick-actions-title" style={quickActionsTitleStyle}>
						⚡ Quick Actions
					</h2>
					<div className="sad-quick-actions-container" style={quickActionsContainerStyle}>
						<button 
							className="sad-quick-btn sad-primary-btn"
							style={getQuickActionButtonStyle('primary')}
							onClick={() => onNavigate('tours')}
							onMouseEnter={(e) => {
								e.target.style.transform = 'translateY(-3px)';
								e.target.style.boxShadow = '0 8px 25px rgba(0, 123, 255, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
							}}
						>
							🎯 Create New Tour
						</button>
						<button 
							className="sad-quick-btn sad-secondary-btn"
							style={getQuickActionButtonStyle('secondary')}
							onClick={() => onNavigate('bookings')}
							onMouseEnter={(e) => {
								e.target.style.transform = 'translateY(-3px)';
								e.target.style.boxShadow = '0 8px 25px rgba(108, 117, 125, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
							}}
						>
							📋 View All Bookings
						</button>
						<button 
							className="sad-quick-btn sad-secondary-btn"
							style={getQuickActionButtonStyle('secondary')}
							onClick={() => onNavigate('profile')}
							onMouseEnter={(e) => {
								e.target.style.transform = 'translateY(-3px)';
								e.target.style.boxShadow = '0 8px 25px rgba(108, 117, 125, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
							}}
						>
							🏛️ Edit School Profile
						</button>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="sad-activity-grid" style={activityGridStyle}>
					{/* Recent Bookings */}
					<div className="sad-activity-card" style={activityCardStyle}>
						<h3 className="sad-activity-title" style={activityTitleStyle}>
							📅 Recent Bookings
						</h3>
						{recentBookings.length > 0 ? (
							<div className="sad-bookings-list">
								{recentBookings.slice(0, 5).map((booking, index) => (
									<div 
										key={booking._id} 
										className="sad-booking-item" 
										style={{
											...activityItemStyle,
											borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none'
										}}
										onMouseEnter={(e) => {
											e.target.style.backgroundColor = '#f8f9fa';
											e.target.style.transform = 'translateX(4px)';
										}}
										onMouseLeave={(e) => {
											e.target.style.backgroundColor = 'transparent';
											e.target.style.transform = 'translateX(0)';
										}}
									>
										<div className="sad-booking-name" style={activityItemNameStyle}>
											{booking.studentName}
										</div>
										<div className="sad-booking-details" style={activityItemDetailStyle}>
											{booking.tourId?.title} - {new Date(booking.createdAt).toLocaleDateString()}
										</div>
										<span 
											className="sad-status-badge" 
											style={getStatusBadgeStyle(booking.status)}
										>
											{booking.status.toUpperCase()}
										</span>
									</div>
								))}
							</div>
						) : (
							<p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
								📭 No recent bookings
							</p>
						)}
						<button 
							className="sad-view-all-btn"
							onClick={() => onNavigate('bookings')}
							style={viewAllButtonStyle}
							onMouseEnter={(e) => {
								e.target.style.backgroundColor = colors.primaryBlue;
								e.target.style.color = colors.white;
								e.target.style.transform = 'translateY(-2px)';
							}}
							onMouseLeave={(e) => {
								e.target.style.backgroundColor = 'transparent';
								e.target.style.color = colors.primaryBlue;
								e.target.style.transform = 'translateY(0)';
							}}
						>
							View All Bookings →
						</button>
					</div>

					{/* Upcoming Tours */}
					<div className="sad-activity-card" style={activityCardStyle}>
						<h3 className="sad-activity-title" style={activityTitleStyle}>
							🎯 Upcoming Tours
						</h3>
						{upcomingTours.length > 0 ? (
							<div className="sad-tours-list">
								{upcomingTours.slice(0, 5).map((tour, index) => (
									<div 
										key={tour._id} 
										className="sad-tour-item" 
										style={{
											...activityItemStyle,
											borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none'
										}}
										onMouseEnter={(e) => {
											e.target.style.backgroundColor = '#f8f9fa';
											e.target.style.transform = 'translateX(4px)';
										}}
										onMouseLeave={(e) => {
											e.target.style.backgroundColor = 'transparent';
											e.target.style.transform = 'translateX(0)';
										}}
									>
										<div className="sad-tour-name" style={activityItemNameStyle}>
											{tour.title}
										</div>
										<div className="sad-tour-details" style={activityItemDetailStyle}>
											📅 {new Date(tour.date).toLocaleDateString()} at ⏰ {tour.startTime}
										</div>
										<div className="sad-tour-capacity" style={activityItemDetailStyle}>
											👥 Capacity: {tour.currentBookings || 0}/{tour.maxCapacity}
										</div>
									</div>
								))}
							</div>
						) : (
							<p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
								📅 No upcoming tours scheduled
							</p>
						)}
						<button 
							className="sad-view-all-btn"
							onClick={() => onNavigate('tours')}
							style={viewAllButtonStyle}
							onMouseEnter={(e) => {
								e.target.style.backgroundColor = colors.primaryBlue;
								e.target.style.color = colors.white;
								e.target.style.transform = 'translateY(-2px)';
							}}
							onMouseLeave={(e) => {
								e.target.style.backgroundColor = 'transparent';
								e.target.style.color = colors.primaryBlue;
								e.target.style.transform = 'translateY(0)';
							}}
						>
							Manage Tours →
						</button>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}

				@media (max-width: 768px) {
					.sad-activity-grid {
						grid-template-columns: 1fr !important;
					}
					
					.sad-stats-grid {
						grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
					}
					
					.sad-quick-actions-container {
						flex-direction: column !important;
					}
					
					.sad-header {
						padding: 1.5rem !important;
					}
					
					.sad-header-title {
						font-size: 2rem !important;
					}
					
					.sad-badges {
						flex-direction: column !important;
						align-items: flex-start !important;
					}
				}

				@media (max-width: 480px) {
					.sad-wrapper {
						padding: 1rem !important;
					}
					
					.sad-stats-grid {
						grid-template-columns: 1fr !important;
					}
					
					.sad-stat-card {
						padding: 1.5rem !important;
					}
					
					.sad-quick-actions {
						padding: 1.5rem !important;
					}
					
					.sad-activity-card {
						padding: 1.5rem !important;
					}
				}
			`}</style>
		</div>
	);
};

export default SchoolAdminDashboard;