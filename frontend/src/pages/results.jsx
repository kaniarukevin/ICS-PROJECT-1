import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Results() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize filters from URL
  const [name, setName] = useState(searchParams.get('name') || '');
  const [schoolType, setSchoolType] = useState(searchParams.get('schoolType') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minFee, setMinFee] = useState(searchParams.get('minFee') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);

    const params = {};
    if (name) params.name = name;
    if (schoolType) params.schoolType = schoolType;
    if (location) params.location = location;
    if (minFee) params.minFee = minFee;
    if (maxFee) params.maxFee = maxFee;

    try {
      const res = await axios.get('http://localhost:5000/api/parents/schools', { params });
      if (Array.isArray(res.data)) {
        setSchools(res.data);
      } else {
        setSchools([]);
        console.warn('Unexpected response format:', res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when URL search params change
  useEffect(() => {
    // Sync URL to local state (for interactive updates to work)
    setName(searchParams.get('name') || '');
    setSchoolType(searchParams.get('schoolType') || '');
    setLocation(searchParams.get('location') || '');
    setMinFee(searchParams.get('minFee') || '');
    setMaxFee(searchParams.get('maxFee') || '');

    fetchSchools();
  }, [searchParams.toString()]);

  const handleApplyFilters = () => {
    const newParams = {};

    if (name) newParams.name = name;
    if (schoolType) newParams.schoolType = schoolType;
    if (location) newParams.location = location;
    if (minFee) newParams.minFee = minFee;
    if (maxFee) newParams.maxFee = maxFee;

    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setName('');
    setSchoolType('');
    setLocation('');
    setMinFee('');
    setMaxFee('');
    setSearchParams({});
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Search & Filter Schools</h1>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={schoolType}
          onChange={(e) => setSchoolType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="High School">High School</option>
          <option value="TVET">TVET</option>
          <option value="University">University</option>
        </select>

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Min Fee"
          value={minFee}
          onChange={(e) => setMinFee(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Max Fee"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            onClick={handleClearFilters}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 📋 Results */}
      {loading ? (
        <p>Loading schools...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : schools.length === 0 ? (
        <p>No schools found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <div
              key={school._id}
              className="border rounded-xl shadow p-4 hover:shadow-lg transition-all"
            >
              <h2 className="text-xl font-semibold">{school.name}</h2>
              <p className="text-sm text-gray-600 mb-1">
                {school.location?.city || 'Unknown City'}, {school.location?.state || 'Unknown State'}
              </p>
              <p className="text-sm text-gray-500 mb-2">{school.schoolType || 'Type not specified'}</p>
              <p className="text-sm text-gray-700 mb-1">
                📍 {school.location?.address || 'Address not available'}
              </p>
              <p className="text-sm text-gray-700">
                ⭐ {school.ratings?.overall ? school.ratings.overall.toFixed(1) : 'No rating'}
              </p>
              <a
                href={`/school/${school._id}`}
                className="inline-block mt-2 text-blue-600 hover:underline text-sm"
              >
                View Details
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Results;
