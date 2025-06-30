import React, { useState, useEffect } from 'react';

const SystemReports = () => {
	const [reportsData, setReportsData] = useState({
		bookingsByMonth: [],
		schoolsByStatus: [],
		schoolsByType: [],
		usersByRole: [],
		ratingStats: {},
		geographicDistribution: []
	});
	const [loading, setLoading] = useState(true);
	const [selectedReport, setSelectedReport] = useState('overview');

	useEffect(() => {
		fetchReports();
	}, []);

	const fetchReports = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/system-admin/reports', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			setReportsData(data);
		} catch (error) {
			console.error('Error fetching reports:', error);
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
			default:
				return;
		}

		// Download CSV
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', filename);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	const generateSchoolsCSV = () => {
		const headers = 'School Type,Count,Percentage\n';
		const rows = reportsData.schoolsByType.map(item => 
			`${item._id || 'Unknown'},${item.count},${((item.count / reportsData.schoolsByType.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%`
		).join('\n');
		return headers + rows;
	};

	const generateUsersCSV = () => {
		const headers = 'User Role,Count,Percentage\n';
		const total = reportsData.usersByRole.reduce((sum, role) => sum + role.count, 0);
		const rows = reportsData.usersByRole.map(item => 
			`${item._id || 'Unknown'},${item.count},${((item.count / total) * 100).toFixed(1)}%`
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

	const formatMonth = (month, year) => {
		const date = new Date(year, month - 1);
		return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
		return <div style={{ padding: '2rem' }}>Loading reports...</div>;
	}

	return (
		<div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
				<h1>System Reports & Analytics</h1>
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
				</div>
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
									<strong>{reportsData.schoolsByType.reduce((sum, s) => sum + s.count, 0)}</strong>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>Total Users:</span>
									<strong>{reportsData.usersByRole.reduce((sum, u) => sum + u.count, 0)}</strong>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>Total Bookings:</span>
									<strong>{reportsData.bookingsByMonth.reduce((sum, b) => sum + b.count, 0)}</strong>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>Average Rating:</span>
									<strong>{reportsData.ratingStats.avgOverall?.toFixed(1) || 'N/A'}</strong>
								</div>
							</div>
						</div>

						{/* Top Performing Regions */}
						<div style={cardStyle}>
							<h3>🌍 Geographic Distribution</h3>
							{reportsData.geographicDistribution.length > 0 ? (
								<div>
									{reportsData.geographicDistribution.slice(0, 5).map((region, index) => (
										<div key={index} style={{ 
											display: 'flex', 
											justifyContent: 'space-between', 
											padding: '0.5rem 0',
											borderBottom: index < 4 ? '1px solid #eee' : 'none'
										}}>
											<span>{region._id}</span>
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
							{reportsData.schoolsByType.length > 0 ? (
								<div>
									{reportsData.schoolsByType.map((type, index) => {
										const total = reportsData.schoolsByType.reduce((sum, s) => sum + s.count, 0);
										const percentage = ((type.count / total) * 100).toFixed(1);
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
							{reportsData.schoolsByStatus.length > 0 ? (
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
						{reportsData.usersByRole.length > 0 ? (
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
								{reportsData.usersByRole.map((role, index) => {
									const total = reportsData.usersByRole.reduce((sum, r) => sum + r.count, 0);
									const percentage = ((role.count / total) * 100).toFixed(1);
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
						{reportsData.bookingsByMonth.length > 0 ? (
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
		</div>
	);
};

export default SystemReports;