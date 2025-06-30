import { useState, useEffect } from 'react';
import { systemAdminService } from '../services/systemAdminService';

export const useUsers = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const data = await systemAdminService.getUsers();
			setUsers(data);
			setError(null);
		} catch (err) {
			setError(err.message);
			console.error('Error fetching users:', err);
		} finally {
			setLoading(false);
		}
	};

	const activateUser = async (userId) => {
		try {
			await systemAdminService.updateUserStatus(userId, true);
			await fetchUsers(); // Refresh the list
			return { success: true };
		} catch (err) {
			setError(err.message);
			return { success: false, error: err.message };
		}
	};

	const deactivateUser = async (userId) => {
		try {
			await systemAdminService.updateUserStatus(userId, false);
			await fetchUsers(); // Refresh the list
			return { success: true };
		} catch (err) {
			setError(err.message);
			return { success: false, error: err.message };
		}
	};

	const getUsersByRole = (role) => {
		return users.filter(user => user.role === role);
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return {
		users,
		loading,
		error,
		fetchUsers,
		activateUser,
		deactivateUser,
		getUsersByRole,
		// Computed values
		totalUsers: users.length,
		activeUsers: users.filter(u => u.isActive).length,
		inactiveUsers: users.filter(u => !u.isActive).length,
		parentUsers: users.filter(u => u.role === 'parent').length,
		schoolAdminUsers: users.filter(u => u.role === 'school_admin').length,
		systemAdminUsers: users.filter(u => u.role === 'system_admin').length
	};
};