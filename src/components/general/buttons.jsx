import {useNavigate} from 'react-router-dom';

const Button =({
    children, 
    onclick, 
    type="button", 
    variant = "primary",
    to
}) => {
    const navigate = useNavigate();

    // handle navigation if 'to' prop is provided
    const handleClick = (e) => {
        if (to) {
            navigate(to);
        }
        if (onclick) {
            onclick(e);
        }
    };

    /// base design of buttons
    const base = 
        "px-4 py-2 rounded-md font-medium transition flex items-center justify-center gap-2";
    /// different styles for different button variants
    const styles = {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-600",
        text: "bg-transparent text-sm text-blue-500 hover:underline",
        google: "bg-white border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 w-full mt-4",
        facebook:"bg-white border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 w-full mt-4"
    };
    const GoogleIcon = ()=> (
        <svg width="24" height="24" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.3 35.7 26.8 37 24 37c-5.2 0-9.6-3.5-11.2-8.2l-6.7 5.1C9.9 39.8 16.5 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.4-6 6.9l6.3 5.2C38.6 37.5 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z"/>
        </svg>
    );

    const FacebookIcon = ()=> (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path fill="#1976D2" d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12H17l-.5 3h-2.5v7A10 10 0 0 0 22 12z"/>
        </svg>
    );

    return (
        <button
            type={type}
            onClick={handleClick}
            className={`${base} ${styles[variant]}`}
        >   
            {variant === "google" && <GoogleIcon />}
            {variant === "facebook" && <FacebookIcon />}
            {children}
        </button>
    );
};

export default Button;