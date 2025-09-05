// File: src/pages/HomePage.js
// Process: Redirects to login or dashboard based on authentication status.
// Flow: Checks token/user → Redirects to /login, /admin, or /teacher.


import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (user && token && user.role) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'teacher') {
        navigate('/teacher');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column'
    }}>
      <h1>School Attendance System</h1>
      <p>Loading...</p>
    </div>
  );
}