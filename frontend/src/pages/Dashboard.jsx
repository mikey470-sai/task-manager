import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    api.get('/dashboard')
      .then(res => setStats(res.data))
      .catch(() => { localStorage.clear(); navigate('/login'); });
  }, []);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TaskManager</h1>
        <div className="flex gap-4 items-center">
          <Link to="/projects" className="text-gray-600 hover:text-blue-600">Projects</Link>
          <span className="text-gray-500 text-sm">{user.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
        {!stats ? <p className="text-gray-400">Loading...</p> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-gray-500 text-sm mt-1">Total Tasks</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow text-center">
                <p className="text-3xl font-bold text-green-600">{stats.done}</p>
                <p className="text-gray-500 text-sm mt-1">Done</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow text-center">
                <p className="text-3xl font-bold text-yellow-500">{stats.in_progress}</p>
                <p className="text-gray-500 text-sm mt-1">In Progress</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow text-center">
                <p className="text-3xl font-bold text-red-500">{stats.overdue}</p>
                <p className="text-gray-500 text-sm mt-1">Overdue</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">My Assigned Tasks</h3>
              {stats.my_tasks.length === 0 ? (
                <p className="text-gray-400">No tasks assigned to you yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Priority</th>
                      <th className="pb-2">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.my_tasks.map(t => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{t.title}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'done' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.priority === 'high' ? 'bg-red-100 text-red-700' : t.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                        </td>
                        <td className="py-2 text-gray-500">{t.due_date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}