import { useState, useEffect } from 'react';
import { systemAdminService } from '../services/systemAdminService';

export const useSchools = () => {
	const [schools, setSchools] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchSchools = async () => {
		try {
			setLoading(true);
			const data = await systemAdminService.getSchools();
			setSchools(data);
			setError(null);
		} catch (err) {
			setError(err.message);
			console.error('Error fetching schools:', err);
		} finally {
			setLoading(false);
		}
	};

	const approveSchool = async (schoolId) => {
		try {
			await systemAdminService.updateSchoolApproval(schoolId, true);
			await fetchSchools(); // Refresh the list
			return { success: true };
		} catch (err) {
			setError(err.message);
			return { success: false, error: err.message };
		}
	};

	const rejectSchool = async (schoolId) => {
		try {
			await systemAdminService.updateSchoolApproval(schoolId, false);
			await fetchSchools(); // Refresh the list
			return { success: true };
		} catch (err) {
			setError(err.message);
			return { success: false, error: err.message };
		}
	};

	useEffect(() => {
		fetchSchools();
	}, []);

	return {
		schools,
		loading,
		error,
		fetchSchools,
		approveSchool,
		rejectSchool,
		// Computed values
		totalSchools: schools.length,
		approvedSchools: schools.filter(s => s.isApproved).length,
		pendingSchools: schools.filter(s => !s.isApproved).length
	};
};