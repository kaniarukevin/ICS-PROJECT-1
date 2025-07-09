import React from 'react';

const ReportGenerator = ({ statistics, recentBookings, upcomingTours }) => {
  // Converts data arrays/objects into CSV and triggers download
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const replacer = (key, value) => (value === null || value === undefined ? '' : value);

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // header row
      ...data.map(row =>
        headers.map(field => JSON.stringify(row[field], replacer)).join(',')
      )
    ];

    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleDownloadStatistics = () => {
    const statsArray = Object.entries(statistics).map(([key, value]) => ({
      metric: key,
      value,
    }));
    downloadCSV(statsArray, 'school_statistics.csv');
  };

  const handleDownloadRecentBookings = () => {
    const data = recentBookings.map(b => ({
      Student: b.studentName,
      Tour: b.tourId?.title || 'N/A',
      Date: new Date(b.createdAt).toLocaleDateString(),
      Status: b.status,
    }));
    downloadCSV(data, 'recent_bookings.csv');
  };

  const handleDownloadUpcomingTours = () => {
    const data = upcomingTours.map(t => ({
      Title: t.title,
      Date: new Date(t.date).toLocaleDateString(),
      StartTime: t.startTime,
      Capacity: `${t.currentBookings || 0}/${t.maxCapacity}`,
    }));
    downloadCSV(data, 'upcoming_tours.csv');
  };

  return (
    <div className="report-generator">
      <h2>📄 Generate Reports</h2>
      <div className="report-buttons">
        <button onClick={handleDownloadStatistics}>📊 Download Statistics</button>
        <button onClick={handleDownloadRecentBookings}>📋 Download Recent Bookings</button>
        <button onClick={handleDownloadUpcomingTours}>🎯 Download Upcoming Tours</button>
      </div>

      <style>{`
        .report-generator {
          margin-top: 2rem;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .report-generator h2 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }
        .report-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .report-buttons button {
          padding: 0.75rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .report-buttons button:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default ReportGenerator;
