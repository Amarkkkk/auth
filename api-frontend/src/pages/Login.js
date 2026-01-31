// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// lottie
import Lottie from 'lottie-react';
import LoginAnimation from '../assets/lottie/Login.json';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-lg overflow-hidden max-w-7xl w-full">
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className='flex flex-col items-center justify-center space-y-2'>
            <h2 className="text-3xl md:text-4xl font-medium text-center tracking-widest font-serif uppercase mb-0">
              Welcome Back!
            </h2>
            <p className="text-sm md:text-l font-medium text-center font-serif text-gray-500 tracking-widest">
              Let's get you signed in securely.
            </p>            
          </div>            

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div className="flex justify-center">
              {/* Email Field */}
              <div className="space-y-4 w-full max-w-md">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
                  Email address
                </label>                
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 box-border"
                  placeholder="Enter your email address"
                  style={{ margin: 0 }}
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 tracking-wide">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 tracking-wide no-underline ">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 tracking-wide rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 box-border"
                  placeholder="Enter your password"
                  style={{ margin: 0 }}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors box-border tracking-wide"
                  style={{ margin: 0 }}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>

            
          </form>
          <p className="mt-2 text-center text-sm text-gray-600 tracking-wide">
              Don't have account?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 tracking-wide no-underline">
                Sign up
              </Link>
            </p>
        </div>
      <div className='md:flex items-center justify-center bg-indigo-200'>
        <Lottie 
         animationData = {LoginAnimation}
         loop = {true}
         
        />
      </div>      
      </div>
    </div>
  );
};

export default Login;