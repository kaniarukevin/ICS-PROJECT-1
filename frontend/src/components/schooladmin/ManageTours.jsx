import React, { useState, useEffect } from 'react';

const ManageTours = () => {
	const [tours, setTours] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [editingTour, setEditingTour] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [filter, setFilter] = useState('all');
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		date: '',
		duration: '90',
		maxCapacity: '',
		tourType: 'Physical',
		meetingPoint: 'Main Reception',
		highlights: '',
		requirements: '',
		notes: '',
		timeSlots: [{ startTime: '' }]
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
			title: '',
			description: '',
			date: '',
			duration: '90',
			maxCapacity: '',
			tourType: 'Physical',
			meetingPoint: 'Main Reception',
			highlights: '',
			requirements: '',
			notes: '',
			timeSlots: [{ startTime: '' }]
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

	if (loading) return <div style={{ padding: '2rem' }}>⏳ Loading tours...</div>;

	return (
		<div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			<h2 style={{ marginBottom: '1rem', color: '#333' }}>🎯 Manage School Tours</h2>

			{/* Create Button */}
			<button
				onClick={() => showForm ? resetForm() : setShowForm(true)}
				style={{
					backgroundColor: showForm ? '#dc3545' : '#007bff',
					color: 'white',
					padding: '0.6rem 1.2rem',
					border: 'none',
					borderRadius: '6px',
					cursor: 'pointer',
					marginBottom: '1.5rem'
				}}
			>
				{showForm ? '✖ Cancel' : '➕ Create New Tour'}
			</button>

			{/* Filter Buttons */}
			<div style={{ marginBottom: '1.5rem' }}>
				{['all', 'active', 'inactive', 'upcoming'].map((f) => (
					<button
						key={f}
						onClick={() => setFilter(f)}
						style={{
							marginRight: '1rem',
							padding: '0.5rem 1rem',
							border: '1px solid #ccc',
							borderRadius: '20px',
							backgroundColor: filter === f ? '#007bff' : 'white',
							color: filter === f ? 'white' : '#333',
							cursor: 'pointer',
							fontWeight: filter === f ? 'bold' : 'normal'
						}}
					>
						{f.toUpperCase()}
					</button>
				))}
			</div>

			{/* Tour Form */}
			{showForm && (
				<form onSubmit={handleSubmit} style={{ background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #ccc' }}>
					<input
						type="text"
						placeholder="📛 Title"
						value={formData.title}
						required
						onChange={e => setFormData({ ...formData, title: e.target.value })}
						style={inputStyle}
					/>
					<textarea
						placeholder="📝 Description"
						value={formData.description}
						required
						onChange={e => setFormData({ ...formData, description: e.target.value })}
						style={textAreaStyle}
					/>
					<input type="date" value={formData.date} required onChange={e => setFormData({ ...formData, date: e.target.value })} style={inputStyle} />
					<input type="number" placeholder="👥 Max Capacity" value={formData.maxCapacity} required onChange={e => setFormData({ ...formData, maxCapacity: e.target.value })} style={inputStyle} />
					<select value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} style={inputStyle}>
						<option value="60">⏱️ 60 minutes</option>
						<option value="90">⏱️ 90 minutes</option>
						<option value="120">⏱️ 120 minutes</option>
					</select>

					{/* Time Slots */}
					<label><strong>🕒 Time Slots</strong></label>
					{formData.timeSlots.map((slot, i) => (
						<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
							<input
								type="time"
								value={slot.startTime}
								required
								onChange={(e) => {
									const updated = [...formData.timeSlots];
									updated[i].startTime = e.target.value;
									setFormData({ ...formData, timeSlots: updated });
								}}
								style={{ ...inputStyle, width: '150px' }}
							/>
							<span>➡ Ends at {slot.startTime ? calculateEndTime(slot.startTime, formData.duration) : '--:--'}</span>
							{formData.timeSlots.length > 1 && (
								<button type="button" onClick={() => {
									setFormData({ ...formData, timeSlots: formData.timeSlots.filter((_, idx) => idx !== i) });
								}}>❌ Remove</button>
							)}
						</div>
					))}
					{formData.timeSlots.length < 3 && (
						<button type="button" onClick={() =>
							setFormData({ ...formData, timeSlots: [...formData.timeSlots, { startTime: '' }] })
						}>➕ Add Slot</button>
					)}

					<textarea placeholder="✨ Highlights (one per line)" value={formData.highlights} onChange={e => setFormData({ ...formData, highlights: e.target.value })} style={textAreaStyle} />
					<textarea placeholder="📋 Requirements (one per line)" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} style={textAreaStyle} />
					<textarea placeholder="📝 Notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={textAreaStyle} />

					<button type="submit" disabled={submitting} style={submitBtn}>
						{submitting ? '⏳ Saving...' : (editingTour ? '✏️ Update Tour' : '✅ Create Tour')}
					</button>
				</form>
			)}

			{/* Tour Cards */}
			{getFilteredTours().map(tour => (
				<div key={tour._id} style={{ background: 'white', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
					<h3>{tour.title}</h3>
					<p>{tour.description}</p>
					<p>📅 {new Date(tour.date).toLocaleDateString()}</p>
					<p>🕒 Slots:</p>
					<ul>
						{tour.timeSlots?.map((slot, i) => (
							<li key={i}>{slot.startTime} – {slot.endTime}</li>
						))}
					</ul>
					<p>👥 {tour.currentBookings}/{tour.maxCapacity}</p>
					<p>📍 {tour.meetingPoint}</p>
					<p>🎯 Type: {tour.tourType}</p>
					<div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
						<button onClick={() => handleEdit(tour)}>✏️ Edit</button>
						<button onClick={() => toggleStatus(tour._id, tour.isActive)}>
							{tour.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
						</button>
						<button onClick={() => handleDelete(tour._id)}>🗑️ Delete</button>
					</div>
				</div>
			))}
		</div>
	);
};

// Inlined styles
const inputStyle = {
	display: 'block',
	width: '100%',
	margin: '0.5rem 0',
	padding: '0.6rem',
	border: '1px solid #ccc',
	borderRadius: '4px'
};

const textAreaStyle = {
	...inputStyle,
	resize: 'vertical',
	minHeight: '60px'
};

const submitBtn = {
	padding: '0.75rem 1.5rem',
	backgroundColor: '#28a745',
	color: 'white',
	border: 'none',
	borderRadius: '6px',
	cursor: 'pointer',
	marginTop: '1rem'
};

export default ManageTours;
