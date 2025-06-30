import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
	const token = localStorage.getItem('token');
	const user = JSON.parse(localStorage.getItem('user'));

	// Check if user is logged in
	if (!token || !user) {
		return <Navigate to="/login" />;
	}

	// Check if user has required role (if allowedRoles is specified)
	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<h2>Access Denied</h2>
				<p>You don't have permission to access this page.</p>
				<p>Required role: {allowedRoles.join(' or ')}</p>
				<p>Your role: {user.role}</p>
			</div>
		);
	}

	return children;
};

export default ProtectedRoute;