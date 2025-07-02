import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const Results = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local form state
  const [name, setName] = useState(searchParams.get("name") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [schoolType, setSchoolType] = useState(searchParams.get("schoolType") || "");
  const [minFee, setMinFee] = useState(searchParams.get("minFee") || "");
  const [maxFee, setMaxFee] = useState(searchParams.get("maxFee") || "");
  const [facilities, setFacilities] = useState(searchParams.get("facilities") || "");

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/parents/schools?${searchParams.toString()}`);
      setSchools(res.data.schools || []);
    } catch (err) {
      console.error("Error fetching schools:", err);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {};

    if (name.trim()) params.name = name.trim();
    if (location.trim()) params.location = location.trim();
    if (schoolType) params.schoolType = schoolType;
    if (minFee) params.minFee = minFee;
    if (maxFee) params.maxFee = maxFee;
    if (facilities.trim()) params.facilities = facilities.trim();

    setSearchParams(params);
  };

  const handleClear = () => {
    setName("");
    setLocation("");
    setSchoolType("");
    setMinFee("");
    setMaxFee("");
    setFacilities("");
    setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <input
          type="text"
          placeholder="Search by school name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded p-2"
        />
        <select
          value={schoolType}
          onChange={(e) => setSchoolType(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Types</option>
          <option value="Primary">Primary</option>
          <option value="Secondary">Secondary</option>
          <option value="College">College</option>
          <option value="University">University</option>
          <option value="TVET">TVET</option>
        </select>
        <input
          type="number"
          placeholder="Min Fee"
          value={minFee}
          onChange={(e) => setMinFee(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="number"
          placeholder="Max Fee"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Facility (e.g. Library)"
          value={facilities}
          onChange={(e) => setFacilities(e.target.value)}
          className="border rounded p-2"
        />

        <div className="flex gap-2 col-span-full">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Search
          </button>
          <button type="button" onClick={handleClear} className="bg-gray-300 px-4 py-2 rounded">
            Clear
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-center text-gray-600">Loading schools...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(schools) && schools.length > 0 ? (
            schools.map((school) => (
              <div key={school._id} className="border p-4 rounded shadow">
                <h2 className="text-lg font-semibold">{school.name}</h2>
                <p className="text-sm text-gray-600">{school.location?.city}</p>
                <p className="text-sm text-gray-700">{school.schoolType}</p>
                <p className="text-sm text-gray-700">
                  Fee: {school.fees?.tuition?.baseFee?.toLocaleString("en-KE", { style: "currency", currency: "KES" })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">No schools found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Results;
