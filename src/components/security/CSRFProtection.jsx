import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// CSRF Token Management
let csrfToken = null;

export const getCSRFToken = () => {
  if (!csrfToken) {
    csrfToken = uuidv4();
    sessionStorage.setItem('csrf_token', csrfToken);
  }
  return csrfToken;
};

export const validateCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
};

export const useCSRFProtection = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentToken = getCSRFToken();
    setToken(currentToken);
  }, []);

  return token;
};

// HOC for CSRF-protected forms
export function withCSRFProtection(WrappedComponent) {
  return function CSRFProtectedComponent(props) {
    const token = useCSRFProtection();

    return <WrappedComponent {...props} csrfToken={token} />;
  };
}