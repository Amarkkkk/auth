const TextField = ({ 
    label, 
    type  = "text", 
    name,
    value, 
    placeholder,
    disabled = false,
    onChange
}) => {
    return (
        <div className="flex flex-col space-y-1 w-full">
            {/** label  */}
            {label && (
                <label className="text-sm text-gray-600 font-medium">
                    {label}
                </label>
            )}

            {/** input  */}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className="
                w-full p-2 border border-gray-300 rounded
                focus:outline-none focus:ring-2 focus:ring-blue-400
                transition"
            />            
        </div>
    ); 
};

export default TextField;