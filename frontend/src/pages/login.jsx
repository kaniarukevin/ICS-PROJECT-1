import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('http://localhost:5000/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			const data = await response.json();

			if (response.ok) {
				// Store user data and token
				localStorage.setItem('user', JSON.stringify(data.user));
				localStorage.setItem('token', data.token);
				
				// Redirect based on role
				if (data.user.role === 'school_admin') {
					navigate('/school-admin');
				} else if (data.user.role === 'system_admin') {
					navigate('/system-admin');
				} else {
					navigate('/dashboard');
				}
			} else {
				setError(data.message || 'Login failed');
			}
		} catch (error) {
			setError('Network error. Please try again.');
			console.error('Login error:', error);
		} finally {
			setLoading(false);
		}
	};

	const formStyle = {
		maxWidth: '400px',
		margin: '2rem auto',
		padding: '2rem',
		border: '1px solid #ddd',
		borderRadius: '8px',
		backgroundColor: '#f8f9fa'
	};

	const inputStyle = {
		width: '100%',
		padding: '0.75rem',
		margin: '0.5rem 0',
		border: '1px solid #ccc',
		borderRadius: '4px',
		fontSize: '1rem'
	};

	const buttonStyle = {
		width: '100%',
		padding: '0.75rem',
		backgroundColor: '#007bff',
		color: 'white',
		border: 'none',
		borderRadius: '4px',
		fontSize: '1rem',
		cursor: loading ? 'not-allowed' : 'pointer',
		opacity: loading ? 0.6 : 1
	};

	return (
		<div style={{ padding: '2rem' }}>
			<h2 style={{ textAlign: 'center' }}>Login to School Tour Booking</h2>
			
			<form onSubmit={handleSubmit} style={formStyle}>
				<div>
					<label>Email:</label>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						style={inputStyle}
						placeholder="Enter your email"
					/>
				</div>

				<div>
					<label>Password:</label>
					<input
						type="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						required
						style={inputStyle}
						placeholder="Enter your password"
					/>
				</div>

				{error && (
					<div style={{ color: 'red', margin: '1rem 0', textAlign: 'center' }}>
						{error}
					</div>
				)}

				<button type="submit" disabled={loading} style={buttonStyle}>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>

			{/* Test Users Info */}
			<div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
				<h4>Test Users (Create these in your database):</h4>
				<p><strong>School Admin:</strong> schooladmin@test.com</p>
				<p><strong>System Admin:</strong> systemadmin@test.com</p>
				<p><strong>Parent:</strong> parent@test.com</p>
				<p><em>Use any password you set when creating these users</em></p>
			</div>
		</div>
	);
};

export default Login;