// File: src/pages/ReportsPage.js
// Process: Displays student reports, with bonus: class report section (react-datepicker for date picker).
// Flow 1: Fetches students → Select student → GET /api/student-report/{id} → Display report.
// Flow 2: Select date → Set month as YYYY-MM → GET /api/class-report.


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ReportsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentReport, setStudentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // Class report states
  const [classes, setClasses] = useState([]);
  const [selectedClassReport, setSelectedClassReport] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date()); // Initialize to current month
  const [classReport, setClassReport] = useState(null);
  const [loadingClassReport, setLoadingClassReport] = useState(false);

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    if (!userData || !['admin', 'teacher'].includes(userData.role) || !token) {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    fetchStudents();
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

  const fetchStudents = async () => {
    setInitialLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/students`, getAuthHeaders());
      setStudents(response.data);
      const uniqueClasses = [...new Set(response.data.map(s => s.class_grade))];
      setClasses(uniqueClasses);
      if (uniqueClasses.length > 0) {
        setSelectedClassReport(uniqueClasses[0]); // Auto-select first class
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleStudentReportFetch = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `${API_URL}/student-report/${selectedStudent}`,
        getAuthHeaders()
      );
      setStudentReport(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch student report');
      setStudentReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClassReportFetch = async () => {
    if (!selectedClassReport || !selectedDate) {
      setError('Please select a class and month');
      return;
    }

    const month = selectedDate.toISOString().slice(0, 7); // YYYY-MM
    setLoadingClassReport(true);
    setError('');
    try {
      const response = await axios.get(
        `${API_URL}/class-report/${encodeURIComponent(selectedClassReport)}/${month}`,
        getAuthHeaders()
      );
      setClassReport(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch class report';
      setError(`Class Report Error: ${errorMsg}`);
      setClassReport(null);
    } finally {
      setLoadingClassReport(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const goBack = () => {
    setError('');
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/teacher');
    }
  };

  const parseSummary = (summaryStr) => {
    if (!summaryStr) return { total_days: 0, present_days: 0, absent_days: 0, attendance_percentage: 0 };
    const parts = summaryStr.split(', ');
    const obj = {};
    parts.forEach(p => {
      const [key, val] = p.split(': ');
      obj[key.toLowerCase().replace(' ', '_')] = parseInt(val) || 0;
    });
    obj.present_days = obj.present || 0;
    obj.absent_days = obj.absent || 0;
    obj.attendance_percentage = obj.total_days > 0 ? Math.round((obj.present_days / obj.total_days) * 100) : 0;
    return obj;
  };

  if (initialLoading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Reports</h1>
        <div>
          <button 
            onClick={goBack}
            className="button button-secondary"
            style={{ marginRight: '10px' }}
          >
            Back to Dashboard
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

      <div className="report-container" style={{ marginBottom: '30px' }}>
        <h2>Individual Student Report</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Select Student:
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="select"
            >
              <option value="">-- Select a Student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.class_grade})
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleStudentReportFetch}
            disabled={!selectedStudent || loading}
            className="button button-primary"
          >
            {loading ? 'Loading...' : 'Get Report'}
          </button>
        </div>

        {studentReport && (
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h3>
              Report for {students.find(s => s.id === selectedStudent)?.name} - 
              {students.find(s => s.id === selectedStudent)?.class_grade}
            </h3>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Summary</h4>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="center">
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                    {parseSummary(studentReport.summary).total_days}
                  </div>
                  <div>Total Days</div>
                </div>
                <div className="center">
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                    {parseSummary(studentReport.summary).present_days}
                  </div>
                  <div>Present</div>
                </div>
                <div className="center">
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                    {parseSummary(studentReport.summary).absent_days}
                  </div>
                  <div>Absent</div>
                </div>
              </div>
              <div className="center" style={{ marginTop: '15px', fontSize: '18px' }}>
                <strong>Attendance Rate: {parseSummary(studentReport.summary).attendance_percentage}%</strong>
              </div>
            </div>

            <h4>Detailed Attendance</h4>
            <div className="list-container">
              {studentReport.attendances.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No attendance records found.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th className="center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentReport.attendances.map((record, index) => (
                      <tr key={index}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td className="center" style={{ 
                          color: record.status === 'present' ? '#28a745' : '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          {record.status === 'present' ? '✓ Present' : '✗ Absent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="report-container">
        <h2>Class Report</h2>
        
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr auto', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Select Class:
            </label>
            <select
              value={selectedClassReport}
              onChange={(e) => setSelectedClassReport(e.target.value)}
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
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Select Month:
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              placeholderText="-- Select Month --"
              className="input"
            />
          </div>
          
          <button
            onClick={handleClassReportFetch}
            disabled={!selectedClassReport || !selectedDate || loadingClassReport}
            className="button button-success"
          >
            {loadingClassReport ? 'Loading...' : 'Get Report'}
          </button>
        </div>

        {classReport && (
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h3>Class Report for {selectedClassReport} - {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</h3>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Class Summary</h4>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="center">
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                    {classReport.summary.total_students}
                  </div>
                  <div>Total Students</div>
                </div>
                <div className="center">
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6c757d' }}>
                    {classReport.summary.total_days}
                  </div>
                  <div>School Days</div>
                </div>
                <div className="center">
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                    {classReport.summary.average_attendance}%
                  </div>
                  <div>Avg Attendance</div>
                </div>
                <div className="center">
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fd7e14' }}>
                    {classReport.summary.total_absences}
                  </div>
                  <div>Total Absences</div>
                </div>
              </div>
            </div>

            <h4>Student-wise Attendance</h4>
            <div className="list-container">
              {classReport.students.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No attendance data found for this class and month.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th className="center">Present Days</th>
                      <th className="center">Absent Days</th>
                      <th className="center">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classReport.students.map((student, index) => (
                      <tr key={index}>
                        <td>{student.name}</td>
                        <td className="center" style={{ color: '#28a745' }}>
                          {student.present_days}
                        </td>
                        <td className="center" style={{ color: '#dc3545' }}>
                          {student.absent_days}
                        </td>
                        <td className="center" style={{ fontWeight: 'bold' }}>
                          {student.attendance_percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
