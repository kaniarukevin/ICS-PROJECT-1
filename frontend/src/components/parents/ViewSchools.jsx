import React, { useState, useEffect } from 'react';

const ViewSchools = () => {
    const [schools, setSchools] = useState([]);
    const [filter, setFilter] = useState('all'); // all, verified, unverified
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('🏫 Making schools API call...');
            console.log('Token exists:', !!token);
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:5000/api/system-admin/schools', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Schools response status:', response.status);
            console.log('📡 Schools response OK:', response.ok);

            // Get response text first to see what we're actually getting
            const responseText = await response.text();
            console.log('📡 Schools raw response:', responseText.substring(0, 200) + '...');

            if (!response.ok) {
                console.error('❌ Schools API Error:', response.status, response.statusText);
                throw new Error(`API Error: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
            }

            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('✅ Schools data received:', data.length, 'schools');
            } catch (parseError) {
                console.error('❌ Schools JSON Parse Error:', parseError);
                throw new Error(`Invalid JSON response: ${parseError.message}\nResponse: ${responseText}`);
            }

            setSchools(data);
        } catch (error) {
            console.error('❌ Schools fetch error:', error);
            alert(`Error fetching schools: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    const filteredSchools = schools.filter(school => {
        if (filter === 'verified') return school.isVerified;
        if (filter === 'unverified') return !school.isVerified;
        return true;
    });

    const getSchoolImage = (school) => {
        const primaryImage = school.images?.find(img => img.isPrimary);
        return primaryImage?.url || school.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const renderStars = (rating) => {
        return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2>Loading schools...</h2>
                <p>Fetching data from /api/system-admin/schools</p>
                <p>Expected: {schools.length > 0 ? `${schools.length} schools` : 'Your 50+ schools'}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h1>Manage Schools ({schools.length})</h1>
            
            {/* Filters */}
            <div style={{ marginBottom: '2rem' }}>
                <button 
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                    style={{ 
                        margin: '0 0.5rem', 
                        padding: '0.5rem 1rem',
                        backgroundColor: filter === 'all' ? '#007bff' : '#f8f9fa',
                        color: filter === 'all' ? 'white' : 'black',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    All Schools ({schools.length})
                </button>
                <button 
                    className={filter === 'verified' ? 'active' : ''}
                    onClick={() => setFilter('verified')}
                    style={{ 
                        margin: '0 0.5rem', 
                        padding: '0.5rem 1rem',
                        backgroundColor: filter === 'verified' ? '#28a745' : '#f8f9fa',
                        color: filter === 'verified' ? 'white' : 'black',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Verified ({schools.filter(s => s.isVerified).length})
                </button>
                <button 
                    className={filter === 'unverified' ? 'active' : ''}
                    onClick={() => setFilter('unverified')}
                    style={{ 
                        margin: '0 0.5rem', 
                        padding: '0.5rem 1rem',
                        backgroundColor: filter === 'unverified' ? '#dc3545' : '#f8f9fa',
                        color: filter === 'unverified' ? 'white' : 'black',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Unverified ({schools.filter(s => !s.isVerified).length})
                </button>
            </div>

            {/* Schools Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                gap: '1.5rem' 
            }}>
                {filteredSchools.map(school => (
                    <div key={school._id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {/* School Image */}
                        <img 
                            src={getSchoolImage(school)}
                            alt={school.name}
                            style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover'
                            }}
                        />
                        
                        {/* School Info */}
                        <div style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0 }}>{school.name}</h3>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    backgroundColor: school.isVerified ? '#d4edda' : '#f8d7da',
                                    color: school.isVerified ? '#155724' : '#721c24'
                                }}>
                                    {school.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                            
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0' }}>
                                {school.schoolType} • {school.location?.city || school.city}, {school.location?.state || school.state}
                            </p>
                            
                            {/* Ratings */}
                            {school.ratings && (
                                <div style={{ margin: '0.5rem 0' }}>
                                    <span style={{ color: '#ffc107' }}>
                                        {renderStars(school.averageRating || school.ratings.overall)}
                                    </span>
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                        {school.averageRating?.toFixed(1) || school.ratings.overall?.toFixed(1)} ({school.totalRatings} reviews)
                                    </span>
                                </div>
                            )}
                            
                            {/* Fees */}
                            {school.fees?.tuition && (
                                <div style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                                    <strong>Fees:</strong> {formatCurrency(school.fees.tuition.minAmount)} - {formatCurrency(school.fees.tuition.maxAmount)} {school.fees.tuition.period}
                                </div>
                            )}
                            
                            {/* Curriculum */}
                            {school.curriculum && school.curriculum.length > 0 && (
                                <div style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                                    <strong>Curriculum:</strong> {school.curriculum.join(', ')}
                                </div>
                            )}
                            
                            {/* Contact */}
                            <div style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                                <strong>Contact:</strong> {school.contact?.email || school.email}
                            </div>
                            
                            {/* Facilities count */}
                            {school.facilities && school.facilities.length > 0 && (
                                <div style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                                    <strong>Facilities:</strong> {school.facilities.length} facilities
                                </div>
                            )}
                            
                            {/* Actions */}
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setSelectedSchool(school)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#17a2b8',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    View Details
                                </button>
                                
                                {!school.isVerified ? (
                                    <button
                                        onClick={() => updateSchoolVerification(school._id, true)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Verify
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => updateSchoolVerification(school._id, false)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Unverify
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSchools.length === 0 && (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No schools found for the selected filter.
                </p>
            )}

            {/* School Details Modal */}
            {selectedSchool && (
                <SchoolDetailsModal 
                    school={selectedSchool} 
                    onClose={() => setSelectedSchool(null)}
                />
            )}
        </div>
    );
};

// School Details Modal Component
const SchoolDetailsModal = ({ school, onClose }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const renderStars = (rating) => {
        return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                margin: '1rem'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>{school.name}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                
                <div style={{ padding: '1rem' }}>
                    {/* Images */}
                    {school.images && school.images.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4>Images</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {school.images.map((image, index) => (
                                    <img 
                                        key={index}
                                        src={image.url} 
                                        alt={image.caption}
                                        style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Basic Info */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h4>Basic Information</h4>
                        <p><strong>Type:</strong> {school.schoolType}</p>
                        <p><strong>Description:</strong> {school.description}</p>
                        {school.grades && (
                            <p><strong>Grades:</strong> {school.grades.from} - {school.grades.to}</p>
                        )}
                    </div>
                    
                    {/* Location */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h4>Location</h4>
                        {school.location ? (
                            <>
                                <p>{school.location.address}</p>
                                <p>{school.location.city}, {school.location.state} {school.location.postalCode}</p>
                                <p>{school.location.country}</p>
                            </>
                        ) : (
                            <>
                                <p>{school.address}</p>
                                <p>{school.city}, {school.state} {school.zipCode}</p>
                            </>
                        )}
                    </div>
                    
                    {/* Contact */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h4>Contact Information</h4>
                        <p><strong>Phone:</strong> {school.contact?.phone || school.phone}</p>
                        <p><strong>Email:</strong> {school.contact?.email || school.email}</p>
                        {(school.contact?.website || school.website) && (
                            <p><strong>Website:</strong> <a href={school.contact?.website || school.website} target="_blank" rel="noopener noreferrer">{school.contact?.website || school.website}</a></p>
                        )}
                    </div>
                    
                    {/* Facilities */}
                    {school.facilities && school.facilities.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4>Facilities ({school.facilities.length})</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                {school.facilities.map((facility, index) => (
                                    <div key={index} style={{ padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px' }}>
                                        <strong>{facility.name}</strong>
                                        {facility.description && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>{facility.description}</p>}
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{facility.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Fees */}
                    {school.fees && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4>Fee Structure</h4>
                            {school.fees.tuition && (
                                <div>
                                    <p><strong>Tuition:</strong> {formatCurrency(school.fees.tuition.minAmount)} - {formatCurrency(school.fees.tuition.maxAmount)} ({school.fees.tuition.period})</p>
                                    {school.fees.registration && <p><strong>Registration:</strong> {formatCurrency(school.fees.registration)}</p>}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Ratings */}
                    {school.ratings && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4>Ratings</h4>
                            <p><strong>Overall:</strong> {renderStars(school.ratings.overall)} ({school.ratings.overall?.toFixed(1)})</p>
                            <p><strong>Academic:</strong> {renderStars(school.ratings.academic)} ({school.ratings.academic?.toFixed(1)})</p>
                            <p><strong>Facilities:</strong> {renderStars(school.ratings.facilities)} ({school.ratings.facilities?.toFixed(1)})</p>
                            <p><strong>Teachers:</strong> {renderStars(school.ratings.teachers)} ({school.ratings.teachers?.toFixed(1)})</p>
                            <p><strong>Environment:</strong> {renderStars(school.ratings.environment)} ({school.ratings.environment?.toFixed(1)})</p>
                            <p><strong>Total Reviews:</strong> {school.totalRatings}</p>
                        </div>
                    )}
                    
                    {/* Tour Schedule */}
                    {school.tourSchedule && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4>Tour Schedule</h4>
                            <p><strong>Available Days:</strong> {school.tourSchedule.availableDays?.join(', ')}</p>
                            <p><strong>Duration:</strong> {school.tourSchedule.duration} minutes</p>
                            <p><strong>Advance Booking:</strong> {school.tourSchedule.advanceBooking} days</p>
                            {school.tourSchedule.timeSlots && (
                                <div>
                                    <strong>Time Slots:</strong>
                                    {school.tourSchedule.timeSlots.map((slot, index) => (
                                        <div key={index} style={{ marginLeft: '1rem' }}>
                                            {slot.startTime} - {slot.endTime} (Max: {slot.maxVisitors} visitors)
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewSchools;