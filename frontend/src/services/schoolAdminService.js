// frontend/src/services/schoolAdminService.js

const API_BASE_URL = 'http://localhost:5000/api/school-admin';

// Helper function to get auth headers
const getAuthHeaders = () => {
	const token = localStorage.getItem('token');
	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	};
};

// Helper function to handle API responses
const handleResponse = async (response) => {
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
	}
	return response.json();
};

// Dashboard Service
export const dashboardService = {
	async getDashboard() {
		const response = await fetch(`${API_BASE_URL}/dashboard`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	async getAnalytics() {
		const response = await fetch(`${API_BASE_URL}/analytics`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	}
};

// Tours Service
export const toursService = {
	async getTours() {
		const response = await fetch(`${API_BASE_URL}/tours`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	async createTour(tourData) {
		const response = await fetch(`${API_BASE_URL}/tours`, {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify(tourData)
		});
		return handleResponse(response);
	},

	async updateTour(tourId, tourData) {
		const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(tourData)
		});
		return handleResponse(response);
	},

	async deleteTour(tourId) {
		const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
			method: 'DELETE',
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	async toggleTourStatus(tourId, isActive) {
		const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify({ isActive })
		});
		return handleResponse(response);
	}
};

// Bookings Service
export const bookingsService = {
	async getBookings(filters = {}) {
		const queryParams = new URLSearchParams();
		
		if (filters.status && filters.status !== 'all') {
			queryParams.append('status', filters.status);
		}
		if (filters.tourId && filters.tourId !== 'all') {
			queryParams.append('tourId', filters.tourId);
		}

		const queryString = queryParams.toString();
		const url = queryString ? `${API_BASE_URL}/bookings?${queryString}` : `${API_BASE_URL}/bookings`;
		
		const response = await fetch(url, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	async updateBookingStatus(bookingId, status, adminNotes = '') {
		const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify({ status, adminNotes })
		});
		return handleResponse(response);
	},

	async getBookingDetails(bookingId) {
		const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	}
};

// School Profile Service
export const schoolService = {
	async getSchoolProfile() {
		const response = await fetch(`${API_BASE_URL}/school`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	async updateSchoolProfile(schoolData) {
		const response = await fetch(`${API_BASE_URL}/school`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(schoolData)
		});
		return handleResponse(response);
	}
};

// Statistics and Reports Service
export const reportsService = {
	async getTourPerformance() {
		const response = await fetch(`${API_BASE_URL}/analytics`, {
			headers: getAuthHeaders()
		});
		const data = await handleResponse(response);
		return data.tourPerformance || [];
	},

	async getBookingTrends() {
		const response = await fetch(`${API_BASE_URL}/analytics`, {
			headers: getAuthHeaders()
		});
		const data = await handleResponse(response);
		return data.bookingTrends || [];
	},

	async getStatusDistribution() {
		const response = await fetch(`${API_BASE_URL}/analytics`, {
			headers: getAuthHeaders()
		});
		const data = await handleResponse(response);
		return data.statusDistribution || [];
	},

	async exportBookingsCSV(filters = {}) {
		const queryParams = new URLSearchParams(filters);
		const response = await fetch(`${API_BASE_URL}/bookings/export?${queryParams}`, {
			headers: getAuthHeaders()
		});
		
		if (!response.ok) {
			throw new Error('Failed to export bookings');
		}
		
		// Return blob for CSV download
		return response.blob();
	}
};

// Utility functions
export const utils = {
	// Format date for display
	formatDate(date) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	},

	// Format time for display
	formatTime(time) {
		if (!time) return 'N/A';
		return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	},

	// Format currency
	formatCurrency(amount, currency = 'KES') {
		if (!amount) return 'Not specified';
		return `${currency} ${parseFloat(amount).toLocaleString()}`;
	},

	// Get status color
	getStatusColor(status) {
		const colors = {
			pending: '#ffc107',
			confirmed: '#28a745',
			cancelled: '#dc3545',
			completed: '#17a2b8',
			'no-show': '#6c757d'
		};
		return colors[status] || '#6c757d';
	},

	// Get status icon
	getStatusIcon(status) {
		const icons = {
			pending: '⏳',
			confirmed: '✅',
			cancelled: '❌',
			completed: '🎉',
			'no-show': '👻'
		};
		return icons[status] || '❓';
	},

	// Validate tour form data
	validateTourData(tourData) {
		const errors = [];
		
		if (!tourData.title?.trim()) {
			errors.push('Tour title is required');
		}
		if (!tourData.description?.trim()) {
			errors.push('Tour description is required');
		}
		if (!tourData.date) {
			errors.push('Tour date is required');
		}
		if (!tourData.startTime) {
			errors.push('Start time is required');
		}
		if (!tourData.endTime) {
			errors.push('End time is required');
		}
		if (!tourData.maxCapacity || tourData.maxCapacity < 1) {
			errors.push('Valid max capacity is required');
		}
		
		// Check if end time is after start time
		if (tourData.startTime && tourData.endTime) {
			const start = new Date(`2000-01-01T${tourData.startTime}`);
			const end = new Date(`2000-01-01T${tourData.endTime}`);
			if (end <= start) {
				errors.push('End time must be after start time');
			}
		}
		
		// Check if date is in the future
		if (tourData.date) {
			const tourDate = new Date(tourData.date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			if (tourDate < today) {
				errors.push('Tour date must be in the future');
			}
		}
		
		return errors;
	},

	// Download CSV file
	downloadCSV(blob, filename) {
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}
};

// Error handling wrapper
export const withErrorHandling = (asyncFn) => {
	return async (...args) => {
		try {
			return await asyncFn(...args);
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	};
};

// Export all services as default
export default {
	dashboard: dashboardService,
	tours: toursService,
	bookings: bookingsService,
	school: schoolService,
	reports: reportsService,
	utils
};