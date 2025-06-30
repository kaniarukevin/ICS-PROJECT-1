import React, { useState, useEffect } from 'react';

const ManageTours = () => {
	const [tours, setTours] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [editingTour, setEditingTour] = useState(null);
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		date: '',
		startTime: '',
		endTime: '',
		maxCapacity: ''
	});

	useEffect(() => {
		fetchTours();
	}, []);

	const fetchTours = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/school-admin/tours', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			setTours(data);
		} catch (error) {
			console.error('Error fetching tours:', error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			const url = editingTour 
				? `/api/school-admin/tours/${editingTour._id}`
				: '/api/school-admin/tours';
			
			const method = editingTour ? 'PUT' : 'POST';
			
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				fetchTours();
				resetForm();
				alert(editingTour ? 'Tour updated!' : 'Tour created!');
			}
		} catch (error) {
			console.error('Error saving tour:', error);
		}
	};

	const handleEdit = (tour) => {
		setEditingTour(tour);
		setFormData({
			title: tour.title,
			description: tour.description,
			date: tour.date.split('T')[0],
			startTime: tour.startTime,
			endTime: tour.endTime,
			maxCapacity: tour.maxCapacity
		});
		setShowForm(true);
	};

	const handleDelete = async (tourId) => {
		if (window.confirm('Are you sure you want to delete this tour?')) {
			try {
				const token = localStorage.getItem('token');
				const response = await fetch(`/api/school-admin/tours/${tourId}`, {
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});

				if (response.ok) {
					fetchTours();
					alert('Tour deleted!');
				}
			} catch (error) {
				console.error('Error deleting tour:', error);
			}
		}
	};

	const resetForm = () => {
		setFormData({
			title: '',
			description: '',
			date: '',
			startTime: '',
			endTime: '',
			maxCapacity: ''
		});
		setEditingTour(null);
		setShowForm(false);
	};

	return (
		<div className="manage-tours">
			<div className="header">
				<h1>Manage Tours</h1>
				<button 
					className="btn-primary"
					onClick={() => setShowForm(!showForm)}
				>
					{showForm ? 'Cancel' : 'Create New Tour'}
				</button>
			</div>

			{showForm && (
				<div className="tour-form">
					<h2>{editingTour ? 'Edit Tour' : 'Create New Tour'}</h2>
					<form onSubmit={handleSubmit}>
						<input
							type="text"
							placeholder="Tour Title"
							value={formData.title}
							onChange={(e) => setFormData({...formData, title: e.target.value})}
							required
						/>
						
						<textarea
							placeholder="Tour Description"
							value={formData.description}
							onChange={(e) => setFormData({...formData, description: e.target.value})}
							required
						/>
						
						<input
							type="date"
							value={formData.date}
							onChange={(e) => setFormData({...formData, date: e.target.value})}
							required
						/>
						
						<input
							type="time"
							placeholder="Start Time"
							value={formData.startTime}
							onChange={(e) => setFormData({...formData, startTime: e.target.value})}
							required
						/>
						
						<input
							type="time"
							placeholder="End Time"
							value={formData.endTime}
							onChange={(e) => setFormData({...formData, endTime: e.target.value})}
							required
						/>
						
						<input
							type="number"
							placeholder="Max Capacity"
							value={formData.maxCapacity}
							onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
							required
						/>
						
						<div className="form-buttons">
							<button type="submit" className="btn-primary">
								{editingTour ? 'Update Tour' : 'Create Tour'}
							</button>
							<button type="button" onClick={resetForm} className="btn-secondary">
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			<div className="tours-list">
				{tours.map(tour => (
					<div key={tour._id} className="tour-card">
						<h3>{tour.title}</h3>
						<p>{tour.description}</p>
						<div className="tour-details">
							<p><strong>Date:</strong> {new Date(tour.date).toLocaleDateString()}</p>
							<p><strong>Time:</strong> {tour.startTime} - {tour.endTime}</p>
							<p><strong>Capacity:</strong> {tour.currentBookings}/{tour.maxCapacity}</p>
							<p><strong>Status:</strong> {tour.isActive ? 'Active' : 'Inactive'}</p>
						</div>
						<div className="tour-actions">
							<button onClick={() => handleEdit(tour)} className="btn-secondary">
								Edit
							</button>
							<button onClick={() => handleDelete(tour._id)} className="btn-danger">
								Delete
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ManageTours;