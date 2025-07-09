// frontend/src/components/common/ContactSchoolButton.jsx
import React, { useState } from 'react';

const ContactSchoolButton = ({ school, variant = 'primary', size = 'medium' }) => {
	const [showModal, setShowModal] = useState(false);
	const [sending, setSending] = useState(false);
	const [messageData, setMessageData] = useState({
		subject: '',
		content: '',
		messageType: 'general'
	});
	const [success, setSuccess] = useState(false);

	const user = JSON.parse(localStorage.getItem('user'));
	const token = localStorage.getItem('token');

	const startConversation = async () => {
		if (!messageData.content.trim()) {
			alert('Please enter a message');
			return;
		}

		setSending(true);
		try {
			const response = await fetch('http://localhost:5000/api/messages/conversations/start', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					schoolId: school._id,
					subject: messageData.subject || `Inquiry about ${school.name}`,
					content: messageData.content.trim(),
					messageType: messageData.messageType
				})
			});

			if (response.ok) {
				setSuccess(true);
				setTimeout(() => {
					setShowModal(false);
					setSuccess(false);
					setMessageData({
						subject: '',
						content: '',
						messageType: 'general'
					});
				}, 2000);
			} else {
				alert('Failed to send message. Please try again.');
			}
		} catch (error) {
			console.error('Error sending message:', error);
			alert('Failed to send message. Please try again.');
		} finally {
			setSending(false);
		}
	};

	const getButtonStyle = () => {
		const baseStyle = {
			border: 'none',
			borderRadius: '8px',
			cursor: 'pointer',
			fontWeight: '600',
			transition: 'all 0.3s ease',
			display: 'flex',
			alignItems: 'center',
			gap: '0.5rem',
			justifyContent: 'center'
		};

		const variants = {
			primary: {
				backgroundColor: '#16a34a',
				color: 'white'
			},
			secondary: {
				backgroundColor: 'transparent',
				color: '#16a34a',
				border: '2px solid #16a34a'
			},
			outline: {
				backgroundColor: 'transparent',
				color: '#007bff',
				border: '1px solid #007bff'
			}
		};

		const sizes = {
			small: {
				padding: '0.5rem 0.75rem',
				fontSize: '0.8rem'
			},
			medium: {
				padding: '0.75rem 1rem',
				fontSize: '0.9rem'
			},
			large: {
				padding: '1rem 1.5rem',
				fontSize: '1rem'
			}
		};

		return {
			...baseStyle,
			...variants[variant],
			...sizes[size]
		};
	};

	const modalStyle = {
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
		maxWidth: '90vw',
		maxHeight: '90vh',
		overflow: 'auto'
	};

	const inputStyle = {
		width: '100%',
		padding: '0.75rem',
		border: '1px solid #d0d7de',
		borderRadius: '8px',
		fontSize: '0.9rem',
		fontFamily: 'inherit'
	};

	if (!user || !token || user.role !== 'parent') {
		return null; // Only show for logged-in parents
	}

	return (
		<>
			<button
				style={getButtonStyle()}
				onClick={() => setShowModal(true)}
				onMouseEnter={(e) => {
					if (variant === 'primary') {
						e.target.style.backgroundColor = '#15803d';
					} else if (variant === 'secondary') {
						e.target.style.backgroundColor = '#16a34a';
						e.target.style.color = 'white';
					} else if (variant === 'outline') {
						e.target.style.backgroundColor = '#007bff';
						e.target.style.color = 'white';
					}
				}}
				onMouseLeave={(e) => {
					if (variant === 'primary') {
						e.target.style.backgroundColor = '#16a34a';
					} else if (variant === 'secondary') {
						e.target.style.backgroundColor = 'transparent';
						e.target.style.color = '#16a34a';
					} else if (variant === 'outline') {
						e.target.style.backgroundColor = 'transparent';
						e.target.style.color = '#007bff';
					}
				}}
			>
				💬 Contact School
			</button>

			{showModal && (
				<div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
					<div style={modalContentStyle}>
						{success ? (
							<div style={{ textAlign: 'center', padding: '2rem' }}>
								<div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
								<h3 style={{ color: '#16a34a', marginBottom: '0.5rem' }}>Message Sent!</h3>
								<p style={{ color: '#666' }}>
									Your message has been sent to {school.name}. They will respond soon.
								</p>
							</div>
						) : (
							<>
								<h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
									Contact {school.name}
								</h3>
								
								<div style={{ marginBottom: '1rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Subject (Optional)
									</label>
									<input
										type="text"
										style={inputStyle}
										value={messageData.subject}
										onChange={(e) => setMessageData(prev => ({
											...prev,
											subject: e.target.value
										}))}
										placeholder={`Inquiry about ${school.name}`}
									/>
								</div>

								<div style={{ marginBottom: '1rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Message Type
									</label>
									<select
										style={inputStyle}
										value={messageData.messageType}
										onChange={(e) => setMessageData(prev => ({
											...prev,
											messageType: e.target.value
										}))}
									>
										<option value="booking_inquiry">Booking Inquiry</option>
										<option value="tour_request">Tour Request</option>
									</select>
								</div>

								<div style={{ marginBottom: '1.5rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Your Message *
									</label>
									<textarea
										style={{
											...inputStyle,
											minHeight: '120px',
											resize: 'vertical'
										}}
										value={messageData.content}
										onChange={(e) => setMessageData(prev => ({
											...prev,
											content: e.target.value
										}))}
										placeholder="Hi, I'm interested in learning more about your school..."
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
											cursor: 'pointer',
											fontSize: '0.9rem'
										}}
										onClick={() => setShowModal(false)}
										disabled={sending}
									>
										Cancel
									</button>
									<button
										style={{
											padding: '0.75rem 1.5rem',
											backgroundColor: '#16a34a',
											color: 'white',
											border: 'none',
											borderRadius: '8px',
											cursor: 'pointer',
											fontSize: '0.9rem',
											opacity: sending || !messageData.content.trim() ? 0.5 : 1
										}}
										onClick={startConversation}
										disabled={sending || !messageData.content.trim()}
									>
										{sending ? 'Sending...' : 'Send Message'}
									</button>
								</div>

								<div style={{ 
									marginTop: '1rem', 
									padding: '0.75rem', 
									backgroundColor: '#f8f9fa', 
									borderRadius: '6px',
									fontSize: '0.85rem',
									color: '#666'
								}}>
									💡 Tip: Be specific about what you'd like to know. The school admin will respond to your message directly.
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default ContactSchoolButton;