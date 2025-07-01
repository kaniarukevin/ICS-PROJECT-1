// frontend/src/App.jsx (Complete with All Registration Routes)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import existing components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SchoolAdminPortal from './pages/SchoolAdminPortal';
import SystemAdminPortal from './pages/SystemAdminPortal';

// Import new registration components
import SelectRole from './pages/SelectRole';
import RegisterParent from './pages/RegisterParent';
import RegisterSchoolAdmin from './pages/RegisterSchoolAdmin';

// Import common components
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

function App() {
	return (
		<Router>
			<div className="App">
				<Navbar />
				<Routes>
					{/* Authentication Routes */}
					<Route path="/login" element={<Login />} />
					
					{/* Registration Routes */}
					<Route path="/select-role" element={<SelectRole />} />
					<Route path="/register/parent" element={<RegisterParent />} />
					<Route path="/register/school-admin" element={<RegisterSchoolAdmin />} />
					
					{/* Main Dashboard Route */}
					<Route path="/dashboard" element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					} />
					
					{/* Role-Specific Portal Routes */}
					<Route path="/school-admin/*" element={
						<ProtectedRoute requiredRole="school_admin">
							<SchoolAdminPortal />
						</ProtectedRoute>
					} />
					
					<Route path="/system-admin/*" element={
						<ProtectedRoute requiredRole="system_admin">
							<SystemAdminPortal />
						</ProtectedRoute>
					} />
					
					{/* Default Route - Smart Redirect */}
					<Route path="/" element={<SmartRedirect />} />
					
					{/* Catch-all route */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</Router>
	);
}

// Smart redirect component that redirects based on authentication state
const SmartRedirect = () => {
	const token = localStorage.getItem('token');
	const user = localStorage.getItem('user');
	
	if (token && user) {
		try {
			const userData = JSON.parse(user);
			// Redirect based on user role
			switch (userData.role) {
				case 'school_admin':
					return <Navigate to="/school-admin" replace />;
				case 'system_admin':
					return <Navigate to="/system-admin" replace />;
				case 'parent':
					return <Navigate to="/dashboard" replace />;
				default:
					return <Navigate to="/dashboard" replace />;
			}
		} catch (error) {
			// If user data is corrupted, clear it and redirect to login
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			return <Navigate to="/login" replace />;
		}
	}
	
	// If not authenticated, redirect to login
	return <Navigate to="/login" replace />;
};

// 404 Not Found component
const NotFound = () => {
	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: '70vh',
			textAlign: 'center',
			padding: '2rem'
		}}>
			<h1 style={{ 
				fontSize: '6rem', 
				margin: 0,
				color: '#dc3545'
			}}>
				404
			</h1>
			<h2 style={{ 
				color: '#333',
				marginBottom: '1rem'
			}}>
				Page Not Found
			</h2>
			<p style={{ 
				color: '#666',
				marginBottom: '2rem',
				maxWidth: '400px'
			}}>
				The page you're looking for doesn't exist or has been moved.
			</p>
			<button
				onClick={() => window.location.href = '/'}
				style={{
					padding: '1rem 2rem',
					backgroundColor: '#007bff',
					color: 'white',
					border: 'none',
					borderRadius: '8px',
					fontSize: '1rem',
					cursor: 'pointer'
				}}
			>
				🏠 Go Home
			</button>
		</div>
	);
};

export default App;