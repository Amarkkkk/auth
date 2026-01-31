import React, { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, pending
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await taskService.getTasks();
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Wrap filterTasks in useCallback to make it stable
  const filterTasks = useCallback(() => {
    let filtered = [...tasks];

    if (filter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (filter === 'pending') {
      filtered = filtered.filter(task => !task.completed);
    }

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filter, searchTerm]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      const formattedData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.due_date ? new Date(taskData.due_date).toISOString() : null
      };
      await taskService.createTask(formattedData);      
      await fetchTasks();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const formattedData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.due_date ? new Date(taskData.due_date).toISOString() : null
      };
      await taskService.updateTask(editingTask.id, formattedData);
      await fetchTasks();
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await taskService.updateTask(task.id, { completed: !task.completed });
      await fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(task.id);
        await fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="mt-2 text-gray-600">Manage and organize your tasks</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending ({tasks.filter(t => !t.completed).length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'completed'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Completed ({tasks.filter(t => t.completed).length})
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onToggle={handleToggleComplete}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating a new task'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          task={editingTask}
        />
      </div>
    </div>
  ); 
};

export default Tasks;