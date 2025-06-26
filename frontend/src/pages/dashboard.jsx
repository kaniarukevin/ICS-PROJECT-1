import React from 'react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div>
      <h1>Welcome to School Booking Dashboard</h1>
        <p>This is your dashboard where you can manage your bookings and view your profile.</p>

      {user ? (
        <p>Hello, {user.name}</p>
      ) : (
        <p>You are not logged in. Some features may be unavailable.</p>
      )}
    </div>
  );
};

export default Dashboard;
// This is a simple dashboard page that displays a welcome message and the user's name and email if they are logged in.