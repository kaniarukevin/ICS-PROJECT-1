// frontend/src/pages/SelectRole.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectRole = () => {
	const navigate = useNavigate();

	const roles = [
		{
			id: 'parent',
			title: '👨‍👩‍👧‍👦 Parent',
			description: 'Book school tours for your children and explore educational opportunities',
			features: [
				'Browse and search schools',
				'Book school tours',
				'Manage tour bookings',
				'View school details and ratings',
				'Save favorite schools'
			],
			buttonText: 'Register as Parent',
			route: '/register/parent',
			color: '#28a745',
			bgColor: '#e8f5e8'
		},
		{
			id: 'school_admin',
			title: '🏫 School Administrator',
			description: 'Manage your school\'s tours, bookings, and profile information',
			features: [
				'Create and manage school tours',
				'Handle tour bookings',
				'Update school information',
				'View booking analytics',
				'Manage school profile'
			],
			buttonText: 'Register School',
			route: '/register/school-admin',
			color: '#007bff',
			bgColor: '#e3f2fd'
		},
		{
			id: 'system_admin',
			title: '⚙️ System Administrator',
			description: 'Oversee the entire platform, manage users and schools',
			features: [
				'Manage all schools and users',
				'Approve school registrations',
				'View system analytics',
				'Configure platform settings',
				'Monitor platform activity'
			],
			buttonText: 'Contact Support',
			route: '/contact-admin',
			color: '#dc3545',
			bgColor: '#ffe6e6',
			restricted: true
		}
	];

	const handleRoleSelect = (role) => {
		if (role.id === 'system_admin') {
			alert('System Administrator accounts are created by invitation only. Please contact our support team.');
			return;
		}
		navigate(role.route);
	};

	return (
		<div style={{ 
			minHeight: '100vh',
			backgroundColor: '#f8f9fa',
			padding: '2rem 0'
		}}>
			<div style={{ 
				maxWidth: '1200px',
				margin: '0 auto',
				padding: '0 1rem'
			}}>
				{/* Header */}
				<div style={{ 
					textAlign: 'center',
					marginBottom: '3rem'
				}}>
					<h1 style={{ 
						color: '#333',
						marginBottom: '1rem',
						fontSize: '2.5rem'
					}}>
						Join School Tour Booking Platform
					</h1>
					<p style={{ 
						color: '#666',
						fontSize: '1.2rem',
						maxWidth: '600px',
						margin: '0 auto'
					}}>
						Choose your role to get started with the best school touring experience
					</p>
				</div>

				{/* Role Cards */}
				<div style={{ 
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
					gap: '2rem',
					marginBottom: '3rem'
				}}>
					{roles.map(role => (
						<div
							key={role.id}
							style={{
								backgroundColor: 'white',
								borderRadius: '12px',
								padding: '2rem',
								boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
								border: `3px solid ${role.color}20`,
								transition: 'transform 0.3s, box-shadow 0.3s',
								cursor: 'pointer',
								position: 'relative',
								overflow: 'hidden'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
							}}
						>
							{/* Role Header */}
							<div style={{ 
								marginBottom: '1.5rem',
								textAlign: 'center'
							}}>
								<h2 style={{ 
									color: role.color,
									marginBottom: '0.5rem',
									fontSize: '1.8rem'
								}}>
									{role.title}
								</h2>
								<p style={{ 
									color: '#666',
									lineHeight: '1.5',
									fontSize: '1rem'
								}}>
									{role.description}
								</p>
							</div>

							{/* Features List */}
							<div style={{ marginBottom: '2rem' }}>
								<h4 style={{ 
									color: '#333',
									marginBottom: '1rem',
									fontSize: '1.1rem'
								}}>
									What you can do:
								</h4>
								<ul style={{ 
									listStyle: 'none',
									padding: 0,
									margin: 0
								}}>
									{role.features.map((feature, index) => (
										<li key={index} style={{ 
											display: 'flex',
											alignItems: 'center',
											marginBottom: '0.5rem',
											color: '#555',
											fontSize: '0.95rem'
										}}>
											<span style={{ 
												color: role.color,
												marginRight: '0.5rem',
												fontSize: '1.2rem'
											}}>
												✓
											</span>
											{feature}
										</li>
									))}
								</ul>
							</div>

							{/* Action Button */}
							<button
								onClick={() => handleRoleSelect(role)}
								style={{
									width: '100%',
									padding: '1rem',
									backgroundColor: role.color,
									color: 'white',
									border: 'none',
									borderRadius: '8px',
									fontSize: '1.1rem',
									fontWeight: 'bold',
									cursor: 'pointer',
									transition: 'background-color 0.3s',
									opacity: role.restricted ? 0.7 : 1
								}}
								onMouseEnter={(e) => {
									if (!role.restricted) {
										e.target.style.backgroundColor = role.color + 'dd';
									}
								}}
								onMouseLeave={(e) => {
									e.target.style.backgroundColor = role.color;
								}}
							>
								{role.buttonText}
								{role.restricted && ' (Restricted)'}
							</button>

							{/* Background Decoration */}
							<div style={{
								position: 'absolute',
								top: '-50px',
								right: '-50px',
								width: '100px',
								height: '100px',
								backgroundColor: role.bgColor,
								borderRadius: '50%',
								opacity: 0.3,
								zIndex: 0
							}} />
						</div>
					))}
				</div>

				{/* Already Have Account */}
				<div style={{ 
					textAlign: 'center',
					padding: '2rem',
					backgroundColor: 'white',
					borderRadius: '8px',
					boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
				}}>
					<h3 style={{ 
						color: '#333',
						marginBottom: '1rem'
					}}>
						Already have an account?
					</h3>
					<button
						onClick={() => navigate('/login')}
						style={{
							padding: '1rem 2rem',
							backgroundColor: 'transparent',
							color: '#007bff',
							border: '2px solid #007bff',
							borderRadius: '8px',
							fontSize: '1.1rem',
							fontWeight: 'bold',
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
						Sign In
					</button>
				</div>

				{/* Footer Info */}
				<div style={{ 
					textAlign: 'center',
					marginTop: '2rem',
					color: '#888',
					fontSize: '0.9rem'
				}}>
					<p>
						Need help? Contact our support team at{' '}
						<a href="mailto:support@schooltours.com" style={{ color: '#007bff' }}>
							support@schooltours.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default SelectRole;