// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// lottie
import Lottie from 'lottie-react';
import RegisterAnimation from '../assets/lottie/Register.json';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-lg overflow-hidden max-w-7xl w-full">
         
          <div className='md:flex flex-col justify-center bg-indigo-200'>
              <Lottie 
                animationData={RegisterAnimation}
                loop = {true}
              />
          </div> 

          <div className='flex flex-col justify-center p-8 sm:p-12'>

            <div className='flex flex-col items-center justify-center space-y-2'>
            <h2 className="text-3xl md:text-4xl font-medium text-center tracking-widest font-serif uppercase mb-0">
              Get Started Now!
            </h2>
            <p className="text-sm md:text-l font-medium text-center font-serif text-gray-500 tracking-widest">
              Enter your credentials to access your account.
            </p>            
            </div> 

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}
              <div className='flex justify-center'>
                
              <div className="space-y-4 w-full max-w-md">            
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 box-border"
                    placeholder="Full Name"
                  />
                </div>
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
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 box-border"
                    placeholder="Password (min. 8 characters)"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 placeholder:text-gray-400 box-border"
                    placeholder="Confirm Password"
                  />
                </div>
              

              <div className='pt-2'>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors box-border tracking-wide"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
                
              </div>
                </div>
              </div>
            </form>
            <p className="mt-2 text-center text-sm text-gray-600">
                Have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 no-underline">
                  Sign In
                </Link>
              </p>
        </div>
      </div>
    </div>
  );
};

export default Register;