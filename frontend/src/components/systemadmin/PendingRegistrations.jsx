// frontend/src/components/systemadmin/PendingRegistrations.jsx
import React, { useState, useEffect } from 'react';
import { registrationService } from '../../services/registrationService';

const PendingRegistrations = () => {
	const [pendingAdmins, setPendingAdmins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [processingIds, setProcessingIds] = useState(new Set());
	const [selectedAdmin, setSelectedAdmin] = useState(null);
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		fetchPendingRegistrations();
	}, []);

	const fetchPendingRegistrations = async () => {
		try {
			setLoading(true);
			const data = await registrationService.getPendingSchoolAdmins();
			setPendingAdmins(data);
		} catch (error) {
			console.error('Error fetching pending registrations:', error);
			alert('Error fetching pending registrations: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleVerification = async (userId, isVerified) => {
		if (!window.confirm(`Are you sure you want to ${isVerified ? 'approve' : 'reject'} this registration?`)) {
			return;
		}

		try {
			setProcessingIds(prev => new Set(prev).add(userId));
			
			await registrationService.verifySchoolAdmin(userId, isVerified);
			
			// Remove from pending list
			setPendingAdmins(prev => prev.filter(admin => admin._id !== userId));
			
			alert(`Registration ${isVerified ? 'approved' : 'rejected'} successfully!`);
		} catch (error) {
			console.error('Error processing verification:', error);
			alert('Error processing verification: ' + error.message);
		} finally {
			setProcessingIds(prev => {
				const newSet = new Set(prev);
				newSet.delete(userId);
				return newSet;
			});
		}
	};

	const showAdminDetails = (admin) => {
		setSelectedAdmin(admin);
		setShowDetails(true);
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
				⏳ Loading pending registrations...
			</div>
		);
	}

	return (
		<div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			{/* Header */}
			<div style={{ marginBottom: '2rem' }}>
				<h1 style={{ color: '#333', marginBottom: '0.5rem' }}>
					📋 Pending School Admin Registrations
				</h1>
				<p style={{ color: '#666', margin: 0 }}>
					Review and approve new school administrator accounts
				</p>
			</div>

			{/* Statistics */}
			<div style={{ 
				backgroundColor: 'white', 
				padding: '1.5rem', 
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				marginBottom: '2rem'
			}}>
				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
					gap: '1rem',
					textAlign: 'center'
				}}>
					<div>
						<div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
							{pendingAdmins.length}
						</div>
						<div style={{ color: '#666', fontSize: '0.9rem' }}>Pending Reviews</div>
					</div>
					<div>
						<div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
							{pendingAdmins.filter(admin => admin.createdAt > new Date(Date.now() - 24*60*60*1000)).length}
						</div>
						<div style={{ color: '#666', fontSize: '0.9rem' }}>New Today</div>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div style={{ 
				display: 'flex', 
				gap: '1rem', 
				marginBottom: '2rem',
				flexWrap: 'wrap'
			}}>
				<button
					onClick={fetchPendingRegistrations}
					style={{
						padding: '0.5rem 1rem',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '0.9rem'
					}}
				>
					🔄 Refresh
				</button>
			</div>

			{/* Pending Registrations List */}
			{pendingAdmins.length > 0 ? (
				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
					gap: '1.5rem'
				}}>
					{pendingAdmins.map(admin => (
						<div key={admin._id} style={{ 
							backgroundColor: 'white', 
							padding: '1.5rem', 
							borderRadius: '8px',
							border: '1px solid #e0e0e0',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
						}}>
							{/* Admin Info */}
							<div style={{ marginBottom: '1rem' }}>
								<h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
									{admin.name}
								</h3>
								<div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
									📧 {admin.email}
								</div>
								{admin.phone && (
									<div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
										📱 {admin.phone}
									</div>
								)}
								<div style={{ fontSize: '0.8rem', color: '#888' }}>
									Registered: {new Date(admin.createdAt).toLocaleDateString()}
								</div>
							</div>

							{/* School Info */}
							{admin.schoolId && (
								<div style={{ 
									backgroundColor: '#f8f9fa',
									padding: '1rem',
									borderRadius: '4px',
									marginBottom: '1rem'
								}}>
									<div style={{ fontWeight: '500', color: '#007bff', marginBottom: '0.5rem' }}>
										🏫 {admin.schoolId.name}
									</div>
									<div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
										<strong>Type:</strong> {admin.schoolId.schoolType}
									</div>
									<div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
										<strong>Location:</strong> {admin.schoolId.location?.city || admin.schoolId.city}, {admin.schoolId.location?.state || admin.schoolId.state}
									</div>
									{admin.schoolId.contact?.phone && (
										<div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
											<strong>Phone:</strong> {admin.schoolId.contact.phone}
										</div>
									)}
									{admin.schoolId.contact?.email && (
										<div style={{ fontSize: '0.9rem', color: '#666' }}>
											<strong>Email:</strong> {admin.schoolId.contact.email}
										</div>
									)}
								</div>
							)}

							{/* Status */}
							<div style={{ marginBottom: '1rem' }}>
								<span style={{ 
									padding: '0.3rem 0.7rem',
									borderRadius: '12px',
									fontSize: '0.8rem',
									backgroundColor: '#fff3cd',
									color: '#856404'
								}}>
									⏳ Pending Verification
								</span>
							</div>

							{/* Actions */}
							<div style={{ 
								display: 'flex', 
								gap: '0.5rem', 
								flexWrap: 'wrap'
							}}>
								<button 
									onClick={() => showAdminDetails(admin)}
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
									👁️ View Details
								</button>

								<button 
									onClick={() => handleVerification(admin._id, true)}
									disabled={processingIds.has(admin._id)}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: processingIds.has(admin._id) ? '#ccc' : '#28a745',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										cursor: processingIds.has(admin._id) ? 'not-allowed' : 'pointer',
										fontSize: '0.9rem'
									}}
								>
									{processingIds.has(admin._id) ? '⏳' : '✅'} Approve
								</button>

								<button 
									onClick={() => handleVerification(admin._id, false)}
									disabled={processingIds.has(admin._id)}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: processingIds.has(admin._id) ? '#ccc' : '#dc3545',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										cursor: processingIds.has(admin._id) ? 'not-allowed' : 'pointer',
										fontSize: '0.9rem'
									}}
								>
									{processingIds.has(admin._id) ? '⏳' : '❌'} Reject
								</button>
							</div>
						</div>
					))}
				</div>
			) : (
				<div style={{ 
					textAlign: 'center', 
					padding: '3rem',
					backgroundColor: 'white',
					borderRadius: '8px',
					border: '1px solid #e0e0e0'
				}}>
					<div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
					<h3 style={{ color: '#333', marginBottom: '0.5rem' }}>No Pending Registrations</h3>
					<p style={{ color: '#666', margin: 0 }}>
						All school admin registrations have been processed.
					</p>
				</div>
			)}

			{/* Details Modal */}
			{showDetails && selectedAdmin && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0,0,0,0.5)',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 1000
				}}>
					<div style={{
						backgroundColor: 'white',
						padding: '2rem',
						borderRadius: '8px',
						maxWidth: '600px',
						width: '90%',
						maxHeight: '80vh',
						overflow: 'auto'
					}}>
						<div style={{ 
							display: 'flex', 
							justifyContent: 'space-between', 
							alignItems: 'center',
							marginBottom: '1.5rem'
						}}>
							<h2 style={{ margin: 0, color: '#333' }}>
								👤 Admin Details
							</h2>
							<button
								onClick={() => setShowDetails(false)}
								style={{
									backgroundColor: 'transparent',
									border: 'none',
									fontSize: '1.5rem',
									cursor: 'pointer',
									color: '#666'
								}}
							>
								✕
							</button>
						</div>

						<div style={{ lineHeight: '1.6' }}>
							<h3 style={{ color: '#007bff', marginBottom: '1rem' }}>Personal Information</h3>
							<div style={{ marginBottom: '0.5rem' }}><strong>Name:</strong> {selectedAdmin.name}</div>
							<div style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {selectedAdmin.email}</div>
							<div style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> {selectedAdmin.phone || 'Not provided'}</div>
							<div style={{ marginBottom: '1.5rem' }}><strong>Registered:</strong> {new Date(selectedAdmin.createdAt).toLocaleString()}</div>

							{selectedAdmin.schoolId && (
								<>
									<h3 style={{ color: '#007bff', marginBottom: '1rem' }}>School Information</h3>
									<div style={{ marginBottom: '0.5rem' }}><strong>School Name:</strong> {selectedAdmin.schoolId.name}</div>
									<div style={{ marginBottom: '0.5rem' }}><strong>Type:</strong> {selectedAdmin.schoolId.schoolType}</div>
									<div style={{ marginBottom: '0.5rem' }}><strong>Description:</strong> {selectedAdmin.schoolId.description || 'Not provided'}</div>
									
									<h4 style={{ color: '#007bff', marginTop: '1rem', marginBottom: '0.5rem' }}>Location</h4>
									<div style={{ marginBottom: '0.5rem' }}><strong>Address:</strong> {selectedAdmin.schoolId.location?.address || 'Not provided'}</div>
									<div style={{ marginBottom: '0.5rem' }}><strong>City:</strong> {selectedAdmin.schoolId.location?.city}</div>
									<div style={{ marginBottom: '0.5rem' }}><strong>State:</strong> {selectedAdmin.schoolId.location?.state}</div>
									<div style={{ marginBottom: '1rem' }}><strong>Postal Code:</strong> {selectedAdmin.schoolId.location?.postalCode || 'Not provided'}</div>

									<h4 style={{ color: '#007bff', marginTop: '1rem', marginBottom: '0.5rem' }}>Contact Information</h4>
									<div style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> {selectedAdmin.schoolId.contact?.phone || 'Not provided'}</div>
									<div style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {selectedAdmin.schoolId.contact?.email || 'Not provided'}</div>
									<div style={{ marginBottom: '1rem' }}><strong>Website:</strong> {selectedAdmin.schoolId.contact?.website || 'Not provided'}</div>

									{selectedAdmin.schoolId.curriculum && selectedAdmin.schoolId.curriculum.length > 0 && (
										<>
											<h4 style={{ color: '#007bff', marginTop: '1rem', marginBottom: '0.5rem' }}>Curriculum</h4>
											<div style={{ marginBottom: '1rem' }}>{selectedAdmin.schoolId.curriculum.join(', ')}</div>
										</>
									)}
								</>
							)}
						</div>

						<div style={{ 
							display: 'flex', 
							gap: '1rem',
							justifyContent: 'flex-end',
							marginTop: '2rem'
						}}>
							<button 
								onClick={() => {
									setShowDetails(false);
									handleVerification(selectedAdmin._id, true);
								}}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#28a745',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '0.9rem'
								}}
							>
								✅ Approve Registration
							</button>
							<button 
								onClick={() => {
									setShowDetails(false);
									handleVerification(selectedAdmin._id, false);
								}}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#dc3545',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '0.9rem'
								}}
							>
								❌ Reject Registration
							</button>
							<button
								onClick={() => setShowDetails(false)}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '0.9rem'
								}}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PendingRegistrations;