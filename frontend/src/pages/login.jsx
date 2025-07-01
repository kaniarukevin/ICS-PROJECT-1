// frontend/src/pages/Login.jsx (Updated)
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
				} else if (data.user.role === 'parent') {
					navigate('/dashboard');
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

	// Test credentials for quick login
	const handleQuickLogin = (role) => {
		const credentials = {
			school_admin: { email: 'schooladmin@test.com', password: 'password123' },
			system_admin: { email: 'systemadmin@test.com', password: 'password123' },
			parent: { email: 'parent@test.com', password: 'password123' }
		};
		
		setFormData(credentials[role]);
	};

	return (
		<div style={{ 
			minHeight: '100vh',
			backgroundColor: '#f8f9fa',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '2rem'
		}}>
			<div style={{ 
				maxWidth: '500px',
				width: '100%'
			}}>
				{/* Header */}
				<div style={{ 
					textAlign: 'center',
					marginBottom: '2rem'
				}}>
					<h1 style={{ 
						color: '#333',
						marginBottom: '0.5rem',
						fontSize: '2.5rem'
					}}>
						🏫 School Tours
					</h1>
					<p style={{ 
						color: '#666',
						margin: 0,
						fontSize: '1.1rem'
					}}>
						Sign in to your account
					</p>
				</div>

				{/* Login Form */}
				<div style={{
					backgroundColor: 'white',
					padding: '2rem',
					borderRadius: '12px',
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					marginBottom: '2rem'
				}}>
					<form onSubmit={handleSubmit}>
						<div style={{ marginBottom: '1rem' }}>
							<label style={{ 
								display: 'block',
								marginBottom: '0.5rem',
								fontWeight: '500',
								color: '#333'
							}}>
								Email Address:
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								placeholder="Enter your email"
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '1rem'
								}}
							/>
						</div>

						<div style={{ marginBottom: '1.5rem' }}>
							<label style={{ 
								display: 'block',
								marginBottom: '0.5rem',
								fontWeight: '500',
								color: '#333'
							}}>
								Password:
							</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
								placeholder="Enter your password"
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '1rem'
								}}
							/>
						</div>

						{error && (
							<div style={{ 
								color: '#dc3545',
								margin: '1rem 0',
								textAlign: 'center',
								padding: '0.75rem',
								backgroundColor: '#f8d7da',
								borderRadius: '4px',
								border: '1px solid #f5c6cb'
							}}>
								{error}
							</div>
						)}

						<button 
							type="submit" 
							disabled={loading}
							style={{
								width: '100%',
								padding: '0.75rem',
								backgroundColor: loading ? '#ccc' : '#007bff',
								color: 'white',
								border: 'none',
								borderRadius: '8px',
								fontSize: '1.1rem',
								fontWeight: 'bold',
								cursor: loading ? 'not-allowed' : 'pointer',
								marginBottom: '1rem'
							}}
						>
							{loading ? '⏳ Signing In...' : '🔐 Sign In'}
						</button>

						{/* Forgot Password Link */}
						<div style={{ textAlign: 'center' }}>
							<button
								type="button"
								style={{
									background: 'none',
									border: 'none',
									color: '#007bff',
									textDecoration: 'underline',
									cursor: 'pointer',
									fontSize: '0.9rem'
								}}
							>
								Forgot your password?
							</button>
						</div>
					</form>
				</div>

				{/* Registration Options */}
				<div style={{
					backgroundColor: 'white',
					padding: '2rem',
					borderRadius: '12px',
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					marginBottom: '2rem'
				}}>
					<h3 style={{ 
						textAlign: 'center',
						color: '#333',
						marginBottom: '1.5rem'
					}}>
						Don't have an account?
					</h3>
					
					<div style={{ 
						display: 'grid',
						gap: '1rem'
					}}>
						<button
							onClick={() => navigate('/select-role')}
							style={{
								padding: '1rem',
								backgroundColor: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '8px',
								fontSize: '1.1rem',
								fontWeight: 'bold',
								cursor: 'pointer',
								transition: 'background-color 0.3s'
							}}
							onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
							onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
						>
							🚀 Get Started - Choose Your Role
						</button>

						<div style={{ 
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '1rem'
						}}>
							<button
								onClick={() => navigate('/register/parent')}
								style={{
									padding: '0.75rem',
									backgroundColor: 'transparent',
									color: '#28a745',
									border: '2px solid #28a745',
									borderRadius: '6px',
									fontSize: '0.9rem',
									cursor: 'pointer',
									transition: 'all 0.3s'
								}}
								onMouseEnter={(e) => {
									e.target.style.backgroundColor = '#28a745';
									e.target.style.color = 'white';
								}}
								onMouseLeave={(e) => {
									e.target.style.backgroundColor = 'transparent';
									e.target.style.color = '#28a745';
								}}
							>
								👨‍👩‍👧‍👦 Parent
							</button>

							<button
								onClick={() => navigate('/register/school-admin')}
								style={{
									padding: '0.75rem',
									backgroundColor: 'transparent',
									color: '#007bff',
									border: '2px solid #007bff',
									borderRadius: '6px',
									fontSize: '0.9rem',
									cursor: 'pointer',
									transition: 'all 0.3s'
								}}
								onMouseEnter={(e) => {
									e.target.style.backgroundColor = '#007bff';
									e.target.style.color = 'white';
								}}
								onMouseLeave={(e) => {
									e.target.style.backgroundColor = 'transparent';
									e.target.style.color = '#007bff';
								}}
							>
								🏫 School Admin
							</button>
						</div>
					</div>
				</div>

				{/* Quick Login for Testing */}
				<div style={{
					backgroundColor: '#e9ecef',
					padding: '1.5rem',
					borderRadius: '8px',
					border: '1px solid #dee2e6'
				}}>
					<h4 style={{ 
						color: '#495057',
						marginBottom: '1rem',
						textAlign: 'center'
					}}>
						🧪 Quick Login (For Testing)
					</h4>
					
					<div style={{ 
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
						gap: '0.5rem',
						marginBottom: '1rem'
					}}>
						<button
							onClick={() => handleQuickLogin('parent')}
							style={{
								padding: '0.5rem',
								backgroundColor: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								fontSize: '0.8rem',
								cursor: 'pointer'
							}}
						>
							👨‍👩‍👧‍👦 Parent
						</button>
						<button
							onClick={() => handleQuickLogin('school_admin')}
							style={{
								padding: '0.5rem',
								backgroundColor: '#007bff',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								fontSize: '0.8rem',
								cursor: 'pointer'
							}}
						>
							🏫 School Admin
						</button>
						<button
							onClick={() => handleQuickLogin('system_admin')}
							style={{
								padding: '0.5rem',
								backgroundColor: '#dc3545',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								fontSize: '0.8rem',
								cursor: 'pointer'
							}}
						>
							⚙️ System Admin
						</button>
					</div>
					
					<div style={{ 
						fontSize: '0.8rem',
						color: '#6c757d',
						textAlign: 'center'
					}}>
						<p style={{ margin: 0 }}>
							<strong>Test Accounts:</strong><br />
							parent@test.com | schooladmin@test.com | systemadmin@test.com<br />
							<em>Password: password123</em>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;