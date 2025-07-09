// frontend/src/components/schooladmin/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';

const Messages = () => {
	const [conversations, setConversations] = useState([]);
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [filter, setFilter] = useState('all'); // all, unread, urgent
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		fetchConversations();
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const fetchConversations = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/messages/conversations', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				setConversations(data);
			} else {
				console.error('Failed to fetch conversations');
			}
		} catch (error) {
			console.error('Error fetching conversations:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchMessages = async (conversationId) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				`http://localhost:5000/api/messages/conversations/${conversationId}/messages`,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);

			if (response.ok) {
				const data = await response.json();
				setMessages(data.messages);
				setSelectedConversation(data.conversation);
				
				// Refresh conversations to update unread counts
				setTimeout(() => fetchConversations(), 100);
			}
		} catch (error) {
			console.error('Error fetching messages:', error);
		}
	};

	const sendMessage = async () => {
		if (!newMessage.trim()) return;

		setSending(true);
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/messages/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					conversationId: selectedConversation._id,
					content: newMessage.trim()
				})
			});

			if (response.ok) {
				const data = await response.json();
				setMessages(prev => [...prev, data.data]);
				setNewMessage('');
				fetchConversations(); // Refresh conversations list
			}
		} catch (error) {
			console.error('Error sending message:', error);
		} finally {
			setSending(false);
		}
	};

	const markConversationAsRead = async (conversationId) => {
		try {
			const token = localStorage.getItem('token');
			await fetch(`http://localhost:5000/api/messages/conversations/${conversationId}/read`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
		} catch (error) {
			console.error('Error marking conversation as read:', error);
		}
	};

	const getFilteredConversations = () => {
		let filtered = [...conversations];

		switch (filter) {
			case 'unread':
				filtered = filtered.filter(conv => conv.unreadForCurrentUser > 0);
				break;
			case 'urgent':
				filtered = filtered.filter(conv => conv.priority === 'urgent' || conv.priority === 'high');
				break;
			default:
				break;
		}

		return filtered.sort((a, b) => {
			// Sort by unread first, then by last message time
			if (a.unreadForCurrentUser > 0 && b.unreadForCurrentUser === 0) return -1;
			if (b.unreadForCurrentUser > 0 && a.unreadForCurrentUser === 0) return 1;
			return new Date(b.updatedAt) - new Date(a.updatedAt);
		});
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} else if (diffInDays === 1) {
			return 'Yesterday';
		} else if (diffInDays < 7) {
			return date.toLocaleDateString([], { weekday: 'short' });
		} else {
			return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

	const getPriorityColor = (priority) => {
		switch (priority) {
			case 'urgent': return '#dc3545';
			case 'high': return '#fd7e14';
			case 'normal': return '#28a745';
			default: return '#6c757d';
		}
	};

	// Styles
	const containerStyle = {
		display: 'flex',
		height: '100vh',
		backgroundColor: '#f8f9fa',
		fontFamily: '"Segoe UI", sans-serif'
	};

	const sidebarStyle = {
		width: '380px',
		backgroundColor: '#ffffff',
		borderRight: '1px solid #e0e0e0',
		display: 'flex',
		flexDirection: 'column'
	};

	const headerStyle = {
		padding: '1.5rem',
		borderBottom: '1px solid #e0e0e0',
		backgroundColor: '#007bff',
		color: 'white'
	};

	const filterTabsStyle = {
		display: 'flex',
		borderBottom: '1px solid #e0e0e0'
	};

	const filterTabStyle = {
		flex: 1,
		padding: '0.75rem',
		border: 'none',
		backgroundColor: 'transparent',
		cursor: 'pointer',
		fontSize: '0.85rem',
		fontWeight: '500'
	};

	const activeFilterTabStyle = {
		...filterTabStyle,
		backgroundColor: '#f8f9fa',
		borderBottom: '2px solid #007bff',
		color: '#007bff'
	};

	const conversationListStyle = {
		flex: 1,
		overflowY: 'auto'
	};

	const conversationItemStyle = {
		padding: '1rem',
		borderBottom: '1px solid #f0f0f0',
		cursor: 'pointer',
		transition: 'background-color 0.2s'
	};

	const activeConversationStyle = {
		...conversationItemStyle,
		backgroundColor: '#e3f2fd'
	};

	const chatAreaStyle = {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#ffffff'
	};

	const chatHeaderStyle = {
		padding: '1rem 1.5rem',
		borderBottom: '1px solid #e0e0e0',
		backgroundColor: '#ffffff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	};

	const messagesContainerStyle = {
		flex: 1,
		overflowY: 'auto',
		padding: '1rem',
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem'
	};

	const messageStyle = {
		maxWidth: '70%',
		padding: '0.75rem 1rem',
		borderRadius: '12px',
		wordWrap: 'break-word'
	};

	const sentMessageStyle = {
		...messageStyle,
		backgroundColor: '#007bff',
		color: 'white',
		alignSelf: 'flex-end',
		marginLeft: 'auto'
	};

	const receivedMessageStyle = {
		...messageStyle,
		backgroundColor: '#f1f3f4',
		color: '#333',
		alignSelf: 'flex-start'
	};

	const inputAreaStyle = {
		padding: '1rem',
		borderTop: '1px solid #e0e0e0',
		display: 'flex',
		gap: '0.5rem',
		alignItems: 'flex-end'
	};

	const textareaStyle = {
		flex: 1,
		minHeight: '40px',
		maxHeight: '120px',
		padding: '0.75rem',
		border: '1px solid #d0d7de',
		borderRadius: '8px',
		resize: 'none',
		fontFamily: 'inherit',
		fontSize: '0.9rem'
	};

	const buttonStyle = {
		padding: '0.75rem 1.5rem',
		backgroundColor: '#007bff',
		color: 'white',
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		fontWeight: '600',
		fontSize: '0.9rem'
	};

	if (loading) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<div>Loading messages...</div>
			</div>
		);
	}

	const filteredConversations = getFilteredConversations();
	const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadForCurrentUser || 0), 0);

	return (
		<div style={containerStyle}>
			{/* Sidebar */}
			<div style={sidebarStyle}>
				<div style={headerStyle}>
					<h2 style={{ margin: 0, fontSize: '1.2rem' }}>💬 Parent Messages</h2>
					{unreadCount > 0 && (
						<div style={{ 
							marginTop: '0.5rem',
							fontSize: '0.85rem',
							opacity: 0.9
						}}>
							{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
						</div>
					)}
				</div>

				{/* Filter Tabs */}
				<div style={filterTabsStyle}>
					<button
						style={filter === 'all' ? activeFilterTabStyle : filterTabStyle}
						onClick={() => setFilter('all')}
					>
						All ({conversations.length})
					</button>
					<button
						style={filter === 'unread' ? activeFilterTabStyle : filterTabStyle}
						onClick={() => setFilter('unread')}
					>
						Unread ({unreadCount})
					</button>
					<button
						style={filter === 'urgent' ? activeFilterTabStyle : filterTabStyle}
						onClick={() => setFilter('urgent')}
					>
						Urgent
					</button>
				</div>

				<div style={conversationListStyle}>
					{filteredConversations.length === 0 ? (
						<div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
							No conversations to show
						</div>
					) : (
						filteredConversations.map(conversation => {
							const parent = conversation.participants?.find(p => p.role === 'parent');
							return (
								<div
									key={conversation._id}
									style={
										selectedConversation?._id === conversation._id 
											? activeConversationStyle 
											: conversationItemStyle
									}
									onClick={() => {
										fetchMessages(conversation._id);
										if (conversation.unreadForCurrentUser > 0) {
											markConversationAsRead(conversation._id);
										}
									}}
								>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
										<div style={{ flex: 1 }}>
											<div style={{ 
												display: 'flex', 
												alignItems: 'center', 
												gap: '0.5rem',
												marginBottom: '0.25rem'
											}}>
												<span>{getConversationTypeIcon(conversation.conversationType)}</span>
												<div style={{ fontWeight: 'bold' }}>
													{parent?.userId?.name || 'Unknown Parent'}
												</div>
												{conversation.priority !== 'normal' && (
													<span style={{
														width: '8px',
														height: '8px',
														borderRadius: '50%',
														backgroundColor: getPriorityColor(conversation.priority)
													}}></span>
												)}
											</div>
											<div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
												{conversation.subject}
											</div>
											{conversation.lastMessage && (
												<div style={{ 
													fontSize: '0.8rem', 
													color: '#888',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap'
												}}>
													{conversation.lastMessage.content}
												</div>
											)}
										</div>
										<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
											{conversation.lastMessage && (
												<div style={{ fontSize: '0.75rem', color: '#888' }}>
													{formatDate(conversation.lastMessage.sentAt)}
												</div>
											)}
											{conversation.unreadForCurrentUser > 0 && (
												<span style={{
													backgroundColor: '#007bff',
													color: 'white',
													borderRadius: '10px',
													padding: '0.2rem 0.5rem',
													fontSize: '0.7rem',
													fontWeight: 'bold'
												}}>
													{conversation.unreadForCurrentUser}
												</span>
											)}
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* Chat Area */}
			<div style={chatAreaStyle}>
				{selectedConversation ? (
					<>
						{/* Chat Header */}
						<div style={chatHeaderStyle}>
							<div>
								<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
									<span>{getConversationTypeIcon(selectedConversation.conversationType)}</span>
									<h3 style={{ margin: 0 }}>
										{selectedConversation.participants?.find(p => p.role === 'parent')?.userId?.name || 'Unknown Parent'}
									</h3>
									{selectedConversation.priority !== 'normal' && (
										<span style={{
											padding: '0.2rem 0.5rem',
											borderRadius: '12px',
											fontSize: '0.7rem',
											fontWeight: 'bold',
											textTransform: 'uppercase',
											backgroundColor: getPriorityColor(selectedConversation.priority),
											color: 'white'
										}}>
											{selectedConversation.priority}
										</span>
									)}
								</div>
								<div style={{ fontSize: '0.85rem', color: '#666' }}>
									{selectedConversation.subject}
								</div>
							</div>
							<div style={{ fontSize: '0.8rem', color: '#666' }}>
								{selectedConversation.conversationType.replace('_', ' ').toUpperCase()}
							</div>
						</div>

						{/* Messages */}
						<div style={messagesContainerStyle}>
							{messages.map(message => (
								<div key={message._id}>
									<div
										style={
											message.senderId._id === JSON.parse(localStorage.getItem('user'))._id
												? sentMessageStyle
												: receivedMessageStyle
										}
									>
										<div style={{ marginBottom: '0.25rem' }}>
											{message.content}
										</div>
										<div style={{ 
											fontSize: '0.7rem', 
											opacity: 0.7,
											textAlign: message.senderId._id === JSON.parse(localStorage.getItem('user'))._id ? 'right' : 'left'
										}}>
											{message.senderId.name} • {formatDate(message.createdAt)}
										</div>
									</div>
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>

						{/* Input Area */}
						<div style={inputAreaStyle}>
							<textarea
								style={textareaStyle}
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								placeholder="Type your reply..."
								onKeyPress={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										sendMessage();
									}
								}}
							/>
							<button
								style={{
									...buttonStyle,
									opacity: sending || !newMessage.trim() ? 0.5 : 1
								}}
								onClick={sendMessage}
								disabled={sending || !newMessage.trim()}
							>
								{sending ? 'Sending...' : 'Reply'}
							</button>
						</div>
					</>
				) : (
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
						color: '#666',
						gap: '1rem'
					}}>
						<div style={{ fontSize: '3rem' }}>💬</div>
						<div style={{ fontSize: '1.1rem', textAlign: 'center' }}>
							Select a conversation to view messages from parents
						</div>
						<div style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center' }}>
							Parents can contact you about tours, bookings, and general inquiries
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Messages;