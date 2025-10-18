import React from 'react';
import { AuthProvider as Provider } from './AuthContext';

// Export a component-only module so Fast Refresh stays happy.
const AuthProvider = ({ children }) => {
  return <Provider>{children}</Provider>;
};

export default AuthProvider;
