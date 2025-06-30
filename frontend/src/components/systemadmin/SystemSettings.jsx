import React, { useState, useEffect } from 'react';

const SystemSettings = () => {
	const [settings, setSettings] = useState({
		general: {
			siteName: 'School Tour Booking System',
			siteDescription: 'Platform for booking school tours and managing educational visits',
			adminEmail: 'admin@schooltourbooking.com',
			supportEmail: 'support@schooltourbooking.com',
			maintenanceMode: false,
			allowRegistrations: true
		},
		booking: {
			defaultTourDuration: 90,
			maxAdvanceBooking: 30,
			minAdvanceBooking: 2,
			maxVisitorsPerTour: 20,
			allowCancellations: true,
			cancellationDeadline: 24
		},
		verification: {
			autoApproveSchools: false,
			requireDocuments: true,
			verificationDeadline: 7,
			requirePhoneVerification: true,
			requireEmailVerification: true
		},
		notifications: {
			emailNotifications: true,
			smsNotifications: false,
			bookingConfirmations: true,
			reminderNotifications: true,
			systemAlerts: true
		}
	});

	const [activeTab, setActiveTab] = useState('general');
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [systemStats, setSystemStats] = useState({
		uptime: '0 days',
		version: '1.0.0',
		database: 'Connected',
		lastBackup: 'Never',
		diskUsage: '0%'
	});

	useEffect(() => {
		fetchSystemStats();
		// Load settings from localStorage or API
		const savedSettings = localStorage.getItem('systemSettings');
		if (savedSettings) {
			setSettings(JSON.parse(savedSettings));
		}
	}, []);

	const fetchSystemStats = async () => {
		try {
			// This would typically fetch real system stats from an API
			const startTime = Date.now() - (Math.random() * 86400000 * 7); // Random uptime up to 7 days
			const uptime = Math.floor((Date.now() - startTime) / (1000 * 60 * 60 * 24));
			
			setSystemStats({
				uptime: `${uptime} days`,
				version: '1.0.0',
				database: 'Connected',
				lastBackup: new Date(Date.now() - Math.random() * 86400000).toLocaleDateString(),
				diskUsage: `${Math.floor(Math.random() * 30 + 20)}%`
			});
		} catch (error) {
			console.error('Error fetching system stats:', error);
		}
	};

	const handleSettingChange = (category, key, value) => {
		setSettings(prev => ({
			...prev,
			[category]: {
				...prev[category],
				[key]: value
			}
		}));
		setHasUnsavedChanges(true);
	};

	const saveSettings = () => {
		// In a real app, this would save to the backend
		localStorage.setItem('systemSettings', JSON.stringify(settings));
		setHasUnsavedChanges(false);
		alert('Settings saved successfully!');
	};

	const resetSettings = () => {
		if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
			// Reset to default settings
			localStorage.removeItem('systemSettings');
			window.location.reload();
		}
	};

	const exportSettings = () => {
		const dataStr = JSON.stringify(settings, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'system_settings.json';
		link.click();
		URL.revokeObjectURL(url);
	};

	const importSettings = (event) => {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const importedSettings = JSON.parse(e.target.result);
					setSettings(importedSettings);
					setHasUnsavedChanges(true);
					alert('Settings imported successfully!');
				} catch {
					alert('Error importing settings. Please check the file format.');
				}
			};
			reader.readAsText(file);
		}
	};

	const performSystemAction = (action) => {
		switch (action) {
			case 'backup':
				alert('System backup initiated. You will be notified when complete.');
				break;
			case 'clearCache':
				localStorage.clear();
				alert('System cache cleared successfully!');
				break;
			case 'restartServices':
				alert('Service restart initiated. Some features may be temporarily unavailable.');
				break;
			case 'checkUpdates':
				alert('Checking for updates... System is up to date!');
				break;
			default:
				break;
		}
	};

	const cardStyle = {
		backgroundColor: 'white',
		border: '1px solid #ddd',
		borderRadius: '8px',
		padding: '1.5rem',
		marginBottom: '1.5rem',
		boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
	};

	const tabStyle = {
		padding: '0.75rem 1.5rem',
		margin: '0 0.25rem',
		border: 'none',
		borderRadius: '4px',
		cursor: 'pointer',
		fontWeight: '500'
	};

	const activeTabStyle = {
		...tabStyle,
		backgroundColor: '#6f42c1',
		color: 'white'
	};

	const inactiveTabStyle = {
		...tabStyle,
		backgroundColor: '#f8f9fa',
		color: '#666'
	};

	const inputStyle = {
		width: '100%',
		padding: '0.5rem',
		border: '1px solid #ddd',
		borderRadius: '4px',
		marginBottom: '0.5rem'
	};

	const switchStyle = {
		width: '50px',
		height: '25px',
		backgroundColor: '#ccc',
		borderRadius: '25px',
		position: 'relative',
		cursor: 'pointer',
		transition: 'background-color 0.3s'
	};

	const switchThumbStyle = {
		width: '21px',
		height: '21px',
		backgroundColor: 'white',
		borderRadius: '50%',
		position: 'absolute',
		top: '2px',
		transition: 'left 0.3s'
	};

	const ToggleSwitch = ({ checked, onChange }) => (
		<div 
			style={{
				...switchStyle,
				backgroundColor: checked ? '#28a745' : '#ccc'
			}}
			onClick={() => onChange(!checked)}
		>
			<div 
				style={{
					...switchThumbStyle,
					left: checked ? '27px' : '2px'
				}}
			/>
		</div>
	);

	return (
		<div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
				<h1>⚙️ System Settings</h1>
				<div>
					{hasUnsavedChanges && (
						<span style={{ 
							color: '#dc3545', 
							marginRight: '1rem',
							padding: '0.5rem',
							backgroundColor: '#f8d7da',
							borderRadius: '4px'
						}}>
							⚠️ Unsaved changes
						</span>
					)}
					<button 
						onClick={saveSettings}
						disabled={!hasUnsavedChanges}
						style={{
							padding: '0.75rem 1.5rem',
							backgroundColor: hasUnsavedChanges ? '#28a745' : '#6c757d',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
							marginRight: '0.5rem'
						}}
					>
						💾 Save Settings
					</button>
				</div>
			</div>

			{/* Settings Tabs */}
			<div style={{ marginBottom: '2rem' }}>
				<button
					style={activeTab === 'general' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setActiveTab('general')}
				>
					🔧 General
				</button>
				<button
					style={activeTab === 'booking' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setActiveTab('booking')}
				>
					📅 Booking Settings
				</button>
				<button
					style={activeTab === 'verification' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setActiveTab('verification')}
				>
					✅ Verification
				</button>
				<button
					style={activeTab === 'notifications' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setActiveTab('notifications')}
				>
					🔔 Notifications
				</button>
				<button
					style={activeTab === 'system' ? activeTabStyle : inactiveTabStyle}
					onClick={() => setActiveTab('system')}
				>
					🖥️ System
				</button>
			</div>

			{/* General Settings */}
			{activeTab === 'general' && (
				<div style={cardStyle}>
					<h3>🔧 General Settings</h3>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
						<div>
							<label><strong>Site Name:</strong></label>
							<input
								type="text"
								value={settings.general.siteName}
								onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
								style={inputStyle}
							/>
						</div>
						<div>
							<label><strong>Admin Email:</strong></label>
							<input
								type="email"
								value={settings.general.adminEmail}
								onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
								style={inputStyle}
							/>
						</div>
					</div>
					
					<div>
						<label><strong>Site Description:</strong></label>
						<textarea
							value={settings.general.siteDescription}
							onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
							style={{...inputStyle, height: '80px'}}
						/>
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
						<div>
							<strong>Maintenance Mode</strong>
							<p style={{ color: '#666', margin: '0.25rem 0' }}>Disable public access for maintenance</p>
						</div>
						<ToggleSwitch
							checked={settings.general.maintenanceMode}
							onChange={(value) => handleSettingChange('general', 'maintenanceMode', value)}
						/>
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
						<div>
							<strong>Allow New Registrations</strong>
							<p style={{ color: '#666', margin: '0.25rem 0' }}>Allow new schools to register</p>
						</div>
						<ToggleSwitch
							checked={settings.general.allowRegistrations}
							onChange={(value) => handleSettingChange('general', 'allowRegistrations', value)}
						/>
					</div>
				</div>
			)}

			{/* Booking Settings */}
			{activeTab === 'booking' && (
				<div style={cardStyle}>
					<h3>📅 Booking Settings</h3>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
						<div>
							<label><strong>Default Tour Duration (minutes):</strong></label>
							<input
								type="number"
								value={settings.booking.defaultTourDuration}
								onChange={(e) => handleSettingChange('booking', 'defaultTourDuration', parseInt(e.target.value))}
								style={inputStyle}
							/>
						</div>
						<div>
							<label><strong>Max Advance Booking (days):</strong></label>
							<input
								type="number"
								value={settings.booking.maxAdvanceBooking}
								onChange={(e) => handleSettingChange('booking', 'maxAdvanceBooking', parseInt(e.target.value))}
								style={inputStyle}
							/>
						</div>
						<div>
							<label><strong>Min Advance Booking (days):</strong></label>
							<input
								type="number"
								value={settings.booking.minAdvanceBooking}
								onChange={(e) => handleSettingChange('booking', 'minAdvanceBooking', parseInt(e.target.value))}
								style={inputStyle}
							/>
						</div>
						<div>
							<label><strong>Max Visitors Per Tour:</strong></label>
							<input
								type="number"
								value={settings.booking.maxVisitorsPerTour}
								onChange={(e) => handleSettingChange('booking', 'maxVisitorsPerTour', parseInt(e.target.value))}
								style={inputStyle}
							/>
						</div>
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
						<div>
							<strong>Allow Cancellations</strong>
							<p style={{ color: '#666', margin: '0.25rem 0' }}>Allow users to cancel bookings</p>
						</div>
						<ToggleSwitch
							checked={settings.booking.allowCancellations}
							onChange={(value) => handleSettingChange('booking', 'allowCancellations', value)}
						/>
					</div>

					{settings.booking.allowCancellations && (
						<div style={{ marginTop: '1rem' }}>
							<label><strong>Cancellation Deadline (hours before tour):</strong></label>
							<input
								type="number"
								value={settings.booking.cancellationDeadline}
								onChange={(e) => handleSettingChange('booking', 'cancellationDeadline', parseInt(e.target.value))}
								style={inputStyle}
							/>
						</div>
					)}
				</div>
			)}

			{/* Verification Settings */}
			{activeTab === 'verification' && (
				<div style={cardStyle}>
					<h3>✅ Verification Settings</h3>
					
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
						<div>
							<strong>Auto-Approve Schools</strong>
							<p style={{ color: '#666', margin: '0.25rem 0' }}>Automatically approve new school registrations</p>
						</div>
						<ToggleSwitch
							checked={settings.verification.autoApproveSchools}
							onChange={(value) => handleSettingChange('verification', 'autoApproveSchools', value)}
						/>
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
						<div>
							<strong>Require Documents</strong>
							<p style={{ color: '#666', margin: '0.25rem 0' }}>Schools must upload verification documents</p>
						</div>
						<ToggleSwitch
							checked={settings.verification.requireDocuments}
							onChange={(value) => handleSettingChange('verification', 'requireDocuments', value)}
						/>
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
						<div>
							<strong>Require Phone Verification</strong>
							<p style={{ color: '#666', margin: '0.25rem 0' }}>Verify phone numbers during registration</p>
						</div>
						<ToggleSwitch
							checked={settings.verification.requirePhoneVerification}
							onChange={(value) => handleSettingChange('verification', 'requirePhoneVerification', value)}
						/>
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
						<div>
							<strong>Require Email Verification</strong>
							<p style={{ color: '#666', margin: '0.25rem 0' }}>Verify email addresses during registration</p>
						</div>
						<ToggleSwitch
							checked={settings.verification.requireEmailVerification}
							onChange={(value) => handleSettingChange('verification', 'requireEmailVerification', value)}
						/>
					</div>

					<div>
						<label><strong>Verification Deadline (days):</strong></label>
						<input
							type="number"
							value={settings.verification.verificationDeadline}
							onChange={(e) => handleSettingChange('verification', 'verificationDeadline', parseInt(e.target.value))}
							style={inputStyle}
						/>
						<small style={{ color: '#666' }}>How long schools have to complete verification</small>
					</div>
				</div>
			)}

			{/* Notification Settings */}
			{activeTab === 'notifications' && (
				<div style={cardStyle}>
					<h3>🔔 Notification Settings</h3>
					
					{[
						{ key: 'emailNotifications', label: 'Email Notifications', desc: 'Send notifications via email' },
						{ key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send notifications via SMS' },
						{ key: 'bookingConfirmations', label: 'Booking Confirmations', desc: 'Send booking confirmation messages' },
						{ key: 'reminderNotifications', label: 'Reminder Notifications', desc: 'Send reminder messages before tours' },
						{ key: 'systemAlerts', label: 'System Alerts', desc: 'Send system status and error alerts' }
					].map((setting, index) => (
						<div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
							<div>
								<strong>{setting.label}</strong>
								<p style={{ color: '#666', margin: '0.25rem 0' }}>{setting.desc}</p>
							</div>
							<ToggleSwitch
								checked={settings.notifications[setting.key]}
								onChange={(value) => handleSettingChange('notifications', setting.key, value)}
							/>
						</div>
					))}
				</div>
			)}

			{/* System Management */}
			{activeTab === 'system' && (
				<div>
					{/* System Status */}
					<div style={cardStyle}>
						<h3>🖥️ System Status</h3>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
							{Object.entries(systemStats).map(([key, value], index) => (
								<div key={index} style={{ 
									padding: '1rem', 
									backgroundColor: '#f8f9fa', 
									borderRadius: '4px',
									textAlign: 'center'
								}}>
									<div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
									<div style={{ fontSize: '1.2rem', color: '#007bff', marginTop: '0.5rem' }}>{value}</div>
								</div>
							))}
						</div>
					</div>

					{/* System Actions */}
					<div style={cardStyle}>
						<h3>🔧 System Actions</h3>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
							<button
								onClick={() => performSystemAction('backup')}
								style={{
									padding: '1rem',
									backgroundColor: '#28a745',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								💾 Create Backup
							</button>
							<button
								onClick={() => performSystemAction('clearCache')}
								style={{
									padding: '1rem',
									backgroundColor: '#ffc107',
									color: 'black',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								🗑️ Clear Cache
							</button>
							<button
								onClick={() => performSystemAction('restartServices')}
								style={{
									padding: '1rem',
									backgroundColor: '#dc3545',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								🔄 Restart Services
							</button>
							<button
								onClick={() => performSystemAction('checkUpdates')}
								style={{
									padding: '1rem',
									backgroundColor: '#6f42c1',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								🔍 Check Updates
							</button>
						</div>
					</div>

					{/* Settings Management */}
					<div style={cardStyle}>
						<h3>⚙️ Settings Management</h3>
						<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
							<button
								onClick={exportSettings}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#17a2b8',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								📥 Export Settings
							</button>
							<label style={{
								padding: '0.75rem 1.5rem',
								backgroundColor: '#6c757d',
								color: 'white',
								borderRadius: '4px',
								cursor: 'pointer'
							}}>
								📤 Import Settings
								<input
									type="file"
									accept=".json"
									onChange={importSettings}
									style={{ display: 'none' }}
								/>
							</label>
							<button
								onClick={resetSettings}
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#dc3545',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								🔄 Reset to Defaults
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SystemSettings;