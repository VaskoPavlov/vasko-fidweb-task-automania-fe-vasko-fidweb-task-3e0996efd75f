import { useContext, useState } from 'react';
import { UserContext } from '../contexts/userContext';
import { loginUser } from '../apis/user-api';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useContext(UserContext);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('token', response.token);
        return true;
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
