import { createContext } from 'react';

// Pure context value export (no components) to satisfy Fast Refresh rules
export const AuthContext = createContext();

export default AuthContext;
