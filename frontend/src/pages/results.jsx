import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './results.css'; // updated to use .css extension if it exists

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
            style={{ cursor: 'pointer', fontSize: '1.25rem', transition: 'transform 0.2s ease' }}
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
  const [locationSuggestions, setLocationSuggestions] = useState([]);
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);

    const params = {
      page: currentPage,
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
  }, [searchParams.toString(), currentPage]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const updateSortInParams = (newSortBy, newSortOrder) => {
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
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    };
    setSearchParams(newParams);
    setCurrentPage(1);
  };

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

  const filteredSuggestions = locationSuggestions.filter(loc =>
    loc.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className="sr-wrapper">
      <header className="sr-header">
        <div className="sr-container">
          <div className="sr-search-bar">
            <div className="sr-search-row">
              <input 
                type="text" 
                placeholder="Search by school name..." 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                onKeyDown={handleKeyDown}
                className="sr-input"
              />
              <button onClick={handleApplyFilters} className="sr-btn sr-btn-primary">Search</button>
            </div>

            <div className="sr-sort-controls">
              <div className="sr-sort-group">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const newSort = e.target.value;
                    setSortBy(newSort);
                    updateSortInParams(newSort, sortOrder);
                  }}
                  className="sr-select"
                >
                  <option value="createdAt">Newest</option>
                  <option value="ratings.overall">Overall Rating</option>
                  <option value="fees.tuition.minAmount">Lowest Fee</option>
                  <option value="name">A-Z</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => {
                    const newOrder = e.target.value;
                    setSortOrder(newOrder);
                    updateSortInParams(sortBy, newOrder);
                  }}
                  className="sr-select"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>

              <button 
                className="sr-btn sr-btn-link"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                {filtersOpen ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="sr-main">
        <div className="sr-container">
          <div className="sr-layout">
            <aside className={`sr-sidebar ${filtersOpen ? 'open' : ''}`}>
              <div className="sr-filters">
                <h3 className="sr-filters-title">Refine Your Search</h3>

                <div className="sr-filter-group">
                  <label className="sr-label">School Type</label>
                  <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)} className="sr-input">
                    <option value="">All Types</option>
                    <option value="High School">High School</option>
                    <option value="TVET">TVET</option>
                    <option value="University">University</option>
                  </select>
                </div>

                <div className="sr-filter-group">
                  <label className="sr-label">Location</label>
                  <input
                    type="text"
                    list="location-options"
                    placeholder="Town or County"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="sr-input"
                  />
                  <datalist id="location-options">
                    {filteredSuggestions.map((loc, i) => <option key={i} value={loc} />)}
                  </datalist>
                </div>

                <div className="sr-filter-group">
                  <label className="sr-label">Fee Range</label>
                  <div className="sr-fee-inputs">
                    <input
                      type="number"
                      placeholder="Min Fee"
                      value={minFee}
                      min="0"
                      onChange={(e) => setMinFee(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="sr-input"
                    />
                    <input
                      type="number"
                      placeholder="Max Fee"
                      value={maxFee}
                      min="0"
                      onChange={(e) => setMaxFee(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="sr-input"
                    />
                  </div>
                </div>

                <div className="sr-rating-filters">
                  <StarFilter label="⭐ Overall Rating" value={overallRating} setValue={setOverallRating} />
                  <StarFilter label="📘 Academic Rating" value={academicRating} setValue={setAcademicRating} />
                  <StarFilter label="🏫 Facilities Rating" value={facilitiesRating} setValue={setFacilitiesRating} />
                  <StarFilter label="👩‍🏫 Teachers Rating" value={teachersRating} setValue={setTeachersRating} />
                  <StarFilter label="🌳 Environment Rating" value={environmentRating} setValue={setEnvironmentRating} />
                </div>

                <div className="sr-filter-actions">
                  <button onClick={handleApplyFilters} className="sr-btn sr-btn-primary">Apply Filters</button>
                  <button onClick={handleClearFilters} className="sr-btn sr-btn-secondary">Clear All</button>
                </div>
              </div>
            </aside>

            <main className="sr-results">
              {loading ? (
                <div className="sr-loading">
                  <div className="sr-spinner"></div>
                  <p>Finding schools for you...</p>
                </div>
              ) : error ? (
                <div className="sr-error"><p>😔 {error}</p></div>
              ) : schools.length === 0 ? (
                <div className="sr-no-results"><p>📚 No schools found matching your criteria. Try adjusting your filters!</p></div>
              ) : (
                <>

                  <div className="sr-grid">
                    {schools.map((school) => (
                      <div key={school._id} className="sr-card">
                        <h3 className="sr-card-title">{school.name}</h3>
                        <p className="sr-card-meta">📍 {school.location?.city || 'Unknown City'}, {school.location?.state || 'Unknown State'}</p>
                        <p className="sr-card-meta">🏫 {school.schoolType || 'Type not specified'}</p>
                        <p className="sr-card-meta">{school.location?.address || 'Address not available'}</p>
                        <StarRating value={school.ratings?.overall || 0} />
                        <div className="sr-card-actions">
                          <a href={`/school/${school._id}`} className="sr-btn sr-btn-outline">View Details</a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sr-pagination">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="sr-btn"
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="sr-btn"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
