// components/common/SchoolCard.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import{ AuthContext } from '../../context/AuthContext'; // Adjust the import path as necessary

const SchoolCard = ({ school, enableActions = true }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Assuming your authContext provides this

  const handleClick = () => {
    navigate(`/school/${school._id}`);
  };

  return (
    <div className="school-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <h3>{school.name}</h3>
      <p>{school.schoolType}</p>
      <p>
        {school.location?.city || 'Unknown City'}, {school.location?.state || 'Unknown State'}
      </p>
      <StarRating value={school.ratings?.overall || 0} />

      {enableActions && (
        <div className="school-actions">
          {user ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/school/${school._id}?action=book`); }}>Book Tour</button>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/school/${school._id}?action=rate`); }}>Rate</button>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/compare?schoolId=${school._id}`); }}>Compare</button>
            </>
          ) : (
            <p className="login-hint">Login to book, rate, or compare</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SchoolCard;
