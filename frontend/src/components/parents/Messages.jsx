// frontend/src/components/parents/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';

const Messages = () => {
	const [conversations, setConversations] = useState([]);
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [showNewConversation, setShowNewConversation] = useState(false);
	const [schools, setSchools] = useState([]);
	const [newConversationData, setNewConversationData] = useState({
		schoolId: '',
		subject: '',
		content: '',
		messageType: 'general'  // Changed back to 'general' to match conversationType enum
	});
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		fetchConversations();
		fetchSchools();
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

	const fetchSchools = async () => {
		try {
			const response = await fetch('http://localhost:5000/api/parents/schools/dropdown');
			if (response.ok) {
				const data = await response.json();
				setSchools(data.schools);
			}
		} catch (error) {
			console.error('Error fetching schools:', error);
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
					content: newMessage.trim(),
					messageType: 'text'  // For individual messages, use 'text'
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

	const startNewConversation = async () => {
		if (!newConversationData.schoolId || !newConversationData.content.trim()) {
			alert('Please select a school and enter a message');
			return;
		}

		setSending(true);
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/messages/conversations/start', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(newConversationData)
			});

			if (response.ok) {
				const data = await response.json();
				setShowNewConversation(false);
				setNewConversationData({
					schoolId: '',
					subject: '',
					content: '',
					messageType: 'general'  // Reset to default
				});
				fetchConversations();
				fetchMessages(data.conversation._id);
			} else {
				// Log the response for debugging
				const errorData = await response.json();
				console.error('Error response:', errorData);
				alert('Failed to start conversation. Please try again.');
			}
		} catch (error) {
			console.error('Error starting conversation:', error);
			alert('Failed to start conversation. Please try again.');
		} finally {
			setSending(false);
		}
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

	// Styles (same as before)
	const containerStyle = {
		display: 'flex',
		height: '100vh',
		backgroundColor: '#f8f9fa',
		fontFamily: '"Segoe UI", sans-serif'
	};

	const sidebarStyle = {
		width: '350px',
		backgroundColor: '#ffffff',
		borderRight: '1px solid #e0e0e0',
		display: 'flex',
		flexDirection: 'column'
	};

	const headerStyle = {
		padding: '1.5rem',
		borderBottom: '1px solid #e0e0e0',
		backgroundColor: '#16a34a',
		color: 'white'
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
		backgroundColor: '#f0f8f0'
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
		backgroundColor: '#16a34a',
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
		backgroundColor: '#16a34a',
		color: 'white',
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		fontWeight: '600',
		fontSize: '0.9rem'
	};

	const newConversationModalStyle = {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.5)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1000
	};

	const modalContentStyle = {
		backgroundColor: 'white',
		padding: '2rem',
		borderRadius: '12px',
		width: '500px',
		maxWidth: '90vw'
	};

	if (loading) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<div>Loading messages...</div>
			</div>
		);
	}

	return (
		<div style={containerStyle}>
			{/* Sidebar */}
			<div style={sidebarStyle}>
				<div style={headerStyle}>
					<h2 style={{ margin: 0, fontSize: '1.2rem' }}>💬 Messages</h2>
					<button
						onClick={() => setShowNewConversation(true)}
						style={{
							...buttonStyle,
							fontSize: '0.8rem',
							padding: '0.5rem 1rem',
							marginTop: '0.5rem'
						}}
					>
						+ New Message
					</button>
				</div>

				<div style={conversationListStyle}>
					{conversations.length === 0 ? (
						<div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
							No conversations yet
						</div>
					) : (
						conversations.map(conversation => (
							<div
								key={conversation._id}
								style={
									selectedConversation?._id === conversation._id 
										? activeConversationStyle 
										: conversationItemStyle
								}
								onClick={() => fetchMessages(conversation._id)}
							>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
									<div style={{ flex: 1 }}>
										<div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
											{conversation.schoolId?.name}
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
												backgroundColor: '#16a34a',
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
						))
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
								<h3 style={{ margin: 0 }}>{selectedConversation.schoolId?.name}</h3>
								<div style={{ fontSize: '0.85rem', color: '#666' }}>
									{selectedConversation.subject}
								</div>
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
											textAlign: 'right'
										}}>
											{formatDate(message.createdAt)}
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
								placeholder="Type your message..."
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
								{sending ? 'Sending...' : 'Send'}
							</button>
						</div>
					</>
				) : (
					<div style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
						color: '#666',
						fontSize: '1.1rem'
					}}>
						Select a conversation to start messaging
					</div>
				)}
			</div>

			{/* New Conversation Modal */}
			{showNewConversation && (
				<div style={newConversationModalStyle}>
					<div style={modalContentStyle}>
						<h3 style={{ marginTop: 0 }}>Start New Conversation</h3>
						
						<div style={{ marginBottom: '1rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
								School
							</label>
							<select
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '1px solid #d0d7de',
									borderRadius: '8px'
								}}
								value={newConversationData.schoolId}
								onChange={(e) => setNewConversationData(prev => ({
									...prev,
									schoolId: e.target.value
								}))}
							>
								<option value="">Select a school</option>
								{schools.map(school => (
									<option key={school._id} value={school._id}>
										{school.name}
									</option>
								))}
							</select>
						</div>

						<div style={{ marginBottom: '1rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
								Subject
							</label>
							<input
								type="text"
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '1px solid #d0d7de',
									borderRadius: '8px'
								}}
								value={newConversationData.subject}
								onChange={(e) => setNewConversationData(prev => ({
									...prev,
									subject: e.target.value
								}))}
								placeholder="What is this about?"
							/>
						</div>

						<div style={{ marginBottom: '1rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
								Message Type
							</label>
							<select
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '1px solid #d0d7de',
									borderRadius: '8px'
								}}
								value={newConversationData.messageType}
								onChange={(e) => setNewConversationData(prev => ({
									...prev,
									messageType: e.target.value
								}))}
							>
								{/* Updated to match Conversation.conversationType enum */}
								<option value="booking_inquiry">Booking Inquiry</option>
								<option value="tour_request">Tour Request</option>
							</select>
						</div>

						<div style={{ marginBottom: '1.5rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
								Message
							</label>
							<textarea
								style={{
									width: '100%',
									minHeight: '100px',
									padding: '0.75rem',
									border: '1px solid #d0d7de',
									borderRadius: '8px',
									resize: 'vertical'
								}}
								value={newConversationData.content}
								onChange={(e) => setNewConversationData(prev => ({
									...prev,
									content: e.target.value
								}))}
								placeholder="Type your message..."
							/>
						</div>

						<div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
							<button
								style={{
									padding: '0.75rem 1.5rem',
									backgroundColor: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: '8px',
									cursor: 'pointer'
								}}
								onClick={() => setShowNewConversation(false)}
							>
								Cancel
							</button>
							<button
								style={{
									...buttonStyle,
									opacity: sending ? 0.5 : 1
								}}
								onClick={startNewConversation}
								disabled={sending}
							>
								{sending ? 'Starting...' : 'Start Conversation'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Messages;