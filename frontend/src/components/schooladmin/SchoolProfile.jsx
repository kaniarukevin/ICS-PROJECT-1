import React, { useState, useEffect } from 'react';

const SchoolProfile = () => {
	const [school, setSchool] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({});

	useEffect(() => {
		fetchSchoolInfo();
	}, []);

	const fetchSchoolInfo = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/school-admin/school', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			setSchool(data);
			setFormData(data);
		} catch (error) {
			console.error('Error fetching school info:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/school-admin/school', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const updatedSchool = await response.json();
				setSchool(updatedSchool);
				setEditing(false);
				alert('School information updated successfully!');
			}
		} catch (error) {
			console.error('Error updating school info:', error);
			alert('Error updating school information');
		}
	};

	const handleCancel = () => {
		setFormData(school);
		setEditing(false);
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-KE', {
			style: 'currency',
			currency: 'KES',
			minimumFractionDigits: 0
		}).format(amount);
	};

	const renderStars = (rating) => {
		if (!rating) return 'No rating';
		return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
	};

	if (loading) {
		return <div style={{ padding: '2rem' }}>Loading school information...</div>;
	}

	if (!school) {
		return <div style={{ padding: '2rem' }}>No school information found.</div>;
	}

	const sectionStyle = {
		backgroundColor: 'white',
		border: '1px solid #ddd',
		borderRadius: '8px',
		padding: '1.5rem',
		marginBottom: '1.5rem',
		boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
	};

	const inputStyle = {
		width: '100%',
		padding: '0.5rem',
		border: '1px solid #ddd',
		borderRadius: '4px',
		marginBottom: '0.5rem'
	};

	return (
		<div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
				<h1>School Profile</h1>
				{!editing ? (
					<button 
						onClick={() => setEditing(true)}
						style={{
							padding: '0.75rem 1.5rem',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Edit Profile
					</button>
				) : (
					<div style={{ display: 'flex', gap: '0.5rem' }}>
						<button 
							onClick={handleSave}
							style={{
								padding: '0.75rem 1.5rem',
								backgroundColor: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							Save Changes
						</button>
						<button 
							onClick={handleCancel}
							style={{
								padding: '0.75rem 1.5rem',
								backgroundColor: '#6c757d',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							Cancel
						</button>
					</div>
				)}
			</div>

			{/* Basic Information */}
			<div style={sectionStyle}>
				<h3>Basic Information</h3>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
					<div>
						<label><strong>School Name:</strong></label>
						{editing ? (
							<input 
								type="text"
								value={formData.name || ''}
								onChange={(e) => setFormData({...formData, name: e.target.value})}
								style={inputStyle}
							/>
						) : (
							<p>{school.name}</p>
						)}
					</div>
					
					<div>
						<label><strong>School Type:</strong></label>
						{editing ? (
							<select 
								value={formData.schoolType || ''}
								onChange={(e) => setFormData({...formData, schoolType: e.target.value})}
								style={inputStyle}
							>
								<option value="">Select Type</option>
								<option value="Primary">Primary</option>
								<option value="Secondary">Secondary</option>
								<option value="College">College</option>
								<option value="University">University</option>
								<option value="TVET">TVET</option>
							</select>
						) : (
							<p>{school.schoolType}</p>
						)}
					</div>
				</div>
				
				<div>
					<label><strong>Description:</strong></label>
					{editing ? (
						<textarea 
							value={formData.description || ''}
							onChange={(e) => setFormData({...formData, description: e.target.value})}
							style={{...inputStyle, height: '100px'}}
							placeholder="Enter school description..."
						/>
					) : (
						<p>{school.description}</p>
					)}
				</div>
			</div>

			{/* Contact Information */}
			<div style={sectionStyle}>
				<h3>Contact Information</h3>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
					<div>
						<label><strong>Phone:</strong></label>
						{editing ? (
							<input 
								type="text"
								value={formData.contact?.phone || formData.phone || ''}
								onChange={(e) => setFormData({
									...formData, 
									contact: {...formData.contact, phone: e.target.value}
								})}
								style={inputStyle}
							/>
						) : (
							<p>{school.contact?.phone || school.phone}</p>
						)}
					</div>
					
					<div>
						<label><strong>Email:</strong></label>
						{editing ? (
							<input 
								type="email"
								value={formData.contact?.email || formData.email || ''}
								onChange={(e) => setFormData({
									...formData, 
									contact: {...formData.contact, email: e.target.value}
								})}
								style={inputStyle}
							/>
						) : (
							<p>{school.contact?.email || school.email}</p>
						)}
					</div>
					
					<div>
						<label><strong>Website:</strong></label>
						{editing ? (
							<input 
								type="url"
								value={formData.contact?.website || formData.website || ''}
								onChange={(e) => setFormData({
									...formData, 
									contact: {...formData.contact, website: e.target.value}
								})}
								style={inputStyle}
								placeholder="https://www.yourschool.com"
							/>
						) : (
							<p>
								{(school.contact?.website || school.website) ? (
									<a href={school.contact?.website || school.website} target="_blank" rel="noopener noreferrer">
										{school.contact?.website || school.website}
									</a>
								) : 'Not provided'}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Location Information */}
			<div style={sectionStyle}>
				<h3>Location</h3>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
					<div>
						<label><strong>Address:</strong></label>
						{editing ? (
							<input 
								type="text"
								value={formData.location?.address || formData.address || ''}
								onChange={(e) => setFormData({
									...formData, 
									location: {...formData.location, address: e.target.value}
								})}
								style={inputStyle}
							/>
						) : (
							<p>{school.location?.address || school.address}</p>
						)}
					</div>
					
					<div>
						<label><strong>City:</strong></label>
						{editing ? (
							<input 
								type="text"
								value={formData.location?.city || formData.city || ''}
								onChange={(e) => setFormData({
									...formData, 
									location: {...formData.location, city: e.target.value}
								})}
								style={inputStyle}
							/>
						) : (
							<p>{school.location?.city || school.city}</p>
						)}
					</div>
					
					<div>
						<label><strong>State:</strong></label>
						{editing ? (
							<input 
								type="text"
								value={formData.location?.state || formData.state || ''}
								onChange={(e) => setFormData({
									...formData, 
									location: {...formData.location, state: e.target.value}
								})}
								style={inputStyle}
							/>
						) : (
							<p>{school.location?.state || school.state}</p>
						)}
					</div>
					
					<div>
						<label><strong>Postal Code:</strong></label>
						{editing ? (
							<input 
								type="text"
								value={formData.location?.postalCode || formData.zipCode || ''}
								onChange={(e) => setFormData({
									...formData, 
									location: {...formData.location, postalCode: e.target.value}
								})}
								style={inputStyle}
							/>
						) : (
							<p>{school.location?.postalCode || school.zipCode}</p>
						)}
					</div>
				</div>
			</div>

			{/* Read-only Information */}
			<div style={sectionStyle}>
				<h3>School Statistics</h3>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
					{/* Verification Status */}
					<div>
						<label><strong>Verification Status:</strong></label>
						<p>
							<span style={{
								padding: '0.25rem 0.75rem',
								borderRadius: '4px',
								backgroundColor: (school.isVerified || school.isApproved) ? '#d4edda' : '#f8d7da',
								color: (school.isVerified || school.isApproved) ? '#155724' : '#721c24'
							}}>
								{(school.isVerified || school.isApproved) ? 'Verified' : 'Pending Verification'}
							</span>
						</p>
					</div>

					{/* Ratings */}
					{school.ratings && (
						<>
							<div>
								<label><strong>Overall Rating:</strong></label>
								<p>
									{renderStars(school.averageRating || school.ratings.overall)} 
									({(school.averageRating || school.ratings.overall)?.toFixed(1)})
								</p>
							</div>
							
							<div>
								<label><strong>Total Reviews:</strong></label>
								<p>{school.totalRatings || 0}</p>
							</div>
						</>
					)}

					{/* Facilities Count */}
					{school.facilities && (
						<div>
							<label><strong>Facilities:</strong></label>
							<p>{school.facilities.length} facilities</p>
						</div>
					)}

					{/* Fee Range */}
					{school.fees?.tuition && (
						<div>
							<label><strong>Fee Range:</strong></label>
							<p>
								{formatCurrency(school.fees.tuition.minAmount)} - {formatCurrency(school.fees.tuition.maxAmount)} 
								<br />
								<small>({school.fees.tuition.period})</small>
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Images */}
			{school.images && school.images.length > 0 && (
				<div style={sectionStyle}>
					<h3>School Images</h3>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
						{school.images.map((image, index) => (
							<div key={index}>
								<img 
									src={image.url} 
									alt={image.caption || `School image ${index + 1}`}
									style={{ 
										width: '100%', 
										height: '150px', 
										objectFit: 'cover', 
										borderRadius: '4px',
										border: image.isPrimary ? '3px solid #007bff' : 'none'
									}}
								/>
								<p style={{ fontSize: '0.9rem', margin: '0.5rem 0', textAlign: 'center' }}>
									{image.caption}
									{image.isPrimary && <span style={{ color: '#007bff' }}> (Primary)</span>}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Facilities */}
			{school.facilities && school.facilities.length > 0 && (
				<div style={sectionStyle}>
					<h3>Facilities ({school.facilities.length})</h3>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
						{school.facilities.map((facility, index) => (
							<div key={index} style={{ 
								padding: '1rem', 
								border: '1px solid #eee', 
								borderRadius: '6px',
								backgroundColor: '#f8f9fa'
							}}>
								<h4 style={{ margin: '0 0 0.5rem 0' }}>{facility.name}</h4>
								{facility.description && <p style={{ margin: '0.5rem 0', color: '#666' }}>{facility.description}</p>}
								<span style={{ 
									fontSize: '0.8rem', 
									color: '#999',
									backgroundColor: 'white',
									padding: '0.2rem 0.5rem',
									borderRadius: '4px'
								}}>
									{facility.category}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default SchoolProfile;