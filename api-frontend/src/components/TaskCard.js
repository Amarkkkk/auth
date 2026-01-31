import React from "react";

const TaskCard = ({task, onEdit, onDelete, onToggle}) => {
    const priorityColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800'
    };

    const formatDate = (date) => {
        if (!date) return 'No due date';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 hove:shadow-lg transition-shadow  ${task.completed ? 'opacity-75' : ''}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <input
                        type = "checkbox"
                        checked = {task.completed}
                        onChange={() => onToggle(task)}
                        className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded curser-pointer"
                    />
                    <div className="flex-1">
                        <h3 className={`text-lg font-semibold text-gray-900 ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="mt-1 text-sm text-gray-600">
                                {task.description}
                            </p>
                        )}
                        <div className="mt-3 flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                                {task.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatDate(task.due_date)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2 ml-4">
                    <button
                    onClick={() => onEdit(task)}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="Edit">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>                            
                        </svg>
                    </button>
                    <button
                    onClick={() => onDelete(task)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;