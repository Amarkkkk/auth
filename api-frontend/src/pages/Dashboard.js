// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks({ limit: 5 })
      ]);

      setStats(statsRes.data.stats);
      setRecentTasks(tasksRes.data.tasks.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion percentage
  const completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  useEffect(() => {
  const timer = setTimeout(() => {
    setAnimatedProgress(completionPercentage);
  }, 500); // slight delay = smoother feel

  return () => clearTimeout(timer);
}, [completionPercentage]);


  // Data for Pie Chart
  const chartData = stats.total > 0 ? [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' }
  ].filter(item => item.value > 0) : [];

  // Custom label for pie chart
  const renderCustomLabel = (entry) => {
    return `${entry.value}`;
  };
  // animation


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Main Grid - 4 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Column 1: Total Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Column 2: Completed */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Column 3: Pending */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Column 4: Task Distribution (spans 2 rows) */}
        <div className="lg:row-span-2 bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Distribution</h3>
          
          {stats.total > 0 ? (
            <div className="flex flex-col flex-1 justify-between">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={65}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend/Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{stats.completed}</span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">{stats.pending}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Total</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{stats.total}</span>
                </div>
              </div>

              {/* Progress Ring - Fills bottom space */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#6366f1"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="226"
                          strokeDashoffset={226 - (animatedProgress / 100) * 226}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">
                          {completionPercentage}%
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Overall</p>
                      <p className="text-xs text-gray-500">Completion</p>
                    </div>
                  </div>
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <svg className="h-16 w-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-center text-sm">No tasks yet</p>
              <Link to="/tasks" className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Create task
              </Link>
            </div>
          )}
        </div>

        {/* Overall Progress - Spans 3 columns (row 2) */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Overall Progress</h3>
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Completion Rate
                </span>
                <span className="text-3xl font-bold text-indigo-600">
                  {completionPercentage}%
                </span>
              </div>

              <div className="w-full h-5 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${animatedProgress}%`,
                  background: 'linear-gradient(to right, #22c55e, #16a34a)'
                }}
              />
            </div>
          </div>
          
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6 text-center border border-green-100">
                <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-600 mt-2 font-medium">Tasks Completed</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6 text-center border border-yellow-100">
                <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-600 mt-2 font-medium">Tasks Pending</p>
              </div>
            </div>

            {/* Progress Text */}
            {stats.total > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {completionPercentage === 100 
                      ? '🎉 All tasks completed!' 
                      : '💪 Keep up the great work!'}
                  </span>
                  <span className="text-sm font-semibold text-indigo-600">
                    {stats.completed} of {stats.total} completed
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          <Link
            to="/tasks"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            View all
            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 mt-4">No tasks yet. Create your first task!</p>
              <Link
                to="/tasks"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Create Task →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">
              {stats.total > 0 
                ? `${completionPercentage}% Complete`
                : 'Get Started'}
            </h3>
            <p className="text-indigo-100 mt-1">
              {stats.pending > 0 
                ? `Keep going! ${stats.pending} task${stats.pending > 1 ? 's' : ''} remaining`
                : stats.total > 0 
                  ? 'All caught up! 🎉' 
                  : 'Create your first task to get started'}
            </p>
          </div>
          <Link
            to="/tasks"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            {stats.pending > 0 ? 'View Tasks' : 'Create Task'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;