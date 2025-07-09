// frontend/src/components/common/MessagePreview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MessagePreview = ({ maxItems = 3, showHeader = true, compact = false }) => {
	const [conversations, setConversations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [unreadCount, setUnreadCount] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		fetchRecentConversations();
	}, []);

	const fetchRecentConversations = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/messages/conversations', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				setConversations(data.slice(0, maxItems));
				
				// Calculate unread count
				const totalUnread = data.reduce((sum, conv) => sum + (conv.unreadForCurrentUser || 0), 0);
				setUnreadCount(totalUnread);
			}
		} catch (error) {
			console.error('Error fetching conversations:', error);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
		
		if (diffInHours < 1) {
			return 'Just now';
		} else if (diffInHours < 24) {
			return `${diffInHours}h ago`;
		} else {
			const diffInDays = Math.floor(diffInHours / 24);
			return `${diffInDays}d ago`;
		}
	};

	const getConversationTitle = (conversation, userRole) => {
		if (userRole === 'parent') {
			return conversation.schoolId?.name || 'Unknown School';
		} else {
			const parent = conversation.participants?.find(p => p.role === 'parent');
			return parent?.userId?.name || 'Unknown Parent';
		}
	};

	const getConversationTypeIcon = (type) => {
		switch (type) {
			case 'booking_inquiry': return '📅';
			case 'tour_request': return '🎯';
			case 'complaint': return '⚠️';
			case 'feedback': return '💭';
			default: return '💬';
		}
	};

	const handleViewAllMessages = () => {
		navigate('/messages');
	};

	const user = JSON.parse(localStorage.getItem('user'));
	const userRole = user?.role;

	const containerStyle = {
		backgroundColor: '#ffffff',
		borderRadius: compact ? '8px' : '12px',
		border: '1px solid #e0e0e0',
		overflow: 'hidden',
		boxShadow: compact ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
	};

	const headerStyle = {
		padding: compact ? '1rem' : '1.5rem',
		borderBottom: '1px solid #f0f0f0',
		backgroundColor: '#f8f9fa',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	};

	const titleStyle = {
		margin: 0,
		fontSize: compact ? '1rem' : '1.1rem',
		fontWeight: '600',
		color: '#333',
		display: 'flex',
		alignItems: 'center',
		gap: '0.5rem'
	};

	const badgeStyle = {
		backgroundColor: '#dc3545',
		color: 'white',
		borderRadius: '10px',
		padding: '0.2rem 0.5rem',
		fontSize: '0.7rem',
		fontWeight: 'bold'
	};

	const listStyle = {
		padding: 0,
		margin: 0,
		listStyle: 'none'
	};

	const itemStyle = {
		padding: compact ? '0.75rem 1rem' : '1rem 1.5rem',
		borderBottom: '1px solid #f5f5f5',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
		display: 'flex',
		alignItems: 'flex-start',
		gap: '0.75rem'
	};

	const itemHoverStyle = {
		backgroundColor: '#f8f9fa'
	};

	const emptyStyle = {
		padding: compact ? '1.5rem 1rem' : '3rem 1.5rem',
		textAlign: 'center',
		color: '#666',
		fontSize: compact ? '0.85rem' : '0.9rem'
	};

	const viewAllButtonStyle = {
		width: '100%',
		padding: compact ? '0.75rem' : '1rem',
		backgroundColor: '#f8f9fa',
		border: 'none',
		borderTop: '1px solid #e0e0e0',
		color: '#007bff',
		cursor: 'pointer',
		fontWeight: '600',
		fontSize: '0.9rem',
		transition: 'background-color 0.2s'
	};

	if (loading) {
		return (
			<div style={containerStyle}>
				{showHeader && (
					<div style={headerStyle}>
						<h3 style={titleStyle}>💬 Messages</h3>
					</div>
				)}
				<div style={emptyStyle}>
					Loading messages...
				</div>
			</div>
		);
	}

	return (
		<div style={containerStyle}>
			{showHeader && (
				<div style={headerStyle}>
					<h3 style={titleStyle}>
						💬 Recent Messages
						{unreadCount > 0 && (
							<span style={badgeStyle}>
								{unreadCount}
							</span>
						)}
					</h3>
					{conversations.length > 0 && (
						<button
							style={{
								backgroundColor: 'transparent',
								border: 'none',
								color: '#007bff',
								cursor: 'pointer',
								fontSize: '0.85rem',
								textDecoration: 'underline'
							}}
							onClick={handleViewAllMessages}
						>
							View All
						</button>
					)}
				</div>
			)}

			{conversations.length === 0 ? (
				<div style={emptyStyle}>
					<div style={{ fontSize: compact ? '1.5rem' : '2rem', marginBottom: '0.5rem' }}>
						💬
					</div>
					<div>No messages yet</div>
					{userRole === 'parent' && (
						<div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#888' }}>
							Contact schools to start conversations
						</div>
					)}
				</div>
			) : (
				<>
					<ul style={listStyle}>
						{conversations.map((conversation) => (
							<li
								key={conversation._id}
								style={itemStyle}
								onClick={handleViewAllMessages}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = itemHoverStyle.backgroundColor;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
							>
								<div style={{ fontSize: '1.2rem', marginTop: '0.1rem' }}>
									{getConversationTypeIcon(conversation.conversationType)}
								</div>
								
								<div style={{ flex: 1, minWidth: 0 }}>
									<div style={{ 
										display: 'flex', 
										alignItems: 'center', 
										justifyContent: 'space-between',
										marginBottom: '0.25rem'
									}}>
										<div style={{ 
											fontWeight: conversation.unreadForCurrentUser > 0 ? 'bold' : '500',
											fontSize: compact ? '0.85rem' : '0.9rem',
											color: '#333'
										}}>
											{getConversationTitle(conversation, userRole)}
										</div>
										<div style={{ 
											fontSize: '0.75rem', 
											color: '#888',
											whiteSpace: 'nowrap'
										}}>
											{conversation.lastMessage && formatDate(conversation.lastMessage.sentAt)}
										</div>
									</div>
									
									<div style={{ 
										fontSize: compact ? '0.75rem' : '0.8rem',
										color: '#666',
										marginBottom: '0.25rem'
									}}>
										{conversation.subject}
									</div>
									
									{conversation.lastMessage && (
										<div style={{ 
											fontSize: '0.75rem',
											color: '#888',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											display: 'flex',
											alignItems: 'center',
											gap: '0.5rem'
										}}>
											<span>
												{conversation.lastMessage.content}
											</span>
											{conversation.unreadForCurrentUser > 0 && (
												<span style={{
													...badgeStyle,
													fontSize: '0.6rem',
													padding: '0.1rem 0.4rem'
												}}>
													{conversation.unreadForCurrentUser}
												</span>
											)}
										</div>
									)}
								</div>
							</li>
						))}
					</ul>
					
					{conversations.length >= maxItems && (
						<button
							style={viewAllButtonStyle}
							onClick={handleViewAllMessages}
							onMouseEnter={(e) => {
								e.target.style.backgroundColor = '#e9ecef';
							}}
							onMouseLeave={(e) => {
								e.target.style.backgroundColor = '#f8f9fa';
							}}
						>
							View All Messages ({unreadCount > 0 ? `${unreadCount} unread` : 'All'})
						</button>
					)}
				</>
			)}
		</div>
	);
};

export default MessagePreview;