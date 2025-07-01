// frontend/src/components/auth/ParentRegistration.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ParentRegistration = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	
	const [formData, setFormData] = useState({
		// Personal Information
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',
		
		// Address
		address: {
			street: '',
			city: '',
			state: '',
			zipCode: '',
			country: 'Kenya'
		},
		
		// Children Information
		children: [
			{
				name: '',
				age: '',
				grade: '',
				school: ''
			}
		],
		
		// Preferences
		interestedSchoolTypes: [],
		maxDistance: '',
		
		// Agreement
		agreeToTerms: false,
		subscribeNewsletter: true
	});

	const kenyanStates = [
		'Nairobi County',
		'Mombasa County',
		'Kisumu County',
		'Nakuru County',
		'Eldoret',
		'Machakos County',
		'Meru County',
		'Nyeri County',
		'Kiambu County',
		'Thika',
		'Other'
	];

	const schoolTypes = [
		'Pre-Primary',
		'Primary',
		'Secondary',
		'College',
		'University',
		'TVET'
	];

	// Handle input changes
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		
		if (name.includes('address.')) {
			const addressField = name.split('.')[1];
			setFormData(prev => ({
				...prev,
				address: {
					...prev.address,
					[addressField]: value
				}
			}));
		} else if (name === 'interestedSchoolTypes') {
			const updatedTypes = checked 
				? [...formData.interestedSchoolTypes, value]
				: formData.interestedSchoolTypes.filter(type => type !== value);
			setFormData(prev => ({
				...prev,
				interestedSchoolTypes: updatedTypes
			}));
		} else {
			setFormData(prev => ({
				...prev,
				[name]: type === 'checkbox' ? checked : value
			}));
		}

		// Clear errors when user starts typing
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}));
		}
	};

	// Handle child information changes
	const handleChildChange = (index, field, value) => {
		const updatedChildren = [...formData.children];
		updatedChildren[index] = {
			...updatedChildren[index],
			[field]: value
		};
		setFormData(prev => ({
			...prev,
			children: updatedChildren
		}));
	};

	// Add another child
	const addChild = () => {
		setFormData(prev => ({
			...prev,
			children: [
				...prev.children,
				{ name: '', age: '', grade: '', school: '' }
			]
		}));
	};

	// Remove child
	const removeChild = (index) => {
		if (formData.children.length > 1) {
			const updatedChildren = formData.children.filter((_, i) => i !== index);
			setFormData(prev => ({
				...prev,
				children: updatedChildren
			}));
		}
	};

	// Form validation
	const validateForm = () => {
		const newErrors = {};
		
		if (!formData.name.trim()) newErrors.name = 'Full name is required';
		if (!formData.email.trim()) newErrors.email = 'Email is required';
		if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
		if (!formData.password) newErrors.password = 'Password is required';
		if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
		if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
		if (!formData.address.city.trim()) newErrors.city = 'City is required';
		if (!formData.address.state.trim()) newErrors.state = 'State/County is required';
		
		// Validate at least one child
		const validChildren = formData.children.filter(child => child.name.trim() && child.age);
		if (validChildren.length === 0) {
			newErrors.children = 'At least one child\'s information is required';
		}
		
		if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
		
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Submit form
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) return;
		
		setLoading(true);
		
		try {
			// Filter out empty children
			const validChildren = formData.children.filter(child => 
				child.name.trim() && child.age
			);

			const registrationData = {
				name: formData.name.trim(),
				email: formData.email.toLowerCase().trim(),
				password: formData.password,
				role: 'parent',
				phone: formData.phone.trim(),
				address: {
					street: formData.address.street.trim(),
					city: formData.address.city.trim(),
					state: formData.address.state.trim(),
					zipCode: formData.address.zipCode.trim(),
					country: formData.address.country
				},
				children: validChildren,
				preferences: {
					interestedSchoolTypes: formData.interestedSchoolTypes,
					maxDistance: formData.maxDistance ? parseInt(formData.maxDistance) : null,
					subscribeNewsletter: formData.subscribeNewsletter
				}
			};

			const response = await fetch('http://localhost:5000/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(registrationData)
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Registration failed');
			}

			// Store token and user data
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));

			alert('Parent account created successfully!');
			navigate('/dashboard');

		} catch (error) {
			console.error('Registration error:', error);
			alert('Registration failed: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ 
			minHeight: '100vh',
			backgroundColor: '#f8f9fa',
			padding: '2rem 0'
		}}>
			<div style={{
				maxWidth: '800px',
				margin: '0 auto',
				padding: '2rem',
				backgroundColor: 'white',
				borderRadius: '12px',
				boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
			}}>
				{/* Header */}
				<div style={{ 
					textAlign: 'center',
					marginBottom: '2rem'
				}}>
					<h1 style={{ 
						color: '#28a745',
						marginBottom: '0.5rem',
						fontSize: '2rem'
					}}>
						👨‍👩‍👧‍👦 Parent Registration
					</h1>
					<p style={{ 
						color: '#666',
						margin: 0,
						fontSize: '1.1rem'
					}}>
						Create your account to start booking school tours
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit}>
					{/* Personal Information */}
					<div style={{ marginBottom: '2rem' }}>
						<h3 style={{ 
							color: '#333',
							marginBottom: '1rem',
							borderBottom: '2px solid #28a745',
							paddingBottom: '0.5rem'
						}}>
							📋 Personal Information
						</h3>
						
						<div style={{ 
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
							gap: '1rem'
						}}>
							<div>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									Full Name *
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									placeholder="Enter your full name"
									required
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
								{errors.name && <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.name}</span>}
							</div>

							<div>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									Email Address *
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="Enter your email"
									required
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
								{errors.email && <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.email}</span>}
							</div>

							<div>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									Phone Number
								</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									placeholder="+254 700 000 000"
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
							</div>

							<div>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									Password *
								</label>
								<input
									type="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Create a password"
									required
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
								{errors.password && <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.password}</span>}
							</div>

							<div>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									Confirm Password *
								</label>
								<input
									type="password"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleChange}
									placeholder="Confirm your password"
									required
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
								{errors.confirmPassword && <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.confirmPassword}</span>}
							</div>
						</div>
					</div>

					{/* Address Information */}
					<div style={{ marginBottom: '2rem' }}>
						<h3 style={{ 
							color: '#333',
							marginBottom: '1rem',
							borderBottom: '2px solid #28a745',
							paddingBottom: '0.5rem'
						}}>
							📍 Address Information
						</h3>
						
						<div style={{ 
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
							gap: '1rem'
						}}>
							<div style={{ gridColumn: '1 / -1' }}>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									Street Address
								</label>
								<input
									type="text"
									name="address.street"
									value={formData.address.street}
									onChange={handleChange}
									placeholder="Street address"
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
							</div>

							<div>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									City *
								</label>
								<input
									type="text"
									name="address.city"
									value={formData.address.city}
									onChange={handleChange}
									placeholder="City"
									required
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
								{errors.city && <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.city}</span>}
							</div>

							<div>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									State/County *
								</label>
								<select
									name="address.state"
									value={formData.address.state}
									onChange={handleChange}
									required
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								>
									<option value="">Select state/county</option>
									{kenyanStates.map(state => (
										<option key={state} value={state}>{state}</option>
									))}
								</select>
								{errors.state && <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.state}</span>}
							</div>

							<div>
								<label style={{ 
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '500',
									color: '#333'
								}}>
									Postal Code
								</label>
								<input
									type="text"
									name="address.zipCode"
									value={formData.address.zipCode}
									onChange={handleChange}
									placeholder="00100"
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
							</div>
						</div>
					</div>

					{/* Children Information */}
					<div style={{ marginBottom: '2rem' }}>
						<div style={{ 
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '1rem'
						}}>
							<h3 style={{ 
								color: '#333',
								margin: 0,
								borderBottom: '2px solid #28a745',
								paddingBottom: '0.5rem'
							}}>
								👶 Children Information
							</h3>
							<button
								type="button"
								onClick={addChild}
								style={{
									padding: '0.5rem 1rem',
									backgroundColor: '#28a745',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '0.9rem'
								}}
							>
								+ Add Child
							</button>
						</div>
						
						{errors.children && (
							<div style={{ color: '#dc3545', fontSize: '0.9rem', marginBottom: '1rem' }}>
								{errors.children}
							</div>
						)}

						{formData.children.map((child, index) => (
							<div key={index} style={{ 
								backgroundColor: '#f8f9fa',
								padding: '1rem',
								borderRadius: '4px',
								marginBottom: '1rem',
								border: '1px solid #e0e0e0'
							}}>
								<div style={{ 
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: '1rem'
								}}>
									<h4 style={{ 
										margin: 0,
										color: '#333',
										fontSize: '1.1rem'
									}}>
										Child {index + 1}
									</h4>
									{formData.children.length > 1 && (
										<button
											type="button"
											onClick={() => removeChild(index)}
											style={{
												backgroundColor: '#dc3545',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												padding: '0.25rem 0.5rem',
												cursor: 'pointer',
												fontSize: '0.8rem'
											}}
										>
											Remove
										</button>
									)}
								</div>

								<div style={{ 
									display: 'grid',
									gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
									gap: '1rem'
								}}>
									<input
										type="text"
										placeholder="Child's name *"
										value={child.name}
										onChange={(e) => handleChildChange(index, 'name', e.target.value)}
										style={{
											padding: '0.5rem',
											border: '1px solid #ddd',
											borderRadius: '4px',
											fontSize: '0.9rem'
										}}
									/>
									<input
										type="number"
										placeholder="Age *"
										value={child.age}
										onChange={(e) => handleChildChange(index, 'age', e.target.value)}
										min="3"
										max="25"
										style={{
											padding: '0.5rem',
											border: '1px solid #ddd',
											borderRadius: '4px',
											fontSize: '0.9rem'
										}}
									/>
									<input
										type="text"
										placeholder="Current grade"
										value={child.grade}
										onChange={(e) => handleChildChange(index, 'grade', e.target.value)}
										style={{
											padding: '0.5rem',
											border: '1px solid #ddd',
											borderRadius: '4px',
											fontSize: '0.9rem'
										}}
									/>
									<input
										type="text"
										placeholder="Current school"
										value={child.school}
										onChange={(e) => handleChildChange(index, 'school', e.target.value)}
										style={{
											padding: '0.5rem',
											border: '1px solid #ddd',
											borderRadius: '4px',
											fontSize: '0.9rem'
										}}
									/>
								</div>
							</div>
						))}
					</div>

					{/* Preferences */}
					<div style={{ marginBottom: '2rem' }}>
						<h3 style={{ 
							color: '#333',
							marginBottom: '1rem',
							borderBottom: '2px solid #28a745',
							paddingBottom: '0.5rem'
						}}>
							⚙️ Preferences
						</h3>
						
						<div style={{ marginBottom: '1rem' }}>
							<label style={{ 
								display: 'block',
								marginBottom: '0.5rem',
								fontWeight: '500',
								color: '#333'
							}}>
								Interested School Types:
							</label>
							<div style={{ 
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
								gap: '0.5rem'
							}}>
								{schoolTypes.map(type => (
									<label key={type} style={{ 
										display: 'flex',
										alignItems: 'center',
										gap: '0.5rem',
										cursor: 'pointer'
									}}>
										<input
											type="checkbox"
											name="interestedSchoolTypes"
											value={type}
											checked={formData.interestedSchoolTypes.includes(type)}
											onChange={handleChange}
										/>
										{type}
									</label>
								))}
							</div>
						</div>

						<div>
							<label style={{ 
								display: 'block',
								marginBottom: '0.5rem',
								fontWeight: '500',
								color: '#333'
							}}>
								Maximum Distance (km):
							</label>
							<input
								type="number"
								name="maxDistance"
								value={formData.maxDistance}
								onChange={handleChange}
								placeholder="e.g., 20"
								min="1"
								max="200"
								style={{
									width: '200px',
									padding: '0.5rem',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '0.9rem'
								}}
							/>
						</div>
					</div>

					{/* Terms and Newsletter */}
					<div style={{ marginBottom: '2rem' }}>
						<div style={{ 
							padding: '1rem',
							backgroundColor: '#f8f9fa',
							borderRadius: '4px',
							border: '1px solid #e0e0e0'
						}}>
							<label style={{ 
								display: 'flex',
								alignItems: 'flex-start',
								gap: '0.5rem',
								cursor: 'pointer',
								marginBottom: '1rem'
							}}>
								<input
									type="checkbox"
									name="agreeToTerms"
									checked={formData.agreeToTerms}
									onChange={handleChange}
									required
									style={{ marginTop: '0.2rem' }}
								/>
								<span>
									I agree to the Terms and Conditions and Privacy Policy *
								</span>
							</label>
							{errors.agreeToTerms && (
								<span style={{ color: '#dc3545', fontSize: '0.9rem' }}>
									{errors.agreeToTerms}
								</span>
							)}

							<label style={{ 
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem',
								cursor: 'pointer'
							}}>
								<input
									type="checkbox"
									name="subscribeNewsletter"
									checked={formData.subscribeNewsletter}
									onChange={handleChange}
								/>
								Subscribe to newsletter for school updates and tips
							</label>
						</div>
					</div>

					{/* Submit Button */}
					<div style={{ textAlign: 'center' }}>
						<button
							type="submit"
							disabled={loading}
							style={{
								padding: '1rem 2rem',
								backgroundColor: loading ? '#ccc' : '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '8px',
								fontSize: '1.1rem',
								fontWeight: 'bold',
								cursor: loading ? 'not-allowed' : 'pointer',
								marginBottom: '1rem'
							}}
						>
							{loading ? '⏳ Creating Account...' : '✅ Create Parent Account'}
						</button>

						<div>
							<span style={{ color: '#666' }}>
								Already have an account?{' '}
								<button
									type="button"
									onClick={() => navigate('/login')}
									style={{
										background: 'none',
										border: 'none',
										color: '#007bff',
										textDecoration: 'underline',
										cursor: 'pointer'
									}}
								>
									Sign in here
								</button>
							</span>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ParentRegistration;