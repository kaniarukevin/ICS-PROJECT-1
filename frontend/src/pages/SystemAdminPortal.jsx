//frontend/src/pages/SystemAdminPortal.jsx

import React, { useState } from 'react';
import SystemAdminDashboard from '../components/systemadmin/SystemAdminDashboard';
import ManageSchools from '../components/systemadmin/ManageSchools';
import ManageUsers from '../components/systemadmin/ManageUsers';
import SystemReports from '../components/systemadmin/SystemReports';
import SystemSettings from '../components/systemadmin/SystemSettings';

const SystemAdminPortal = () => {
	const [activeTab, setActiveTab] = useState('dashboard');

	const handleNavigate = (tab) => {
		setActiveTab(tab);
	};

	const renderContent = () => {
		switch (activeTab) {
			case 'dashboard':
				return <SystemAdminDashboard onNavigate={handleNavigate} />;
			case 'schools':
				return <ManageSchools />;
			case 'users':
				return <ManageUsers />;
			case 'reports':
				return <SystemReports />;
			case 'settings':
				return <SystemSettings />;
			default:
				return <SystemAdminDashboard onNavigate={handleNavigate} />;
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
		transition: 'background-color 0.2s'
	};

	const activeNavButtonStyle = {
		...navButtonStyle,
		backgroundColor: '#28a745',
		color: 'white'
	};

	return (
		<div style={{ display: 'flex', minHeight: '100vh' }}>
			<div style={{ 
				width: '250px', 
				backgroundColor: '#f8f9fa', 
				borderRight: '1px solid #dee2e6',
				padding: '1rem'
			}}>
				<h2 style={{ marginBottom: '2rem', color: '#28a745' }}>System Admin</h2>
				<nav>
					<button 
						style={activeTab === 'dashboard' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('dashboard')}
					>
						📈 Dashboard
					</button>
					<button 
						style={activeTab === 'schools' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('schools')}
					>
						🏫 Manage Schools
					</button>
					<button 
						style={activeTab === 'users' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('users')}
					>
						👥 Manage Users
					</button>
					<button 
						style={activeTab === 'reports' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('reports')}
					>
						📊 View Reports
					</button>
					<button 
						style={activeTab === 'settings' ? activeNavButtonStyle : navButtonStyle}
						onClick={() => setActiveTab('settings')}
					>
						⚙️ System Settings
					</button>
				</nav>

				{/* System Status Indicator */}
				<div style={{ 
					marginTop: '2rem', 
					padding: '1rem', 
					backgroundColor: '#d4edda', 
					borderRadius: '4px',
					fontSize: '0.9rem'
				}}>
					<div style={{ color: '#155724', fontWeight: 'bold', marginBottom: '0.5rem' }}>🟢 System Status</div>
					<div style={{ color: '#155724' }}>All systems operational</div>
				</div>
			</div>

			<div style={{ flex: 1, overflow: 'auto' }}>
				{renderContent()}
			</div>
		</div>
	);
};

export default SystemAdminPortal;