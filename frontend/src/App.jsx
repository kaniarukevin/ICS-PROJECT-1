import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SchoolAdminPortal from './pages/SchoolAdminPortal';
import SystemAdminPortal from './pages/SystemAdminPortal';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
	return (
		<Router>
			<div className="App">
				<Navbar />
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route 
						path="/dashboard" 
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						} 
					/>
					<Route 
						path="/school-admin" 
						element={
							<ProtectedRoute allowedRoles={['school_admin']}>
								<SchoolAdminPortal />
							</ProtectedRoute>
						} 
					/>
					<Route 
						path="/system-admin" 
						element={
							<ProtectedRoute allowedRoles={['system_admin']}>
								<SystemAdminPortal />
							</ProtectedRoute>
						} 
					/>
					<Route path="/" element={<Navigate to="/dashboard" />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;