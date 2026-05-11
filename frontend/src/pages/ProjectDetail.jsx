import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assignee_id: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadData = () => {
    api.get(`/projects/${id}`).then(res => setProject(res.data)).catch(() => navigate('/projects'));
    api.get(`/projects/${id}/tasks`).then(res => setTasks(res.data));
  };

  useEffect(() => { loadData(); }, [id]);

  const myRole = project?.members?.find(m => m.user_id === user.id)?.role;

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, taskForm);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', assignee_id: '' });
      setShowTaskForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status });
    setTasks(tasks.map(t => t.id === taskId ? {...t, status} : t));
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const deleteProject = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: 'member' });
      setMemberEmail('');
      setShowMemberForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  if (!project) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TaskManager</h1>
        <div className="flex gap-4 items-center">
          <Link to="/projects" className="text-gray-600 hover:text-blue-600">← Projects</Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{project.name}</h2>
            <p className="text-gray-500">{project.description}</p>
          </div>
          {myRole === 'admin' && project.owner_id === user.id && (
            <button onClick={deleteProject} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
              Delete Project
            </button>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Team Members</h3>
            {myRole === 'admin' && (
              <button onClick={() => setShowMemberForm(!showMemberForm)} className="text-sm text-blue-600 hover:underline">+ Add Member</button>
            )}
          </div>
          {showMemberForm && (
            <form onSubmit={addMember} className="flex gap-2 mb-3">
              <input type="email" placeholder="Member email" required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
              <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">Add</button>
              <button type="button" onClick={() => setShowMemberForm(false)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm">Cancel</button>
            </form>
          )}
          <div className="flex flex-wrap gap-2">
            {project.members.map(m => (
              <span key={m.user_id} className={`px-3 py-1 rounded-full text-sm font-medium ${m.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {m.name} <span className="opacity-60">({m.role})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Tasks ({filteredTasks.length})</h3>
            <div className="flex gap-2">
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
                <option value="all">All</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {myRole === 'admin' && (
                <button onClick={() => setShowTaskForm(!showTaskForm)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">+ Add Task</button>
              )}
            </div>
          </div>
          {showTaskForm && (
            <form onSubmit={createTask} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
              <input type="text" placeholder="Task title" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              <input type="text" placeholder="Description (optional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              <div className="flex gap-2 flex-wrap">
                <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
                <select value={taskForm.assignee_id} onChange={e => setTaskForm({...taskForm, assignee_id: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none flex-1">
                  <option value="">Unassigned</option>
                  {project.members.map(m => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Create Task</button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Cancel</button>
              </div>
            </form>
          )}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No tasks found.</p>
            ) : filteredTasks.map(t => (
              <div key={t.id} className={`border rounded-lg p-4 ${t.overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{t.title}</p>
                    {t.description && <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.priority === 'high' ? 'bg-red-100 text-red-700' : t.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                      {t.due_date && <span className={`text-xs ${t.overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>Due: {t.due_date}</span>}
                      {t.overdue && <span className="text-xs text-red-500 font-medium">⚠ Overdue</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none">
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {myRole === 'admin' && (
                      <button onClick={() => deleteTask(t.id)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}