// frontend/src/components/schooladmin/SchoolProfile.jsx
import React, { useState, useEffect } from 'react';

const SchoolProfile = () => {
	const [school, setSchool] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [formData, setFormData] = useState({
		description: '',
		contact: {
			phone: '',
			email: '',
			website: ''
		},
		facilities: [],
		curriculum: [],
		fees: {
			currency: 'KES',
			tuition: {
				minAmount: '',
				maxAmount: '',
				period: 'Termly'
			},
			registration: '',
			other: []
		},
		tourSchedule: {
			availableDays: [],
			timeSlots: [],
			duration: 90,
			advanceBooking: 2
		}
	});
	const [newFacility, setNewFacility] = useState({ name: '', description: '', category: 'Other' });
	const [newCurriculum, setNewCurriculum] = useState('');
	const [newTimeSlot, setNewTimeSlot] = useState({ startTime: '', endTime: '', maxVisitors: 20 });

	useEffect(() => {
		fetchSchoolProfile();
	}, []);

	const fetchSchoolProfile = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/school-admin/school', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch school profile');
			}

			const data = await response.json();
			setSchool(data);
			
			// Initialize form data with existing school data
			setFormData({
				description: data.description || '',
				contact: {
					phone: data.contact?.phone || '',
					email: data.contact?.email || '',
					website: data.contact?.website || ''
				},
				facilities: data.facilities || [],
				curriculum: data.curriculum || [],
				fees: {
					currency: data.fees?.currency || 'KES',
					tuition: {
						minAmount: data.fees?.tuition?.minAmount?.toString() || '',
						maxAmount: data.fees?.tuition?.maxAmount?.toString() || '',
						period: data.fees?.tuition?.period || 'Termly'
					},
					registration: data.fees?.registration?.toString() || '',
					other: data.fees?.other || []
				},
				tourSchedule: {
					availableDays: data.tourSchedule?.availableDays || [],
					timeSlots: data.tourSchedule?.timeSlots || [],
					duration: data.tourSchedule?.duration || 90,
					advanceBooking: data.tourSchedule?.advanceBooking || 2
				}
			});
		} catch (error) {
			console.error('Error fetching school profile:', error);
			alert('Error fetching school profile: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			const token = localStorage.getItem('token');
			
			// Prepare data for submission
			const updateData = {
				...formData,
				fees: {
					...formData.fees,
					tuition: {
						...formData.fees.tuition,
						minAmount: formData.fees.tuition.minAmount ? parseFloat(formData.fees.tuition.minAmount) : undefined,
						maxAmount: formData.fees.tuition.maxAmount ? parseFloat(formData.fees.tuition.maxAmount) : undefined
					},
					registration: formData.fees.registration ? parseFloat(formData.fees.registration) : undefined
				}
			};

			const response = await fetch('http://localhost:5000/api/school-admin/school', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(updateData)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to update school profile');
			}

			await fetchSchoolProfile();
			setEditMode(false);
			alert('School profile updated successfully!');
		} catch (error) {
			console.error('Error updating school profile:', error);
			alert('Error updating school profile: ' + error.message);
		} finally {
			setSaving(false);
		}
	};

	const addFacility = () => {
		if (newFacility.name.trim()) {
			setFormData({
				...formData,
				facilities: [...formData.facilities, { ...newFacility }]
			});
			setNewFacility({ name: '', description: '', category: 'Other' });
		}
	};

	const removeFacility = (index) => {
		setFormData({
			...formData,
			facilities: formData.facilities.filter((_, i) => i !== index)
		});
	};

	const addCurriculum = () => {
		if (newCurriculum.trim() && !formData.curriculum.includes(newCurriculum.trim())) {
			setFormData({
				...formData,
				curriculum: [...formData.curriculum, newCurriculum.trim()]
			});
			setNewCurriculum('');
		}
	};

	const removeCurriculum = (index) => {
		setFormData({
			...formData,
			curriculum: formData.curriculum.filter((_, i) => i !== index)
		});
	};

	const addTimeSlot = () => {
		if (newTimeSlot.startTime && newTimeSlot.endTime) {
			setFormData({
				...formData,
				tourSchedule: {
					...formData.tourSchedule,
					timeSlots: [...formData.tourSchedule.timeSlots, { ...newTimeSlot }]
				}
			});
			setNewTimeSlot({ startTime: '', endTime: '', maxVisitors: 20 });
		}
	};

	const removeTimeSlot = (index) => {
		setFormData({
			...formData,
			tourSchedule: {
				...formData.tourSchedule,
				timeSlots: formData.tourSchedule.timeSlots.filter((_, i) => i !== index)
			}
		});
	};

	const toggleAvailableDay = (day) => {
		const days = formData.tourSchedule.availableDays;
		if (days.includes(day)) {
			setFormData({
				...formData,
				tourSchedule: {
					...formData.tourSchedule,
					availableDays: days.filter(d => d !== day)
				}
			});
		} else {
			setFormData({
				...formData,
				tourSchedule: {
					...formData.tourSchedule,
					availableDays: [...days, day]
				}
			});
		}
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
				⏳ Loading school profile...
			</div>
		);
	}

	if (!school) {
		return (
			<div style={{ 
				textAlign: 'center', 
				padding: '3rem',
				color: '#dc3545'
			}}>
				❌ School profile not found
			</div>
		);
	}

	const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	return (
		<div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			{/* Header */}
			<div style={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'center',
				marginBottom: '2rem'
			}}>
				<div>
					<h1 style={{ color: '#333', margin: 0 }}>🏛️ School Profile</h1>
					<p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
						Manage your school information and settings
					</p>
				</div>
				<div style={{ display: 'flex', gap: '1rem' }}>
					{editMode ? (
						<>
							<button 
								onClick={handleSave}
								disabled={saving}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: saving ? '#ccc' : '#28a745',
									color: 'white',
									border: 'none',
									borderRadius: '6px',
									cursor: saving ? 'not-allowed' : 'pointer',
									fontSize: '1rem',
									fontWeight: '500'
								}}
							>
								{saving ? '⏳ Saving...' : '💾 Save Changes'}
							</button>
							<button 
								onClick={() => {
									setEditMode(false);
									fetchSchoolProfile(); // Reset form data
								}}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: '6px',
									cursor: 'pointer',
									fontSize: '1rem'
								}}
							>
								✕ Cancel
							</button>
						</>
					) : (
						<button 
							onClick={() => setEditMode(true)}
							style={{
								padding: '0.75rem 1.5rem',
								backgroundColor: '#007bff',
								color: 'white',
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '1rem',
								fontWeight: '500'
							}}
						>
							✏️ Edit Profile
						</button>
					)}
				</div>
			</div>

			{/* School Basic Info (Read-only) */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '2rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<h2 style={{ marginBottom: '1.5rem', color: '#333' }}>📋 Basic Information</h2>
				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
					gap: '1rem'
				}}>
					<div>
						<strong>School Name:</strong>
						<div style={{ color: '#666', marginTop: '0.25rem' }}>{school.name}</div>
					</div>
					<div>
						<strong>School Type:</strong>
						<div style={{ color: '#666', marginTop: '0.25rem' }}>{school.schoolType}</div>
					</div>
					<div>
						<strong>Verification Status:</strong>
						<div style={{ marginTop: '0.25rem' }}>
							<span style={{
								padding: '0.3rem 0.7rem',
								borderRadius: '12px',
								fontSize: '0.8rem',
								backgroundColor: school.isVerified ? '#e8f5e8' : '#fff3cd',
								color: school.isVerified ? '#2e7d2e' : '#856404'
							}}>
								{school.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
							</span>
						</div>
					</div>
					<div>
						<strong>Location:</strong>
						<div style={{ color: '#666', marginTop: '0.25rem' }}>
							{school.location?.city}, {school.location?.state}
						</div>
					</div>
				</div>
			</div>

			{/* School Description */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '2rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<h2 style={{ marginBottom: '1.5rem', color: '#333' }}>📝 Description</h2>
				{editMode ? (
					<textarea
						value={formData.description}
						onChange={(e) => setFormData({...formData, description: e.target.value})}
						placeholder="Describe your school..."
						rows="5"
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem',
							resize: 'vertical'
						}}
					/>
				) : (
					<div style={{ color: '#666', lineHeight: '1.6' }}>
						{school.description || 'No description provided.'}
					</div>
				)}
			</div>

			{/* Contact Information */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '2rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<h2 style={{ marginBottom: '1.5rem', color: '#333' }}>📞 Contact Information</h2>
				{editMode ? (
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
						gap: '1rem'
					}}>
						<input
							type="tel"
							placeholder="Phone Number"
							value={formData.contact.phone}
							onChange={(e) => setFormData({
								...formData,
								contact: {...formData.contact, phone: e.target.value}
							})}
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem'
							}}
						/>
						<input
							type="email"
							placeholder="Email Address"
							value={formData.contact.email}
							onChange={(e) => setFormData({
								...formData,
								contact: {...formData.contact, email: e.target.value}
							})}
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem'
							}}
						/>
						<input
							type="url"
							placeholder="Website URL"
							value={formData.contact.website}
							onChange={(e) => setFormData({
								...formData,
								contact: {...formData.contact, website: e.target.value}
							})}
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem'
							}}
						/>
					</div>
				) : (
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
						gap: '1rem'
					}}>
						<div>
							<strong>📱 Phone:</strong>
							<div style={{ color: '#666', marginTop: '0.25rem' }}>
								{school.contact?.phone || 'Not provided'}
							</div>
						</div>
						<div>
							<strong>📧 Email:</strong>
							<div style={{ color: '#666', marginTop: '0.25rem' }}>
								{school.contact?.email || 'Not provided'}
							</div>
						</div>
						<div>
							<strong>🌐 Website:</strong>
							<div style={{ color: '#666', marginTop: '0.25rem' }}>
								{school.contact?.website ? (
									<a href={school.contact.website} target="_blank" rel="noopener noreferrer">
										{school.contact.website}
									</a>
								) : 'Not provided'}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Facilities */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '2rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<h2 style={{ marginBottom: '1.5rem', color: '#333' }}>🏢 Facilities</h2>
				
				{editMode && (
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: '2fr 3fr 1fr auto', 
						gap: '0.5rem',
						alignItems: 'end',
						marginBottom: '1rem',
						padding: '1rem',
						backgroundColor: '#f8f9fa',
						borderRadius: '4px'
					}}>
						<input
							type="text"
							placeholder="Facility Name"
							value={newFacility.name}
							onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
							style={{
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '0.9rem'
							}}
						/>
						<input
							type="text"
							placeholder="Description"
							value={newFacility.description}
							onChange={(e) => setNewFacility({...newFacility, description: e.target.value})}
							style={{
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '0.9rem'
							}}
						/>
						<select
							value={newFacility.category}
							onChange={(e) => setNewFacility({...newFacility, category: e.target.value})}
							style={{
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '0.9rem'
							}}
						>
							<option value="Academic">Academic</option>
							<option value="Sports">Sports</option>
							<option value="Other">Other</option>
						</select>
						<button
							onClick={addFacility}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
								fontSize: '0.9rem'
							}}
						>
							➕ Add
						</button>
					</div>
				)}

				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
					gap: '1rem'
				}}>
					{formData.facilities.map((facility, index) => (
						<div key={index} style={{ 
							padding: '1rem',
							border: '1px solid #e0e0e0',
							borderRadius: '4px',
							backgroundColor: '#fafafa'
						}}>
							<div style={{ 
								display: 'flex', 
								justifyContent: 'space-between', 
								alignItems: 'flex-start',
								marginBottom: '0.5rem'
							}}>
								<strong style={{ color: '#333' }}>{facility.name}</strong>
								{editMode && (
									<button
										onClick={() => removeFacility(index)}
										style={{
											backgroundColor: 'transparent',
											border: 'none',
											color: '#dc3545',
											cursor: 'pointer',
											fontSize: '1rem'
										}}
									>
										🗑️
									</button>
								)}
							</div>
							<div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
								{facility.description}
							</div>
							<span style={{ 
								padding: '0.2rem 0.5rem',
								backgroundColor: '#e3f2fd',
								color: '#1565c0',
								borderRadius: '12px',
								fontSize: '0.8rem'
							}}>
								{facility.category}
							</span>
						</div>
					))}
				</div>

				{formData.facilities.length === 0 && (
					<div style={{ 
						textAlign: 'center', 
						color: '#666',
						padding: '2rem',
						fontStyle: 'italic'
					}}>
						No facilities added yet.
					</div>
				)}
			</div>

			{/* Curriculum */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '2rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<h2 style={{ marginBottom: '1.5rem', color: '#333' }}>📚 Curriculum</h2>
				
				{editMode && (
					<div style={{ 
						display: 'flex', 
						gap: '0.5rem',
						marginBottom: '1rem',
						padding: '1rem',
						backgroundColor: '#f8f9fa',
						borderRadius: '4px'
					}}>
						<input
							type="text"
							placeholder="Add curriculum (e.g., KCSE, Cambridge, IB)"
							value={newCurriculum}
							onChange={(e) => setNewCurriculum(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && addCurriculum()}
							style={{
								flex: 1,
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '0.9rem'
							}}
						/>
						<button
							onClick={addCurriculum}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
								fontSize: '0.9rem'
							}}
						>
							➕ Add
						</button>
					</div>
				)}

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
					{formData.curriculum.map((curr, index) => (
						<span key={index} style={{ 
							padding: '0.5rem 1rem',
							backgroundColor: '#e8f5e8',
							color: '#2e7d2e',
							borderRadius: '20px',
							fontSize: '0.9rem',
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem'
						}}>
							{curr}
							{editMode && (
								<button
									onClick={() => removeCurriculum(index)}
									style={{
										backgroundColor: 'transparent',
										border: 'none',
										color: '#dc3545',
										cursor: 'pointer',
										fontSize: '0.8rem'
									}}
								>
									✕
								</button>
							)}
						</span>
					))}
				</div>

				{formData.curriculum.length === 0 && (
					<div style={{ 
						textAlign: 'center', 
						color: '#666',
						padding: '2rem',
						fontStyle: 'italic'
					}}>
						No curriculum information added yet.
					</div>
				)}
			</div>

			{/* Fee Structure */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '2rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<h2 style={{ marginBottom: '1.5rem', color: '#333' }}>💰 Fee Structure</h2>
				
				{editMode ? (
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
						gap: '1rem'
					}}>
						<div>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
								Min Tuition Fee (KES)
							</label>
							<input
								type="number"
								placeholder="Minimum fee"
								value={formData.fees.tuition.minAmount}
								onChange={(e) => setFormData({
									...formData,
									fees: {
										...formData.fees,
										tuition: {...formData.fees.tuition, minAmount: e.target.value}
									}
								})}
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
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
								Max Tuition Fee (KES)
							</label>
							<input
								type="number"
								placeholder="Maximum fee"
								value={formData.fees.tuition.maxAmount}
								onChange={(e) => setFormData({
									...formData,
									fees: {
										...formData.fees,
										tuition: {...formData.fees.tuition, maxAmount: e.target.value}
									}
								})}
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
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
								Fee Period
							</label>
							<select
								value={formData.fees.tuition.period}
								onChange={(e) => setFormData({
									...formData,
									fees: {
										...formData.fees,
										tuition: {...formData.fees.tuition, period: e.target.value}
									}
								})}
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '1rem'
								}}
							>
								<option value="Termly">Termly</option>
								<option value="Annually">Annually</option>
								<option value="Monthly">Monthly</option>
							</select>
						</div>
						<div>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
								Registration Fee (KES)
							</label>
							<input
								type="number"
								placeholder="Registration fee"
								value={formData.fees.registration}
								onChange={(e) => setFormData({
									...formData,
									fees: {...formData.fees, registration: e.target.value}
								})}
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
				) : (
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
						gap: '1rem'
					}}>
						<div>
							<strong>💵 Tuition Fee Range:</strong>
							<div style={{ color: '#666', marginTop: '0.25rem' }}>
								{school.fees?.tuition?.minAmount && school.fees?.tuition?.maxAmount 
									? `KES ${school.fees.tuition.minAmount.toLocaleString()} - ${school.fees.tuition.maxAmount.toLocaleString()}`
									: 'Not specified'
								}
							</div>
						</div>
						<div>
							<strong>📅 Fee Period:</strong>
							<div style={{ color: '#666', marginTop: '0.25rem' }}>
								{school.fees?.tuition?.period || 'Not specified'}
							</div>
						</div>
						<div>
							<strong>📝 Registration Fee:</strong>
							<div style={{ color: '#666', marginTop: '0.25rem' }}>
								{school.fees?.registration 
									? `KES ${school.fees.registration.toLocaleString()}`
									: 'Not specified'
								}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Tour Schedule Settings */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '2rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0'
			}}>
				<h2 style={{ marginBottom: '1.5rem', color: '#333' }}>🕐 Tour Schedule Settings</h2>
				
				{editMode ? (
					<div style={{ display: 'grid', gap: '2rem' }}>
						{/* Available Days */}
						<div>
							<h3 style={{ marginBottom: '1rem', color: '#555' }}>Available Days</h3>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
								{weekDays.map(day => (
									<button
										key={day}
										onClick={() => toggleAvailableDay(day)}
										style={{
											padding: '0.5rem 1rem',
											border: '1px solid #ddd',
											borderRadius: '20px',
											backgroundColor: formData.tourSchedule.availableDays.includes(day) ? '#007bff' : 'white',
											color: formData.tourSchedule.availableDays.includes(day) ? 'white' : '#333',
											cursor: 'pointer',
											fontSize: '0.9rem'
										}}
									>
										{day}
									</button>
								))}
							</div>
						</div>

						{/* Time Slots */}
						<div>
							<h3 style={{ marginBottom: '1rem', color: '#555' }}>Available Time Slots</h3>
							
							<div style={{ 
								display: 'grid', 
								gridTemplateColumns: '1fr 1fr 1fr auto', 
								gap: '0.5rem',
								alignItems: 'end',
								marginBottom: '1rem',
								padding: '1rem',
								backgroundColor: '#f8f9fa',
								borderRadius: '4px'
							}}>
								<input
									type="time"
									placeholder="Start Time"
									value={newTimeSlot.startTime}
									onChange={(e) => setNewTimeSlot({...newTimeSlot, startTime: e.target.value})}
									style={{
										padding: '0.5rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '0.9rem'
									}}
								/>
								<input
									type="time"
									placeholder="End Time"
									value={newTimeSlot.endTime}
									onChange={(e) => setNewTimeSlot({...newTimeSlot, endTime: e.target.value})}
									style={{
										padding: '0.5rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '0.9rem'
									}}
								/>
								<input
									type="number"
									placeholder="Max Visitors"
									value={newTimeSlot.maxVisitors}
									onChange={(e) => setNewTimeSlot({...newTimeSlot, maxVisitors: parseInt(e.target.value)})}
									min="1"
									style={{
										padding: '0.5rem',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '0.9rem'
									}}
								/>
								<button
									onClick={addTimeSlot}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: '#28a745',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '0.9rem'
									}}
								>
									➕ Add
								</button>
							</div>

							<div style={{ display: 'grid', gap: '0.5rem' }}>
								{formData.tourSchedule.timeSlots.map((slot, index) => (
									<div key={index} style={{ 
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										padding: '0.75rem',
										border: '1px solid #e0e0e0',
										borderRadius: '4px',
										backgroundColor: '#fafafa'
									}}>
										<span style={{ fontSize: '0.9rem' }}>
											{slot.startTime} - {slot.endTime} (Max: {slot.maxVisitors} visitors)
										</span>
										<button
											onClick={() => removeTimeSlot(index)}
											style={{
												backgroundColor: 'transparent',
												border: 'none',
												color: '#dc3545',
												cursor: 'pointer',
												fontSize: '1rem'
											}}
										>
											🗑️
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Other Settings */}
						<div style={{ 
							display: 'grid', 
							gridTemplateColumns: '1fr 1fr', 
							gap: '1rem'
						}}>
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
									Default Tour Duration (minutes)
								</label>
								<input
									type="number"
									value={formData.tourSchedule.duration}
									onChange={(e) => setFormData({
										...formData,
										tourSchedule: {...formData.tourSchedule, duration: parseInt(e.target.value)}
									})}
									min="30"
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
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
									Advance Booking (days)
								</label>
								<input
									type="number"
									value={formData.tourSchedule.advanceBooking}
									onChange={(e) => setFormData({
										...formData,
										tourSchedule: {...formData.tourSchedule, advanceBooking: parseInt(e.target.value)}
									})}
									min="0"
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
					</div>
				) : (
					<div style={{ display: 'grid', gap: '1.5rem' }}>
						<div>
							<strong>📅 Available Days:</strong>
							<div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
								{school.tourSchedule?.availableDays?.length > 0 ? (
									school.tourSchedule.availableDays.map(day => (
										<span key={day} style={{ 
											padding: '0.3rem 0.7rem',
											backgroundColor: '#e3f2fd',
											color: '#1565c0',
											borderRadius: '12px',
											fontSize: '0.9rem'
										}}>
											{day}
										</span>
									))
								) : (
									<span style={{ color: '#666', fontStyle: 'italic' }}>No specific days configured</span>
								)}
							</div>
						</div>

						<div>
							<strong>⏰ Time Slots:</strong>
							<div style={{ marginTop: '0.5rem' }}>
								{school.tourSchedule?.timeSlots?.length > 0 ? (
									school.tourSchedule.timeSlots.map((slot, index) => (
										<div key={index} style={{ 
											padding: '0.5rem',
											backgroundColor: '#f8f9fa',
											marginBottom: '0.5rem',
											borderRadius: '4px',
											fontSize: '0.9rem'
										}}>
											{slot.startTime} - {slot.endTime} (Max: {slot.maxVisitors} visitors)
										</div>
									))
								) : (
									<span style={{ color: '#666', fontStyle: 'italic' }}>No time slots configured</span>
								)}
							</div>
						</div>

						<div style={{ 
							display: 'grid', 
							gridTemplateColumns: '1fr 1fr', 
							gap: '1rem'
						}}>
							<div>
								<strong>🕐 Default Duration:</strong>
								<div style={{ color: '#666', marginTop: '0.25rem' }}>
									{school.tourSchedule?.duration || 90} minutes
								</div>
							</div>
							<div>
								<strong>📋 Advance Booking:</strong>
								<div style={{ color: '#666', marginTop: '0.25rem' }}>
									{school.tourSchedule?.advanceBooking || 2} days minimum
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SchoolProfile;