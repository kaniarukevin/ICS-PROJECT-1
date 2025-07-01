// frontend/src/hooks/useTours.js
import { useState, useEffect, useCallback } from 'react';
import { toursService } from '../services/schoolAdminService';

export const useTours = () => {
	const [tours, setTours] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch tours
	const fetchTours = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await toursService.getTours();
			setTours(data);
		} catch (err) {
			setError(err.message);
			console.error('Error fetching tours:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	// Create tour
	const createTour = useCallback(async (tourData) => {
		try {
			setError(null);
			const newTour = await toursService.createTour(tourData);
			setTours(prev => [newTour, ...prev]);
			return { success: true, data: newTour };
		} catch (err) {
			setError(err.message);
			console.error('Error creating tour:', err);
			return { success: false, error: err.message };
		}
	}, []);

	// Update tour
	const updateTour = useCallback(async (tourId, tourData) => {
		try {
			setError(null);
			const updatedTour = await toursService.updateTour(tourId, tourData);
			setTours(prev => prev.map(tour => 
				tour._id === tourId ? updatedTour : tour
			));
			return { success: true, data: updatedTour };
		} catch (err) {
			setError(err.message);
			console.error('Error updating tour:', err);
			return { success: false, error: err.message };
		}
	}, []);

	// Delete tour
	const deleteTour = useCallback(async (tourId) => {
		try {
			setError(null);
			await toursService.deleteTour(tourId);
			setTours(prev => prev.filter(tour => tour._id !== tourId));
			return { success: true };
		} catch (err) {
			setError(err.message);
			console.error('Error deleting tour:', err);
			return { success: false, error: err.message };
		}
	}, []);

	// Toggle tour status
	const toggleTourStatus = useCallback(async (tourId, isActive) => {
		try {
			setError(null);
			const updatedTour = await toursService.toggleTourStatus(tourId, isActive);
			setTours(prev => prev.map(tour => 
				tour._id === tourId ? { ...tour, isActive } : tour
			));
			return { success: true, data: updatedTour };
		} catch (err) {
			setError(err.message);
			console.error('Error toggling tour status:', err);
			return { success: false, error: err.message };
		}
	}, []);

	// Get filtered tours
	const getFilteredTours = useCallback((filter) => {
		const now = new Date();
		
		switch (filter) {
			case 'active':
				return tours.filter(tour => tour.isActive);
			case 'inactive':
				return tours.filter(tour => !tour.isActive);
			case 'upcoming':
				return tours.filter(tour => new Date(tour.date) > now);
			case 'past':
				return tours.filter(tour => new Date(tour.date) < now);
			case 'full':
				return tours.filter(tour => tour.currentBookings >= tour.maxCapacity);
			case 'available':
				return tours.filter(tour => 
					tour.isActive && 
					new Date(tour.date) > now && 
					tour.currentBookings < tour.maxCapacity
				);
			default:
				return tours;
		}
	}, [tours]);

	// Get tour statistics
	const getTourStats = useCallback(() => {
		const now = new Date();
		return {
			total: tours.length,
			active: tours.filter(t => t.isActive).length,
			inactive: tours.filter(t => !t.isActive).length,
			upcoming: tours.filter(t => new Date(t.date) > now).length,
			past: tours.filter(t => new Date(t.date) < now).length,
			full: tours.filter(t => t.currentBookings >= t.maxCapacity).length,
			totalBookings: tours.reduce((sum, t) => sum + (t.currentBookings || 0), 0),
			totalCapacity: tours.reduce((sum, t) => sum + (t.maxCapacity || 0), 0)
		};
	}, [tours]);

	// Find tour by ID
	const findTourById = useCallback((tourId) => {
		return tours.find(tour => tour._id === tourId);
	}, [tours]);

	// Get tours happening today
	const getTodaysTours = useCallback(() => {
		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];
		
		return tours.filter(tour => {
			const tourDate = new Date(tour.date);
			const tourDateStr = tourDate.toISOString().split('T')[0];
			return tourDateStr === todayStr && tour.isActive;
		});
	}, [tours]);

	// Get tours for the next week
	const getUpcomingWeekTours = useCallback(() => {
		const now = new Date();
		const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
		
		return tours.filter(tour => {
			const tourDate = new Date(tour.date);
			return tourDate >= now && tourDate <= nextWeek && tour.isActive;
		}).sort((a, b) => new Date(a.date) - new Date(b.date));
	}, [tours]);

	// Initial load
	useEffect(() => {
		fetchTours();
	}, [fetchTours]);

	return {
		// Data
		tours,
		loading,
		error,
		
		// Actions
		fetchTours,
		createTour,
		updateTour,
		deleteTour,
		toggleTourStatus,
		
		// Utilities
		getFilteredTours,
		getTourStats,
		findTourById,
		getTodaysTours,
		getUpcomingWeekTours,
		
		// Clear error
		clearError: () => setError(null)
	};
};