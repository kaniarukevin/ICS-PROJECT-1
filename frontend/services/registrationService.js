// frontend/src/services/registrationService.js

const API_BASE_URL = 'http://localhost:5000/api/school-admin-registration';

// Helper function to handle API responses
const handleResponse = async (response) => {
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
	}
	return response.json();
};

// School Admin Registration Service
export const registrationService = {
	// Register new school admin
	async registerSchoolAdmin(registrationData) {
		const response = await fetch(`${API_BASE_URL}/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(registrationData)
		});
		return handleResponse(response);
	},

	// Validate email availability
	async validateEmail(email) {
		const response = await fetch(`${API_BASE_URL}/validate-email?email=${encodeURIComponent(email)}`);
		return handleResponse(response);
	},

	// Validate school name availability
	async validateSchoolName(schoolName) {
		const response = await fetch(`${API_BASE_URL}/validate-school-name?schoolName=${encodeURIComponent(schoolName)}`);
		return handleResponse(response);
	},

	// Get registration statistics (system admin only)
	async getRegistrationStats() {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_BASE_URL}/stats`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		return handleResponse(response);
	},

	// Get pending school admins (system admin only)
	async getPendingSchoolAdmins() {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_BASE_URL}/pending`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		return handleResponse(response);
	},

	// Verify school admin (system admin only)
	async verifySchoolAdmin(userId, isVerified, notes = '') {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_BASE_URL}/verify/${userId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ isVerified, notes })
		});
		return handleResponse(response);
	}
};

// Validation utilities
export const validationUtils = {
	// Validate email format
	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	},

	// Validate password strength
	validatePassword(password) {
		const errors = [];
		
		if (password.length < 6) {
			errors.push('Password must be at least 6 characters long');
		}
		
		if (!/[A-Z]/.test(password)) {
			errors.push('Password should contain at least one uppercase letter');
		}
		
		if (!/[a-z]/.test(password)) {
			errors.push('Password should contain at least one lowercase letter');
		}
		
		if (!/[0-9]/.test(password)) {
			errors.push('Password should contain at least one number');
		}
		
		return {
			isValid: errors.length === 0,
			errors,
			strength: this.getPasswordStrength(password)
		};
	},

	// Get password strength
	getPasswordStrength(password) {
		let score = 0;
		
		if (password.length >= 8) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;
		
		if (score <= 2) return 'Weak';
		if (score <= 3) return 'Medium';
		if (score <= 4) return 'Strong';
		return 'Very Strong';
	},

	// Validate phone number (Kenyan format)
	isValidKenyanPhone(phone) {
		const kenyanPhoneRegex = /^(\+254|0)[17]\d{8}$/;
		return kenyanPhoneRegex.test(phone.replace(/\s/g, ''));
	},

	// Validate school name
	validateSchoolName(name) {
		const errors = [];
		
		if (!name.trim()) {
			errors.push('School name is required');
		} else if (name.trim().length < 3) {
			errors.push('School name must be at least 3 characters long');
		} else if (name.trim().length > 100) {
			errors.push('School name must be less than 100 characters');
		}
		
		return {
			isValid: errors.length === 0,
			errors
		};
	},

	// Validate required fields for each step
	validateStep(step, formData) {
		const errors = {};
		
		switch (step) {
			case 1: // Personal Information
				if (!formData.name.trim()) {
					errors.name = 'Full name is required';
				}
				
				if (!formData.email.trim()) {
					errors.email = 'Email is required';
				} else if (!this.isValidEmail(formData.email)) {
					errors.email = 'Please enter a valid email address';
				}
				
				if (!formData.password) {
					errors.password = 'Password is required';
				} else {
					const passwordValidation = this.validatePassword(formData.password);
					if (!passwordValidation.isValid) {
						errors.password = passwordValidation.errors[0];
					}
				}
				
				if (formData.password !== formData.confirmPassword) {
					errors.confirmPassword = 'Passwords do not match';
				}
				
				if (formData.phone && !this.isValidKenyanPhone(formData.phone)) {
					errors.phone = 'Please enter a valid Kenyan phone number (+254 or 07/01)';
				}
				break;
				
			case 2: // School Information
				const schoolNameValidation = this.validateSchoolName(formData.schoolName);
				if (!schoolNameValidation.isValid) {
					errors.schoolName = schoolNameValidation.errors[0];
				}
				
				if (!formData.schoolType) {
					errors.schoolType = 'School type is required';
				}
				
				if (!formData.city.trim()) {
					errors.city = 'City is required';
				}
				
				if (!formData.state.trim()) {
					errors.state = 'State/County is required';
				}
				break;
				
			case 3: // Contact & Academic Information
				if (formData.schoolEmail && !this.isValidEmail(formData.schoolEmail)) {
					errors.schoolEmail = 'Please enter a valid school email address';
				}
				
				if (formData.schoolPhone && !this.isValidKenyanPhone(formData.schoolPhone)) {
					errors.schoolPhone = 'Please enter a valid phone number';
				}
				
				if (formData.website && !this.isValidURL(formData.website)) {
					errors.website = 'Please enter a valid website URL';
				}
				break;
				
			case 4: // Review & Confirm
				if (!formData.agreeToTerms) {
					errors.agreeToTerms = 'You must agree to the terms and conditions';
				}
				break;
		}
		
		return {
			isValid: Object.keys(errors).length === 0,
			errors
		};
	},

	// Validate URL
	isValidURL(string) {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	}
};

// Form data utilities
export const formUtils = {
	// Get initial form data
	getInitialFormData() {
		return {
			// Personal Information
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
			phone: '',
			
			// School Information
			schoolName: '',
			schoolType: '',
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
			
			// Additional Info
			curriculum: [],
			grades: {
				from: '',
				to: ''
			},
			
			// Agreement
			agreeToTerms: false
		};
	},

	// Format form data for submission
	formatFormDataForSubmission(formData) {
		return {
			...formData,
			name: formData.name.trim(),
			email: formData.email.toLowerCase().trim(),
			schoolName: formData.schoolName.trim(),
			city: formData.city.trim(),
			state: formData.state.trim(),
			address: formData.address.trim(),
			description: formData.description.trim(),
			schoolPhone: formData.schoolPhone.trim(),
			schoolEmail: formData.schoolEmail.toLowerCase().trim(),
			website: formData.website.trim(),
			zipCode: formData.zipCode.trim()
		};
	},

	// Get step titles
	getStepTitles() {
		return {
			1: 'Personal Information',
			2: 'School Information', 
			3: 'Contact & Academic Details',
			4: 'Review & Confirm'
		};
	},

	// Get progress percentage
	getProgressPercentage(currentStep, totalSteps = 4) {
		return (currentStep / totalSteps) * 100;
	}
};

export default {
	registrationService,
	validationUtils,
	formUtils
};