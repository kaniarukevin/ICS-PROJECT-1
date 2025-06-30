import React, { useState } from 'react';
import SchoolAdminDashboard from '../components/schooladmin/SchoolAdminDashboard';
import ManageTours from '../components/schooladmin/ManageTours';
import ViewBookings from '../components/schooladmin/ViewBookings';

const SchoolAdminPortal = () => {
	const [activeTab, setActiveTab] = useState('dashboard');

	const renderContent = () => {
		switch (activeTab) {
			case 'dashboard':
				return <SchoolAdminDashboard />;
			case 'tours':
				return <ManageTours />;
			case 'bookings':
				return <ViewBookings />;
			default:
				return <SchoolAdminDashboard />;
		}
	};

	return (
		<div className="portal-container">
			<div className="portal-sidebar">
				<h2>School Admin</h2>
				<nav className="portal-nav">
					<button 
						className={activeTab === 'dashboard' ? 'active' : ''}
						onClick={() => setActiveTab('dashboard')}
					>
						Dashboard
					</button>
					<button 
						className={activeTab === 'tours' ? 'active' : ''}
						onClick={() => setActiveTab('tours')}
					>
						Manage Tours
					</button>
					<button 
						className={activeTab === 'bookings' ? 'active' : ''}
						onClick={() => setActiveTab('bookings')}
					>
						View Bookings
					</button>
				</nav>
			</div>

			<div className="portal-content">
				{renderContent()}
			</div>
		</div>
	);
};

export default SchoolAdminPortal;