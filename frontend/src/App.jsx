import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/home';
import Login from './pages/Login';
import SchoolDetails from './pages/schoolDetails';
import Dashboard from './pages/Dashboard';
import SchoolAdminPortal from './pages/SchoolAdminPortal';
import SystemAdminPortal from './pages/SystemAdminPortal';
import SelectRole from './pages/SelectRole';
import RegisterParent from './pages/RegisterParent';
import RegisterSchoolAdmin from './pages/RegisterSchoolAdmin';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Results from './pages/results';

function App() {
	return (
		<Router>
			<div className="App">
				<Navbar />
				<Routes>
					{/* Public Home Page */}
					<Route path="/" element={<Home />} />

					{/* Authentication Routes */}
					<Route path="/login" element={<Login />} />
					<Route path="/select-role" element={<SelectRole />} />
					<Route path="/register/parent" element={<RegisterParent />} />
					<Route path="/register/school-admin" element={<RegisterSchoolAdmin />} />

					 <Route path="/school/:id" element={<SchoolDetails />} />

					 <Route path='/results' element={<Results />} />

					{/* Parent Dashboard */}
					<Route path="/dashboard" element={
						<ProtectedRoute requiredRole="parent">
							<Dashboard />
						</ProtectedRoute>
					} />

					{/* School Admin Portal */}
					<Route path="/school-admin/*" element={
						<ProtectedRoute requiredRole="school_admin">
							<SchoolAdminPortal />
						</ProtectedRoute>
					} />

					{/* System Admin Portal */}
					<Route path="/system-admin/*" element={
						<ProtectedRoute requiredRole="system_admin">
							<SystemAdminPortal />
						</ProtectedRoute>
					} />

					{/* Catch-All for 404s */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</Router>
	);
}

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
