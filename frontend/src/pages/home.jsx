import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';

function StarRating({ value }) {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push(<span key={i} className="star full">★</span>);
    else if (i === fullStars && hasHalfStar) stars.push(<span key={i} className="star half">⯪</span>);
    else stars.push(<span key={i} className="star empty">☆</span>);
  }
  return <div className="star-rating">{stars} <span className="rating-number">{value.toFixed(1)}</span></div>;
}

function StarFilter({ label, value, setValue }) {
  const handleClick = (val) => {
    setValue(value === val ? '' : val);
  };

  return (
    <div className="star-filter">
      <label>{label}</label>
      <div className="star-select">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${value >= star ? 'full' : 'empty'}`}
            onClick={() => handleClick(star)}
            style={{ cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.2s ease' }}
          >
            ★
          </span>
        ))}
        {value && <span className="star-value">{value}</span>}
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
    <div className="results-wrapper">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to EduSearch</h1>
        <p className="welcome-subtitle">Discover the best educational institutions for your child's future</p>
      </div>

      <div className="top-schools-section">
        <h2 className="section-title">🏆 Top 5 Schools</h2>
        <p className="section-description">Based on overall ratings and reviews from parents and students</p>
      </div>

      <div className="filter-grid">
        <input type="text" placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} />
        <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)}>
          <option value="">All Types</option>
          <option value="High School">High School</option>
          <option value="TVET">TVET</option>
          <option value="University">University</option>
        </select>

        <input
          type="text"
          list="location-options"
          placeholder="Location (Town or County)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <datalist id="location-options">
          {filteredSuggestions.map((loc, i) => <option key={i} value={loc} />)}
        </datalist>

        <input type="number" placeholder="Min Fee" value={minFee} onChange={(e) => setMinFee(e.target.value)} onKeyDown={handleKeyDown} />
        <input type="number" placeholder="Max Fee" value={maxFee} onChange={(e) => setMaxFee(e.target.value)} onKeyDown={handleKeyDown} />

        <div className="rating-filters">
          <StarFilter label="⭐ Minimum Overall Rating" value={overallRating} setValue={setOverallRating} />
        </div>

        <div className="filter-buttons">
          <button onClick={handleSearch}>🔍 Search</button>
          <button onClick={handleClearFilters}>Clear</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-section">
          <p>🔍 Finding the best schools for you...</p>
        </div>
      ) : error ? (
        <div className="error-section">
          <p className="error-text">😔 {error}</p>
        </div>
      ) : schools.length === 0 ? (
        <div className="no-results-section">
          <p>📚 No schools found matching your criteria. Try adjusting your filters!</p>
        </div>
      ) : (
        <>
          <div className="results-grid">
            {schools.map((school, index) => (
              <div key={school._id} className="school-card">
                <div className="school-rank">🏅 #{index + 1}</div>
                <h3>{school.name}</h3>
                <p className="school-location">📍 {school.location?.city || 'Unknown City'}, {school.location?.state || 'Unknown State'}</p>
                <p className="school-type">🏫 {school.schoolType || 'Type not specified'}</p>
                <p className="school-address">{school.location?.address || 'Address not available'}</p>
                <StarRating value={school.ratings?.overall || 0} />
                <a href={`/school/${school._id}`} className="view-details-btn">View Details →</a>
              </div>
            ))}
          </div>

          <div className="explore-more">
            <p>Looking for more options? <a href="/results">Explore all schools</a></p>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
