// hooks/useSchoolSearch.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useSchoolSearch = (initialFilters = {}) => {
  const [schools, setSchools] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSchools = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/parents/schools', {
        params: { ...filters, page: currentPage },
      });
      setSchools(response.data.schools || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to load schools');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [filters, currentPage]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // reset to page 1 on filter change
  };

  const resetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return {
    schools,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    error,
  };
};

export default useSchoolSearch;
