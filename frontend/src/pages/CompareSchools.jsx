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

  const ComparisonRow = ({ label, getValue }) => (
    <tr>
      <td className="comparison-label">{label}</td>
      {schools.map(school => (
        <td key={school._id}>{getValue(school)}</td>
      ))}
    </tr>
  );

  if (loading) return <p>Loading comparison...</p>;

  if (schools.length === 0) {
    return (
      <div className="compare-schools-container">
        <h2>Compare Schools</h2>
        <p>No schools selected for comparison.</p>
        <button onClick={() => navigate('/results')}>Browse Schools</button>
      </div>
    );
  }

  return (
    <div className="compare-schools-container">
      <div className="compare-header">
        <h2>Compare Schools ({schools.length})</h2>
        <div className="compare-actions">
          <button onClick={clearAll} className="clear-btn">Clear All</button>
          <button onClick={() => navigate('/results')} className="browse-btn">
            Browse More Schools
          </button>
        </div>
      </div>

      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              {schools.map(school => (
                <th key={school._id} className="school-header">
                  <div className="school-header-content">
                    <h3>{school.name}</h3>
                    <button 
                      onClick={() => removeFromCompare(school._id)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ComparisonRow 
              label="School Type" 
              getValue={school => school.schoolType || 'N/A'} 
            />
            
            <ComparisonRow 
              label="Location" 
              getValue={school => 
                school.location ? 
                `${school.location.city}, ${school.location.state}` : 
                'N/A'
              } 
            />
            
            <ComparisonRow 
              label="Overall Rating" 
              getValue={school => 
                school.ratings?.overall ? 
                `${school.ratings.overall.toFixed(1)} / 5` : 
                'Not rated'
              } 
            />
            
            <ComparisonRow 
              label="Academic Rating" 
              getValue={school => 
                school.ratings?.academic ? 
                `${school.ratings.academic.toFixed(1)} / 5` : 
                'Not rated'
              } 
            />
            
            <ComparisonRow 
              label="Facilities Rating" 
              getValue={school => 
                school.ratings?.facilities ? 
                `${school.ratings.facilities.toFixed(1)} / 5` : 
                'Not rated'
              } 
            />
            
            <ComparisonRow 
              label="Teachers Rating" 
              getValue={school => 
                school.ratings?.teachers ? 
                `${school.ratings.teachers.toFixed(1)} / 5` : 
                'Not rated'
              } 
            />
            
            <ComparisonRow 
              label="Environment Rating" 
              getValue={school => 
                school.ratings?.environment ? 
                `${school.ratings.environment.toFixed(1)} / 5` : 
                'Not rated'
              } 
            />
            
            <ComparisonRow 
              label="Tuition Fees" 
              getValue={school => 
                school.fees?.tuition ? 
                `KES ${school.fees.tuition.minAmount} - ${school.fees.tuition.maxAmount}` : 
                'N/A'
              } 
            />
            
            <ComparisonRow 
              label="Facilities" 
              getValue={school => 
                school.facilities?.length ? 
                school.facilities.map(f => f.name).join(', ') : 
                'N/A'
              } 
            />
            
            <ComparisonRow 
              label="Contact Phone" 
              getValue={school => school.contact?.phone || 'N/A'} 
            />
            
            <ComparisonRow 
              label="Contact Email" 
              getValue={school => school.contact?.email || 'N/A'} 
            />
            
            <tr>
              <td className="comparison-label">Actions</td>
              {schools.map(school => (
                <td key={school._id}>
                  <button 
                    onClick={() => navigate(`/schools/${school._id}`)}
                    className="view-details-btn"
                  >
                    View Details
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {schools.length >= 2 && (
        <div className="comparison-summary">
          <h3>Quick Comparison</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Highest Rated Overall</h4>
              <p>
                {schools.reduce((best, current) => 
                  (current.ratings?.overall || 0) > (best.ratings?.overall || 0) ? current : best
                ).name}
              </p>
            </div>
            <div className="summary-card">
              <h4>Most Affordable</h4>
              <p>
                {schools.reduce((cheapest, current) => 
                  (current.fees?.tuition?.minAmount || Infinity) < (cheapest.fees?.tuition?.minAmount || Infinity) ? current : cheapest
                ).name}
              </p>
            </div>
            <div className="summary-card">
              <h4>Most Facilities</h4>
              <p>
                {schools.reduce((most, current) => 
                  (current.facilities?.length || 0) > (most.facilities?.length || 0) ? current : most
                ).name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareSchools;