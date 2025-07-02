import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './results.css';

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
    setValue(value === val ? '' : val); // Toggle
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

function Results() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState(searchParams.get('name') || '');
  const [schoolType, setSchoolType] = useState(searchParams.get('schoolType') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minFee, setMinFee] = useState(searchParams.get('minFee') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');

  const [overallRating, setOverallRating] = useState(searchParams.get('overallRating') || '');
  const [academicRating, setAcademicRating] = useState(searchParams.get('academicRating') || '');
  const [facilitiesRating, setFacilitiesRating] = useState(searchParams.get('facilitiesRating') || '');
  const [teachersRating, setTeachersRating] = useState(searchParams.get('teachersRating') || '');
  const [environmentRating, setEnvironmentRating] = useState(searchParams.get('environmentRating') || '');

  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);

    const params = {
      page: currentPage,
      name,
      schoolType,
      location,
      minFee,
      maxFee,
      overallRating,
      academicRating,
      facilitiesRating,
      teachersRating,
      environmentRating,
      sortBy,
      sortOrder,
    };

    try {
      const res = await axios.get('http://localhost:5000/api/parents/schools', { params });
      setSchools(res.data.schools || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [searchParams.toString(), currentPage]);

  const handleApplyFilters = () => {
    const newParams = {
      name,
      schoolType,
      location,
      minFee,
      maxFee,
      overallRating,
      academicRating,
      facilitiesRating,
      teachersRating,
      environmentRating,
      sortBy,
      sortOrder,
    };
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApplyFilters();
  };

  const handleClearFilters = () => {
    setName('');
    setSchoolType('');
    setLocation('');
    setMinFee('');
    setMaxFee('');
    setOverallRating('');
    setAcademicRating('');
    setFacilitiesRating('');
    setTeachersRating('');
    setEnvironmentRating('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="results-wrapper">
      <h1 className="results-title">Search & Filter Schools</h1>

      <div className="sort-controls">
        <label>Sort By:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="ratings.overall">Overall Rating</option>
          <option value="fees.tuition.minAmount">Lowest Fee</option>
          <option value="name">A-Z</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="filter-grid">
        <input type="text" placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} />
        <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)}>
          <option value="">All Types</option>
          <option value="High School">High School</option>
          <option value="TVET">TVET</option>
          <option value="University">University</option>
        </select>
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={handleKeyDown} />
        <input type="number" placeholder="Min Fee" value={minFee} onChange={(e) => setMinFee(e.target.value)} onKeyDown={handleKeyDown} />
        <input type="number" placeholder="Max Fee" value={maxFee} onChange={(e) => setMaxFee(e.target.value)} onKeyDown={handleKeyDown} />

        <div className="rating-filters">
          <StarFilter label="⭐ Overall Rating" value={overallRating} setValue={setOverallRating} />
          <StarFilter label="📘 Academic Rating" value={academicRating} setValue={setAcademicRating} />
          <StarFilter label="🏫 Facilities Rating" value={facilitiesRating} setValue={setFacilitiesRating} />
          <StarFilter label="👩‍🏫 Teachers Rating" value={teachersRating} setValue={setTeachersRating} />
          <StarFilter label="🌳 Environment Rating" value={environmentRating} setValue={setEnvironmentRating} />
        </div>

        <div className="filter-buttons">
          <button onClick={handleApplyFilters}>Apply</button>
          <button onClick={handleClearFilters}>Clear</button>
        </div>
      </div>

      {loading ? (
        <p>Loading schools...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : schools.length === 0 ? (
        <p>No schools found.</p>
      ) : (
        <>
          <div className="results-grid">
            {schools.map((school) => (
              <div key={school._id} className="school-card">
                <h2>{school.name}</h2>
                <p>{school.location?.city || 'Unknown City'}, {school.location?.state || 'Unknown State'}</p>
                <p>{school.schoolType || 'Type not specified'}</p>
                <p>📍 {school.location?.address || 'Address not available'}</p>
                <StarRating value={school.ratings?.overall || 0} />
                <a href={`/school/${school._id}`}>View Details</a>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Results;
