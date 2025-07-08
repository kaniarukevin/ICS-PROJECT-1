import React, { useState, useEffect } from 'react';

const SchoolAdminDashboard = ({ onNavigate }) => {
	const [dashboardData, setDashboardData] = useState({
		school: { name: '', type: '', isVerified: false },
		statistics: {
			totalTours: 0, activeTours: 0, upcomingTours: 0,
			totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, todaysBookings: 0
		},
		recentBookings: [], upcomingTours: []
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
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (!response.ok) throw new Error('Failed to fetch dashboard data');
			const data = await response.json();
			setDashboardData(data);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="dashboard-wrapper">
				<div className="loading-container">⏳ Loading dashboard...</div>
				<style>{`
					.dashboard-wrapper { padding: 2rem; background: #f9fafe; min-height: 100vh; font-family: "Segoe UI", sans-serif; }
					.loading-container { display: flex; justify-content: center; align-items: center; height: 400px; font-size: 1.2rem; color: #666; }
				`}</style>
			</div>
		);
	}

	if (error) {
		return (
			<div className="dashboard-wrapper">
				<div className="error-container">
					❌ Error: {error}
					<button onClick={fetchDashboardData} className="retry-btn">🔄 Retry</button>
				</div>
				<style>{`
					.dashboard-wrapper { padding: 2rem; background: #f9fafe; min-height: 100vh; font-family: "Segoe UI", sans-serif; }
					.error-container { text-align: center; padding: 2rem; color: #dc3545; background: white; border-radius: 12px; }
					.retry-btn { margin-top: 1rem; padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; }
				`}</style>
			</div>
		);
	}

	const { school, statistics, recentBookings, upcomingTours } = dashboardData;

	return (
		<div className="dashboard-wrapper">
			<div className="dashboard-container">
				{/* Header */}
				<div className="dashboard-header">
					<h1>📊 {school.name} Dashboard</h1>
					<div className="badges">
						<span className="badge">{school.type}</span>
						{school.isVerified && <span className="badge verified">✅ Verified</span>}
					</div>
				</div>

				{/* Stats Grid */}
				<div className="stats-grid">
					<div className="stat-card clickable" onClick={() => onNavigate('tours')}>
						<h3>🎯 Total Tours</h3>
						<div className="stat-number">{statistics.totalTours}</div>
						<p>All time tours created</p>
					</div>
					<div className="stat-card clickable" onClick={() => onNavigate('tours')}>
						<h3>🟢 Active Tours</h3>
						<div className="stat-number">{statistics.activeTours}</div>
						<p>Currently accepting bookings</p>
					</div>
					<div className="stat-card clickable" onClick={() => onNavigate('tours')}>
						<h3>⏰ Upcoming Tours</h3>
						<div className="stat-number">{statistics.upcomingTours}</div>
						<p>Scheduled ahead</p>
					</div>
					<div className="stat-card clickable" onClick={() => onNavigate('bookings')}>
						<h3>📋 Total Bookings</h3>
						<div className="stat-number">{statistics.totalBookings}</div>
						<p>All time bookings</p>
					</div>
					<div className="stat-card clickable" onClick={() => onNavigate('bookings')}>
						<h3>⏳ Pending Bookings</h3>
						<div className="stat-number">{statistics.pendingBookings}</div>
						<p>Awaiting confirmation</p>
					</div>
					<div className="stat-card clickable" onClick={() => onNavigate('bookings')}>
						<h3>✅ Confirmed Bookings</h3>
						<div className="stat-number">{statistics.confirmedBookings}</div>
						<p>Ready to tour</p>
					</div>
					<div className="stat-card">
						<h3>📅 Today's Bookings</h3>
						<div className="stat-number">{statistics.todaysBookings}</div>
						<p>New bookings today</p>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="quick-actions">
					<h2>⚡ Quick Actions</h2>
					<div className="action-buttons">
						<button onClick={() => onNavigate('tours')} className="action-btn primary">🎯 Create New Tour</button>
						<button onClick={() => onNavigate('bookings')} className="action-btn secondary">📋 View All Bookings</button>
						<button onClick={() => onNavigate('profile')} className="action-btn secondary">🏛️ Edit School Profile</button>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="activity-grid">
					<div className="activity-card">
						<h3>📅 Recent Bookings</h3>
						{recentBookings.length > 0 ? (
							<div>
								{recentBookings.slice(0, 5).map((booking, index) => (
									<div key={booking._id || index} className="activity-item">
										<div className="item-name">{booking.studentName}</div>
										<div className="item-detail">{booking.tourId?.title} - {new Date(booking.createdAt).toLocaleDateString()}</div>
										<span className={`status-badge ${booking.status}`}>{booking.status.toUpperCase()}</span>
									</div>
								))}
							</div>
						) : (
							<p className="empty-message">📭 No recent bookings</p>
						)}
						<button onClick={() => onNavigate('bookings')} className="view-all-btn">View All Bookings →</button>
					</div>

					<div className="activity-card">
						<h3>🎯 Upcoming Tours</h3>
						{upcomingTours.length > 0 ? (
							<div>
								{upcomingTours.slice(0, 5).map((tour, index) => (
									<div key={tour._id || index} className="activity-item">
										<div className="item-name">{tour.title}</div>
										<div className="item-detail">📅 {new Date(tour.date).toLocaleDateString()} at ⏰ {tour.startTime}</div>
										<div className="item-detail">👥 Capacity: {tour.currentBookings || 0}/{tour.maxCapacity}</div>
									</div>
								))}
							</div>
						) : (
							<p className="empty-message">📅 No upcoming tours scheduled</p>
						)}
						<button onClick={() => onNavigate('tours')} className="view-all-btn">Manage Tours →</button>
					</div>
				</div>
			</div>

			<style>{`
				.dashboard-wrapper { padding: 2rem; background: #f9fafe; min-height: 100vh; font-family: "Segoe UI", sans-serif; }
				.dashboard-container { max-width: 1400px; margin: 0 auto; }
				.dashboard-header { margin-bottom: 2rem; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 2rem; border-radius: 12px; }
				.dashboard-header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; }
				.badges { display: flex; gap: 1rem; flex-wrap: wrap; }
				.badge { padding: 0.5rem 1rem; border-radius: 25px; font-size: 0.9rem; font-weight: 600; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); }
				.badge.verified { background: rgba(40,167,69,0.2); border: 1px solid rgba(40,167,69,0.4); }
				.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
				.stat-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; transition: all 0.3s ease; }
				.stat-card.clickable { cursor: pointer; }
				.stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
				.stat-card h3 { margin: 0 0 1rem 0; color: #666; font-size: 1rem; font-weight: 600; }
				.stat-number { font-size: 2.5rem; font-weight: 700; margin: 0.5rem 0; color: #007bff; }
				.stat-card p { margin: 0; color: #888; font-size: 0.85rem; }
				.quick-actions { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e0e0e0; margin-bottom: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
				.quick-actions h2 { margin-bottom: 1.5rem; color: #2d2d2d; font-size: 1.5rem; font-weight: 700; }
				.action-buttons { display: flex; flex-wrap: wrap; gap: 1rem; }
				.action-btn { padding: 1rem 1.5rem; border: none; border-radius: 10px; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.3s ease; }
				.action-btn.primary { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; }
				.action-btn.secondary { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; }
				.action-btn:hover { transform: translateY(-3px); }
				.activity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
				.activity-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
				.activity-card h3 { margin-bottom: 1.5rem; color: #2d2d2d; font-size: 1.3rem; font-weight: 700; }
				.activity-item { padding: 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
				.item-name { font-weight: 600; color: #2d2d2d; margin-bottom: 0.25rem; }
				.item-detail { color: #666; font-size: 0.85rem; margin-bottom: 0.5rem; }
				.status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
				.status-badge.confirmed { background: #e8f5e8; color: #2e7d2e; }
				.status-badge.pending { background: #fff3cd; color: #856404; }
				.status-badge.cancelled { background: #f8d7da; color: #721c24; }
				.empty-message { color: #888; font-style: italic; text-align: center; padding: 2rem; }
				.view-all-btn { margin-top: 1.5rem; padding: 0.75rem 1.25rem; background: transparent; color: #007bff; border: 2px solid #007bff; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; width: 100%; transition: all 0.3s ease; }
				.view-all-btn:hover { background: #007bff; color: white; }
				@media (max-width: 768px) {
					.activity-grid { grid-template-columns: 1fr; }
					.stats-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
					.action-buttons { flex-direction: column; }
				}
			`}</style>
		</div>
	);
};

export default SchoolAdminDashboard;