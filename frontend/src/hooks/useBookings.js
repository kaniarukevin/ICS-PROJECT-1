// frontend/src/hooks/useBookings.js
import { useState, useEffect, useCallback } from 'react';
import { bookingsService } from '../services/schoolAdminService';

export const useBookings = (initialFilters = {}) => {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState(initialFilters);

	// Fetch bookings
	const fetchBookings = useCallback(async (customFilters = null) => {
		try {
			setLoading(true);
			setError(null);
			const filtersToUse = customFilters || filters;
			const data = await bookingsService.getBookings(filtersToUse);
			setBookings(data);
		} catch (err) {
			setError(err.message);
			console.error('Error fetching bookings:', err);
		} finally {
			setLoading(false);
		}
	}, [filters]);

	// Update booking status
	const updateBookingStatus = useCallback(async (bookingId, status, adminNotes = '') => {
		try {
			setError(null);
			const updatedBooking = await bookingsService.updateBookingStatus(bookingId, status, adminNotes);
			setBookings(prev => prev.map(booking => 
				booking._id === bookingId ? updatedBooking : booking
			));
			return { success: true, data: updatedBooking };
		} catch (err) {
			setError(err.message);
			console.error('Error updating booking status:', err);
			return { success: false, error: err.message };
		}
	}, []);

	// Batch update multiple bookings
	const batchUpdateBookings = useCallback(async (bookingIds, status, adminNotes = '') => {
		try {
			setError(null);
			const results = await Promise.allSettled(
				bookingIds.map(id => bookingsService.updateBookingStatus(id, status, adminNotes))
			);
			
			// Update successful bookings in state
			results.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					setBookings(prev => prev.map(booking => 
						booking._id === bookingIds[index] ? result.value : booking
					));
				}
			});

			const successful = results.filter(r => r.status === 'fulfilled').length;
			const failed = results.filter(r => r.status === 'rejected').length;

			return { 
				success: failed === 0, 
				successful, 
				failed,
				total: bookingIds.length 
			};
		} catch (err) {
			setError(err.message);
			console.error('Error batch updating bookings:', err);
			return { success: false, error: err.message };
		}
	}, []);

	// Get filtered bookings
	const getFilteredBookings = useCallback((customFilters = {}) => {
		let filtered = [...bookings];

		// Apply status filter
		if (customFilters.status && customFilters.status !== 'all') {
			filtered = filtered.filter(booking => booking.status === customFilters.status);
		}

		// Apply tour filter
		if (customFilters.tourId && customFilters.tourId !== 'all') {
			filtered = filtered.filter(booking => booking.tourId?._id === customFilters.tourId);
		}

		// Apply date range filter
		if (customFilters.startDate) {
			const startDate = new Date(customFilters.startDate);
			filtered = filtered.filter(booking => new Date(booking.createdAt) >= startDate);
		}

		if (customFilters.endDate) {
			const endDate = new Date(customFilters.endDate);
			filtered = filtered.filter(booking => new Date(booking.createdAt) <= endDate);
		}

		// Apply search filter (student name, parent email, etc.)
		if (customFilters.search) {
			const searchLower = customFilters.search.toLowerCase();
			filtered = filtered.filter(booking => 
				booking.studentName.toLowerCase().includes(searchLower) ||
				booking.parentEmail.toLowerCase().includes(searchLower) ||
				booking.parentPhone.includes(searchLower) ||
				booking.tourId?.title?.toLowerCase().includes(searchLower)
			);
		}

		// Sort by creation date (newest first) by default
		filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		return filtered;
	}, [bookings]);

	// Get booking statistics
	const getBookingStats = useCallback(() => {
		const stats = {
			total: bookings.length,
			pending: 0,
			confirmed: 0,
			cancelled: 0,
			completed: 0,
			'no-show': 0,
			totalGuests: 0,
			todaysBookings: 0,
			thisWeekBookings: 0,
			thisMonthBookings: 0
		};

		const now = new Date();
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 24 * 60 * 60 * 1000);
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

		bookings.forEach(booking => {
			// Count by status
			if (stats.hasOwnProperty(booking.status)) {
				stats[booking.status]++;
			}

			// Count total guests
			stats.totalGuests += booking.numberOfGuests || 1;

			// Count by time periods
			const bookingDate = new Date(booking.createdAt);
			
			if (bookingDate >= todayStart) {
				stats.todaysBookings++;
			}
			
			if (bookingDate >= weekStart) {
				stats.thisWeekBookings++;
			}
			
			if (bookingDate >= monthStart) {
				stats.thisMonthBookings++;
			}
		});

		return stats;
	}, [bookings]);

	// Get bookings by tour
	const getBookingsByTour = useCallback(() => {
		const tourBookings = {};
		
		bookings.forEach(booking => {
			const tourId = booking.tourId?._id;
			const tourTitle = booking.tourId?.title || 'Unknown Tour';
			
			if (!tourBookings[tourId]) {
				tourBookings[tourId] = {
					tourId,
					tourTitle,
					total: 0,
					confirmed: 0,
					pending: 0,
					cancelled: 0,
					completed: 0,
					totalGuests: 0,
					bookings: []
				};
			}
			
			const tourData = tourBookings[tourId];
			tourData.total++;
			tourData.totalGuests += booking.numberOfGuests || 1;
			tourData[booking.status]++;
			tourData.bookings.push(booking);
		});

		return Object.values(tourBookings);
	}, [bookings]);

	// Get recent bookings
	const getRecentBookings = useCallback((limit = 10) => {
		return [...bookings]
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(0, limit);
	}, [bookings]);

	// Get upcoming tour bookings
	const getUpcomingBookings = useCallback(() => {
		const now = new Date();
		return bookings
			.filter(booking => {
				const tourDate = booking.tourId?.date;
				return tourDate && new Date(tourDate) > now && booking.status !== 'cancelled';
			})
			.sort((a, b) => new Date(a.tourId.date) - new Date(b.tourId.date));
	}, [bookings]);

	// Find booking by ID
	const findBookingById = useCallback((bookingId) => {
		return bookings.find(booking => booking._id === bookingId);
	}, [bookings]);

	// Update filters and refresh data
	const updateFilters = useCallback((newFilters) => {
		setFilters(prev => ({ ...prev, ...newFilters }));
	}, []);

	// Clear filters
	const clearFilters = useCallback(() => {
		setFilters({});
	}, []);

	// Export bookings data
	const exportBookings = useCallback((format = 'csv', customFilters = null) => {
		const dataToExport = getFilteredBookings(customFilters || filters);
		
		if (format === 'csv') {
			const headers = [
				'Booking ID',
				'Student Name',
				'Student Age',
				'Parent Email',
				'Parent Phone',
				'Tour Title',
				'Tour Date',
				'Number of Guests',
				'Status',
				'Booking Date',
				'Special Requests'
			];

			const csvData = dataToExport.map(booking => [
				booking._id,
				booking.studentName,
				booking.studentAge,
				booking.parentEmail,
				booking.parentPhone,
				booking.tourId?.title || 'N/A',
				booking.tourId?.date ? new Date(booking.tourId.date).toLocaleDateString() : 'N/A',
				booking.numberOfGuests,
				booking.status,
				new Date(booking.createdAt).toLocaleDateString(),
				booking.specialRequests || ''
			]);

			return {
				headers,
				data: csvData,
				filename: `bookings_export_${new Date().toISOString().split('T')[0]}.csv`
			};
		}

		return dataToExport;
	}, [getFilteredBookings, filters]);

	// Initial load
	useEffect(() => {
		fetchBookings();
	}, [fetchBookings]);

	// Refresh when filters change
	useEffect(() => {
		if (Object.keys(filters).length > 0) {
			fetchBookings();
		}
	}, [filters, fetchBookings]);

	return {
		// Data
		bookings,
		loading,
		error,
		filters,

		// Actions
		fetchBookings,
		updateBookingStatus,
		batchUpdateBookings,
		updateFilters,
		clearFilters,

		// Utilities
		getFilteredBookings,
		getBookingStats,
		getBookingsByTour,
		getRecentBookings,
		getUpcomingBookings,
		findBookingById,
		exportBookings,

		// Clear error
		clearError: () => setError(null)
	};
};