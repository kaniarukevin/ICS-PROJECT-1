import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';

function StarRating({ value }) {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push(<span key={i} className="hp-star hp-full">★</span>);
    else if (i === fullStars && hasHalfStar) stars.push(<span key={i} className="hp-star hp-half">⯪</span>);
    else stars.push(<span key={i} className="hp-star hp-empty">☆</span>);
  }
  return <div className="hp-star-rating">{stars} <span className="hp-rating-number">{value.toFixed(1)}</span></div>;
}

function StarFilter({ label, value, setValue }) {
  const handleClick = (val) => {
    setValue(value === val ? '' : val);
  };

  return (
    <div className="hp-star-filter">
      <label className="hp-star-label">{label}</label>
      <div className="hp-star-select">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`hp-star ${value >= star ? 'hp-full' : 'hp-empty'}`}
            onClick={() => handleClick(star)}
            style={{ cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.2s ease' }}
          >
            ★
          </span>
        ))}
        {value && <span className="hp-star-value">{value}</span>}
      </div>
    </div>
  );
}

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState(searchParams.get('name') || '');
  const [schoolType, setSchoolType] = useState(searchParams.get('schoolType') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [minFee, setMinFee] = useState(searchParams.get('minFee') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');

  const [overallRating, setOverallRating] = useState(searchParams.get('overallRating') || '');
  const [academicRating, setAcademicRating] = useState(searchParams.get('academicRating') || '');
  const [facilitiesRating, setFacilitiesRating] = useState(searchParams.get('facilitiesRating') || '');
  const [teachersRating, setTeachersRating] = useState(searchParams.get('teachersRating') || '');
  const [environmentRating, setEnvironmentRating] = useState(searchParams.get('environmentRating') || '');

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);

    const params = {
      page: 1,
      limit: 5,
      name,
      schoolType,
      location,
      minFee: minFee ? Number(minFee) : undefined,
      maxFee: maxFee ? Number(maxFee) : undefined,
      overallRating,
      academicRating,
      facilitiesRating,
      teachersRating,
      environmentRating,
      sortBy: 'ratings.overall',
      sortOrder: 'desc',
    };

    try {
      const res = await axios.get('http://localhost:5000/api/parents/schools', { params });
      setSchools(res.data.schools?.slice(0, 5) || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/parents/locations');
      setLocationSuggestions(res.data);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [searchParams.toString()]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (name) searchParams.set('name', name);
    if (schoolType) searchParams.set('schoolType', schoolType);
    if (location) searchParams.set('location', location);
    if (minFee) searchParams.set('minFee', minFee);
    if (maxFee) searchParams.set('maxFee', maxFee);
    if (overallRating) searchParams.set('overallRating', overallRating);
    navigate(`/results?${searchParams.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearFilters = () => {
    setName('');
    setSchoolType('');
    setLocation('');
    setMinFee('');
    setMaxFee('');
    setOverallRating('');
    setSearchParams({});
  };

  const filteredSuggestions = locationSuggestions.filter(loc =>
    loc.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className="hp-wrapper">
      {/* Hero Section with Search */}
      <div className="hp-hero-section">
        <div className="hp-container">
          <div className="hp-hero-content">
            <h1 className="hp-hero-title">Find Your Perfect School</h1>
            <p className="hp-hero-subtitle">
              Search, compare, and book tours at top schools across Kenya
            </p>
            
            <div className="hp-hero-search">
              {/* Search Bar Row */}
              <div className="hp-search-row">
                <input 
                  type="text" 
                  placeholder="Search by school name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  className="hp-search-input hp-main-search"
                />
              </div>

              {/* Filters Row */}
              <div className="hp-filters-row">
                <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)} className="hp-filter-select">
                  <option value="">All Types</option>
                  <option value="High School">High School</option>
                  <option value="TVET">TVET</option>
                  <option value="University">University</option>
                  <option value="Primary School">Primary School</option>
                  <option value="Kindergarten">Kindergarten</option>  
                  <option value="College">College</option>
                </select>

                <input
                  type="text"
                  list="location-options"
                  placeholder="Location (Town or County)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="hp-search-input"
                />
                <datalist id="location-options">
                  {filteredSuggestions.map((loc, i) => <option key={i} value={loc} />)}
                </datalist>

                <input 
                  type="number" 
                  placeholder="Min Fee" 
                  value={minFee} 
                  onChange={(e) => setMinFee(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  className="hp-search-input"
                />
                <input 
                  type="number" 
                  placeholder="Max Fee" 
                  value={maxFee} 
                  onChange={(e) => setMaxFee(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  className="hp-search-input"
                />
              </div>

              {/* Rating Row */}
              <div className="hp-rating-row">
                <div className="hp-rating-filters">
                  <StarFilter label="⭐ Minimum Overall Rating" value={overallRating} setValue={setOverallRating} />
                </div>
              </div>

              {/* Buttons Row */}
              <div className="hp-filter-buttons">
                <button onClick={handleSearch} className="hp-search-btn">Search Schools</button>
                <button onClick={handleClearFilters} className="hp-clear-btn">Clear Filters</button>
              </div>
              
              {/* CTA Section */}
              <div className="hp-cta-section">
                <p className="hp-cta-text">Or browse all schools</p>
                <button onClick={() => navigate('/results')} className="hp-cta-btn">
                  View All Schools
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Schools Section */}
      <div className="hp-top-schools-section">
        <div className="hp-container">
          <h2 className="hp-section-title">🏆 Top 5 Schools</h2>
          <p className="hp-section-description">Based on overall ratings and reviews from parents and students</p>

          {loading ? (
            <div className="hp-loading-section">
              <div className="hp-loading-spinner"></div>
              <p>🔍 Finding the best schools for you...</p>
            </div>
          ) : error ? (
            <div className="hp-error-section">
              <p className="hp-error-text">😔 {error}</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="hp-no-results-section">
              <p>📚 No schools found matching your criteria. Try adjusting your filters!</p>
            </div>
          ) : (
            <>
              <div className="hp-results-grid">
                {schools.map((school, index) => (
                  <div key={school._id} className="hp-school-card">
                    <div className="hp-school-rank">🏅 #{index + 1}</div>
                    <h3 className="hp-school-name">{school.name}</h3>
                    <p className="hp-school-location">📍 {school.location?.city || 'Unknown City'}, {school.location?.state || 'Unknown State'}</p>
                    <p className="hp-school-type">🏫 {school.schoolType || 'Type not specified'}</p>
                    <p className="hp-school-address">{school.location?.address || 'Address not available'}</p>
                    <StarRating value={school.ratings?.overall || 0} />
                    <div className="hp-school-actions">
                      <a href={`/school/${school._id}`} className="hp-view-details-btn">View Details</a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hp-explore-more">
                <p>Looking for more options? <a href="/results" className="hp-explore-link">Explore all schools</a></p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;