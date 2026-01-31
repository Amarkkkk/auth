// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Hero Section */}
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-black mb-6 tracking-tight">
            Organize Your Tasks.
            <span className="block text-gray-600 mt-2">
              Achieve More Every Day.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-black mb-12 max-w-2xl mx-auto leading-relaxed">
            A simple and powerful task manager that helps you stay focused,
            track progress, and get things done.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-3 rounded-xl text-lg font-semibold
                  bg-white text-indigo-600
                  hover:bg-indigo-50
                  shadow-lg hover:shadow-xl
                  transition-all duration-300
                  no-underline"                  
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 rounded-xl text-lg font-semibold
                    bg-white text-indigo-600
                    hover:bg-indigo-50
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                    no-underline"
                >
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="px-8 py-3 rounded-xl text-lg font-semibold
                    bg-indigo-900/80 text-white
                    hover:bg-indigo-900
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                    no-underline"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="group bg-white backdrop-blur-lg rounded-2xl p-8 shadow-xl
            hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">
              ✅
            </div>
            <h3 className="text-xl text-black font-semibold mb-3">
              Easy Task Management
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Create, update, and organize your tasks effortlessly in one place.
            </p>
          </div>

          <div className="group bg-white backdrop-blur-lg rounded-2xl p-8 shadow-xl
            hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">
              🎯
            </div>
            <h3 className="text-xl text-black font-semibold mb-3">
              Smart Priorities
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Focus on what matters most by setting task priorities clearly.
            </p>
          </div>

          <div className="group bg-white backdrop-blur-lg rounded-2xl p-8 shadow-xl
            hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-xl text-black font-semibold mb-3">
              Visual Progress Tracking
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Track your productivity with clear insights and progress stats.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
