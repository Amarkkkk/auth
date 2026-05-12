import {Link,useLocation} from 'react-router-dom';

{/** sidebar link component **/}

const SidebarLink = ({to, label, onClick}) => {
    const location = useLocation();
    {/** check if the current path matches the link's path for active styling **/}
    const isActive = location.pathname === to;
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`
            p-2 rounded transition 
            ${isActive 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-blue-100'}`}
        >
            {label}
        </Link>
    );
};

export default SidebarLink;