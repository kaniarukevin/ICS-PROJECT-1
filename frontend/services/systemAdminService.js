// frontend/src/services/systemAdminService.js
const API_BASE_URL = 'http://localhost:5000/api/system-admin';

// Helper function to get auth headers
const getAuthHeaders = () => {
	const token = localStorage.getItem('token');
	return {
		'Authorization': `Bearer ${token}`,
		'Content-Type': 'application/json'
	};
};

// Helper function to handle API responses
const handleResponse = async (response) => {
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errorText}`);
	}
	return response.json();
};

export const systemAdminService = {
	// Dashboard
	getDashboard: async () => {
		const response = await fetch(`${API_BASE_URL}/dashboard`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	// Schools Management
	getSchools: async () => {
		const response = await fetch(`${API_BASE_URL}/schools`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	updateSchoolApproval: async (schoolId, updateData) => {
		const response = await fetch(`${API_BASE_URL}/schools/${schoolId}/approve`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(updateData)
		});
		return handleResponse(response);
	},

	// Users Management
	getUsers: async () => {
		const response = await fetch(`${API_BASE_URL}/users`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	updateUserStatus: async (userId, updateData) => {
		const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(updateData)
		});
		return handleResponse(response);
	},

	// Reports and Analytics
	getReports: async () => {
		const response = await fetch(`${API_BASE_URL}/reports`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	getAdvancedAnalytics: async () => {
		const response = await fetch(`${API_BASE_URL}/analytics`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	// Bookings Management
	getAllBookings: async (params = {}) => {
		const queryString = new URLSearchParams(params).toString();
		const url = queryString ? `${API_BASE_URL}/bookings?${queryString}` : `${API_BASE_URL}/bookings`;
		
		const response = await fetch(url, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	},

	// Health Check
	healthCheck: async () => {
		const response = await fetch(`${API_BASE_URL}/health`, {
			headers: getAuthHeaders()
		});
		return handleResponse(response);
	}
};