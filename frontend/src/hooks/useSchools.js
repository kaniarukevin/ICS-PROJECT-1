// frontend/src/hooks/useSchool.js
import { useState, useEffect, useCallback } from 'react';
import { schoolService } from '../services/schoolAdminService';

export const useSchool = () => {
	const [school, setSchool] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [saving, setSaving] = useState(false);

	// Fetch school profile
	const fetchSchoolProfile = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await schoolService.getSchoolProfile();
			setSchool(data);
		} catch (err) {
			setError(err.message);
			console.error('Error fetching school profile:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	// Update school profile
	const updateSchoolProfile = useCallback(async (schoolData) => {
		try {
			setSaving(true);
			setError(null);
			const updatedSchool = await schoolService.updateSchoolProfile(schoolData);
			setSchool(updatedSchool);
			return { success: true, data: updatedSchool };
		} catch (err) {
			setError(err.message);
			console.error('Error updating school profile:', err);
			return { success: false, error: err.message };
		} finally {
			setSaving(false);
		}
	}, []);

	// Add facility
	const addFacility = useCallback((facility) => {
		if (!school) return;
		
		const updatedFacilities = [...(school.facilities || []), facility];
		setSchool(prev => ({
			...prev,
			facilities: updatedFacilities
		}));
	}, [school]);

	// Remove facility
	const removeFacility = useCallback((index) => {
		if (!school || !school.facilities) return;
		
		const updatedFacilities = school.facilities.filter((_, i) => i !== index);
		setSchool(prev => ({
			...prev,
			facilities: updatedFacilities
		}));
	}, [school]);

	// Update facility
	const updateFacility = useCallback((index, updatedFacility) => {
		if (!school || !school.facilities) return;
		
		const updatedFacilities = school.facilities.map((facility, i) => 
			i === index ? updatedFacility : facility
		);
		setSchool(prev => ({
			...prev,
			facilities: updatedFacilities
		}));
	}, [school]);

	// Add curriculum
	const addCurriculum = useCallback((curriculum) => {
		if (!school || school.curriculum?.includes(curriculum)) return;
		
		const updatedCurriculum = [...(school.curriculum || []), curriculum];
		setSchool(prev => ({
			...prev,
			curriculum: updatedCurriculum
		}));
	}, [school]);

	// Remove curriculum
	const removeCurriculum = useCallback((index) => {
		if (!school || !school.curriculum) return;
		
		const updatedCurriculum = school.curriculum.filter((_, i) => i !== index);
		setSchool(prev => ({
			...prev,
			curriculum: updatedCurriculum
		}));
	}, [school]);

	// Add time slot
	const addTimeSlot = useCallback((timeSlot) => {
		if (!school) return;
		
		const updatedTimeSlots = [...(school.tourSchedule?.timeSlots || []), timeSlot];
		setSchool(prev => ({
			...prev,
			tourSchedule: {
				...prev.tourSchedule,
				timeSlots: updatedTimeSlots
			}
		}));
	}, [school]);

	// Remove time slot
	const removeTimeSlot = useCallback((index) => {
		if (!school || !school.tourSchedule?.timeSlots) return;
		
		const updatedTimeSlots = school.tourSchedule.timeSlots.filter((_, i) => i !== index);
		setSchool(prev => ({
			...prev,
			tourSchedule: {
				...prev.tourSchedule,
				timeSlots: updatedTimeSlots
			}
		}));
	}, [school]);

	// Toggle available day
	const toggleAvailableDay = useCallback((day) => {
		if (!school) return;
		
		const currentDays = school.tourSchedule?.availableDays || [];
		const updatedDays = currentDays.includes(day)
			? currentDays.filter(d => d !== day)
			: [...currentDays, day];
		
		setSchool(prev => ({
			...prev,
			tourSchedule: {
				...prev.tourSchedule,
				availableDays: updatedDays
			}
		}));
	}, [school]);

	// Update contact information
	const updateContact = useCallback((contactData) => {
		if (!school) return;
		
		setSchool(prev => ({
			...prev,
			contact: {
				...prev.contact,
				...contactData
			}
		}));
	}, [school]);

	// Update fee structure
	const updateFees = useCallback((feeData) => {
		if (!school) return;
		
		setSchool(prev => ({
			...prev,
			fees: {
				...prev.fees,
				...feeData
			}
		}));
	}, [school]);

	// Get school statistics
	const getSchoolStats = useCallback(() => {
		if (!school) return null;

		return {
			hasDescription: !!school.description,
			facilitiesCount: school.facilities?.length || 0,
			curriculumCount: school.curriculum?.length || 0,
			hasContactInfo: !!(school.contact?.phone && school.contact?.email),
			hasFeeStructure: !!(school.fees?.tuition?.minAmount || school.fees?.tuition?.maxAmount),
			hasTimeSlots: school.tourSchedule?.timeSlots?.length || 0,
			availableDaysCount: school.tourSchedule?.availableDays?.length || 0,
			isVerified: school.isVerified,
			profileCompleteness: calculateProfileCompleteness(school)
		};
	}, [school]);

	// Calculate profile completeness percentage
	const calculateProfileCompleteness = useCallback((schoolData) => {
		if (!schoolData) return 0;

		const fields = [
			schoolData.description,
			schoolData.contact?.phone,
			schoolData.contact?.email,
			schoolData.facilities?.length > 0,
			schoolData.curriculum?.length > 0,
			schoolData.fees?.tuition?.minAmount || schoolData.fees?.tuition?.maxAmount,
			schoolData.tourSchedule?.timeSlots?.length > 0,
			schoolData.tourSchedule?.availableDays?.length > 0
		];

		const completedFields = fields.filter(Boolean).length;
		return Math.round((completedFields / fields.length) * 100);
	}, []);

	// Validate school data before saving
	const validateSchoolData = useCallback((schoolData) => {
		const errors = [];

		// Required fields validation
		if (!schoolData.description?.trim()) {
			errors.push('School description is required');
		}

		if (!schoolData.contact?.email?.trim()) {
			errors.push('Contact email is required');
		}

		if (!schoolData.contact?.phone?.trim()) {
			errors.push('Contact phone number is required');
		}

		// Email format validation
		if (schoolData.contact?.email && !/\S+@\S+\.\S+/.test(schoolData.contact.email)) {
			errors.push('Please enter a valid email address');
		}

		// Phone format validation (basic)
		if (schoolData.contact?.phone && !/^\+?[\d\s\-\(\)]+$/.test(schoolData.contact.phone)) {
			errors.push('Please enter a valid phone number');
		}

		// Fee validation
		if (schoolData.fees?.tuition?.minAmount && schoolData.fees?.tuition?.maxAmount) {
			const min = parseFloat(schoolData.fees.tuition.minAmount);
			const max = parseFloat(schoolData.fees.tuition.maxAmount);
			
			if (min >= max) {
				errors.push('Maximum fee must be greater than minimum fee');
			}
		}

		// Time slots validation
		if (schoolData.tourSchedule?.timeSlots) {
			schoolData.tourSchedule.timeSlots.forEach((slot, index) => {
				if (slot.startTime && slot.endTime) {
					const start = new Date(`2000-01-01T${slot.startTime}`);
					const end = new Date(`2000-01-01T${slot.endTime}`);
					
					if (end <= start) {
						errors.push(`Time slot ${index + 1}: End time must be after start time`);
					}
				}
			});
		}

		return errors;
	}, []);

	// Reset school data to original
	const resetSchoolData = useCallback(() => {
		fetchSchoolProfile();
	}, [fetchSchoolProfile]);

	// Initial load
	useEffect(() => {
		fetchSchoolProfile();
	}, [fetchSchoolProfile]);

	return {
		// Data
		school,
		loading,
		error,
		saving,

		// Actions
		fetchSchoolProfile,
		updateSchoolProfile,
		resetSchoolData,

		// Facility management
		addFacility,
		removeFacility,
		updateFacility,

		// Curriculum management
		addCurriculum,
		removeCurriculum,

		// Time slot management
		addTimeSlot,
		removeTimeSlot,
		toggleAvailableDay,

		// Data updates
		updateContact,
		updateFees,

		// Utilities
		getSchoolStats,
		validateSchoolData,
		calculateProfileCompleteness,

		// Clear error
		clearError: () => setError(null)
	};
};