// frontend/src/components/schooladmin/ManageTours.jsx (Enhanced - Simplified Form)
import React, { useState, useEffect } from 'react';

const ManageTours = () => {
	const [tours, setTours] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [editingTour, setEditingTour] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [filter, setFilter] = useState('all'); // all, active, inactive, upcoming
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		date: '',
		startTime: '',
		maxCapacity: '',
		tourType: 'Physical',
		meetingPoint: 'Main Reception',
		duration: '90',
		highlights: '',
		requirements: '',
		notes: ''
	});

	useEffect(() => {
		fetchTours();
	}, []);

	const fetchTours = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/school-admin/tours', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch tours');
			}

			const data = await response.json();
			setTours(data);
		} catch (error) {
			console.error('Error fetching tours:', error);
			alert('Error fetching tours: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	// Calculate end time from start time + duration
	const calculateEndTime = (startTime, duration) => {
		if (!startTime || !duration) return '';
		
		const [hours, minutes] = startTime.split(':').map(Number);
		const startMinutes = hours * 60 + minutes;
		const endMinutes = startMinutes + parseInt(duration);
		
		const endHours = Math.floor(endMinutes / 60);
		const endMins = endMinutes % 60;
		
		return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const token = localStorage.getItem('token');
			const url = editingTour 
				? `http://localhost:5000/api/school-admin/tours/${editingTour._id}`
				: 'http://localhost:5000/api/school-admin/tours';
			
			const method = editingTour ? 'PUT' : 'POST';
			
			// Prepare data - calculate end time from start time + duration
			const endTime = calculateEndTime(formData.startTime, formData.duration);
			
			const tourData = {
				...formData,
				endTime, // Auto-calculated
				maxCapacity: parseInt(formData.maxCapacity),
				duration: parseInt(formData.duration),
				highlights: formData.highlights.split('\n').filter(h => h.trim()),
				requirements: formData.requirements.split('\n').filter(r => r.trim())
			};
			
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(tourData)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to save tour');
			}

			await fetchTours();
			resetForm();
			alert(editingTour ? 'Tour updated successfully!' : 'Tour created successfully!');
		} catch (error) {
			console.error('Error saving tour:', error);
			alert('Error saving tour: ' + error.message);
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (tour) => {
		setEditingTour(tour);
		setFormData({
			title: tour.title,
			description: tour.description,
			date: tour.date.split('T')[0],
			startTime: tour.startTime,
			maxCapacity: tour.maxCapacity.toString(),
			tourType: tour.tourType || 'Physical',
			meetingPoint: tour.meetingPoint || 'Main Reception',
			duration: tour.duration?.toString() || '90',
			highlights: Array.isArray(tour.highlights) ? tour.highlights.join('\n') : '',
			requirements: Array.isArray(tour.requirements) ? tour.requirements.join('\n') : '',
			notes: tour.notes || ''
		});
		setShowForm(true);
	};

	const handleDelete = async (tourId) => {
		if (window.confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
			try {
				const token = localStorage.getItem('token');
				const response = await fetch(`http://localhost:5000/api/school-admin/tours/${tourId}`, {
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to delete tour');
				}

				await fetchTours();
				alert('Tour deleted successfully!');
			} catch (error) {
				console.error('Error deleting tour:', error);
				alert('Error deleting tour: ' + error.message);
			}
		}
	};

	const toggleTourStatus = async (tourId, currentStatus) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`http://localhost:5000/api/school-admin/tours/${tourId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ isActive: !currentStatus })
			});

			if (!response.ok) {
				throw new Error('Failed to update tour status');
			}

			await fetchTours();
		} catch (error) {
			console.error('Error updating tour status:', error);
			alert('Error updating tour status: ' + error.message);
		}
	};

	const resetForm = () => {
		setFormData({
			title: '',
			description: '',
			date: '',
			startTime: '',
			maxCapacity: '',
			tourType: 'Physical',
			meetingPoint: 'Main Reception',
			duration: '90',
			highlights: '',
			requirements: '',
			notes: ''
		});
		setEditingTour(null);
		setShowForm(false);
	};

	const getFilteredTours = () => {
		const now = new Date();
		
		switch (filter) {
			case 'active':
				return tours.filter(tour => tour.isActive);
			case 'inactive':
				return tours.filter(tour => !tour.isActive);
			case 'upcoming':
				return tours.filter(tour => new Date(tour.date) > now);
			default:
				return tours;
		}
	};

	const getTourStatusColor = (tour) => {
		const now = new Date();
		const tourDate = new Date(tour.date);
		
		if (!tour.isActive) return '#6c757d';
		if (tourDate < now) return '#dc3545';
		if (tour.currentBookings >= tour.maxCapacity) return '#ffc107';
		return '#28a745';
	};

	const getTourStatusText = (tour) => {
		const now = new Date();
		const tourDate = new Date(tour.date);
		
		if (!tour.isActive) return 'Inactive';
		if (tourDate < now) return 'Past';
		if (tour.currentBookings >= tour.maxCapacity) return 'Full';
		return 'Available';
	};

	if (loading) {
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				height: '400px',
				fontSize: '1.1rem'
			}}>
				⏳ Loading tours...
			</div>
		);
	}

	const filteredTours = getFilteredTours();

	return (
		<div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			{/* Header */}
			<div style={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'center',
				marginBottom: '2rem'
			}}>
				<h1 style={{ color: '#333', margin: 0 }}>🎯 Manage Tours</h1>
				<button 
					style={{
						padding: '0.75rem 1.5rem',
						backgroundColor: showForm ? '#dc3545' : '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '6px',
						cursor: 'pointer',
						fontSize: '1rem',
						fontWeight: '500'
					}}
					onClick={() => showForm ? resetForm() : setShowForm(true)}
				>
					{showForm ? '✕ Cancel' : '+ Create New Tour'}
				</button>
			</div>

			{/* Filters */}
			<div style={{ 
				display: 'flex', 
				gap: '1rem', 
				marginBottom: '2rem',
				flexWrap: 'wrap'
			}}>
				{[
					{ key: 'all', label: 'All Tours', count: tours.length },
					{ key: 'active', label: 'Active', count: tours.filter(t => t.isActive).length },
					{ key: 'inactive', label: 'Inactive', count: tours.filter(t => !t.isActive).length },
					{ key: 'upcoming', label: 'Upcoming', count: tours.filter(t => new Date(t.date) > new Date()).length }
				].map(filterOption => (
					<button
						key={filterOption.key}
						onClick={() => setFilter(filterOption.key)}
						style={{
							padding: '0.5rem 1rem',
							border: filter === filterOption.key ? '2px solid #007bff' : '1px solid #ddd',
							borderRadius: '20px',
							backgroundColor: filter === filterOption.key ? '#e3f2fd' : 'white',
							color: filter === filterOption.key ? '#007bff' : '#666',
							cursor: 'pointer',
							fontSize: '0.9rem'
						}}
					>
						{filterOption.label} ({filterOption.count})
					</button>
				))}
			</div>

			{/* Tour Form */}
			{showForm && (
				<div style={{ 
					backgroundColor: 'white', 
					padding: '2rem', 
					borderRadius: '8px',
					border: '1px solid #e0e0e0',
					marginBottom: '2rem'
				}}>
					<h2 style={{ marginBottom: '1.5rem', color: '#333' }}>
						{editingTour ? '✏️ Edit Tour' : '➕ Create New Tour'}
					</h2>
					
					<form onSubmit={handleSubmit}>
						{/* Title and Tour Type */}
						<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
							<input
								type="text"
								placeholder="Tour Title"
								value={formData.title}
								onChange={(e) => setFormData({...formData, title: e.target.value})}
								required
								style={{
									padding: '0.75rem',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '1rem'
								}}
							/>
							
							<select
								value={formData.tourType}
								onChange={(e) => setFormData({...formData, tourType: e.target.value})}
								style={{
									padding: '0.75rem',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '1rem'
								}}
							>
								<option value="Physical">Physical Tour</option>
								<option value="Virtual">Virtual Tour</option>
								<option value="Hybrid">Hybrid Tour</option>
							</select>
						</div>
						
						{/* Description */}
						<textarea
							placeholder="Tour Description"
							value={formData.description}
							onChange={(e) => setFormData({...formData, description: e.target.value})}
							required
							rows="3"
							style={{
								width: '100%',
								padding: '0.75rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem',
								marginBottom: '1rem',
								resize: 'vertical'
							}}
						/>
						
						{/* Date, Start Time, Duration */}
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
									📅 Date
								</label>
								<input
									type="date"
									value={formData.date}
									onChange={(e) => setFormData({...formData, date: e.target.value})}
									required
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
							</div>
							
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
									⏰ Start Time
								</label>
								<input
									type="time"
									value={formData.startTime}
									onChange={(e) => setFormData({...formData, startTime: e.target.value})}
									required
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
							</div>
							
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
									⏱️ Duration (minutes)
								</label>
								<select
									value={formData.duration}
									onChange={(e) => setFormData({...formData, duration: e.target.value})}
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								>
									<option value="60">60 minutes</option>
									<option value="90">90 minutes</option>
									<option value="120">120 minutes</option>
									<option value="150">150 minutes</option>
									<option value="180">180 minutes</option>
								</select>
							</div>
						</div>

						{/* Show calculated end time */}
						{formData.startTime && formData.duration && (
							<div style={{ 
								backgroundColor: '#f8f9fa', 
								padding: '0.75rem', 
								borderRadius: '4px',
								marginBottom: '1rem',
								fontSize: '0.9rem',
								color: '#666'
							}}>
								🕐 Tour will end at: <strong>{calculateEndTime(formData.startTime, formData.duration)}</strong>
							</div>
						)}
						
						{/* Capacity and Meeting Point */}
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
									👥 Max Capacity
								</label>
								<input
									type="number"
									placeholder="e.g., 20"
									value={formData.maxCapacity}
									onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
									required
									min="1"
									max="100"
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
							</div>
							
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
									📍 Meeting Point
								</label>
								<input
									type="text"
									placeholder="e.g., Main Reception, Library Entrance"
									value={formData.meetingPoint}
									onChange={(e) => setFormData({...formData, meetingPoint: e.target.value})}
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem'
									}}
								/>
							</div>
						</div>
						
						{/* Highlights and Requirements */}
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
									✨ Tour Highlights (one per line)
								</label>
								<textarea
									placeholder="e.g., Science Labs&#10;Sports Facilities&#10;Arts Center"
									value={formData.highlights}
									onChange={(e) => setFormData({...formData, highlights: e.target.value})}
									rows="4"
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem',
										resize: 'vertical'
									}}
								/>
							</div>
							
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
									📋 Requirements (one per line)
								</label>
								<textarea
									placeholder="e.g., Wear comfortable shoes&#10;Bring photo ID&#10;Arrive 10 minutes early"
									value={formData.requirements}
									onChange={(e) => setFormData({...formData, requirements: e.target.value})}
									rows="4"
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '1rem',
										resize: 'vertical'
									}}
								/>
							</div>
						</div>
						
						{/* Additional Notes */}
						<div style={{ marginBottom: '1rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
								📝 Additional Notes
							</label>
							<textarea
								placeholder="Any additional information for tour participants..."
								value={formData.notes}
								onChange={(e) => setFormData({...formData, notes: e.target.value})}
								rows="2"
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '1rem',
									resize: 'vertical'
								}}
							/>
						</div>
						
						{/* Submit Buttons */}
						<div style={{ display: 'flex', gap: '1rem' }}>
							<button 
								type="submit" 
								disabled={submitting}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: submitting ? '#ccc' : '#007bff',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: submitting ? 'not-allowed' : 'pointer',
									fontSize: '1rem',
									fontWeight: '500'
								}}
							>
								{submitting ? '⏳ Saving...' : (editingTour ? '✏️ Update Tour' : '➕ Create Tour')}
							</button>
							<button 
								type="button" 
								onClick={resetForm}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '1rem'
								}}
							>
								✕ Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Tours List */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
				gap: '1.5rem'
			}}>
				{filteredTours.length > 0 ? (
					filteredTours.map(tour => (
						<div key={tour._id} style={{ 
							backgroundColor: 'white', 
							padding: '1.5rem', 
							borderRadius: '8px',
							border: '1px solid #e0e0e0',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
						}}>
							<div style={{ 
								display: 'flex', 
								justifyContent: 'space-between', 
								alignItems: 'flex-start',
								marginBottom: '1rem'
							}}>
								<h3 style={{ margin: 0, color: '#333', flex: 1 }}>{tour.title}</h3>
								<span style={{ 
									padding: '0.3rem 0.7rem',
									borderRadius: '12px',
									fontSize: '0.8rem',
									fontWeight: '500',
									backgroundColor: getTourStatusColor(tour) + '20',
									color: getTourStatusColor(tour)
								}}>
									{getTourStatusText(tour)}
								</span>
							</div>
							
							<p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.4' }}>
								{tour.description}
							</p>
							
							<div style={{ 
								display: 'grid', 
								gridTemplateColumns: '1fr 1fr', 
								gap: '0.5rem',
								fontSize: '0.9rem',
								marginBottom: '1rem'
							}}>
								<div><strong>📅 Date:</strong> {new Date(tour.date).toLocaleDateString()}</div>
								<div><strong>⏰ Time:</strong> {tour.startTime} - {tour.endTime}</div>
								<div><strong>👥 Capacity:</strong> {tour.currentBookings}/{tour.maxCapacity}</div>
								<div><strong>⏱️ Duration:</strong> {tour.duration || 90} min</div>
								<div><strong>📍 Meeting:</strong> {tour.meetingPoint}</div>
								<div><strong>🎯 Type:</strong> {tour.tourType}</div>
							</div>

							{tour.highlights && tour.highlights.length > 0 && (
								<div style={{ marginBottom: '1rem' }}>
									<strong style={{ fontSize: '0.9rem' }}>✨ Highlights:</strong>
									<ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
										{tour.highlights.map((highlight, idx) => (
											<li key={idx} style={{ color: '#666' }}>{highlight}</li>
										))}
									</ul>
								</div>
							)}
							
							<div style={{ 
								display: 'flex', 
								gap: '0.5rem', 
								flexWrap: 'wrap'
							}}>
								<button 
									onClick={() => handleEdit(tour)}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: '#17a2b8',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '0.9rem'
									}}
								>
									✏️ Edit
								</button>
								<button 
									onClick={() => toggleTourStatus(tour._id, tour.isActive)}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: tour.isActive ? '#ffc107' : '#28a745',
										color: tour.isActive ? '#000' : 'white',
										border: 'none',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '0.9rem'
									}}
								>
									{tour.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
								</button>
								<button 
									onClick={() => handleDelete(tour._id)}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: '#dc3545',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '0.9rem'
									}}
								>
									🗑️ Delete
								</button>
							</div>
						</div>
					))
				) : (
					<div style={{ 
						gridColumn: '1 / -1',
						textAlign: 'center', 
						padding: '3rem',
						color: '#666'
					}}>
						{filter === 'all' ? (
							<div>
								<h3>No tours created yet</h3>
								<p>Create your first tour to start accepting bookings!</p>
								<button 
									onClick={() => setShowForm(true)}
									style={{
										padding: '0.75rem 1.5rem',
										backgroundColor: '#007bff',
										color: 'white',
										border: 'none',
										borderRadius: '6px',
										cursor: 'pointer',
										fontSize: '1rem',
										marginTop: '1rem'
									}}
								>
									➕ Create Your First Tour
								</button>
							</div>
						) : (
							<div>
								<h3>No {filter} tours found</h3>
								<p>Try adjusting your filter or create a new tour.</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ManageTours;