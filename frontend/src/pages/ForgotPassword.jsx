import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage('Reset link generated successfully!');
      setResetLink(res.data.reset_link);
    } catch (err) {
      setError(err.response?.data?.error || 'Email not found');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your email to reset your password</p>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        {message && (
          <div className="mb-4 bg-green-50 p-3 rounded-lg">
            <p className="text-green-600 text-sm">{message}</p>
            {resetLink && (
              <a href={resetLink} className="text-blue-600 text-sm underline break-all mt-2 block">
                Click here to reset password
              </a>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
            Generate Reset Link
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          <Link to="/login" className="text-blue-600 hover:underline">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}