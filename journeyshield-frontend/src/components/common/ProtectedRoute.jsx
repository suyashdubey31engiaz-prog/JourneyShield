// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const user = JSON.parse(sessionStorage.getItem('user'));
//   if (!user) {
//     return <Navigate to="/login" />;
//   }
//   return children;
// };

// export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Checks sessionStorage for the user data from a successful login
  const user = JSON.parse(sessionStorage.getItem('user'));

  if (!user) {
    // If no user is found, redirect them to the login page
    return <Navigate to="/login" />;
  }

  // If a user is found, show the requested page
  return children;
};

export default ProtectedRoute;