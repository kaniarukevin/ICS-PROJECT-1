// frontend/src/components/common/MessageNotification.jsx
import React, { useState, useEffect } from 'react';

const MessageNotification = () => {
	const [notifications, setNotifications] = useState([]);
	const [lastUnreadCount, setLastUnreadCount] = useState(0);

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem('user'));
		const token = localStorage.getItem('token');

		if (!user || !token) return;

		// Check for new messages every 10 seconds
		const interval = setInterval(checkForNewMessages, 10000);
		
		// Initial check
		checkForNewMessages();

		return () => clearInterval(interval);
	}, []);

	const checkForNewMessages = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/messages/unread-count', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				const currentUnreadCount = data.unreadCount;

				// If unread count increased, show notification
				if (currentUnreadCount > lastUnreadCount && lastUnreadCount !== 0) {
					const newMessages = currentUnreadCount - lastUnreadCount;
					showNotification(
						`You have ${newMessages} new message${newMessages > 1 ? 's' : ''}`,
						'info'
					);
				}

				setLastUnreadCount(currentUnreadCount);
			}
		} catch (error) {
			console.error('Error checking for new messages:', error);
		}
	};

	const showNotification = (message, type = 'info', duration = 5000) => {
		const id = Date.now();
		const notification = {
			id,
			message,
			type,
			timestamp: new Date()
		};

		setNotifications(prev => [...prev, notification]);

		// Auto remove after duration
		setTimeout(() => {
			removeNotification(id);
		}, duration);
	};

	const removeNotification = (id) => {
		setNotifications(prev => prev.filter(notif => notif.id !== id));
	};

	const getNotificationStyle = (type) => {
		const baseStyle = {
			position: 'relative',
			padding: '1rem 1.5rem',
			marginBottom: '0.5rem',
			borderRadius: '8px',
			boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			minWidth: '300px',
			animation: 'slideInRight 0.3s ease-out',
			cursor: 'pointer'
		};

		const styles = {
			info: {
				backgroundColor: '#d1ecf1',
				borderLeft: '4px solid #0dcaf0',
				color: '#055160'
			},
			success: {
				backgroundColor: '#d4edda',
				borderLeft: '4px solid #198754',
				color: '#0f5132'
			},
			warning: {
				backgroundColor: '#fff3cd',
				borderLeft: '4px solid #ffc107',
				color: '#664d03'
			},
			error: {
				backgroundColor: '#f8d7da',
				borderLeft: '4px solid #dc3545',
				color: '#721c24'
			}
		};

		return {
			...baseStyle,
			...styles[type]
		};
	};

	const containerStyle = {
		position: 'fixed',
		top: '80px', // Below the navbar
		right: '20px',
		zIndex: 9999,
		pointerEvents: 'none'
	};

	const notificationContentStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: '0.75rem',
		flex: 1
	};

	const closeButtonStyle = {
		background: 'none',
		border: 'none',
		fontSize: '1.2rem',
		cursor: 'pointer',
		color: 'inherit',
		opacity: 0.7,
		padding: '0',
		pointerEvents: 'auto'
	};

	const getIcon = (type) => {
		switch (type) {
			case 'success': return '✅';
			case 'warning': return '⚠️';
			case 'error': return '❌';
			default: return '💬';
		}
	};

	return (
		<>
			<style>
				{`
					@keyframes slideInRight {
						from {
							transform: translateX(100%);
							opacity: 0;
						}
						to {
							transform: translateX(0);
							opacity: 1;
						}
					}
					
					@keyframes slideOutRight {
						from {
							transform: translateX(0);
							opacity: 1;
						}
						to {
							transform: translateX(100%);
							opacity: 0;
						}
					}
				`}
			</style>
			
			<div style={containerStyle}>
				{notifications.map(notification => (
					<div
						key={notification.id}
						style={{
							...getNotificationStyle(notification.type),
							pointerEvents: 'auto'
						}}
						onClick={() => removeNotification(notification.id)}
					>
						<div style={notificationContentStyle}>
							<span style={{ fontSize: '1.2rem' }}>
								{getIcon(notification.type)}
							</span>
							<div>
								<div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
									{notification.message}
								</div>
								<div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
									Click to dismiss
								</div>
							</div>
						</div>
						<button
							style={closeButtonStyle}
							onClick={(e) => {
								e.stopPropagation();
								removeNotification(notification.id);
							}}
							onMouseEnter={(e) => {
								e.target.style.opacity = 1;
							}}
							onMouseLeave={(e) => {
								e.target.style.opacity = 0.7;
							}}
						>
							×
						</button>
					</div>
				))}
			</div>
		</>
	);
};

// Hook to use notifications throughout the app
export const useNotification = () => {
	const showNotification = (message, type = 'info', duration = 5000) => {
		// This would typically dispatch to a global notification state
		// For now, we'll use a simple event system
		const event = new CustomEvent('showNotification', {
			detail: { message, type, duration }
		});
		window.dispatchEvent(event);
	};

	return { showNotification };
};

export default MessageNotification;