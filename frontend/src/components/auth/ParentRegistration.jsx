import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ParentRegistration = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '+254',
		agreeToTerms: false,
		subscribeNewsletter: true
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		
		if (name === 'phone') {
			const digitsOnly = value.replace(/\D/g, '');
			setFormData(prev => ({
				...prev,
				phone: '+254' + digitsOnly.slice(3, 12) // prevent multiple +254s
			}));
			return;
		}

		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));

		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.name.trim()) newErrors.name = 'Full name is required';
		if (!formData.email.trim()) newErrors.email = 'Email is required';
		if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
		if (!formData.password) newErrors.password = 'Password is required';
		if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
		if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
		if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);
		try {
			const response = await fetch('http://localhost:5000/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name.trim(),
					email: formData.email.toLowerCase().trim(),
					password: formData.password,
					role: 'parent',
					phone: formData.phone.trim(),
					preferences: { subscribeNewsletter: formData.subscribeNewsletter }
				})
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Registration failed');

			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			alert('Parent account created successfully!');
			navigate('/home');
		} catch (error) {
			alert('Registration failed: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	const inputStyle = {
		width: '100%',
		padding: '0.75rem 1rem',
		border: '1px solid #ccc',
		borderRadius: '6px',
		fontSize: '1rem',
		boxSizing: 'border-box'
	};

	const labelStyle = {
		fontWeight: '500',
		marginBottom: '0.5rem',
		display: 'block'
	};

	const errorStyle = {
		color: 'red',
		fontSize: '0.9rem',
		marginTop: '0.3rem'
	};

	const passwordContainerStyle = {
		position: 'relative'
	};

	const toggleButtonStyle = {
		position: 'absolute',
		top: '50%',
		right: '10px',
		transform: 'translateY(-50%)',
		background: 'none',
		border: 'none',
		cursor: 'pointer',
		fontSize: '1.1rem'
	};

	return (
		<div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
			<h2 style={{ textAlign: 'center', color: '#28a745', marginBottom: '1rem' }}>
				👨‍👩‍👧‍👦 Parent Registration
			</h2>
			<p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
				Sign up to start exploring schools and booking tours.
			</p>
			<form onSubmit={handleSubmit}>
				{/* Name */}
				<div style={{ marginBottom: '1rem' }}>
					<label style={labelStyle}>Full Name *</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						placeholder="i.e Firstname Lastname"
						style={inputStyle}
						required
					/>
					{errors.name && <div style={errorStyle}>{errors.name}</div>}
				</div>

				{/* Email */}
				<div style={{ marginBottom: '1rem' }}>
					<label style={labelStyle}>Email Address *</label>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="e.g. kevin@example.com"
						style={inputStyle}
						required
					/>
					{errors.email && <div style={errorStyle}>{errors.email}</div>}
				</div>

				{/* Phone Number */}
				<div style={{ marginBottom: '1rem' }}>
					<label style={labelStyle}>Phone Number *</label>
					<input
						type="tel"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						placeholder="+2547XXXXXXXX"
						style={inputStyle}
						required
					/>
				</div>

				{/* Password */}
				<div style={{ marginBottom: '1rem' }}>
					<label style={labelStyle}>Password *</label>
					<div style={passwordContainerStyle}>
						<input
							type={showPassword ? 'text' : 'password'}
							name="password"
							value={formData.password}
							onChange={handleChange}
							style={{ ...inputStyle, paddingRight: '2.5rem' }}
							placeholder="Create a password"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(prev => !prev)}
							style={toggleButtonStyle}
							tabIndex={-1}
						>
							{showPassword ? '🙈' : '👁️'}
						</button>
					</div>
					{errors.password && <div style={errorStyle}>{errors.password}</div>}
				</div>

				{/* Confirm Password */}
				<div style={{ marginBottom: '1rem' }}>
					<label style={labelStyle}>Confirm Password *</label>
					<div style={passwordContainerStyle}>
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							style={{ ...inputStyle, paddingRight: '2.5rem' }}
							placeholder="Re-enter password"
							required
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(prev => !prev)}
							style={toggleButtonStyle}
							tabIndex={-1}
						>
							{showConfirmPassword ? '🙈' : '👁️'}
						</button>
					</div>
					{errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword}</div>}
				</div>

				{/* Agreement */}
				<div style={{ marginBottom: '1rem' }}>
					<label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
						<input
							type="checkbox"
							name="agreeToTerms"
							checked={formData.agreeToTerms}
							onChange={handleChange}
							required
						/>
						<span>I agree to the Terms and Privacy Policy *</span>
					</label>
					{errors.agreeToTerms && <div style={errorStyle}>{errors.agreeToTerms}</div>}
				</div>

				{/* Newsletter */}
				<div style={{ marginBottom: '1.5rem' }}>
					<label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<input
							type="checkbox"
							name="subscribeNewsletter"
							checked={formData.subscribeNewsletter}
							onChange={handleChange}
						/>
						Subscribe to school updates & tips
					</label>
				</div>

				{/* Submit */}
				<div style={{ textAlign: 'center' }}>
					<button
						type="submit"
						disabled={loading}
						style={{
							padding: '0.8rem 2rem',
							backgroundColor: '#28a745',
							color: 'white',
							fontSize: '1rem',
							fontWeight: '600',
							border: 'none',
							borderRadius: '6px',
							cursor: loading ? 'not-allowed' : 'pointer'
						}}
					>
						{loading ? '⏳ Registering...' : '✅ Register'}
					</button>
					<p style={{ marginTop: '1rem' }}>
						Already have an account?{' '}
						<button
							type="button"
							onClick={() => navigate('/login')}
							style={{
								color: '#007bff',
								background: 'none',
								border: 'none',
								textDecoration: 'underline',
								cursor: 'pointer'
							}}
						>
							Log in
						</button>
					</p>
				</div>
			</form>
		</div>
	);
};

export default ParentRegistration;
