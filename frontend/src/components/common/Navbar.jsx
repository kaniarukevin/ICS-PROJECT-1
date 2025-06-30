import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem('user'));
	const token = localStorage.getItem('token');

	const handleLogout = () => {
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		navigate('/login');
	};

	return (
		<nav style={{ 
			padding: '1rem', 
			backgroundColor: '#f8f9fa', 
			borderBottom: '1px solid #dee2e6',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center'
		}}>
			<div>
				<Link to="/dashboard" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
					School Tour Booking
				</Link>
			</div>

			{token && user && (
				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
					{/* Role-specific navigation */}
					{user.role === 'school_admin' && (
						<Link to="/school-admin" style={{ textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', borderRadius: '4px' }}>
							School Admin Portal
						</Link>
					)}
					
					{user.role === 'system_admin' && (
						<Link to="/system-admin" style={{ textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', borderRadius: '4px' }}>
							System Admin Portal
						</Link>
					)}

					<span>Hello, {user.name} ({user.role})</span>
					<button 
						onClick={handleLogout}
						style={{ 
							padding: '0.5rem 1rem', 
							backgroundColor: '#dc3545', 
							color: 'white', 
							border: 'none', 
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Logout
					</button>
				</div>
			)}

			{!token && (
				<Link to="/login" style={{ textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', borderRadius: '4px' }}>
					Login
				</Link>
			)}
		</nav>
	);
};

export default Navbar;