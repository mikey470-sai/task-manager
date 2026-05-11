import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects/').then(res => setProjects(res.data)).catch(() => navigate('/login'));
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    await api.post('/projects/', form);
    setForm({ name: '', description: '' });
    setShowForm(false);
    api.get('/projects/').then(r => setProjects(r.data));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TaskManager</h1>
        <div className="flex gap-4 items-center">
          <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Project</button>
        </div>
        {showForm && (
          <form onSubmit={createProject} className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
            <input type="text" placeholder="Project name" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input type="text" placeholder="Description (optional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        )}
        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No projects yet</p>
            <p className="text-sm mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{p.description || 'No description'}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-400">
                  <span>👥 {p.member_count} members</span>
                  <span>✅ {p.task_count} tasks</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${p.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{p.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}