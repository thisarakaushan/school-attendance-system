// File: src/pages/TeacherPage.js
// Process: Teacher dashboard for marking attendance by class.
// Flow: Fetches classes → Select class → GET /api/students-by-class/{class} → Submit POST /api/mark-attendance.


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TeacherPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    if (!user || user.role !== 'teacher' || !token) {
      navigate('/login');
      return;
    }

    fetchClasses();
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

  const fetchClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/students`, getAuthHeaders());
      const uniqueClasses = [...new Set(response.data.map(s => s.class_grade))];
      setClasses(uniqueClasses);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = async (classValue) => {
    setSelectedClass(classValue);
    setStudents([]);
    setAttendance({});
    setAttendanceMarked(false);
    setError('');
    setSuccess('');

    if (!classValue) return;

    setLoading(true);
    try {
      const studentsResponse = await axios.get(
        `${API_URL}/students-by-class/${encodeURIComponent(classValue)}`,
        getAuthHeaders()
      );
      setStudents(studentsResponse.data);
      const initialAttendance = {};
      studentsResponse.data.forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      setError('No attendance data to submit');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const attendances = Object.entries(attendance).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        status
      }));
      await axios.post(`${API_URL}/mark-attendance`, { attendances }, getAuthHeaders());
      setSuccess('Attendance marked successfully!');
      setAttendanceMarked(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to mark attendance');
      if (error.response?.data?.error?.includes('already marked')) {
        setAttendanceMarked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewReports = () => {
    setError(''); // Clear any existing errors
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate('/reports');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Teacher Dashboard</h1>
        <div>
          <button 
            onClick={handleViewReports}
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

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Select Class:
        </label>
        <select
          value={selectedClass}
          onChange={(e) => handleClassChange(e.target.value)}
          className="select"
        >
          <option value="">-- Select a Class --</option>
          {classes.map((cls, index) => (
            <option key={index} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <div>
          <h2>Mark Attendance for {selectedClass}</h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Date: {new Date().toLocaleDateString()}
          </p>

          {loading && <p>Loading students...</p>}

          {students.length > 0 && (
            <div className="list-container">
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px',
                borderBottom: '1px solid #ccc',
                display: 'grid',
                gridTemplateColumns: '1fr 100px 100px',
                alignItems: 'center',
                fontWeight: 'bold'
              }}>
                <span>Student Name</span>
                <span className="center">Present</span>
                <span className="center">Absent</span>
              </div>

              {students.map((student, index) => (
                <div 
                  key={student.id}
                  className="list-item"
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 100px',
                    alignItems: 'center'
                  }}
                >
                  <span>{student.name}</span>
                  <div className="center">
                    <input
                      type="radio"
                      name={`attendance_${student.id}`}
                      value="present"
                      checked={attendance[student.id] === 'present'}
                      onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                      disabled={attendanceMarked}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </div>
                  <div className="center">
                    <input
                      type="radio"
                      name={`attendance_${student.id}`}
                      value="absent"
                      checked={attendance[student.id] === 'absent'}
                      onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                      disabled={attendanceMarked}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {students.length > 0 && !attendanceMarked && (
            <button
              onClick={handleSubmitAttendance}
              disabled={loading}
              className="button button-primary"
              style={{ marginTop: '20px', width: '100%' }}
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          )}

          {students.length === 0 && selectedClass && !loading && (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No students found for this class.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
