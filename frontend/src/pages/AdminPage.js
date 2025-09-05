// File: src/pages/AdminPage.js
// Process: Admin dashboard for registering students/teachers and viewing lists.
// Flow: Checks admin role → Fetches students/teachers → Submits registrations → Updates lists.


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');

  // Teacher form state
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        axios.get(`${API_URL}/students`, getAuthHeaders()),
        axios.get(`${API_URL}/teachers`, getAuthHeaders())
      ]);

      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register-student`, {
        name: studentName,
        class_grade: studentClass  // Fixed: use class_grade to match backend
      }, getAuthHeaders());

      setSuccess('Student registered successfully');
      setStudentName('');
      setStudentClass('');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register student');
    }
  };

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register-teacher`, {
        name: teacherName,
        email: teacherEmail,
        password: teacherPassword
      }, getAuthHeaders());

      setSuccess('Teacher registered successfully');
      setTeacherName('');
      setTeacherEmail('');
      setTeacherPassword('');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register teacher');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        <div>
          <button 
            onClick={() => navigate('/reports')}
            className="button button-success"
            style={{ marginRight: '10px' }}
          >
            View Reports
          </button>
          <button 
            onClick={handleLogout}
            className="button button-danger"
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="grid">
        <div className="form-container">
          <h2>Register Student</h2>
          <form onSubmit={handleRegisterStudent}>
            <div style={{ marginBottom: '15px' }}>
              <label>Name:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                className="input"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Class/Grade:</label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="e.g., Grade 5, Class 10-B"
                required
                className="input"
              />
            </div>
            <button type="submit" className="button button-primary">
              Register Student
            </button>
          </form>
        </div>

        <div className="form-container">
          <h2>Register Teacher</h2>
          <form onSubmit={handleRegisterTeacher}>
            <div style={{ marginBottom: '15px' }}>
              <label>Name:</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
                className="input"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Email:</label>
              <input
                type="email"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                required
                className="input"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Password:</label>
              <input
                type="password"
                value={teacherPassword}
                onChange={(e) => setTeacherPassword(e.target.value)}
                required
                className="input"
              />
            </div>
            <button type="submit" className="button button-primary">
              Register Teacher
            </button>
          </form>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '30px' }}>
        <div>
          <h2>Students ({students.length})</h2>
          <div className="list-container">
            {students.length === 0 ? (
              <p style={{ padding: '20px' }}>No students registered yet.</p>
            ) : (
              students.map((student, index) => (
                <div key={student.id} className="list-item">
                  <strong>{student.name}</strong> - {student.class_grade}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2>Teachers ({teachers.length})</h2>
          <div className="list-container">
            {teachers.length === 0 ? (
              <p style={{ padding: '20px' }}>No teachers registered yet.</p>
            ) : (
              teachers.map((teacher, index) => (
                <div key={teacher.id} className="list-item">
                  <strong>{teacher.name}</strong><br />
                  <small>{teacher.email}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}