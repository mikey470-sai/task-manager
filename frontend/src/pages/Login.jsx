import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Login to your TaskManager account</p>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
            Login
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}