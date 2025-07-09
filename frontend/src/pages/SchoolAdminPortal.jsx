// frontend/src/pages/SchoolAdminPortal.jsx
import React, { useState, useEffect } from 'react';
import SchoolAdminDashboard from '../components/schooladmin/SchoolAdminDashboard';
import ManageTours from '../components/schooladmin/ManageTours';
import ViewBookings from '../components/schooladmin/ViewBookings';
import SchoolProfile from '../components/schooladmin/SchoolProfile';
import Messages from '../components/schooladmin/Messages';

const SchoolAdminPortal = () => {
	const [activeTab, setActiveTab] = useState('dashboard');
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		fetchUnreadCount();
		// Set up interval to check for new messages every 30 seconds
		const interval = setInterval(fetchUnreadCount, 30000);
		return () => clearInterval(interval);
	}, []);

	const fetchUnreadCount = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/messages/unread-count', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (response.ok) {
				const data = await response.json();
				setUnreadCount(data.unreadCount);
			}
		} catch (error) {
			console.error('Error fetching unread count:', error);
		}
	};

	const handleNavigate = (tab) => {
		setActiveTab(tab);
		// Refresh unread count when switching to messages
		if (tab === 'messages') {
			setTimeout(fetchUnreadCount, 500);
		}
	};

	const renderContent = () => {
		switch (activeTab) {
			case 'dashboard':
				return <SchoolAdminDashboard onNavigate={handleNavigate} />;
			case 'tours':
				return <ManageTours />;
			case 'bookings':
				return <ViewBookings />;
			case 'messages':
				return <Messages />;
			case 'profile':
				return <SchoolProfile />;
			default:
				return <SchoolAdminDashboard onNavigate={handleNavigate} />;
		}
	};

	const navButtonStyle = {
		width: '100%',
		padding: '0.75rem 1rem',
		margin: '0.25rem 0',
		border: 'none',
		borderRadius: '4px',
		backgroundColor: 'transparent',
		cursor: 'pointer',
		textAlign: 'left',
		transition: 'background-color 0.2s',
		fontSize: '0.95rem',
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	};

	const activeNavButtonStyle = {
		...navButtonStyle,
		backgroundColor: '#007bff',
		color: 'white'
	};

	const badgeStyle = {
		backgroundColor: '#dc3545',
		color: 'white',
		borderRadius: '10px',
		padding: '0.2rem 0.5rem',
		fontSize: '0.7rem',
		fontWeight: 'bold',
		minWidth: '18px',
		textAlign: 'center'
	};

	const sidebarStyle = {
		width: '250px',
		backgroundColor: '#f8f9fa',
		borderRight: '1px solid #dee2e6',
		padding: '1rem',
		minHeight: '100vh'
	};

	const mainContentStyle = {
		flex: 1,
		overflow: 'auto',
		backgroundColor: '#ffffff'
	};

	return (
		<div style={{ display: 'flex', minHeight: '100vh' }}>
			<div style={sidebarStyle}>
				<h2 style={{ marginBottom: '2rem', color: '#007bff', fontSize: '1.4rem' }}>
					🏫 School Admin
				</h2>
				
				<nav>
					<button 
						style={activeTab === 'dashboard' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('dashboard')}
					>
						<span>📊 Dashboard</span>
					</button>
					
					<button 
						style={activeTab === 'tours' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('tours')}
					>
						<span>🎯 Manage Tours</span>
					</button>
					
					<button 
						style={activeTab === 'bookings' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('bookings')}
					>
						<span>📅 View Bookings</span>
					</button>
					
					<button 
						style={activeTab === 'messages' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('messages')}
					>
						<span>💬 Messages</span>
						{unreadCount > 0 && (
							<span style={badgeStyle}>
								{unreadCount > 99 ? '99+' : unreadCount}
							</span>
						)}
					</button>
					
					<button 
						style={activeTab === 'profile' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('profile')}
					>
						<span>🏛️ School Profile</span>
					</button>
				</nav>

				{/* Quick Stats */}
				<div style={{ 
					marginTop: '2rem', 
					padding: '1rem', 
					backgroundColor: '#e3f2fd', 
					borderRadius: '8px',
					fontSize: '0.9rem'
				}}>
					<div style={{ color: '#1565c0', fontWeight: 'bold', marginBottom: '0.5rem' }}>
						🟢 Quick Info
					</div>
					<div style={{ color: '#1565c0', marginBottom: '0.3rem' }}>
						Manage your school tours, bookings, and parent communications efficiently
					</div>
					{unreadCount > 0 && (
						<div style={{ color: '#dc3545', marginTop: '0.5rem', fontWeight: 'bold' }}>
							💬 {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
						</div>
					)}
				</div>

				{/* Action Shortcuts */}
				<div style={{ 
					marginTop: '1rem', 
					padding: '1rem', 
					backgroundColor: '#fff3e0', 
					borderRadius: '8px',
					fontSize: '0.85rem'
				}}>
					<div style={{ color: '#e65100', fontWeight: 'bold', marginBottom: '0.5rem' }}>
						⚡ Quick Actions
					</div>
					<button 
						onClick={() => setActiveTab('tours')}
						style={{
							width: '100%',
							padding: '0.4rem',
							margin: '0.2rem 0',
							border: '1px solid #ff9800',
							borderRadius: '4px',
							backgroundColor: 'transparent',
							color: '#e65100',
							cursor: 'pointer',
							fontSize: '0.8rem'
						}}
					>
						+ Create Tour
					</button>
					<button 
						onClick={() => setActiveTab('bookings')}
						style={{
							width: '100%',
							padding: '0.4rem',
							margin: '0.2rem 0',
							border: '1px solid #ff9800',
							borderRadius: '4px',
							backgroundColor: 'transparent',
							color: '#e65100',
							cursor: 'pointer',
							fontSize: '0.8rem'
						}}
					>
						📋 View Bookings
					</button>
					<button 
						onClick={() => setActiveTab('messages')}
						style={{
							width: '100%',
							padding: '0.4rem',
							margin: '0.2rem 0',
							border: '1px solid #ff9800',
							borderRadius: '4px',
							backgroundColor: 'transparent',
							color: '#e65100',
							cursor: 'pointer',
							fontSize: '0.8rem',
							position: 'relative'
						}}
					>
						💬 Check Messages
						{unreadCount > 0 && (
							<span style={{
								...badgeStyle,
								position: 'absolute',
								top: '-5px',
								right: '-5px',
								fontSize: '0.6rem'
							}}>
								{unreadCount > 99 ? '99+' : unreadCount}
							</span>
						)}
					</button>
				</div>
			</div>

			<div style={mainContentStyle}>
				{renderContent()}
			</div>
		</div>
	);
};

export default SchoolAdminPortal;