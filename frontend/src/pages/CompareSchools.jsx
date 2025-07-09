import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './compareSchools.css';

function CompareSchools() {
  const [compareList, setCompareList] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('compareSchools')) || [];
    setCompareList(stored);
    
    if (stored.length > 0) {
      fetchSchoolsData(stored);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSchoolsData = async (schoolIds) => {
    try {
      const promises = schoolIds.map(id => 
        fetch(`http://localhost:5000/api/parents/schools/${id}`)
          .then(res => res.json())
      );
      const schoolsData = await Promise.all(promises);
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCompare = (schoolId) => {
    const updated = compareList.filter(id => id !== schoolId);
    setCompareList(updated);
    localStorage.setItem('compareSchools', JSON.stringify(updated));
    setSchools(schools.filter(school => school._id !== schoolId));
  };

  const clearAll = () => {
    setCompareList([]);
    setSchools([]);
    localStorage.removeItem('compareSchools');
  };

  const ComparisonRow = ({ label, getValue, icon = null }) => (
    <tr className="cs-comparison-row">
      <td className="cs-comparison-label">
        {icon && <span className="cs-label-icon">{icon}</span>}
        {label}
      </td>
      {schools.map(school => (
        <td key={school._id} className="cs-comparison-value">{getValue(school)}</td>
      ))}
    </tr>
  );

  const StarRating = ({ rating }) => {
    const stars = [];
    const value = parseFloat(rating) || 0;
    const fullStars = Math.floor(value);
    const hasHalfStar = value - fullStars >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="cs-star cs-star-full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="cs-star cs-star-half">⯪</span>);
      } else {
        stars.push(<span key={i} className="cs-star cs-star-empty">☆</span>);
      }
    }
    
    return (
      <div className="cs-star-rating">
        {stars}
        <span className="cs-rating-number">{value.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="cs-wrapper">
        <div className="cs-loading">
          <div className="cs-loading-spinner"></div>
          <p>🔍 Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="cs-wrapper">
        <div className="cs-container">
          <div className="cs-empty-state">
            <div className="cs-empty-content">
              <span className="cs-empty-icon">📊</span>
              <h2 className="cs-empty-title">No Schools to Compare</h2>
              <p className="cs-empty-description">
                You haven't added any schools to your comparison list yet. 
                Start browsing schools to add them for comparison.
              </p>
              <button onClick={() => navigate('/results')} className="cs-btn cs-btn-primary">
                🔍 Browse Schools
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-wrapper">
      <div className="cs-container">
        {/* Header Section */}
        <div className="cs-header">
          <div className="cs-header-content">
            <h1 className="cs-title">📊 Compare Schools</h1>
            <p className="cs-subtitle">
              Compare {schools.length} school{schools.length !== 1 ? 's' : ''} side by side to make an informed decision
            </p>
          </div>
          <div className="cs-header-actions">
            <button onClick={clearAll} className="cs-btn cs-btn-secondary">
              🗑️ Clear All
            </button>
            <button onClick={() => navigate('/results')} className="cs-btn cs-btn-outline">
              ➕ Browse More Schools
            </button>
          </div>
        </div>

        {/* Schools Preview Cards */}
        <div className="cs-schools-preview">
          <h3 className="cs-preview-title">🏫 Schools in Comparison</h3>
          <div className="cs-schools-grid">
            {schools.map(school => (
              <div key={school._id} className="cs-school-preview-card">
                <div className="cs-school-icon">
                  <span className="cs-school-type-icon">
                    {school.schoolType === 'University' ? '🏛️' : 
                     school.schoolType === 'High School' ? '🎓' : 
                     school.schoolType === 'TVET' ? '🔧' : '🏫'}
                  </span>
                </div>
                <div className="cs-school-info">
                  <h4 className="cs-school-name">{school.name}</h4>
                  <p className="cs-school-type">🏫 {school.schoolType}</p>
                  <p className="cs-school-location">
                    📍 {school.location?.city}, {school.location?.state}
                  </p>
                  <div className="cs-school-rating">
                    <StarRating rating={school.ratings?.overall || 0} />
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCompare(school._id)}
                  className="cs-remove-btn"
                  title="Remove from comparison"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="cs-comparison-section">
          <h3 className="cs-section-title">📋 Detailed Comparison</h3>
          <div className="cs-table-container">
            <table className="cs-comparison-table">
              <thead>
                <tr>
                  <th className="cs-feature-header">Feature</th>
                  {schools.map(school => (
                    <th key={school._id} className="cs-school-header">
                      <div className="cs-school-header-content">
                        <div className="cs-header-icon">
                          {school.schoolType === 'University' ? '🏛️' : 
                           school.schoolType === 'High School' ? '🎓' : 
                           school.schoolType === 'TVET' ? '🔧' : '🏫'}
                        </div>
                        <div className="cs-header-info">
                          <h4 className="cs-header-name">{school.name}</h4>
                          <span className="cs-header-type">{school.schoolType}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow 
                  label="School Type" 
                  icon="🏫"
                  getValue={school => school.schoolType || 'N/A'} 
                />
                
                <ComparisonRow 
                  label="Location" 
                  icon="📍"
                  getValue={school => 
                    school.location ? 
                    `${school.location.city}, ${school.location.state}` : 
                    'N/A'
                  } 
                />
                
                <ComparisonRow 
                  label="Overall Rating" 
                  icon="⭐"
                  getValue={school => 
                    school.ratings?.overall ? 
                    <StarRating rating={school.ratings.overall} /> : 
                    <span className="cs-no-rating">Not rated</span>
                  } 
                />
                
                <ComparisonRow 
                  label="Academic Rating" 
                  icon="📚"
                  getValue={school => 
                    school.ratings?.academic ? 
                    <StarRating rating={school.ratings.academic} /> : 
                    <span className="cs-no-rating">Not rated</span>
                  } 
                />
                
                <ComparisonRow 
                  label="Facilities Rating" 
                  icon="🏢"
                  getValue={school => 
                    school.ratings?.facilities ? 
                    <StarRating rating={school.ratings.facilities} /> : 
                    <span className="cs-no-rating">Not rated</span>
                  } 
                />
                
                <ComparisonRow 
                  label="Teachers Rating" 
                  icon="👨‍🏫"
                  getValue={school => 
                    school.ratings?.teachers ? 
                    <StarRating rating={school.ratings.teachers} /> : 
                    <span className="cs-no-rating">Not rated</span>
                  } 
                />
                
                <ComparisonRow 
                  label="Environment Rating" 
                  icon="🌱"
                  getValue={school => 
                    school.ratings?.environment ? 
                    <StarRating rating={school.ratings.environment} /> : 
                    <span className="cs-no-rating">Not rated</span>
                  } 
                />
                
                <ComparisonRow 
                  label="Tuition Fees (per term)" 
                  icon="💰"
                  getValue={school => 
                    school.fees?.tuition ? 
                    <div className="cs-fee-range">
                      <span className="cs-fee-amount">
                        KES {school.fees.tuition.minAmount?.toLocaleString()} - {school.fees.tuition.maxAmount?.toLocaleString()}
                      </span>
                    </div> : 
                    <span className="cs-no-data">Fee information not available</span>
                  } 
                />
                
                <ComparisonRow                    
  label="Available Facilities"                    
  icon="🏢"                   
  getValue={school =>                      
    school.facilities?.length ?                      
    <div className="cs-facilities-list">                       
      {school.facilities.map((f, i) => (                         
        <span key={i} className="cs-facility-tag">{f.name}</span>                       
      ))}                     
    </div> :                      
    <span className="cs-no-data">No facilities listed</span>                   
  }                  
/>
                
                <ComparisonRow 
                  label="Contact Phone" 
                  icon="📱"
                  getValue={school => 
                    school.contact?.phone ? 
                    <a href={`tel:${school.contact.phone}`} className="cs-contact-link">
                      {school.contact.phone}
                    </a> : 
                    <span className="cs-no-data">Not available</span>
                  } 
                />
                
                <ComparisonRow 
                  label="Contact Email" 
                  icon="📧"
                  getValue={school => 
                    school.contact?.email ? 
                    <a href={`mailto:${school.contact.email}`} className="cs-contact-link">
                      {school.contact.email}
                    </a> : 
                    <span className="cs-no-data">Not available</span>
                  } 
                />
                
                <tr className="cs-actions-row">
                  <td className="cs-comparison-label">
                    <span className="cs-label-icon">🎯</span>
                    Actions
                  </td>
                  {schools.map(school => (
                    <td key={school._id} className="cs-actions-cell">
                      <div className="cs-action-buttons">
                        <button 
                          onClick={() => navigate(`/schools/${school._id}`)}
                          className="cs-btn cs-btn-primary cs-btn-small"
                        >
                          👁️ View Details
                        </button>
                        <button 
                          onClick={() => removeFromCompare(school._id)}
                          className="cs-btn cs-btn-danger cs-btn-small"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Summary */}
        {schools.length >= 2 && (
          <div className="cs-summary-section">
            <h3 className="cs-section-title">📈 Quick Summary</h3>
            <div className="cs-summary-grid">
              <div className="cs-summary-card">
                <div className="cs-summary-icon">🏆</div>
                <div className="cs-summary-content">
                  <h4 className="cs-summary-title">Highest Rated Overall</h4>
                  <p className="cs-summary-school">
                    {schools.reduce((best, current) => 
                      (current.ratings?.overall || 0) > (best.ratings?.overall || 0) ? current : best
                    ).name}
                  </p>
                  <span className="cs-summary-value">
                    ⭐ {schools.reduce((best, current) => 
                      (current.ratings?.overall || 0) > (best.ratings?.overall || 0) ? current : best
                    ).ratings?.overall?.toFixed(1) || 'N/A'}/5
                  </span>
                </div>
              </div>
              
              <div className="cs-summary-card">
                <div className="cs-summary-icon">💰</div>
                <div className="cs-summary-content">
                  <h4 className="cs-summary-title">Most Affordable</h4>
                  <p className="cs-summary-school">
                    {schools.reduce((cheapest, current) => 
                      (current.fees?.tuition?.minAmount || Infinity) < (cheapest.fees?.tuition?.minAmount || Infinity) ? current : cheapest
                    ).name}
                  </p>
                  <span className="cs-summary-value">
                    From KES {schools.reduce((cheapest, current) => 
                      (current.fees?.tuition?.minAmount || Infinity) < (cheapest.fees?.tuition?.minAmount || Infinity) ? current : cheapest
                    ).fees?.tuition?.minAmount?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="cs-summary-card">
                <div className="cs-summary-icon">🏢</div>
                <div className="cs-summary-content">
                  <h4 className="cs-summary-title">Most Facilities</h4>
                  <p className="cs-summary-school">
                    {schools.reduce((most, current) => 
                      (current.facilities?.length || 0) > (most.facilities?.length || 0) ? current : most
                    ).name}
                  </p>
                  <span className="cs-summary-value">
                    {schools.reduce((most, current) => 
                      (current.facilities?.length || 0) > (most.facilities?.length || 0) ? current : most
                    ).facilities?.length || 0} facilities
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompareSchools;