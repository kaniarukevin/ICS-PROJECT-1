import React, { useState, useEffect } from 'react';

const ManageTours = () => {
	const [tours, setTours] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [editingTour, setEditingTour] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [filter, setFilter] = useState('all');
	const [formData, setFormData] = useState({
		title: '', description: '', date: '', duration: '90', maxCapacity: '',
		tourType: 'Physical', meetingPoint: 'Main Reception', highlights: '',
		requirements: '', notes: '', timeSlots: [{ startTime: '' }]
	});

	useEffect(() => {
		fetchTours();
	}, []);

	const fetchTours = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const res = await fetch('http://localhost:5000/api/school-admin/tours', {
				headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
			setTours(data);
		} catch (err) {
			alert('❌ Error fetching tours: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const calculateEndTime = (startTime, duration) => {
		if (!startTime || !duration) return '';
		const [h, m] = startTime.split(':').map(Number);
		const totalMin = h * 60 + m + parseInt(duration);
		const endH = Math.floor(totalMin / 60).toString().padStart(2, '0');
		const endM = (totalMin % 60).toString().padStart(2, '0');
		return `${endH}:${endM}`;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const token = localStorage.getItem('token');
			const method = editingTour ? 'PUT' : 'POST';
			const url = editingTour
				? `http://localhost:5000/api/school-admin/tours/${editingTour._id}`
				: 'http://localhost:5000/api/school-admin/tours';

			const timeSlots = formData.timeSlots
				.filter(slot => slot.startTime)
				.map(slot => ({
					startTime: slot.startTime,
					endTime: calculateEndTime(slot.startTime, formData.duration)
				}));

			const tourData = {
				...formData,
				duration: parseInt(formData.duration),
				maxCapacity: parseInt(formData.maxCapacity),
				timeSlots,
				highlights: formData.highlights.split('\n').filter(h => h.trim()),
				requirements: formData.requirements.split('\n').filter(r => r.trim())
			};

			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(tourData)
			});

			if (!res.ok) throw new Error((await res.json()).message || 'Failed to save tour');

			await fetchTours();
			resetForm();
			alert(editingTour ? '✅ Tour updated!' : '✅ Tour created!');
		} catch (err) {
			alert('❌ Error saving tour: ' + err.message);
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
			duration: tour.duration?.toString() || '90',
			maxCapacity: tour.maxCapacity.toString(),
			tourType: tour.tourType || 'Physical',
			meetingPoint: tour.meetingPoint || 'Main Reception',
			highlights: Array.isArray(tour.highlights) ? tour.highlights.join('\n') : '',
			requirements: Array.isArray(tour.requirements) ? tour.requirements.join('\n') : '',
			notes: tour.notes || '',
			timeSlots: tour.timeSlots?.map(ts => ({ startTime: ts.startTime })) || [{ startTime: '' }]
		});
		setShowForm(true);
	};

	const handleDelete = async (id) => {
		if (!window.confirm('❗ Are you sure you want to delete this tour?')) return;
		try {
			const token = localStorage.getItem('token');
			await fetch(`http://localhost:5000/api/school-admin/tours/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			await fetchTours();
			alert('🗑️ Tour deleted!');
		} catch (err) {
			alert('❌ Error deleting tour: ' + err.message);
		}
	};

	const resetForm = () => {
		setFormData({
			title: '', description: '', date: '', duration: '90', maxCapacity: '',
			tourType: 'Physical', meetingPoint: 'Main Reception', highlights: '',
			requirements: '', notes: '', timeSlots: [{ startTime: '' }]
		});
		setEditingTour(null);
		setShowForm(false);
	};

	const getFilteredTours = () => {
		const now = new Date();
		if (filter === 'active') return tours.filter(t => t.isActive);
		if (filter === 'inactive') return tours.filter(t => !t.isActive);
		if (filter === 'upcoming') return tours.filter(t => new Date(t.date) > now);
		return tours;
	};

	const toggleStatus = async (id, isActive) => {
		try {
			const token = localStorage.getItem('token');
			await fetch(`http://localhost:5000/api/school-admin/tours/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ isActive: !isActive })
			});
			await fetchTours();
		} catch (err) {
			alert('❌ Error updating status: ' + err.message);
		}
	};

	if (loading) {
		return (
			<div className="tours-wrapper">
				<div className="loading-container">⏳ Loading tours...</div>
				<style>{tourStyles}</style>
			</div>
		);
	}

	return (
		<div className="tours-wrapper">
			<div className="tours-container">
				<h2 className="tours-header">Manage School Tours</h2>

				{/* Create Button */}
				<button
					onClick={() => showForm ? resetForm() : setShowForm(true)}
					className={`create-btn ${showForm ? 'cancel' : 'create'}`}
				>
					{showForm ? '✖ Cancel' : '➕ Create New Tour'}
				</button>

				{/* Filter Buttons */}
				<div className="filters">
					{['all', 'active', 'inactive', 'upcoming'].map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`filter-btn ${filter === f ? 'active' : ''}`}
						>
							{f.toUpperCase()} ({getFilteredTours().length})
						</button>
					))}
				</div>

				{/* Tour Form */}
				{showForm && (
					<form onSubmit={handleSubmit} className="tour-form">
						<div className="form-header"></div>
						
						<input
							type="text"
							placeholder="📛 Tour Title"
							value={formData.title}
							required
							onChange={e => setFormData({ ...formData, title: e.target.value })}
							className="form-input"
						/>
						
						<textarea
							placeholder="📝 Tour Description"
							value={formData.description}
							required
							onChange={e => setFormData({ ...formData, description: e.target.value })}
							className="form-textarea"
						/>
						
						<input 
							type="date" 
							value={formData.date} 
							required 
							onChange={e => setFormData({ ...formData, date: e.target.value })} 
							className="form-input"
						/>
						
						<input 
							type="number" 
							placeholder="👥 Maximum Capacity" 
							value={formData.maxCapacity} 
							required 
							onChange={e => setFormData({ ...formData, maxCapacity: e.target.value })} 
							className="form-input"
						/>
						
						<select 
							value={formData.duration} 
							onChange={e => setFormData({ ...formData, duration: e.target.value })} 
							className="form-input"
						>
							<option value="60">⏱️ 60 minutes</option>
							<option value="90">⏱️ 90 minutes</option>
							<option value="120">⏱️ 120 minutes</option>
						</select>

						{/* Time Slots */}
						<label className="form-label">🕒 Time Slots</label>
						{formData.timeSlots.map((slot, i) => (
							<div key={i} className="time-slot">
								<input
									type="time"
									value={slot.startTime}
									required
									onChange={(e) => {
										const updated = [...formData.timeSlots];
										updated[i].startTime = e.target.value;
										setFormData({ ...formData, timeSlots: updated });
									}}
									className="time-input"
								/>
								<span className="time-display">
									➡ Ends at {slot.startTime ? calculateEndTime(slot.startTime, formData.duration) : '--:--'}
								</span>
								{formData.timeSlots.length > 1 && (
									<button 
										type="button" 
										onClick={() => {
											setFormData({ ...formData, timeSlots: formData.timeSlots.filter((_, idx) => idx !== i) });
										}}
										className="remove-btn"
									>
										❌ Remove
									</button>
								)}
							</div>
						))}
						{formData.timeSlots.length < 3 && (
							<button 
								type="button" 
								onClick={() =>
									setFormData({ ...formData, timeSlots: [...formData.timeSlots, { startTime: '' }] })
								}
								className="add-slot-btn"
							>
								➕ Add Time Slot
							</button>
						)}

						<textarea 
							placeholder="Tour Highlights (one per line)" 
							value={formData.highlights} 
							onChange={e => setFormData({ ...formData, highlights: e.target.value })} 
							className="form-textarea"
						/>
						
						<textarea 
							placeholder="Tour Requirements (one per line)" 
							value={formData.requirements} 
							onChange={e => setFormData({ ...formData, requirements: e.target.value })} 
							className="form-textarea"
						/>
						
						<textarea 
							placeholder="📝 Additional Notes" 
							value={formData.notes} 
							onChange={e => setFormData({ ...formData, notes: e.target.value })} 
							className="form-textarea"
						/>

						<button 
							type="submit" 
							disabled={submitting} 
							className="submit-btn"
						>
							{submitting ? '⏳ Saving...' : (editingTour ? '✏️ Update Tour' : '✅ Create Tour')}
						</button>
					</form>
				)}

				{/* Tour Cards */}
				<div className="tours-list">
					{getFilteredTours().map(tour => (
						<div key={tour._id} className="tour-card">
							<h3>{tour.title}</h3>
							<p>{tour.description}</p>
							<div className="tour-details">
								<div>📅 <strong>Date:</strong> {new Date(tour.date).toLocaleDateString()}</div>
								<div><strong>🕒 Time Slots:</strong></div>
								<ul>
									{tour.timeSlots?.map((slot, i) => (
										<li key={i}>{slot.startTime} – {slot.endTime}</li>
									))}
								</ul>
								<div>👥 <strong>Capacity:</strong> {tour.currentBookings || 0}/{tour.maxCapacity} booked</div>
								<div>📍 <strong>Meeting Point:</strong> {tour.meetingPoint}</div>
								<div>🎯 <strong>Type:</strong> {tour.tourType}</div>
								<div className={`status ${tour.isActive ? 'active' : 'inactive'}`}>
									{tour.isActive ? '✅ Active' : '❌ Inactive'}
								</div>
							</div>
							
							<div className="tour-actions">
								<button onClick={() => handleEdit(tour)} className="action-btn edit">✏️ Edit</button>
								<button onClick={() => toggleStatus(tour._id, tour.isActive)} className="action-btn toggle">
									{tour.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
								</button>
								<button onClick={() => handleDelete(tour._id)} className="action-btn delete">🗑️ Delete</button>
							</div>
						</div>
					))}
				</div>

				{getFilteredTours().length === 0 && (
					<div className="empty-state">
						📅 No tours found for the selected filter.
					</div>
				)}
			</div>
			<style>{tourStyles}</style>
		</div>
	);
};

