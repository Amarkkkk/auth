import React from "react";
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const NavBar = () => {
    const {user, logout, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to ="/" className="flex items-center">
                            <span className="text-2x1 font-bold text-indigo-600">Task Manager</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                            <Link
                            to = "/dashboard"
                            className="text-grey-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                Dashboard
                            </Link>

                            <Link
                            to = "/tasks"
                            className="text-grey-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                Tasks
                            </Link>

                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-grey-700">
                                    Welcome, <span className="font-semibold">{user?.name}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                                    Logout
                                </button>
                            </div>
                            </>
                        ):(
                            <>
                            <Link
                            to = "/login"
                            className="text-grey-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                Login
                            </Link>

                            <Link
                            to = "/register"
                            className="text-grey-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                Register
                            </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;