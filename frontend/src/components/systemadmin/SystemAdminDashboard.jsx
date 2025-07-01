//frontend/src/components/systemadmin/SystemAdminDashboard.jsx

import React, { useState, useEffect } from 'react';

const SystemAdminDashboard = ({ onNavigate }) => {
	const [dashboardData, setDashboardData] = useState({
		totalSchools: 0,
		verifiedSchools: 0,
		pendingSchools: 0,
		totalUsers: 0,
		totalTours: 0,
		totalBookings: 0,
		schoolTypes: [],
		topRatedSchools: []
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const token = localStorage.getItem('token');
			const user = JSON.parse(localStorage.getItem('user') || '{}');
			
			console.log('🔐 Making dashboard API call...');
			console.log('Token exists:', !!token);
			console.log('User:', user);
			console.log('User role:', user.role);
			
			if (!token) {
				throw new Error('No authentication token found');
			}
			
			if (user.role !== 'system_admin') {
				throw new Error(`Invalid role: ${user.role}. Expected: system_admin`);
			}

			const response = await fetch('http://localhost:5000/api/system-admin/dashboard', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			console.log('📡 Response status:', response.status);
			console.log('📡 Response headers:', response.headers);
			console.log('📡 Response OK:', response.ok);

			// Get response text first to see what we're actually getting
			const responseText = await response.text();
			console.log('📡 Raw response:', responseText.substring(0, 200) + '...');

			if (!response.ok) {
				console.error('❌ API Error:', response.status, response.statusText);
				throw new Error(`API Error: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
			}

			// Try to parse as JSON
			let data;
			try {
				data = JSON.parse(responseText);
				console.log('✅ Dashboard data received:', data);
			} catch (parseError) {
				console.error('❌ JSON Parse Error:', parseError);
				console.error('❌ Response was:', responseText);
				throw new Error(`Invalid JSON response: ${parseError.message}\nResponse: ${responseText}`);
			}

			setDashboardData(data);
			setError(null);
		} catch (error) {
			console.error('❌ Dashboard fetch error:', error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const renderStars = (rating) => {
		if (!rating) return 'No rating';
		return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
	};

	const getPercentage = (part, total) => {
		return total > 0 ? ((part / total) * 100).toFixed(1) : 0;
	};

	if (loading) {
		return (
			<div style={{ padding: '2rem' }}>
				<h2>Loading dashboard...</h2>
				<p>Fetching data from /api/system-admin/dashboard</p>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ padding: '2rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
				<h2 style={{ color: '#721c24' }}>❌ Dashboard Error</h2>
				<pre style={{ 
					backgroundColor: '#fff', 
					padding: '1rem', 
					border: '1px solid #ccc', 
					borderRadius: '4px',
					overflow: 'auto',
					fontSize: '0.9rem'
				}}>
					{error}
				</pre>
				<button 
					onClick={fetchDashboardData}
					style={{
						marginTop: '1rem',
						padding: '0.75rem 1.5rem',
						backgroundColor: '#dc3545',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					🔄 Retry
				</button>
				
				<div style={{ marginTop: '1rem' }}>
					<h4>Debug Info:</h4>
					<p><strong>Backend URL:</strong> {window.location.origin}/api/system-admin/dashboard</p>
					<p><strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
					<p><strong>User role:</strong> {JSON.parse(localStorage.getItem('user') || '{}').role}</p>
				</div>
			</div>
		);
	}

	const statCardStyle = {
		backgroundColor: 'white',
		border: '1px solid #ddd',
		borderRadius: '8px',
		padding: '1.5rem',
		textAlign: 'center',
		boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
	};

	const numberStyle = {
		fontSize: '2rem',
		fontWeight: 'bold',
		margin: '0.5rem 0'
	};

	return (
		<div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			<h1 style={{ marginBottom: '2rem' }}>System Admin Dashboard</h1>
			
			{/* Success indicator */}
			<div style={{ 
				backgroundColor: '#d4edda', 
				border: '1px solid #c3e6cb', 
				borderRadius: '4px',
				padding: '0.75rem',
				marginBottom: '1rem',
				color: '#155724'
			}}>
				✅ Successfully connected to backend API
			</div>
			
			{/* Main Stats Grid */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
				gap: '1.5rem',
				marginBottom: '2rem'
			}}>
				<div style={{ ...statCardStyle, borderLeft: '4px solid #007bff' }}>
					<h3 style={{ color: '#007bff' }}>Total Schools</h3>
					<p style={{ ...numberStyle, color: '#007bff' }}>{dashboardData.totalSchools}</p>
					<p style={{ color: '#666', margin: 0 }}>Registered institutions</p>
				</div>
				
				<div style={{ ...statCardStyle, borderLeft: '4px solid #28a745' }}>
					<h3 style={{ color: '#28a745' }}>Verified Schools</h3>
					<p style={{ ...numberStyle, color: '#28a745' }}>{dashboardData.verifiedSchools}</p>
					<p style={{ color: '#666', margin: 0 }}>
						{getPercentage(dashboardData.verifiedSchools, dashboardData.totalSchools)}% of total
					</p>
				</div>
				
				<div style={{ ...statCardStyle, borderLeft: '4px solid #ffc107' }}>
					<h3 style={{ color: '#ffc107' }}>Pending Verification</h3>
					<p style={{ ...numberStyle, color: '#ffc107' }}>{dashboardData.pendingSchools}</p>
					<p style={{ color: '#666', margin: 0 }}>Awaiting approval</p>
				</div>
				
				<div style={{ ...statCardStyle, borderLeft: '4px solid #17a2b8' }}>
					<h3 style={{ color: '#17a2b8' }}>Total Users</h3>
					<p style={{ ...numberStyle, color: '#17a2b8' }}>{dashboardData.totalUsers}</p>
					<p style={{ color: '#666', margin: 0 }}>Active accounts</p>
				</div>
				
				<div style={{ ...statCardStyle, borderLeft: '4px solid #6f42c1' }}>
					<h3 style={{ color: '#6f42c1' }}>Total Tours</h3>
					<p style={{ ...numberStyle, color: '#6f42c1' }}>{dashboardData.totalTours}</p>
					<p style={{ color: '#666', margin: 0 }}>Available tours</p>
				</div>
				
				<div style={{ ...statCardStyle, borderLeft: '4px solid #dc3545' }}>
					<h3 style={{ color: '#dc3545' }}>Total Bookings</h3>
					<p style={{ ...numberStyle, color: '#dc3545' }}>{dashboardData.totalBookings}</p>
					<p style={{ color: '#666', margin: 0 }}>All time bookings</p>
				</div>
			</div>

			{/* School Types and Top Rated Schools */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
				gap: '1.5rem',
				marginBottom: '2rem'
			}}>
				{/* School Types */}
				<div style={statCardStyle}>
					<h3 style={{ marginBottom: '1rem' }}>Schools by Type</h3>
					{dashboardData.schoolTypes && dashboardData.schoolTypes.length > 0 ? (
						<div>
							{dashboardData.schoolTypes.map((type, index) => (
								<div key={index} style={{ 
									display: 'flex', 
									justifyContent: 'space-between', 
									alignItems: 'center',
									padding: '0.5rem 0',
									borderBottom: index < dashboardData.schoolTypes.length - 1 ? '1px solid #eee' : 'none'
								}}>
									<span style={{ fontWeight: '500' }}>{type._id || 'Unknown'}</span>
									<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
										<span style={{ fontWeight: 'bold' }}>{type.count}</span>
										<span style={{ 
											fontSize: '0.8rem', 
											color: '#666',
											backgroundColor: '#f8f9fa',
											padding: '0.2rem 0.5rem',
											borderRadius: '12px'
										}}>
											{getPercentage(type.count, dashboardData.totalSchools)}%
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<p style={{ color: '#666' }}>No school type data available</p>
					)}
				</div>

				{/* Top Rated Schools */}
				<div style={statCardStyle}>
					<h3 style={{ marginBottom: '1rem' }}>Top Rated Schools</h3>
					{dashboardData.topRatedSchools && dashboardData.topRatedSchools.length > 0 ? (
						<div>
							{dashboardData.topRatedSchools.map((school, index) => (
								<div key={index} style={{ 
									padding: '0.75rem 0',
									borderBottom: index < dashboardData.topRatedSchools.length - 1 ? '1px solid #eee' : 'none'
								}}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
										<div style={{ flex: 1 }}>
											<div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
												{school.name}
											</div>
											<div style={{ fontSize: '0.9rem', color: '#666' }}>
												{school.location?.city || school.city}
											</div>
										</div>
										<div style={{ textAlign: 'right' }}>
											<div style={{ color: '#ffc107', marginBottom: '0.25rem' }}>
												{renderStars(school.averageRating || school.ratings?.overall)}
											</div>
											<div style={{ fontSize: '0.8rem', color: '#666' }}>
												{(school.averageRating || school.ratings?.overall)?.toFixed(1)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p style={{ color: '#666' }}>No rating data available</p>
					)}
				</div>
			</div>

			{/* Quick Actions */}
			<div style={statCardStyle}>
				<h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
					gap: '1rem' 
				}}>
					<button 
						onClick={() => onNavigate && onNavigate('reports')}
						style={{
							padding: '1rem',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							cursor: 'pointer',
							fontWeight: '500'
						}}
					>
						📊 View Reports
					</button>
					<button 
						onClick={() => onNavigate && onNavigate('schools')}
						style={{
							padding: '1rem',
							backgroundColor: '#28a745',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							cursor: 'pointer',
							fontWeight: '500'
						}}
					>
						🏫 Manage Schools
					</button>
					<button 
						onClick={() => onNavigate && onNavigate('users')}
						style={{
							padding: '1rem',
							backgroundColor: '#17a2b8',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							cursor: 'pointer',
							fontWeight: '500'
						}}
					>
						👥 Manage Users
					</button>
					<button 
						onClick={() => onNavigate && onNavigate('settings')}
						style={{
							padding: '1rem',
							backgroundColor: '#6f42c1',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							cursor: 'pointer',
							fontWeight: '500'
						}}
					>
						⚙️ System Settings
					</button>
				</div>
			</div>

			{/* System Health */}
			{dashboardData.pendingSchools > 0 && (
				<div style={{ 
					...statCardStyle, 
					backgroundColor: '#fff3cd', 
					borderColor: '#ffc107',
					marginTop: '1.5rem'
				}}>
					<h4 style={{ color: '#856404', margin: '0 0 1rem 0' }}>⚠️ Attention Required</h4>
					<p style={{ color: '#856404', margin: 0 }}>
						{dashboardData.pendingSchools} school{dashboardData.pendingSchools !== 1 ? 's' : ''} waiting for verification.
						<br />
						<strong>Action needed:</strong> Review and approve pending schools to maintain platform quality.
					</p>
				</div>
			)}
		</div>
	);
};

export default SystemAdminDashboard;