const tourStyles = `
.tours-wrapper { padding: 2rem; background: #f9fafe; min-height: 100vh; font-family: "Segoe UI", sans-serif; }
.tours-container { max-width: 1200px; margin: 0 auto; }
.loading-container { display: flex; justify-content: center; align-items: center; height: 400px; font-size: 1.2rem; color: #666; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.tours-header { font-size: 2.5rem; font-weight: 700; margin-bottom: 2rem; color: #2d2d2d; text-align: center; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.create-btn { padding: 1rem 2rem; border: none; border-radius: 12px; cursor: pointer; margin-bottom: 2rem; font-size: 1.1rem; font-weight: 600; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3); transition: all 0.3s ease; display: flex; align-items: center; gap: 0.5rem; }
.create-btn.create { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; }
.create-btn.cancel { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; }
.create-btn:hover { transform: translateY(-3px); }
.filters { margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; }
.filter-btn { padding: 0.75rem 1.5rem; border: 2px solid #007bff; border-radius: 25px; background: white; color: #007bff; cursor: pointer; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s ease; }
.filter-btn.active { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3); }
.filter-btn:hover { transform: translateY(-2px); }
.tour-form { background: white; padding: 2.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #ddd; box-shadow: 0 8px 25px rgba(0,0,0,0.1); position: relative; }
.form-header { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border-radius: 12px 12px 0 0; }
.form-input, .form-textarea { display: block; width: 100%; margin: 1rem 0; padding: 1rem 1.25rem; border: 2px solid #e1e5e9; border-radius: 10px; font-size: 1rem; font-family: inherit; transition: all 0.3s ease; background: #fafbfc; box-sizing: border-box; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15); background: white; transform: translateY(-2px); }
.form-textarea { resize: vertical; min-height: 100px; }
.form-label { display: block; font-weight: 700; color: #2d2d2d; margin-bottom: 0.5rem; font-size: 1rem; }
.time-slot { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 8px; border: 1px solid rgba(0, 123, 255, 0.2); }
.time-input { width: 150px; margin: 0; }
.time-display { font-weight: 600; color: #2d2d2d; }
.remove-btn { padding: 0.5rem 1rem; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
.add-slot-btn { margin: 1rem 0; padding: 0.75rem 1.25rem; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; }
.submit-btn { padding: 1.25rem 2rem; background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: white; border: none; border-radius: 12px; cursor: pointer; margin-top: 1.5rem; font-size: 1.1rem; font-weight: 700; width: 100%; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); transition: all 0.3s ease; }
.submit-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4); }
.submit-btn:disabled { background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%); cursor: not-allowed; opacity: 0.7; }
.tours-list { display: flex; flex-direction: column; gap: 2rem; }
.tour-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.tour-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.tour-card h3 { font-size: 1.4rem; font-weight: 700; color: #2d2d2d; margin-bottom: 1rem; }
.tour-card p { margin: 0.5rem 0; color: #666; font-size: 0.95rem; line-height: 1.5; }
.tour-details { margin: 1rem 0; font-size: 0.95rem; line-height: 1.5; }
.tour-details div { margin: 0.5rem 0; color: #666; }
.tour-details ul { margin: 0.5rem 0; padding-left: 1.5rem; }
.tour-details li { margin: 0.25rem 0; }
.status.active { color: #28a745; font-weight: 600; }
.status.inactive { color: #dc3545; font-weight: 600; }
.tour-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; }
.action-btn { padding: 0.75rem 1.25rem; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 0.5rem; }
.action-btn.edit { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3); }
.action-btn.toggle { background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%); box-shadow: 0 2px 4px rgba(253, 126, 20, 0.3); }
.action-btn.delete { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3); }
.action-btn:hover { transform: translateY(-2px); }
.empty-state { padding: 4rem 2rem; text-align: center; font-size: 1.2rem; color: #007bff; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
@media (max-width: 768px) {
  .filters { flex-direction: column; }
  .time-slot { flex-direction: column; align-items: stretch; }
  .time-input { width: 100%; }
  .tour-actions { flex-direction: column; }
}
`;

export default ManageTours;