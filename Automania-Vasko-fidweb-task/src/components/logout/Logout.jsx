import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/userContext';

export default function Logout() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are already logged out.');
      navigate('/user/login');
      return;
    }

    const logout = async () => {
      try {
        const response = await fetch('https://automania.herokuapp.com/user/logout', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          localStorage.removeItem('token');
          setUser(null);
          alert(result.payload.message);
          navigate('/user/login');
        } else {
          alert('Failed to log out. Please try again.');
        }
      } catch (error) {
        console.error('Error logging out:', error);
        alert('An error occurred during logout.');
      }
    };

    logout();
  }, [navigate, setUser]);

  return null;
}

