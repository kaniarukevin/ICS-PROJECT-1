const API_BASE_URL = '/api/school-admin';

const getAuthHeaders = () => {
	const token = localStorage.getItem('token');
	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	};
};

export const schoolAdminService = {
	// Dashboard
	getDashboard: async () => {
		const response = await fetch(`${API_BASE_URL}/dashboard`, {
			headers: getAuthHeaders()
		});
		return response.json();
	},

	// Tours
	getTours: async () => {
		const response = await fetch(`${API_BASE_URL}/tours`, {
			headers: getAuthHeaders()
		});
		return response.json();
	},

	createTour: async (tourData) => {
		const response = await fetch(`${API_BASE_URL}/tours`, {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify(tourData)
		});
		return response.json();
	},

	updateTour: async (tourId, tourData) => {
		const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(tourData)
		});
		return response.json();
	},

	deleteTour: async (tourId) => {
		const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
			method: 'DELETE',
			headers: getAuthHeaders()
		});
		return response.json();
	},

	// Bookings
	getBookings: async () => {
		const response = await fetch(`${API_BASE_URL}/bookings`, {
			headers: getAuthHeaders()
		});
		return response.json();
	},

	updateBookingStatus: async (bookingId, status) => {
		const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify({ status })
		});
		return response.json();
	},

	// School Info
	getSchoolInfo: async () => {
		const response = await fetch(`${API_BASE_URL}/school`, {
			headers: getAuthHeaders()
		});
		return response.json();
	},

	updateSchoolInfo: async (schoolData) => {
		const response = await fetch(`${API_BASE_URL}/school`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(schoolData)
		});
		return response.json();
	}
};