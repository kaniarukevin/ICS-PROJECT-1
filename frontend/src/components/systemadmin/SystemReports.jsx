// frontend/src/components/systemadmin/SystemReports.jsx
import React, { useState, useEffect } from 'react';

const SystemReports = () => {
	const [reportsData, setReportsData] = useState({
		bookingsByMonth: [],
		schoolsByStatus: [],
		schoolsByType: [],
		usersByRole: [],
		ratingStats: {},
		geographicDistribution: [],
		tourPerformance: {},
		bookingStatusDistribution: [],
		feeStats: [],
		recentActivity: {},
		summary: {}
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedReport, setSelectedReport] = useState('overview');

	useEffect(() => {
		fetchReports();
	}, []);

	const fetchReports = async () => {
		try {
			setLoading(true);
			setError(null);
			
			const token = localStorage.getItem('token');
			const user = JSON.parse(localStorage.getItem('user') || '{}');
			
			console.log('📊 Fetching reports...');
			console.log('Token exists:', !!token);
			console.log('User role:', user.role);
			
			if (!token) {
				throw new Error('No authentication token found');
			}
			
			if (user.role !== 'system_admin') {
				throw new Error(`Invalid role: ${user.role}. Expected: system_admin`);
			}

			const response = await fetch('http://localhost:5000/api/system-admin/reports', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			console.log('📡 Response status:', response.status);
			console.log('📡 Response OK:', response.ok);

			// Get response text first to see what we're actually getting
			const responseText = await response.text();
			console.log('📡 Raw response preview:', responseText.substring(0, 200) + '...');

			if (!response.ok) {
				console.error('❌ API Error:', response.status, response.statusText);
				throw new Error(`API Error: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
			}

			// Try to parse as JSON
			let data;
			try {
				data = JSON.parse(responseText);
				console.log('✅ Reports data received:', data);
			} catch (parseError) {
				console.error('❌ JSON Parse Error:', parseError);
				console.error('❌ Response was:', responseText);
				throw new Error(`Invalid JSON response: ${parseError.message}\nResponse: ${responseText}`);
			}

			setReportsData(data);
			setError(null);
		} catch (error) {
			console.error('❌ Error fetching reports:', error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const downloadReport = (reportType) => {
		// Generate CSV data
		let csvContent = '';
		let filename = '';

		switch (reportType) {
			case 'schools':
				csvContent = generateSchoolsCSV();
				filename = 'schools_report.csv';
				break;
			case 'users':
				csvContent = generateUsersCSV();
				filename = 'users_report.csv';
				break;
			case 'bookings':
				csvContent = generateBookingsCSV();
				filename = 'bookings_report.csv';
				break;
			case 'fees':
				csvContent = generateFeesCSV();
				filename = 'fees_report.csv';
				break;
			default:
				return;
		}

		// Download CSV
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', filename);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	const generateSchoolsCSV = () => {
		const headers = 'School Type,Count,Percentage\n';
		const total = reportsData.schoolsByType.reduce((sum, s) => sum + s.count, 0);
		const rows = reportsData.schoolsByType.map(item => 
			`${item._id || 'Unknown'},${item.count},${total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%`
		).join('\n');
		return headers + rows;
	};

	const generateUsersCSV = () => {
		const headers = 'User Role,Count,Percentage\n';
		const total = reportsData.usersByRole.reduce((sum, role) => sum + role.count, 0);
		const rows = reportsData.usersByRole.map(item => 
			`${item._id || 'Unknown'},${item.count},${total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%`
		).join('\n');
		return headers + rows;
	};

	const generateBookingsCSV = () => {
		const headers = 'Month,Year,Bookings\n';
		const rows = reportsData.bookingsByMonth.map(item => 
			`${item._id.month},${item._id.year},${item.count}`
		).join('\n');
		return headers + rows;
	};

	const generateFeesCSV = () => {
		const headers = 'Currency,Average Min Fee,Average Max Fee,School Count\n';
		const rows = reportsData.feeStats.map(item => 
			`${item._id},${item.avgMinFee.toFixed(0)},${item.avgMaxFee.toFixed(0)},${item.schoolCount}`
		).join('\n');
		return headers + rows;
	};

	const formatMonth = (month, year) => {
		const date = new Date(year, month - 1);
		return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	};

	const formatCurrency = (amount, currency = 'KES') => {
		return new Intl.NumberFormat('en-KE', {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	const cardStyle = {
		backgroundColor: 'white',
		border: '1px solid #ddd',
		borderRadius: '8px',
		padding: '1.5rem',
		marginBottom: '1.5rem',
		boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
	};

	const tabStyle = {
		padding: '0.75rem 1.5rem',
		margin: '0 0.25rem',
		border: 'none',
		borderRadius: '4px',
		cursor: 'pointer',
		fontWeight: '500'
	};

	const activeTabStyle = {
		...tabStyle,
		backgroundColor: '#007bff',
		color: 'white'
	};

	const inactiveTabStyle = {
		...tabStyle,
		backgroundColor: '#f8f9fa',
		color: '#666'
	};

	if (loading) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<h2>📊 Loading Reports...</h2>
				<p>Fetching system analytics and data from /api/system-admin/reports</p>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ padding: '2rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
				<h2 style={{ color: '#721c24' }}>❌ Reports Error</h2>
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
					onClick={fetchReports}
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
					<p><strong>Backend URL:</strong> http://localhost:5000/api/system-admin/reports</p>
					<p><strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
					<p><strong>User role:</strong> {JSON.parse(localStorage.getItem('user') || '{}').role}</p>
				</div>
			</div>
		);
	}

	return (
		<div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
				<h1>📊 System Reports & Analytics</h1>
				<div>
					<button 
						onClick={() => fetchReports()}
						style={{
							padding: '0.75rem 1.5rem',
							backgroundColor: '#28a745',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							marginRight: '0.5rem'
						}}
					>
						🔄 Refresh Data
					</button>
					<small style={{ color: '#666' }}>
						Last updated: {reportsData.generatedAt ? new Date(reportsData.generatedAt).toLocaleString() : 'Unknown'}
					</small>
				</div>
			</div>

			{/* Success indicator */}
			<div style={{ 
				backgroundColor: '#d4edda', 
				border: '1px solid #c3e6cb', 
				borderRadius: '4px',
				padding: '0.75rem',
				marginBottom: '1rem',
				color: '#155724'
			}}>
				✅ Successfully connected to reports API
			</div>

			{/* Report Tabs */}
			<div style={{ marginBottom: '2rem' }}>
				<button
					style={selectedReport === 'overview' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setSelectedReport('overview')}
				>
					📊 Overview
				</button>
				<button
					style={selectedReport === 'schools' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setSelectedReport('schools')}
				>
					🏫 Schools Analysis
				</button>
				<button
					style={selectedReport === 'users' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setSelectedReport('users')}
				>
					👥 Users Analysis
				</button>
				<button
					style={selectedReport === 'bookings' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setSelectedReport('bookings')}
				>
					📅 Bookings Trends
				</button>
				<button
					style={selectedReport === 'ratings' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setSelectedReport('ratings')}
				>
					⭐ Ratings Analysis
				</button>
				<button
					style={selectedReport === 'financial' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setSelectedReport('financial')}
				>
					💰 Financial Analysis
				</button>
			</div>

			{/* Overview Report */}
			{selectedReport === 'overview' && (
				<div>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
						{/* Quick Stats */}
						<div style={cardStyle}>
							<h3>📈 Platform Summary</h3>
							<div style={{ display: 'grid', gap: '0.5rem' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>Total Schools:</span>
									<strong>{reportsData.summary?.totalSchools || 0}</strong>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>Total Users:</span>
									<strong>{reportsData.summary?.totalUsers || 0}</strong>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>Total Tours:</span>
									<strong>{reportsData.summary?.totalTours || 0}</strong>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>Total Bookings:</span>
									<strong>{reportsData.summary?.totalBookings || 0}</strong>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>Average Rating:</span>
									<strong>{reportsData.ratingStats.avgOverall?.toFixed(1) || 'N/A'}</strong>
								</div>
							</div>
						</div>

						{/* Recent Activity */}
						<div style={cardStyle}>
							<h3>📈 Recent Activity (30 days)</h3>
							<div style={{ display: 'grid', gap: '0.5rem' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>New Schools:</span>
									<span style={{ fontWeight: 'bold', color: '#007bff' }}>
										{reportsData.recentActivity?.newSchools || 0}
									</span>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>New Users:</span>
									<span style={{ fontWeight: 'bold', color: '#28a745' }}>
										{reportsData.recentActivity?.newUsers || 0}
									</span>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>New Tours:</span>
									<span style={{ fontWeight: 'bold', color: '#17a2b8' }}>
										{reportsData.recentActivity?.newTours || 0}
									</span>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>New Bookings:</span>
									<span style={{ fontWeight: 'bold', color: '#dc3545' }}>
										{reportsData.recentActivity?.newBookings || 0}
									</span>
								</div>
							</div>
						</div>

						{/* Top Performing Regions */}
						<div style={cardStyle}>
							<h3>🌍 Geographic Distribution</h3>
							{reportsData.geographicDistribution?.length > 0 ? (
								<div>
									{reportsData.geographicDistribution.slice(0, 5).map((region, index) => (
										<div key={index} style={{ 
											display: 'flex', 
											justifyContent: 'space-between', 
											padding: '0.5rem 0',
											borderBottom: index < 4 ? '1px solid #eee' : 'none'
										}}>
											<span>{region._id || 'Unknown City'}</span>
											<span style={{ fontWeight: 'bold' }}>{region.count} schools</span>
										</div>
									))}
								</div>
							) : (
								<p style={{ color: '#666' }}>No geographic data available</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Schools Analysis */}
			{selectedReport === 'schools' && (
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
						<h2>🏫 Schools Analysis</h2>
						<button
							onClick={() => downloadReport('schools')}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#17a2b8',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							📥 Download CSV
						</button>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
						{/* Schools by Type */}
						<div style={cardStyle}>
							<h3>Schools by Type</h3>
							{reportsData.schoolsByType?.length > 0 ? (
								<div>
									{reportsData.schoolsByType.map((type, index) => {
										const total = reportsData.schoolsByType.reduce((sum, s) => sum + s.count, 0);
										const percentage = total > 0 ? ((type.count / total) * 100).toFixed(1) : 0;
										return (
											<div key={index} style={{ 
												marginBottom: '1rem',
												padding: '0.75rem',
												backgroundColor: '#f8f9fa',
												borderRadius: '4px'
											}}>
												<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
													<span style={{ fontWeight: '500' }}>{type._id || 'Unknown'}</span>
													<span style={{ fontWeight: 'bold' }}>{type.count} ({percentage}%)</span>
												</div>
												<div style={{ 
													width: '100%', 
													height: '8px', 
													backgroundColor: '#e9ecef', 
													borderRadius: '4px' 
												}}>
													<div style={{ 
														width: `${percentage}%`, 
														height: '100%', 
														backgroundColor: '#007bff', 
														borderRadius: '4px' 
													}}></div>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<p style={{ color: '#666' }}>No school type data available</p>
							)}
						</div>

						{/* Schools by Status */}
						<div style={cardStyle}>
							<h3>Verification Status</h3>
							{reportsData.schoolsByStatus?.length > 0 ? (
								<div>
									{reportsData.schoolsByStatus.map((status, index) => (
										<div key={index} style={{ 
											display: 'flex', 
											justifyContent: 'space-between',
											padding: '1rem',
											marginBottom: '0.5rem',
											backgroundColor: status._id === 'Verified' ? '#d4edda' : '#f8d7da',
											borderRadius: '4px'
										}}>
											<span style={{ fontWeight: '500' }}>{status._id}</span>
											<span style={{ fontWeight: 'bold' }}>{status.count}</span>
										</div>
									))}
								</div>
							) : (
								<p style={{ color: '#666' }}>No status data available</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Users Analysis */}
			{selectedReport === 'users' && (
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
						<h2>👥 Users Analysis</h2>
						<button
							onClick={() => downloadReport('users')}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#17a2b8',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							📥 Download CSV
						</button>
					</div>

					<div style={cardStyle}>
						<h3>Users by Role</h3>
						{reportsData.usersByRole?.length > 0 ? (
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
								{reportsData.usersByRole.map((role, index) => {
									const total = reportsData.usersByRole.reduce((sum, r) => sum + r.count, 0);
									const percentage = total > 0 ? ((role.count / total) * 100).toFixed(1) : 0;
									const roleColors = {
										parent: '#28a745',
										school_admin: '#007bff',
										system_admin: '#dc3545'
									};
									return (
										<div key={index} style={{ 
											padding: '1.5rem',
											backgroundColor: roleColors[role._id] || '#6c757d',
											color: 'white',
											borderRadius: '8px',
											textAlign: 'center'
										}}>
											<h4 style={{ margin: '0 0 0.5rem 0' }}>
												{role._id?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
											</h4>
											<div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{role.count}</div>
											<div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{percentage}% of total</div>
										</div>
									);
								})}
							</div>
						) : (
							<p style={{ color: '#666' }}>No user role data available</p>
						)}
					</div>
				</div>
			)}

			{/* Bookings Trends */}
			{selectedReport === 'bookings' && (
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
						<h2>📅 Bookings Trends</h2>
						<button
							onClick={() => downloadReport('bookings')}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#17a2b8',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							📥 Download CSV
						</button>
					</div>

					<div style={cardStyle}>
						<h3>Monthly Booking Trends</h3>
						{reportsData.bookingsByMonth?.length > 0 ? (
							<div>
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
									{reportsData.bookingsByMonth.slice(0, 12).map((month, index) => (
										<div key={index} style={{ 
											padding: '1rem',
											backgroundColor: '#f8f9fa',
											borderRadius: '4px',
											textAlign: 'center'
										}}>
											<div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
												{formatMonth(month._id.month, month._id.year)}
											</div>
											<div style={{ fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>
												{month.count}
											</div>
											<div style={{ fontSize: '0.8rem', color: '#666' }}>bookings</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<p style={{ color: '#666' }}>No booking data available</p>
						)}
					</div>

					{/* Booking Status Distribution */}
					{reportsData.bookingStatusDistribution?.length > 0 && (
						<div style={cardStyle}>
							<h3>Booking Status Distribution</h3>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
								{reportsData.bookingStatusDistribution.map((status, index) => {
									const statusColors = {
										pending: '#ffc107',
										confirmed: '#28a745',
										cancelled: '#dc3545',
										completed: '#17a2b8',
										'no-show': '#6c757d'
									};
									return (
										<div key={index} style={{ 
											padding: '1rem',
											backgroundColor: statusColors[status._id] || '#6c757d',
											color: 'white',
											borderRadius: '4px',
											textAlign: 'center'
										}}>
											<div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
												{status._id?.toUpperCase() || 'UNKNOWN'}
											</div>
											<div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
												{status.count}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Ratings Analysis */}
			{selectedReport === 'ratings' && (
				<div>
					<h2>⭐ Ratings Analysis</h2>
					
					<div style={cardStyle}>
						<h3>Average Ratings Across Platform</h3>
						{reportsData.ratingStats && Object.keys(reportsData.ratingStats).length > 0 ? (
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
								{[
									{ key: 'avgOverall', label: 'Overall Rating', icon: '⭐' },
									{ key: 'avgAcademic', label: 'Academic', icon: '📚' },
									{ key: 'avgFacilities', label: 'Facilities', icon: '🏢' },
									{ key: 'avgTeachers', label: 'Teachers', icon: '👨‍🏫' },
									{ key: 'avgEnvironment', label: 'Environment', icon: '🌱' }
								].map((rating, index) => (
									<div key={index} style={{ 
										padding: '1.5rem',
										backgroundColor: '#f8f9fa',
										borderRadius: '8px',
										textAlign: 'center'
									}}>
										<div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{rating.icon}</div>
										<div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{rating.label}</div>
										<div style={{ fontSize: '1.5rem', color: '#ffc107', fontWeight: 'bold' }}>
											{reportsData.ratingStats[rating.key]?.toFixed(1) || 'N/A'}
										</div>
										<div style={{ fontSize: '0.8rem', color: '#666' }}>out of 5.0</div>
									</div>
								))}
							</div>
						) : (
							<p style={{ color: '#666' }}>No rating data available</p>
						)}
						
						{reportsData.ratingStats.totalRated && (
							<div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
								<strong>Total Rated Schools:</strong> {reportsData.ratingStats.totalRated}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Financial Analysis */}
			{selectedReport === 'financial' && (
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
						<h2>💰 Financial Analysis</h2>
						<button
							onClick={() => downloadReport('fees')}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#17a2b8',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							📥 Download CSV
						</button>
					</div>

					<div style={cardStyle}>
						<h3>Fee Structure Analysis</h3>
						{reportsData.feeStats?.length > 0 ? (
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
								{reportsData.feeStats.map((fee, index) => (
									<div key={index} style={{ 
										padding: '1.5rem',
										backgroundColor: '#f8f9fa',
										borderRadius: '8px'
									}}>
										<h4 style={{ margin: '0 0 1rem 0', color: '#007bff' }}>
											{fee._id} Currency
										</h4>
										<div style={{ display: 'grid', gap: '0.5rem' }}>
											<div style={{ display: 'flex', justifyContent: 'space-between' }}>
												<span>Schools:</span>
												<strong>{fee.schoolCount}</strong>
											</div>
											<div style={{ display: 'flex', justifyContent: 'space-between' }}>
												<span>Avg Min Fee:</span>
												<strong>{formatCurrency(fee.avgMinFee, fee._id)}</strong>
											</div>
											<div style={{ display: 'flex', justifyContent: 'space-between' }}>
												<span>Avg Max Fee:</span>
												<strong>{formatCurrency(fee.avgMaxFee, fee._id)}</strong>
											</div>
											<div style={{ display: 'flex', justifyContent: 'space-between' }}>
												<span>Lowest Fee:</span>
												<strong>{formatCurrency(fee.minFee, fee._id)}</strong>
											</div>
											<div style={{ display: 'flex', justifyContent: 'space-between' }}>
												<span>Highest Fee:</span>
												<strong>{formatCurrency(fee.maxFee, fee._id)}</strong>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<p style={{ color: '#666' }}>No fee structure data available</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default SystemReports;