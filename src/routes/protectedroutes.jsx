/**
 * Protected routes for authenticated users
 * This component checks if the user is authenticated
 */

import { Route, Routes } from "react-router-dom";
import Sidebar from "../components/sidebar/sidebar";
import Home from "../pages/home";
import About from "../pages/about";
import Contact from "../pages/contact";

function ProtectedRoutes({children}) {
    return (
        <div className="flex">
            {/** sidebar  */}
            <Sidebar/>
            {/** main content **/}
            <main className="min-h-screen flex-1 md:ml-64 p-6">
                {children}
            </main>
        </div>
    )
};

export default ProtectedRoutes;