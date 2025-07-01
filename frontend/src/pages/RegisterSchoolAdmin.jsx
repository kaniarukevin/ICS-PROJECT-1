// frontend/src/pages/RegisterSchoolAdmin.jsx
import React from 'react';
import SchoolAdminRegistration from '../components/auth/SchoolAdminRegistration';

const RegisterSchoolAdmin = () => {
	return (
		<div style={{ 
			minHeight: '100vh',
			backgroundColor: '#f8f9fa',
			padding: '2rem 0'
		}}>
			<SchoolAdminRegistration />
		</div>
	);
};

export default RegisterSchoolAdmin;