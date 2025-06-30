import React, { useState, useEffect } from 'react';

const SchoolAdminDashboard = () => {
	const [dashboardData, setDashboardData] = useState({
		totalTours: 0,
		activeTours: 0,
		totalBookings: 0,
		pendingBookings: 0
	});
	const [loading, setLoading] = useState(true);

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
			const data = await response.json();
			setDashboardData(data);
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div className="loading">Loading dashboard...</div>;
	}

	return (
		<div className="dashboard-container">
			<h1>School Admin Dashboard</h1>
			
			<div className="stats-grid">
				<div className="stat-card">
					<h3>Total Tours</h3>
					<p className="stat-number">{dashboardData.totalTours}</p>
				</div>
				
				<div className="stat-card">
					<h3>Active Tours</h3>
					<p className="stat-number">{dashboardData.activeTours}</p>
				</div>
				
				<div className="stat-card">
					<h3>Total Bookings</h3>
					<p className="stat-number">{dashboardData.totalBookings}</p>
				</div>
				
				<div className="stat-card">
					<h3>Pending Bookings</h3>
					<p className="stat-number">{dashboardData.pendingBookings}</p>
				</div>
			</div>

			<div className="quick-actions">
				<h2>Quick Actions</h2>
				<div className="action-buttons">
					<button className="btn-primary">Create New Tour</button>
					<button className="btn-secondary">View All Bookings</button>
					<button className="btn-secondary">Manage School Profile</button>
				</div>
			</div>
		</div>
	);
};

export default SchoolAdminDashboard;