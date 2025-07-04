// components/common/SearchFilters.jsx
import React, { useState, useEffect } from 'react';
import StarFilter from './StarFilter';
//import './SearchFilters.css'; // Optional custom styling

const SearchFilters = ({ filters, updateFilters, resetFilters, schoolList }) => {
  const [locations, setLocations] = useState([]);

  // Derive locations from school list
  useEffect(() => {
    if (schoolList?.length) {
      const unique = [...new Set(schoolList.map(s => s.location?.city).filter(Boolean))];
      setLocations(unique);
    }
  }, [schoolList]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFilters({ [name]: value });
  };

  return (
    <div className="search-filters">
      <input
        type="text"
        placeholder="Search by school name"
        name="name"
        value={filters.name || ''}
        onChange={handleInputChange}
      />

      <select name="schoolType" value={filters.schoolType || ''} onChange={handleInputChange}>
        <option value="">All Types</option>
        <option value="Primary">Primary</option>
        <option value="Secondary">Secondary</option>
        <option value="TVET">TVET</option>
        <option value="College">College</option>
        <option value="University">University</option>
      </select>

      <select name="location" value={filters.location || ''} onChange={handleInputChange}>
        <option value="">All Locations</option>
        {locations.map((loc, i) => (
          <option key={i} value={loc}>{loc}</option>
        ))}
      </select>

      <input
        type="number"
        name="minFee"
        placeholder="Min Fee"
        value={filters.minFee || ''}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="maxFee"
        placeholder="Max Fee"
        value={filters.maxFee || ''}
        onChange={handleInputChange}
      />

      <StarFilter label="⭐ Overall" value={filters.overallRating || ''} setValue={(v) => updateFilters({ overallRating: v })} />
      <StarFilter label="📘 Academic" value={filters.academicRating || ''} setValue={(v) => updateFilters({ academicRating: v })} />
      <StarFilter label="🏫 Facilities" value={filters.facilitiesRating || ''} setValue={(v) => updateFilters({ facilitiesRating: v })} />
      <StarFilter label="👩‍🏫 Teachers" value={filters.teachersRating || ''} setValue={(v) => updateFilters({ teachersRating: v })} />
      <StarFilter label="🌳 Environment" value={filters.environmentRating || ''} setValue={(v) => updateFilters({ environmentRating: v })} />

      <div className="filter-buttons">
        <button onClick={() => updateFilters(filters)}>Apply</button>
        <button onClick={resetFilters}>Clear</button>
      </div>
    </div>
  );
};

export default SearchFilters;
