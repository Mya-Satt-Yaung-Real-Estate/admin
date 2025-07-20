import React from 'react';
import { Navigate } from 'react-router-dom';

const UserManagementPage: React.FC = () => {
  // Redirect to the user list page
  return <Navigate to="/users" replace />;
};

export default UserManagementPage; 