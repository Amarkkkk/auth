import { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLink from './sidebarlink';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>

            {/** mobile menu **/}
            <button 
                className='fixed top-4 left-4 z-20 p-2 bg-blue-500 text-white rounded-md md:hidden'
                onClick={() => setIsOpen(!isOpen)}>
                ☰
            </button>

            {/** sidebar **/}
            <aside className={`
                fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-20
                transform transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0
                `}
            >
                {/** logo **/}
                <div className='h-16 flex items-center justify-center font-bold text-xl border-b'>
                    Taskronos
                </div>
                {/** nav links **/}
                <nav className='flex flex-col p-4 space-y-4'>
                    <SidebarLink to="/home" label="Home" onClick={() => setIsOpen(false)}/>
                    <SidebarLink to="/about" label="About" onClick={() => setIsOpen(false)}/>
                    <SidebarLink to="/contact" label="Contact" onClick={() => setIsOpen(false)}/>
                </nav>
            </aside>
            {/** background overlay for mobile menu **/}
            {isOpen && (
                <div  
                    className="fixed inset-0 bg-black/10 z-10 md:hidden"
                    onClick={() => setIsOpen(false)}
                />                
            )}

        </>
    );
};

export default Sidebar;