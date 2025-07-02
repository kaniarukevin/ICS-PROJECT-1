import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [schools, setSchools] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/parents/schools")
      .then((res) => res.json())
      .then((data) => {
        setSchools(data);
        const locationList = [...new Set(data.map((school) => school.location?.city).filter(Boolean))];
        setLocations(locationList);
      })
      .catch((err) => console.error("Failed to fetch schools", err));
  }, []);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append("name", searchTerm);
    if (selectedType) queryParams.append("schoolType", selectedType);
    if (selectedLocation) queryParams.append("location", selectedLocation);
    if (minFee) queryParams.append("minFee", minFee);
    if (maxFee) queryParams.append("maxFee", maxFee);
    navigate(`/results?${queryParams.toString()}`);
  };

  const topRatedSchools = schools
    .filter((school) => school.averageRating >= 4)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="home">
      <h1>Discover Schools in Kenya</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by school name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">Select School Type</option>
          <option value="Primary">Primary</option>
          <option value="Secondary">Secondary</option>
          <option value="TVET">TVET</option>
          <option value="College">College</option>
          <option value="University">University</option>
        </select>

        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
          <option value="">Select Location</option>
          {locations.map((loc, idx) => (
            <option key={idx} value={loc}>{loc}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Fee"
          value={minFee}
          onChange={(e) => setMinFee(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <input
          type="number"
          placeholder="Max Fee"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="quick-buttons">
        {["Primary", "Secondary", "TVET", "College", "University"].map((type) => (
          <button key={type} onClick={() => {
            setSelectedType(type);
            navigate(`/results?schoolType=${type}`);
          }}>
            {type}
          </button>
        ))}
      </div>

      <h2>Top Rated Schools</h2>
      <div className="school-list">
        {topRatedSchools.length > 0 ? (
          topRatedSchools.map((school) => (
            <div 
              className="school-card" 
              key={school._id}
              onClick={() => handleSchoolClick(school._id)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{school.name}</h3>
              <p>{school.description}</p>
              <p><strong>Type:</strong> {school.schoolType}</p>
              <p><strong>Location:</strong> {school.location?.city || 'Location not specified'}</p>
              <p><strong>Rating:</strong> {school.averageRating ? school.averageRating.toFixed(1) : 'No rating'} ⭐</p>
              <p className="click-hint">Click to view details</p>
            </div>
          ))
        ) : (
          <div className="no-schools">
            <p>No top-rated schools available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;