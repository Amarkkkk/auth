// src/components/TaskModal.js
import React, { useState, useEffect } from 'react';

const TaskModal = ({ isOpen, onClose, onSubmit, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  const [notifier, setNotifier] = useState({ message: '', type: '' }); // notifier state

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      });
    }
    setNotifier({ message: '', type: '' }); // reset notifier on open
  }, [task, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // simple validation example
    if (!formData.title.trim()) {
      setNotifier({ message: 'Title is required', type: 'error' });
      return;
    }
    onSubmit(formData)
      .then(() => setNotifier({ message: `Task ${task ? 'updated' : 'created'} successfully!`, type: 'success' }))
      .catch((err) => setNotifier({ message: err.message || 'Something went wrong', type: 'error' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      {/* Modal container */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 animate-fade-in">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

  {/* Notifier */}
  {notifier.message && (
    <div className={`px-4 py-2 rounded-md text-sm ${notifier.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {notifier.message}
    </div>
  )}

  {/* Title */}
  <div className="max-w-md w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Title <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      name="title"
      value={formData.title}
      onChange={handleChange}
      placeholder="Enter task title"
      className="w-full rounded-lg border border-gray-300 px-3 py-2
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
    />
  </div>

  {/* Description */}
  <div className="max-w-md w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Description
    </label>
    <textarea
      name="description"
      value={formData.description}
      onChange={handleChange}
      rows="3"
      placeholder="Optional task description"
      className="w-full rounded-lg border border-gray-300 px-3 py-2
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
    />
  </div>

  {/* Priority + Due Date */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md w-full">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 px-3 py-2
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
      <input
        type="date"
        name="due_date"
        value={formData.due_date}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 px-3 py-2
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
  </div>

  {/* Actions */}
  <div className="flex justify-end gap-3 pt-4 border-t max-w-md w-full">
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition"
    >
      {task ? 'Update Task' : 'Create Task'}
    </button>
  </div>
</form>

      </div>
    </div>
  );
};

export default TaskModal;
