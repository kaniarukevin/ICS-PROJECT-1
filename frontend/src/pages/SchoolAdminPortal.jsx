import React, { useState, useEffect } from 'react';
import SchoolAdminDashboard from '../components/schooladmin/SchoolAdminDashboard';
import ManageTours from '../components/schooladmin/ManageTours';
import ViewBookings from '../components/schooladmin/ViewBookings';
import SchoolProfile from '../components/schooladmin/SchoolProfile';
import ReportGenerator from '../components/schooladmin/ReportGenerator';

const SchoolAdminPortal = () => {
	const [activeTab, setActiveTab] = useState('dashboard');
	const [dashboardData, setDashboardData] = useState(null);
	const [loadingDashboard, setLoadingDashboard] = useState(true);
	const [dashboardError, setDashboardError] = useState(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await fetch('http://localhost:5000/api/school-admin/dashboard', {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (!response.ok) throw new Error('Failed to fetch dashboard data');
				const data = await response.json();
				setDashboardData(data);
			} catch (err) {
				setDashboardError(err.message);
			} finally {
				setLoadingDashboard(false);
			}
		};

		fetchDashboardData();
	}, []);

	const handleNavigate = (tab) => {
		setActiveTab(tab);
	};

	const renderContent = () => {
		if (loadingDashboard) {
			return <div style={{ padding: '2rem' }}>⏳ Loading dashboard...</div>;
		}
		if (dashboardError) {
			return <div style={{ padding: '2rem', color: 'red' }}>❌ {dashboardError}</div>;
		}

		switch (activeTab) {
			case 'dashboard':
				return <SchoolAdminDashboard onNavigate={handleNavigate} data={dashboardData} />;
			case 'tours':
				return <ManageTours />;
			case 'bookings':
				return <ViewBookings />;
			case 'profile':
				return <SchoolProfile />;
			case 'reports':
				return (
					<ReportGenerator
						statistics={dashboardData.statistics}
						recentBookings={dashboardData.recentBookings}
						upcomingTours={dashboardData.upcomingTours}
					/>
				);
			default:
				return <SchoolAdminDashboard onNavigate={handleNavigate} data={dashboardData} />;
		}
	};

	// ——— Styles remain unchanged ———
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
		fontSize: '0.95rem'
	};

	const activeNavButtonStyle = {
		...navButtonStyle,
		backgroundColor: '#007bff',
		color: 'white'
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
					<button style={activeTab === 'dashboard' ? activeNavButtonStyle : navButtonStyle} onClick={() => setActiveTab('dashboard')}>
						📊 Dashboard
					</button>
					<button style={activeTab === 'tours' ? activeNavButtonStyle : navButtonStyle} onClick={() => setActiveTab('tours')}>
						🎯 Manage Tours
					</button>
					<button style={activeTab === 'bookings' ? activeNavButtonStyle : navButtonStyle} onClick={() => setActiveTab('bookings')}>
						📅 View Bookings
					</button>
					<button style={activeTab === 'profile' ? activeNavButtonStyle : navButtonStyle} onClick={() => setActiveTab('profile')}>
						🏛️ School Profile
					</button>
					<button style={activeTab === 'reports' ? activeNavButtonStyle : navButtonStyle} onClick={() => setActiveTab('reports')}>
						📄 Reports
					</button>
				</nav>

				{/* Quick Info */}
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
						Manage your school tours and bookings efficiently
					</div>
				</div>

				{/* Quick Actions */}
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
					<button onClick={() => setActiveTab('tours')} style={{
						width: '100%',
						padding: '0.4rem',
						margin: '0.2rem 0',
						border: '1px solid #ff9800',
						borderRadius: '4px',
						backgroundColor: 'transparent',
						color: '#e65100',
						cursor: 'pointer',
						fontSize: '0.8rem'
					}}>
						+ Create Tour
					</button>
					<button onClick={() => setActiveTab('bookings')} style={{
						width: '100%',
						padding: '0.4rem',
						margin: '0.2rem 0',
						border: '1px solid #ff9800',
						borderRadius: '4px',
						backgroundColor: 'transparent',
						color: '#e65100',
						cursor: 'pointer',
						fontSize: '0.8rem'
					}}>
						📋 View Bookings
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
