import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
	const user = JSON.parse(localStorage.getItem('user'));

	const cardStyle = {
		border: '1px solid #ddd',
		borderRadius: '8px',
		padding: '1.5rem',
		margin: '1rem',
		textAlign: 'center',
		backgroundColor: '#f8f9fa'
	};

	const buttonStyle = {
		padding: '0.75rem 1.5rem',
		backgroundColor: '#007bff',
		color: 'white',
		textDecoration: 'none',
		borderRadius: '4px',
		display: 'inline-block',
		marginTop: '1rem'
	};

	return (
		<div style={{ padding: '2rem' }}>
			<h1>Welcome to School Tour Booking System</h1>
			
			{user ? (
				<div>
					<p>Hello, <strong>{user.name}</strong>!</p>
					<p>Role: <strong>{user.role.replace('_', ' ').toUpperCase()}</strong></p>
					
					<div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
						
						{/* School Admin Portal */}
						{user.role === 'school_admin' && (
							<div style={cardStyle}>
								<h3>🏫 School Admin Portal</h3>
								<p>Manage your school's tours, view bookings, and update school information.</p>
								<ul style={{ textAlign: 'left', margin: '1rem 0' }}>
									<li>📊 Dashboard & Analytics</li>
									<li>🎯 Manage Tours</li>
									<li>📅 View Bookings</li>
									<li>🏛️ School Profile</li>
								</ul>
								<Link to="/school-admin" style={buttonStyle}>
									Access School Admin Portal
								</Link>
							</div>
						)}

						{/* System Admin Portal */}
						{user.role === 'system_admin' && (
							<div style={cardStyle}>
								<h3>⚙️ System Admin Portal</h3>
								<p>Oversee the entire system, manage schools and users.</p>
								<ul style={{ textAlign: 'left', margin: '1rem 0' }}>
									<li>📈 System Dashboard</li>
									<li>🏫 Manage Schools</li>
									<li>👥 Manage Users</li>
									<li>📊 System Reports</li>
								</ul>
								<Link to="/system-admin" style={buttonStyle}>
									Access System Admin Portal
								</Link>
							</div>
						)}

						{/* Parent Features (placeholder for Kevin) */}
						{user.role === 'parent' && (
							<div style={cardStyle}>
								<h3>👨‍👩‍👧‍👦 Parent Portal</h3>
								<p>Search schools, book tours, and manage your bookings.</p>
								<ul style={{ textAlign: 'left', margin: '1rem 0' }}>
									<li>🔍 Search Schools</li>
									<li>📅 Book Tours</li>
									<li>📋 Booking History</li>
									<li>✉️ Confirmations</li>
								</ul>
								<div style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
									Parent Portal (Coming Soon)
								</div>
							</div>
						)}

					</div>

					{/* Quick Stats */}
					<div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
						<h3>Quick Info</h3>
						<p><strong>Email:</strong> {user.email}</p>
						{user.schoolId && <p><strong>School ID:</strong> {user.schoolId}</p>}
						<p><strong>Account Status:</strong> Active</p>
					</div>
				</div>
			) : (
				<div>
					<p>You are not logged in. Please log in to access the system.</p>
					<Link to="/login" style={buttonStyle}>
						Go to Login
					</Link>
				</div>
			)}
		</div>
	);
};

export default Dashboard;