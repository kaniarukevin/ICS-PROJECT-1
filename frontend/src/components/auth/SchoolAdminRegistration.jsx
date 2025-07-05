// frontend/src/components/auth/SchoolAdminRegistration.jsx (Updated with School Type Checklist)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SchoolAdminRegistration = () => {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [validationStatus, setValidationStatus] = useState({});
	
	const [formData, setFormData] = useState({
		// Personal Information
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',
		
		// School Information
		schoolName: '',
		schoolType: [], // CHANGED: Now an array instead of string
		description: '',
		
		// Location
		address: '',
		city: '',
		state: '',
		zipCode: '',
		country: 'Kenya',
		
		// Contact Info
		schoolPhone: '',
		schoolEmail: '',
		website: '',
		
		// Academic Info
		curriculum: [],
		grades: {
			from: '',
			to: ''
		},
		
		// Fee Structure
		fees: {
			currency: 'KES',
			tuition: {
				minAmount: '',
				maxAmount: '',
				period: 'Termly'
			},
			registration: ''
		},
		
		// Agreement
		agreeToTerms: false
	});

	const schoolTypes = [
		{ 
			value: 'Primary', 
			label: 'Primary School', 
			description: 'Early childhood and primary education (K-6)',
			icon: '🏫'
		},
		{ 
			value: 'Secondary', 
			label: 'Secondary School', 
			description: 'Middle and high school education (7-12)',
			icon: '🎓'
		},
		{ 
			value: 'College', 
			label: 'College', 
			description: 'Higher education and undergraduate programs',
			icon: '🏛️'
		},
		{ 
			value: 'University', 
			label: 'University', 
			description: 'Advanced higher education and research',
			icon: '🎓'
		},
		{ 
			value: 'TVET', 
			label: 'TVET Institution', 
			description: 'Technical and Vocational Education and Training',
			icon: '🔧'
		}
	];

	const curriculumOptions = [
		'KCPE',
		'KCSE', 
		'Cambridge IGCSE',
		'IB (International Baccalaureate)',
		'American Curriculum',
		'British Curriculum',
		'Montessori',
		'Waldorf',
		'Other'
	];

	const kenyanStates = [
  'Mombasa',
  'Kwale',
  'Kilifi',
  'Tana River',
  'Lamu',
  'Taita Taveta',
  'Garissa',
  'Wajir',
  'Mandera',
  'Marsabit',
  'Isiolo',
  'Meru',
  'Tharaka-Nithi',
  'Embu',
  'Kitui',
  'Machakos',
  'Makueni',
  'Nyandarua',
  'Nyeri',
  'Kirinyaga',
  'Murang\'a',
  'Kiambu',
  'Turkana',
  'West Pokot',
  'Samburu',
  'Trans Nzoia',
  'Uasin Gishu',
  'Elgeyo-Marakwet',
  'Nandi',
  'Baringo',
  'Laikipia',
  'Nakuru',
  'Narok',
  'Kajiado',
  'Kericho',
  'Bomet',
  'Kakamega',
  'Vihiga',
  'Bungoma',
  'Busia',
  'Siaya',
  'Kisumu',
  'Homa Bay',
  'Migori',
  'Kisii',
  'Nyamira',
  'Nairobi'
];


	const feePeriods = [
		'Termly',
		'Annually', 
		'Monthly'
	];

	const currencies = [
		{ code: 'KES', name: 'Kenyan Shilling (KES)' },
		{ code: 'USD', name: 'US Dollar (USD)' },
		{ code: 'EUR', name: 'Euro (EUR)' },
		{ code: 'GBP', name: 'British Pound (GBP)' }
	];

	// Handle input changes
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		
		if (name.includes('.')) {
			// Handle nested objects like grades.from, fees.currency, fees.tuition.minAmount
			const parts = name.split('.');
			if (parts.length === 2) {
				const [parent, child] = parts;
				setFormData(prev => ({
					...prev,
					[parent]: {
						...prev[parent],
						[child]: value
					}
				}));
			} else if (parts.length === 3) {
				const [parent, child, grandchild] = parts;
				setFormData(prev => ({
					...prev,
					[parent]: {
						...prev[parent],
						[child]: {
							...prev[parent][child],
							[grandchild]: value
						}
					}
				}));
			}
		} else if (name === 'schoolType') {
			// UPDATED: Handle school type as array
			const updatedSchoolTypes = checked 
				? [...formData.schoolType, value]
				: formData.schoolType.filter(type => type !== value);
			setFormData(prev => ({
				...prev,
				schoolType: updatedSchoolTypes
			}));
		} else if (name === 'curriculum') {
			const updatedCurriculum = checked 
				? [...formData.curriculum, value]
				: formData.curriculum.filter(item => item !== value);
			setFormData(prev => ({
				...prev,
				curriculum: updatedCurriculum
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

	// Validate email availability
	const validateEmail = async (email) => {
		if (!email || !email.includes('@')) return;
		
		try {
			const response = await fetch(`http://localhost:5000/api/school-admin-registration/validate-email?email=${email}`);
			const data = await response.json();
			
			setValidationStatus(prev => ({
				...prev,
				email: data.available ? 'available' : 'taken'
			}));
			
			if (!data.available) {
				setErrors(prev => ({
					...prev,
					email: data.message
				}));
			}
		} catch (error) {
			console.error('Email validation error:', error);
		}
	};

	// Validate school name availability
	const validateSchoolName = async (schoolName) => {
		if (!schoolName || schoolName.trim().length < 3) return;
		
		try {
			const response = await fetch(`http://localhost:5000/api/school-admin-registration/validate-school-name?schoolName=${schoolName}`);
			const data = await response.json();
			
			setValidationStatus(prev => ({
				...prev,
				schoolName: data.available ? 'available' : 'taken'
			}));
			
			if (!data.available) {
				setErrors(prev => ({
					...prev,
					schoolName: data.message
				}));
			}
		} catch (error) {
			console.error('School name validation error:', error);
		}
	};

	// Form validation
	const validateStep = (step) => {
		const newErrors = {};
		
		if (step === 1) {
			if (!formData.name.trim()) newErrors.name = 'Full name is required';
			if (!formData.email.trim()) newErrors.email = 'Email is required';
			if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
			if (!formData.password) newErrors.password = 'Password is required';
			if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
			if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
		}
		
		if (step === 2) {
			if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
			// UPDATED: Validate school type array
			if (!formData.schoolType || formData.schoolType.length === 0) {
				newErrors.schoolType = 'Please select at least one school type';
			}
			if (!formData.city.trim()) newErrors.city = 'City is required';
			if (!formData.state.trim()) newErrors.state = 'State/County is required';
		}

		if (step === 3) {
			// Validate fee structure
			if (formData.fees.tuition.minAmount && formData.fees.tuition.maxAmount) {
				const minAmount = parseFloat(formData.fees.tuition.minAmount);
				const maxAmount = parseFloat(formData.fees.tuition.maxAmount);
				
				if (minAmount < 0) newErrors['fees.tuition.minAmount'] = 'Minimum amount cannot be negative';
				if (maxAmount < 0) newErrors['fees.tuition.maxAmount'] = 'Maximum amount cannot be negative';
				if (minAmount > maxAmount) newErrors['fees.tuition.maxAmount'] = 'Maximum amount must be greater than minimum';
			}
			
			if (formData.fees.registration && parseFloat(formData.fees.registration) < 0) {
				newErrors['fees.registration'] = 'Registration fee cannot be negative';
			}
		}
		
		if (step === 4) {
			if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
		}
		
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Navigate between steps
	const nextStep = () => {
		if (validateStep(currentStep)) {
			setCurrentStep(prev => Math.min(prev + 1, 4));
		}
	};

	const prevStep = () => {
		setCurrentStep(prev => Math.max(prev - 1, 1));
	};

	// Submit form
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateStep(4)) return;
		
		setLoading(true);
		
		try {
			// Prepare data for submission
			const submissionData = {
				...formData,
				// Convert fee amounts to numbers
				fees: {
					...formData.fees,
					tuition: {
						...formData.fees.tuition,
						minAmount: formData.fees.tuition.minAmount ? parseFloat(formData.fees.tuition.minAmount) : undefined,
						maxAmount: formData.fees.tuition.maxAmount ? parseFloat(formData.fees.tuition.maxAmount) : undefined
					},
					registration: formData.fees.registration ? parseFloat(formData.fees.registration) : undefined
				}
			};

			const response = await fetch('http://localhost:5000/api/school-admin-registration/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(submissionData)
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Registration failed');
			}

			// Store token and user data
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));

			alert('School admin account created successfully! Your account is pending verification.');
			navigate('/school-admin');

		} catch (error) {
			console.error('Registration error:', error);
			alert('Registration failed: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	// Format currency for display
	const formatCurrency = (amount, currency = 'KES') => {
		if (!amount) return '';
		const formatter = new Intl.NumberFormat('en-KE', {
			style: 'currency',
			currency: currency === 'KES' ? 'KES' : currency,
			minimumFractionDigits: 0
		});
		return formatter.format(amount);
	};

	// UPDATED: School Type Checklist Component
	const renderSchoolTypeChecklist = () => {
		return (
			<div className="form-group full-width">
				<label>School Type *</label>
				<p className="field-description">
					Select all types that apply to your institution. You can choose multiple options.
				</p>
				
				<div className="school-type-checklist">
					{schoolTypes.map(type => {
						const isChecked = formData.schoolType.includes(type.value);
						return (
							<div
								key={type.value}
								className={`school-type-option ${isChecked ? 'selected' : ''}`}
								onClick={() => handleChange({
									target: {
										name: 'schoolType',
										value: type.value,
										checked: !isChecked
									}
								})}
							>
								<div className="option-checkbox">
									<input
										type="checkbox"
										name="schoolType"
										value={type.value}
										checked={isChecked}
										onChange={handleChange}
									/>
								</div>
								<div className="option-content">
									<div className="option-header">
										<span className="option-icon">{type.icon}</span>
										<span className="option-label">{type.label}</span>
									</div>
									<div className="option-description">{type.description}</div>
								</div>
							</div>
						);
					})}
				</div>
				
				{formData.schoolType.length > 0 && (
					<div className="selected-types-summary">
						<p><strong>Selected Types ({formData.schoolType.length}):</strong></p>
						<div className="selected-types-tags">
							{formData.schoolType.map(type => {
								const typeInfo = schoolTypes.find(t => t.value === type);
								return (
									<span key={type} className="type-tag">
										{typeInfo?.icon} {typeInfo?.label}
									</span>
								);
							})}
						</div>
					</div>
				)}
				
				{errors.schoolType && <span className="error">{errors.schoolType}</span>}
			</div>
		);
	};

	// Render step content
	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="step-content">
						<h3>Personal Information</h3>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="name">Full Name *</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									placeholder="Enter your full name"
									required
								/>
								{errors.name && <span className="error">{errors.name}</span>}
							</div>

							<div className="form-group">
								<label htmlFor="email">Email Address *</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									onBlur={(e) => validateEmail(e.target.value)}
									placeholder="Enter your email address"
									required
								/>
								{validationStatus.email === 'available' && (
									<span className="success">✅ Email is available</span>
								)}
								{errors.email && <span className="error">{errors.email}</span>}
							</div>

							<div className="form-group">
								<label htmlFor="phone">Phone Number</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									placeholder="+254 700 000 000"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password">Password *</label>
								<input
									type="password"
									id="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Create a strong password"
									required
								/>
								{errors.password && <span className="error">{errors.password}</span>}
							</div>

							<div className="form-group">
								<label htmlFor="confirmPassword">Confirm Password *</label>
								<input
									type="password"
									id="confirmPassword"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleChange}
									placeholder="Confirm your password"
									required
								/>
								{errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
							</div>
						</div>
					</div>
				);

			case 2:
				return (
					<div className="step-content">
						<h3>School Information</h3>
						<div className="form-grid">
							<div className="form-group full-width">
								<label htmlFor="schoolName">School Name *</label>
								<input
									type="text"
									id="schoolName"
									name="schoolName"
									value={formData.schoolName}
									onChange={handleChange}
									onBlur={(e) => validateSchoolName(e.target.value)}
									placeholder="Enter your school name"
									required
								/>
								{validationStatus.schoolName === 'available' && (
									<span className="success">✅ School name is available</span>
								)}
								{errors.schoolName && <span className="error">{errors.schoolName}</span>}
							</div>

							{/* UPDATED: School Type Checklist */}
							{renderSchoolTypeChecklist()}

							<div className="form-group full-width">
								<label htmlFor="description">School Description</label>
								<textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Brief description of your school"
									rows="3"
								/>
							</div>

							<div className="form-group full-width">
								<label htmlFor="address">Address</label>
								<input
									type="text"
									id="address"
									name="address"
									value={formData.address}
									onChange={handleChange}
									placeholder="School address"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="city">Town *</label>
								<input
									type="text"
									id="city"
									name="city"
									value={formData.city}
									onChange={handleChange}
									placeholder="Town"
									required
								/>
								{errors.city && <span className="error">{errors.city}</span>}
							</div>

							<div className="form-group">
								<label htmlFor="state">County *</label>
								<select
									id="state"
									name="state"
									value={formData.state}
									onChange={handleChange}
									required
								>
									<option value="">Select county</option>
									{kenyanStates.map(state => (
										<option key={state} value={state}>{state}</option>
									))}
								</select>
								{errors.state && <span className="error">{errors.state}</span>}
							</div>

							<div className="form-group">
								<label htmlFor="zipCode">Postal Code</label>
								<input
									type="text"
									id="zipCode"
									name="zipCode"
									value={formData.zipCode}
									onChange={handleChange}
									placeholder="00100"
								/>
							</div>
						</div>
					</div>
				);

			case 3:
				return (
					<div className="step-content">
						<h3>Contact, Academic & Fee Information</h3>
						<div className="form-grid">
							{/* Contact Information */}
							<div className="section-header full-width">
								<h4>Contact Information</h4>
							</div>
							
							<div className="form-group">
								<label htmlFor="schoolPhone">School Phone</label>
								<input
									type="tel"
									id="schoolPhone"
									name="schoolPhone"
									value={formData.schoolPhone}
									onChange={handleChange}
									placeholder="School phone number"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="schoolEmail">School Email</label>
								<input
									type="email"
									id="schoolEmail"
									name="schoolEmail"
									value={formData.schoolEmail}
									onChange={handleChange}
									placeholder="School email address"
								/>
							</div>

							<div className="form-group full-width">
								<label htmlFor="website">Website</label>
								<input
									type="url"
									id="website"
									name="website"
									value={formData.website}
									onChange={handleChange}
									placeholder="https://www.yourschool.com"
								/>
							</div>

							{/* Academic Information */}
							<div className="section-header full-width">
								<h4>Academic Information</h4>
							</div>

							<div className="form-group">
								<label htmlFor="grades.from">Grade Range From</label>
								<input
									type="text"
									id="grades.from"
									name="grades.from"
									value={formData.grades.from}
									onChange={handleChange}
									placeholder="e.g., Pre-K, Class 1, Form 1"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="grades.to">Grade Range To</label>
								<input
									type="text"
									id="grades.to"
									name="grades.to"
									value={formData.grades.to}
									onChange={handleChange}
									placeholder="e.g., Class 8, Form 4"
								/>
							</div>

							<div className="form-group full-width">
								<label>Curriculum Offered</label>
								<div className="checkbox-grid">
									{curriculumOptions.map(option => (
										<label key={option} className="checkbox-label">
											<input
												type="checkbox"
												name="curriculum"
												value={option}
												checked={formData.curriculum.includes(option)}
												onChange={handleChange}
											/>
											{option}
										</label>
									))}
								</div>
							</div>

							{/* Fee Structure */}
							<div className="section-header full-width">
								<h4>💰 Fee Structure</h4>
								<p className="section-description">
									Set your school's fee range to help parents understand your pricing structure.
								</p>
							</div>

							<div className="form-group">
								<label htmlFor="fees.currency">Currency</label>
								<select
									id="fees.currency"
									name="fees.currency"
									value={formData.fees.currency}
									onChange={handleChange}
								>
									{currencies.map(currency => (
										<option key={currency.code} value={currency.code}>
											{currency.name}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="fees.tuition.period">Fee Period</label>
								<select
									id="fees.tuition.period"
									name="fees.tuition.period"
									value={formData.fees.tuition.period}
									onChange={handleChange}
								>
									{feePeriods.map(period => (
										<option key={period} value={period}>{period}</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="fees.tuition.minAmount">
									Minimum Tuition Fee ({formData.fees.currency})
								</label>
								<input
									type="number"
									id="fees.tuition.minAmount"
									name="fees.tuition.minAmount"
									value={formData.fees.tuition.minAmount}
									onChange={handleChange}
									placeholder="e.g., 50000"
									min="0"
									step="1000"
								/>
								{errors['fees.tuition.minAmount'] && (
									<span className="error">{errors['fees.tuition.minAmount']}</span>
								)}
								{formData.fees.tuition.minAmount && (
									<span className="fee-preview">
										Preview: {formatCurrency(formData.fees.tuition.minAmount, formData.fees.currency)} per {formData.fees.tuition.period.toLowerCase()}
									</span>
								)}
							</div>

							<div className="form-group">
								<label htmlFor="fees.tuition.maxAmount">
									Maximum Tuition Fee ({formData.fees.currency})
								</label>
								<input
									type="number"
									id="fees.tuition.maxAmount"
									name="fees.tuition.maxAmount"
									value={formData.fees.tuition.maxAmount}
									onChange={handleChange}
									placeholder="e.g., 150000"
									min="0"
									step="1000"
								/>
								{errors['fees.tuition.maxAmount'] && (
									<span className="error">{errors['fees.tuition.maxAmount']}</span>
								)}
								{formData.fees.tuition.maxAmount && (
									<span className="fee-preview">
										Preview: {formatCurrency(formData.fees.tuition.maxAmount, formData.fees.currency)} per {formData.fees.tuition.period.toLowerCase()}
									</span>
								)}
							</div>

							<div className="form-group">
								<label htmlFor="fees.registration">
									Registration Fee ({formData.fees.currency}) <span className="optional">(Optional)</span>
								</label>
								<input
									type="number"
									id="fees.registration"
									name="fees.registration"
									value={formData.fees.registration}
									onChange={handleChange}
									placeholder="e.g., 5000"
									min="0"
									step="500"
								/>
								{errors['fees.registration'] && (
									<span className="error">{errors['fees.registration']}</span>
								)}
								{formData.fees.registration && (
									<span className="fee-preview">
										Preview: {formatCurrency(formData.fees.registration, formData.fees.currency)} one-time
									</span>
								)}
							</div>

							{/* Fee Range Summary */}
							{(formData.fees.tuition.minAmount || formData.fees.tuition.maxAmount) && (
								<div className="form-group full-width">
									<div className="fee-summary">
										<h5>📊 Fee Summary</h5>
										<div className="fee-range">
											{formData.fees.tuition.minAmount && formData.fees.tuition.maxAmount ? (
												<p>
													<strong>Tuition Range:</strong> {formatCurrency(formData.fees.tuition.minAmount, formData.fees.currency)} - {formatCurrency(formData.fees.tuition.maxAmount, formData.fees.currency)} per {formData.fees.tuition.period.toLowerCase()}
												</p>
											) : formData.fees.tuition.minAmount ? (
												<p>
													<strong>Minimum Tuition:</strong> {formatCurrency(formData.fees.tuition.minAmount, formData.fees.currency)} per {formData.fees.tuition.period.toLowerCase()}
												</p>
											) : formData.fees.tuition.maxAmount ? (
												<p>
													<strong>Maximum Tuition:</strong> {formatCurrency(formData.fees.tuition.maxAmount, formData.fees.currency)} per {formData.fees.tuition.period.toLowerCase()}
												</p>
											) : null}
											
											{formData.fees.registration && (
												<p>
													<strong>Registration Fee:</strong> {formatCurrency(formData.fees.registration, formData.fees.currency)} one-time
												</p>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				);

			case 4:
				return (
					<div className="step-content">
						<h3>Review & Confirm</h3>
						<div className="review-section">
							<div className="review-group">
								<h4>Personal Information</h4>
								<p><strong>Name:</strong> {formData.name}</p>
								<p><strong>Email:</strong> {formData.email}</p>
								<p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
							</div>

							<div className="review-group">
								<h4>School Information</h4>
								<p><strong>School Name:</strong> {formData.schoolName}</p>
								{/* UPDATED: Display multiple school types */}
								<p><strong>School Type(s):</strong> {formData.schoolType.length > 0 ? formData.schoolType.join(', ') : 'Not selected'}</p>
								<p><strong>Location:</strong> {formData.city}, {formData.state}</p>
								<p><strong>Description:</strong> {formData.description || 'Not provided'}</p>
							</div>

							<div className="review-group">
								<h4>Academic Information</h4>
								<p><strong>Grade Range:</strong> {formData.grades.from} - {formData.grades.to}</p>
								<p><strong>Curriculum:</strong> {formData.curriculum.join(', ') || 'Not specified'}</p>
							</div>

							<div className="review-group">
								<h4>💰 Fee Structure</h4>
								{formData.fees.tuition.minAmount || formData.fees.tuition.maxAmount ? (
									<div>
										{formData.fees.tuition.minAmount && formData.fees.tuition.maxAmount ? (
											<p><strong>Tuition Range:</strong> {formatCurrency(formData.fees.tuition.minAmount, formData.fees.currency)} - {formatCurrency(formData.fees.tuition.maxAmount, formData.fees.currency)} per {formData.fees.tuition.period.toLowerCase()}</p>
										) : formData.fees.tuition.minAmount ? (
											<p><strong>Minimum Tuition:</strong> {formatCurrency(formData.fees.tuition.minAmount, formData.fees.currency)} per {formData.fees.tuition.period.toLowerCase()}</p>
										) : (
											<p><strong>Maximum Tuition:</strong> {formatCurrency(formData.fees.tuition.maxAmount, formData.fees.currency)} per {formData.fees.tuition.period.toLowerCase()}</p>
										)}
										{formData.fees.registration && (
											<p><strong>Registration Fee:</strong> {formatCurrency(formData.fees.registration, formData.fees.currency)} one-time</p>
										)}
									</div>
								) : (
									<p>No fee information provided</p>
								)}
							</div>

							<div className="terms-section">
								<label className="checkbox-label">
									<input
										type="checkbox"
										name="agreeToTerms"
										checked={formData.agreeToTerms}
										onChange={handleChange}
										required
									/>
									I agree to the Terms and Conditions and Privacy Policy
								</label>
								{errors.agreeToTerms && <span className="error">{errors.agreeToTerms}</span>}
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="registration-container">
			<div className="registration-header">
				<h1>Create School Admin Account</h1>
				<p>Join our platform to manage your school's tours and admissions</p>
			</div>

			{/* Progress indicator */}
			<div className="progress-indicator">
				{[1, 2, 3, 4].map(step => (
					<div
						key={step}
						className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
					>
						<div className="step-number">{step}</div>
						<div className="step-label">
							{step === 1 && 'Personal'}
							{step === 2 && 'School Info'}
							{step === 3 && 'Details & Fees'}
							{step === 4 && 'Review'}
						</div>
					</div>
				))}
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="registration-form">
				{renderStepContent()}

				{/* Navigation buttons */}
				<div className="form-navigation">
					{currentStep > 1 && (
						<button
							type="button"
							onClick={prevStep}
							className="btn-secondary"
						>
							Previous
						</button>
					)}
					
					{currentStep < 4 ? (
						<button
							type="button"
							onClick={nextStep}
							className="btn-primary"
						>
							Next
						</button>
					) : (
						<button
							type="submit"
							disabled={loading}
							className="btn-primary"
						>
							{loading ? 'Creating Account...' : 'Create Account'}
						</button>
					)}
				</div>
			</form>

			<div className="registration-footer">
				<p>
					Already have an account?{' '}
					<button
						type="button"
						onClick={() => navigate('/login')}
						className="link-button"
					>
						Login here
					</button>
				</p>
			</div>

			<style jsx>{`
				.registration-container {
					max-width: 800px;
					margin: 2rem auto;
					padding: 2rem;
					background: white;
					border-radius: 8px;
					box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				}

				.registration-header {
					text-align: center;
					margin-bottom: 2rem;
				}

				.registration-header h1 {
					color: #333;
					margin-bottom: 0.5rem;
				}

				.registration-header p {
					color: #666;
					margin: 0;
				}

				.progress-indicator {
					display: flex;
					justify-content: center;
					margin-bottom: 2rem;
					gap: 2rem;
				}

				.progress-step {
					display: flex;
					flex-direction: column;
					align-items: center;
					opacity: 0.5;
					transition: opacity 0.3s;
				}

				.progress-step.active {
					opacity: 1;
				}

				.progress-step.completed {
					opacity: 1;
					color: #28a745;
				}

				.step-number {
					width: 40px;
					height: 40px;
					border-radius: 50%;
					background: #f0f0f0;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 0.5rem;
					font-weight: bold;
				}

				.progress-step.active .step-number {
					background: #007bff;
					color: white;
				}

				.progress-step.completed .step-number {
					background: #28a745;
					color: white;
				}

				.step-label {
					font-size: 0.9rem;
					text-align: center;
				}

				.registration-form {
					background: #f9f9f9;
					padding: 2rem;
					border-radius: 8px;
					margin-bottom: 2rem;
				}

				.step-content h3 {
					margin-bottom: 1.5rem;
					color: #333;
				}

				.form-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 1rem;
				}

				.form-group {
					display: flex;
					flex-direction: column;
				}

				.form-group.full-width {
					grid-column: 1 / -1;
				}

				.field-description {
					color: #666;
					font-size: 0.9rem;
					margin: 0.5rem 0 1rem 0;
				}

				/* UPDATED: School Type Checklist Styles */
				.school-type-checklist {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
					gap: 1rem;
					margin: 1rem 0;
				}

				.school-type-option {
					display: flex;
					align-items: flex-start;
					gap: 1rem;
					padding: 1rem;
					border: 2px solid #e0e0e0;
					border-radius: 8px;
					background: white;
					cursor: pointer;
					transition: all 0.3s ease;
				}

				.school-type-option:hover {
					border-color: #007bff;
					transform: translateY(-2px);
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
				}

				.school-type-option.selected {
					border-color: #007bff;
					background: #f0f7ff;
					box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
				}

				.option-checkbox {
					margin-top: 0.25rem;
				}

				.option-checkbox input[type="checkbox"] {
					width: 18px;
					height: 18px;
					cursor: pointer;
				}

				.option-content {
					flex: 1;
				}

				.option-header {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					margin-bottom: 0.5rem;
				}

				.option-icon {
					font-size: 1.2rem;
				}

				.option-label {
					font-weight: 600;
					color: #333;
				}

				.option-description {
					color: #666;
					font-size: 0.9rem;
					line-height: 1.4;
				}

				.selected-types-summary {
					margin-top: 1rem;
					padding: 1rem;
					background: #e3f2fd;
					border-radius: 6px;
					border-left: 4px solid #007bff;
				}

				.selected-types-summary p {
					margin: 0 0 0.5rem 0;
					color: #007bff;
				}

				.selected-types-tags {
					display: flex;
					flex-wrap: wrap;
					gap: 0.5rem;
				}

				.type-tag {
					background: #007bff;
					color: white;
					padding: 0.25rem 0.75rem;
					border-radius: 20px;
					font-size: 0.9rem;
					font-weight: 500;
				}

				.section-header {
					border-bottom: 2px solid #007bff;
					padding-bottom: 0.5rem;
					margin: 1.5rem 0 1rem 0;
				}

				.section-header h4 {
					color: #007bff;
					margin: 0;
					font-size: 1.1rem;
				}

				.section-description {
					color: #666;
					font-size: 0.9rem;
					margin: 0.5rem 0 0 0;
				}

				.form-group label {
					margin-bottom: 0.5rem;
					font-weight: 500;
					color: #333;
				}

				.optional {
					color: #666;
					font-weight: normal;
					font-size: 0.9rem;
				}

				.form-group input,
				.form-group select,
				.form-group textarea {
					padding: 0.75rem;
					border: 1px solid #ddd;
					border-radius: 4px;
					font-size: 1rem;
				}

				.form-group input:focus,
				.form-group select:focus,
				.form-group textarea:focus {
					outline: none;
					border-color: #007bff;
				}

				.checkbox-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
					gap: 0.5rem;
					margin-top: 0.5rem;
				}

				.checkbox-label {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					cursor: pointer;
				}

				.error {
					color: #dc3545;
					font-size: 0.9rem;
					margin-top: 0.25rem;
				}

				.success {
					color: #28a745;
					font-size: 0.9rem;
					margin-top: 0.25rem;
				}

				.fee-preview {
					color: #007bff;
					font-size: 0.9rem;
					margin-top: 0.25rem;
					font-weight: 500;
				}

				.fee-summary {
					background: #e3f2fd;
					border: 1px solid #007bff;
					border-radius: 4px;
					padding: 1rem;
					margin-top: 1rem;
				}

				.fee-summary h5 {
					color: #007bff;
					margin: 0 0 0.5rem 0;
				}

				.fee-range p {
					margin: 0.25rem 0;
					color: #333;
				}

				.review-section {
					background: white;
					padding: 1.5rem;
					border-radius: 4px;
					margin-bottom: 1.5rem;
				}

				.review-group {
					margin-bottom: 1.5rem;
				}

				.review-group h4 {
					color: #007bff;
					margin-bottom: 0.5rem;
				}

				.review-group p {
					margin: 0.25rem 0;
					color: #555;
				}

				.terms-section {
					background: #e9ecef;
					padding: 1rem;
					border-radius: 4px;
					border-left: 4px solid #007bff;
				}

				.form-navigation {
					display: flex;
					justify-content: space-between;
					margin-top: 2rem;
				}

				.btn-primary,
				.btn-secondary {
					padding: 0.75rem 2rem;
					border: none;
					border-radius: 4px;
					font-size: 1rem;
					cursor: pointer;
					transition: background-color 0.3s;
				}

				.btn-primary {
					background: #007bff;
					color: white;
				}

				.btn-primary:hover {
					background: #0056b3;
				}

				.btn-primary:disabled {
					background: #ccc;
					cursor: not-allowed;
				}

				.btn-secondary {
					background: #6c757d;
					color: white;
				}

				.btn-secondary:hover {
					background: #545b62;
				}

				.registration-footer {
					text-align: center;
				}

				.link-button {
					background: none;
					border: none;
					color: #007bff;
					text-decoration: underline;
					cursor: pointer;
				}

				.link-button:hover {
					color: #0056b3;
				}

				@media (max-width: 768px) {
					.registration-container {
						margin: 1rem;
						padding: 1rem;
					}

					.form-grid {
						grid-template-columns: 1fr;
					}

					.school-type-checklist {
						grid-template-columns: 1fr;
					}

					.progress-indicator {
						gap: 1rem;
					}

					.form-navigation {
						flex-direction: column;
						gap: 1rem;
					}
				}
			`}</style>
		</div>
	);
};

export default SchoolAdminRegistration;