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

	// Theme colors - Blue scheme
	const colors = {
		primaryBlue: '#007bff',
		darkBlue: '#0056b3',
		lightBlue: '#e3f2fd',
		successGreen: '#28a745',
		dangerRed: '#dc3545',
		warningOrange: '#fd7e14',
		darkGray: '#2d2d2d',
		lightGray: '#f8f9fa',
		white: '#ffffff',
		borderGray: '#ddd'
	};

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

	// Styling objects
	const wrapperStyle = {
		padding: '2rem',
		backgroundColor: '#f9fafe',
		minHeight: '100vh',
		fontFamily: '"Segoe UI", sans-serif'
	};

	const containerStyle = {
		maxWidth: '1200px',
		margin: '0 auto'
	};

	const headerStyle = {
		fontSize: '2.5rem',
		fontWeight: '700',
		marginBottom: '2rem',
		color: colors.darkGray,
		textAlign: 'center',
		background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text'
	};

	const createButtonStyle = {
		background: showForm 
			? `linear-gradient(135deg, ${colors.dangerRed} 0%, #c82333 100%)`
			: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
		color: colors.white,
		padding: '1rem 2rem',
		border: 'none',
		borderRadius: '12px',
		cursor: 'pointer',
		marginBottom: '2rem',
		fontSize: '1.1rem',
		fontWeight: '600',
		boxShadow: showForm 
			? '0 4px 15px rgba(220, 53, 69, 0.3)'
			: '0 4px 15px rgba(0, 123, 255, 0.3)',
		transition: 'all 0.3s ease',
		display: 'flex',
		alignItems: 'center',
		gap: '0.5rem'
	};

	const filterContainerStyle = {
		marginBottom: '2rem',
		display: 'flex',
		gap: '1rem',
		flexWrap: 'wrap'
	};

	const getFilterButtonStyle = (f) => ({
		padding: '0.75rem 1.5rem',
		border: filter === f ? 'none' : `2px solid ${colors.primaryBlue}`,
		borderRadius: '25px',
		background: filter === f 
			? `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`
			: colors.white,
		color: filter === f ? colors.white : colors.primaryBlue,
		cursor: 'pointer',
		fontWeight: filter === f ? '700' : '600',
		fontSize: '0.9rem',
		textTransform: 'uppercase',
		letterSpacing: '0.5px',
		transition: 'all 0.3s ease',
		boxShadow: filter === f 
			? '0 4px 15px rgba(0, 123, 255, 0.3)'
			: '0 2px 4px rgba(0,0,0,0.1)'
	});

	const formStyle = {
		background: colors.white,
		padding: '2.5rem',
		borderRadius: '12px',
		marginBottom: '2rem',
		border: `1px solid ${colors.borderGray}`,
		boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
		position: 'relative'
	};

	const formHeaderStyle = {
		position: 'absolute',
		top: '0',
		left: '0',
		right: '0',
		height: '4px',
		background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
		borderRadius: '12px 12px 0 0'
	};

	const inputStyle = {
		display: 'block',
		width: '100%',
		margin: '1rem 0',
		padding: '1rem 1.25rem',
		border: `2px solid #e1e5e9`,
		borderRadius: '10px',
		fontSize: '1rem',
		fontFamily: 'inherit',
		transition: 'all 0.3s ease',
		background: '#fafbfc',
		boxSizing: 'border-box'
	};

	const inputFocusStyle = {
		outline: 'none',
		borderColor: colors.primaryBlue,
		boxShadow: `0 0 0 4px rgba(0, 123, 255, 0.15)`,
		background: colors.white,
		transform: 'translateY(-2px)'
	};

	const textAreaStyle = {
		...inputStyle,
		resize: 'vertical',
		minHeight: '100px',
		fontFamily: 'inherit'
	};

	const labelStyle = {
		display: 'block',
		fontWeight: '700',
		color: colors.darkGray,
		marginBottom: '0.5rem',
		fontSize: '1rem'
	};

	const timeSlotContainerStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: '1rem',
		marginBottom: '1rem',
		padding: '1rem',
		background: colors.lightBlue,
		borderRadius: '8px',
		border: `1px solid ${colors.primaryBlue}20`
	};

	const submitButtonStyle = {
		padding: '1.25rem 2rem',
		background: submitting 
			? 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
			: `linear-gradient(135deg, ${colors.successGreen} 0%, #1e7e34 100%)`,
		color: colors.white,
		border: 'none',
		borderRadius: '12px',
		cursor: submitting ? 'not-allowed' : 'pointer',
		marginTop: '1.5rem',
		fontSize: '1.1rem',
		fontWeight: '700',
		width: '100%',
		boxShadow: submitting 
			? 'none'
			: '0 4px 15px rgba(40, 167, 69, 0.3)',
		transition: 'all 0.3s ease',
		opacity: submitting ? 0.7 : 1
	};

	const tourCardStyle = {
		background: colors.white,
		padding: '2rem',
		marginBottom: '2rem',
		borderRadius: '12px',
		border: `1px solid ${colors.borderGray}`,
		boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
		transition: 'all 0.3s ease'
	};

	const tourTitleStyle = {
		fontSize: '1.4rem',
		fontWeight: '700',
		color: colors.darkGray,
		marginBottom: '1rem'
	};

	const tourDetailStyle = {
		margin: '0.5rem 0',
		color: '#666',
		fontSize: '0.95rem',
		lineHeight: '1.5'
	};

	const actionButtonsStyle = {
		display: 'flex',
		gap: '0.75rem',
		marginTop: '1.5rem',
		flexWrap: 'wrap'
	};

	const getActionButtonStyle = (type) => {
		const styles = {
			edit: {
				background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.darkBlue} 100%)`,
				boxShadow: '0 2px 4px rgba(0, 123, 255, 0.3)'
			},
			toggle: {
				background: `linear-gradient(135deg, ${colors.warningOrange} 0%, #e8590c 100%)`,
				boxShadow: '0 2px 4px rgba(253, 126, 20, 0.3)'
			},
			delete: {
				background: `linear-gradient(135deg, ${colors.dangerRed} 0%, #c82333 100%)`,
				boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)'
			}
		};

		return {
			padding: '0.75rem 1.25rem',
			color: colors.white,
			border: 'none',
			borderRadius: '8px',
			cursor: 'pointer',
			fontSize: '0.9rem',
			fontWeight: '600',
			transition: 'all 0.3s ease',
			display: 'flex',
			alignItems: 'center',
			gap: '0.5rem',
			...styles[type]
		};
	};

	const loadingStyle = {
		padding: '4rem 2rem',
		textAlign: 'center',
		fontSize: '1.2rem',
		color: '#666',
		background: colors.white,
		borderRadius: '12px',
		boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
	};

	if (loading) {
		return (
			<div style={wrapperStyle}>
				<div style={containerStyle}>
					<div style={loadingStyle}>
						⏳ Loading tours...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mt-wrapper" style={wrapperStyle}>
			<div className="mt-container" style={containerStyle}>
				<h2 className="mt-header" style={headerStyle}>Manage School Tours</h2>

				{/* Create Button */}
				<button
					className="mt-create-btn"
					onClick={() => showForm ? resetForm() : setShowForm(true)}
					style={createButtonStyle}
					onMouseEnter={(e) => {
						e.target.style.transform = 'translateY(-3px)';
						e.target.style.boxShadow = showForm 
							? '0 8px 25px rgba(220, 53, 69, 0.4)'
							: '0 8px 25px rgba(0, 123, 255, 0.4)';
					}}
					onMouseLeave={(e) => {
						e.target.style.transform = 'translateY(0)';
						e.target.style.boxShadow = showForm 
							? '0 4px 15px rgba(220, 53, 69, 0.3)'
							: '0 4px 15px rgba(0, 123, 255, 0.3)';
					}}
				>
					{showForm ? '✖ Cancel' : '➕ Create New Tour'}
				</button>

				{/* Filter Buttons */}
				<div className="mt-filters" style={filterContainerStyle}>
					{['all', 'active', 'inactive', 'upcoming'].map((f) => (
						<button
							key={f}
							className={`mt-filter-btn ${filter === f ? 'mt-filter-active' : ''}`}
							onClick={() => setFilter(f)}
							style={getFilterButtonStyle(f)}
							onMouseEnter={(e) => {
								if (filter !== f) {
									e.target.style.background = colors.lightBlue;
									e.target.style.transform = 'translateY(-2px)';
								}
							}}
							onMouseLeave={(e) => {
								if (filter !== f) {
									e.target.style.background = colors.white;
									e.target.style.transform = 'translateY(0)';
								}
							}}
						>
							{f.toUpperCase()} ({getFilteredTours().length})
						</button>
					))}
				</div>

				{/* Tour Form */}
				{showForm && (
					<form className="mt-form" onSubmit={handleSubmit} style={formStyle}>
						<div style={formHeaderStyle}></div>
						
						<input
							className="mt-input"
							type="text"
							placeholder="📛 Tour Title"
							value={formData.title}
							required
							onChange={e => setFormData({ ...formData, title: e.target.value })}
							style={inputStyle}
							onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
							onBlur={(e) => {
								e.target.style.borderColor = '#e1e5e9';
								e.target.style.boxShadow = 'none';
								e.target.style.background = '#fafbfc';
								e.target.style.transform = 'translateY(0)';
							}}
						/>
						
						<textarea
							className="mt-textarea"
							placeholder="📝 Tour Description"
							value={formData.description}
							required
							onChange={e => setFormData({ ...formData, description: e.target.value })}
							style={textAreaStyle}
							onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
							onBlur={(e) => {
								e.target.style.borderColor = '#e1e5e9';
								e.target.style.boxShadow = 'none';
								e.target.style.background = '#fafbfc';
								e.target.style.transform = 'translateY(0)';
							}}
						/>
						
						<input 
							className="mt-input"
							type="date" 
							value={formData.date} 
							required 
							onChange={e => setFormData({ ...formData, date: e.target.value })} 
							style={inputStyle} 
							onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
							onBlur={(e) => {
								e.target.style.borderColor = '#e1e5e9';
								e.target.style.boxShadow = 'none';
								e.target.style.background = '#fafbfc';
								e.target.style.transform = 'translateY(0)';
							}}
						/>
						
						<input 
							className="mt-input"
							type="number" 
							placeholder="👥 Maximum Capacity" 
							value={formData.maxCapacity} 
							required 
							onChange={e => setFormData({ ...formData, maxCapacity: e.target.value })} 
							style={inputStyle} 
							onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
							onBlur={(e) => {
								e.target.style.borderColor = '#e1e5e9';
								e.target.style.boxShadow = 'none';
								e.target.style.background = '#fafbfc';
								e.target.style.transform = 'translateY(0)';
							}}
						/>
						
						<select 
							className="mt-select"
							value={formData.duration} 
							onChange={e => setFormData({ ...formData, duration: e.target.value })} 
							style={inputStyle}
							onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
							onBlur={(e) => {
								e.target.style.borderColor = '#e1e5e9';
								e.target.style.boxShadow = 'none';
								e.target.style.background = '#fafbfc';
								e.target.style.transform = 'translateY(0)';
							}}
						>
							<option value="60">⏱️ 60 minutes</option>
							<option value="90">⏱️ 90 minutes</option>
							<option value="120">⏱️ 120 minutes</option>
						</select>

						{/* Time Slots */}
						<label style={labelStyle}>🕒 Time Slots</label>
						{formData.timeSlots.map((slot, i) => (
							<div key={i} className="mt-time-slot" style={timeSlotContainerStyle}>
								<input
									className="mt-time-input"
									type="time"
									value={slot.startTime}
									required
									onChange={(e) => {
										const updated = [...formData.timeSlots];
										updated[i].startTime = e.target.value;
										setFormData({ ...formData, timeSlots: updated });
									}}
									style={{ ...inputStyle, width: '150px', margin: '0' }}
								/>
								<span style={{ fontWeight: '600', color: colors.darkGray }}>
									➡ Ends at {slot.startTime ? calculateEndTime(slot.startTime, formData.duration) : '--:--'}
								</span>
								{formData.timeSlots.length > 1 && (
									<button 
										type="button" 
										onClick={() => {
											setFormData({ ...formData, timeSlots: formData.timeSlots.filter((_, idx) => idx !== i) });
										}}
										style={getActionButtonStyle('delete')}
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
								style={{...getActionButtonStyle('edit'), margin: '1rem 0'}}
							>
								➕ Add Time Slot
							</button>
						)}

						<textarea 
							className="mt-textarea"
							placeholder="Tour Highlights (one per line)" 
							value={formData.highlights} 
							onChange={e => setFormData({ ...formData, highlights: e.target.value })} 
							style={textAreaStyle} 
							onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
							onBlur={(e) => {
								e.target.style.borderColor = '#e1e5e9';
								e.target.style.boxShadow = 'none';
								e.target.style.background = '#fafbfc';
								e.target.style.transform = 'translateY(0)';
							}}
						/>
						
						<textarea 
							className="mt-textarea"
							placeholder="Tour Requirements (one per line)" 
							value={formData.requirements} 
							onChange={e => setFormData({ ...formData, requirements: e.target.value })} 
							style={textAreaStyle} 
							onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
							onBlur={(e) => {
								e.target.style.borderColor = '#e1e5e9';
								e.target.style.boxShadow = 'none';
								e.target.style.background = '#fafbfc';
								e.target.style.transform = 'translateY(0)';
							}}
						/>
						
						<textarea 
							className="mt-textarea"
							placeholder="📝 Additional Notes" 
							value={formData.notes} 
							onChange={e => setFormData({ ...formData, notes: e.target.value })} 
							style={textAreaStyle} 
							onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
							onBlur={(e) => {
								e.target.style.borderColor = '#e1e5e9';
								e.target.style.boxShadow = 'none';
								e.target.style.background = '#fafbfc';
								e.target.style.transform = 'translateY(0)';
							}}
						/>

						<button 
							type="submit" 
							disabled={submitting} 
							style={submitButtonStyle}
							onMouseEnter={(e) => {
								if (!submitting) {
									e.target.style.transform = 'translateY(-3px)';
									e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
								}
							}}
							onMouseLeave={(e) => {
								if (!submitting) {
									e.target.style.transform = 'translateY(0)';
									e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
								}
							}}
						>
							{submitting ? '⏳ Saving...' : (editingTour ? '✏️ Update Tour' : '✅ Create Tour')}
						</button>
					</form>
				)}

				{/* Tour Cards */}
				<div className="mt-tours-container">
					{getFilteredTours().map(tour => (
						<div 
							key={tour._id} 
							className="mt-tour-card" 
							style={tourCardStyle}
							onMouseEnter={(e) => {
								e.target.style.transform = 'translateY(-4px)';
								e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
							}}
						>
							<h3 className="mt-tour-title" style={tourTitleStyle}>{tour.title}</h3>
							<p className="mt-tour-description" style={tourDetailStyle}>{tour.description}</p>
							<p className="mt-tour-date" style={tourDetailStyle}>📅 <strong>Date:</strong> {new Date(tour.date).toLocaleDateString()}</p>
							<div className="mt-tour-slots" style={tourDetailStyle}>
								<p><strong>🕒 Time Slots:</strong></p>
								<ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
									{tour.timeSlots?.map((slot, i) => (
										<li key={i} style={{ margin: '0.25rem 0' }}>{slot.startTime} – {slot.endTime}</li>
									))}
								</ul>
							</div>
							<p className="mt-tour-capacity" style={tourDetailStyle}>
								👥 <strong>Capacity:</strong> {tour.currentBookings || 0}/{tour.maxCapacity} booked
							</p>
							<p className="mt-tour-meeting" style={tourDetailStyle}>📍 <strong>Meeting Point:</strong> {tour.meetingPoint}</p>
							<p className="mt-tour-type" style={tourDetailStyle}>🎯 <strong>Type:</strong> {tour.tourType}</p>
							<p className="mt-tour-status" style={{
								...tourDetailStyle,
								color: tour.isActive ? colors.successGreen : colors.dangerRed,
								fontWeight: '600'
							}}>
								{tour.isActive ? '✅ Active' : '❌ Inactive'}
							</p>
							
							<div className="mt-tour-actions" style={actionButtonsStyle}>
								<button 
									className="mt-edit-btn"
									onClick={() => handleEdit(tour)}
									style={getActionButtonStyle('edit')}
									onMouseEnter={(e) => {
										e.target.style.transform = 'translateY(-2px)';
										e.target.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.4)';
									}}
									onMouseLeave={(e) => {
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = '0 2px 4px rgba(0, 123, 255, 0.3)';
									}}
								>
									✏️ Edit
								</button>
								<button 
									className="mt-toggle-btn"
									onClick={() => toggleStatus(tour._id, tour.isActive)}
									style={getActionButtonStyle('toggle')}
									onMouseEnter={(e) => {
										e.target.style.transform = 'translateY(-2px)';
										e.target.style.boxShadow = '0 4px 8px rgba(253, 126, 20, 0.4)';
									}}
									onMouseLeave={(e) => {
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = '0 2px 4px rgba(253, 126, 20, 0.3)';
									}}
								>
									{tour.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
								</button>
								<button 
									className="mt-delete-btn"
									onClick={() => handleDelete(tour._id)}
									style={getActionButtonStyle('delete')}
									onMouseEnter={(e) => {
										e.target.style.transform = 'translateY(-2px)';
										e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.4)';
									}}
									onMouseLeave={(e) => {
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.3)';
									}}
								>
									🗑️ Delete
								</button>
							</div>
						</div>
					))}
				</div>

				{getFilteredTours().length === 0 && (
					<div style={{
						...loadingStyle,
						color: colors.primaryBlue
					}}>
						📅 No tours found for the selected filter.
					</div>
				)}
			</div>
		</div>
	);
};

export default ManageTours;