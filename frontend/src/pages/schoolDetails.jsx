import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function SchoolDetails() {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/parents/schools/${id}`);
        const data = await res.json();
        setSchool(data);
      } catch (err) {
        console.error('Error fetching school:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [id]);

  if (loading) return <p>Loading school details...</p>;
  if (!school) return <p>School not found.</p>;

  return (
    <div className="school-details-container">
      <h1>{school.name}</h1>
      <p><strong>Type:</strong> {school.schoolType}</p>
      <p>{school.description}</p>

      <h3>Location</h3>
      <p>{school.location?.address}, {school.location?.city}, {school.location?.state}</p>

      <h3>Ratings</h3>
      <p>Overall: {school.ratings?.overall || 'N/A'}</p>
      <p>Academic: {school.ratings?.academic || 'N/A'}</p>
      <p>Facilities: {school.ratings?.facilities || 'N/A'}</p>
      <p>Teachers: {school.ratings?.teachers || 'N/A'}</p>
      <p>Environment: {school.ratings?.environment || 'N/A'}</p> 

      <h3>Facilities</h3>
      <ul>
        {school.facilities?.map((f, index) => (
          <li key={index}>{f.name}</li>
        ))}
      </ul>

      <h3>Fees (KES)</h3>
      <p>From {school.fees?.tuition?.minAmount} to {school.fees?.tuition?.maxAmount} per term</p>

      <h3>Contact</h3>
      <p>Phone: {school.contact?.phone}</p>
      <p>Email: {school.contact?.email}</p>
    </div>
  );
}

export default SchoolDetails;
