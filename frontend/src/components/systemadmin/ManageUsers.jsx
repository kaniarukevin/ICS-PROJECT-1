import React, { useState, useEffect } from 'react';

const ManageUsers = () => {
	const [users, setUsers] = useState([]);
	const [filter, setFilter] = useState('all'); // all, parent, school_admin, system_admin
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/system-admin/users', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			setUsers(data);
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			setLoading(false);
		}
	};

	const updateUserStatus = async (userId, isActive) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/system-admin/users/${userId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ isActive })
			});

			if (response.ok) {
				fetchUsers();
				alert(`User ${isActive ? 'activated' : 'deactivated'}!`);
			}
		} catch (error) {
			console.error('Error updating user status:', error);
		}
	};

	const filteredUsers = users.filter(user => {
		if (filter === 'all') return true;
		return user.role === filter;
	});

	const getRoleColor = (role) => {
		switch (role) {
			case 'parent': return 'blue';
			case 'school_admin': return 'green';
			case 'system_admin': return 'purple';
			default: return 'gray';
		}
	};

	if (loading) {
		return <div className="loading">Loading users...</div>;
	}

	return (
		<div className="manage-users">
			<h1>Manage Users</h1>
			
			<div className="filters">
				<button 
					className={filter === 'all' ? 'active' : ''}
					onClick={() => setFilter('all')}
				>
					All Users ({users.length})
				</button>
				<button 
					className={filter === 'parent' ? 'active' : ''}
					onClick={() => setFilter('parent')}
				>
					Parents ({users.filter(u => u.role === 'parent').length})
				</button>
				<button 
					className={filter === 'school_admin' ? 'active' : ''}
					onClick={() => setFilter('school_admin')}
				>
					School Admins ({users.filter(u => u.role === 'school_admin').length})
				</button>
				<button 
					className={filter === 'system_admin' ? 'active' : ''}
					onClick={() => setFilter('system_admin')}
				>
					System Admins ({users.filter(u => u.role === 'system_admin').length})
				</button>
			</div>

			<div className="users-table">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>School</th>
							<th>Status</th>
							<th>Created</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map(user => (
							<tr key={user._id}>
								<td>{user.name}</td>
								<td>{user.email}</td>
								<td>
									<span 
										className="role-badge"
										style={{ color: getRoleColor(user.role) }}
									>
										{user.role.replace('_', ' ').toUpperCase()}
									</span>
								</td>
								<td>
									{user.schoolId?.name || 'N/A'}
								</td>
								<td>
									<span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
										{user.isActive ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td>{new Date(user.createdAt).toLocaleDateString()}</td>
								<td>
									<button
										className={user.isActive ? 'btn-danger' : 'btn-success'}
										onClick={() => updateUserStatus(user._id, !user.isActive)}
									>
										{user.isActive ? 'Deactivate' : 'Activate'}
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredUsers.length === 0 && (
				<p className="no-results">No users found for the selected filter.</p>
			)}
		</div>
	);
};

export default ManageUsers;