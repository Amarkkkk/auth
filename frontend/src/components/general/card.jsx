const Card = ({
    title,
    subtitle, 
    onClick,
    children, 
    classname="", 
    contentClassname=""}) => {
    return (
        <div 
        onClick={onClick}
        className={`bg-white border rounded-lg shadow p-4 
            ${onClick ? "cursor-pointer hover:bg-gray-50 transition" : ""}
            ${classname}`}>
            {/** title  */}
            {title && (
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                    {title}
                </h2>
            )}
            {subtitle && (
                <p className="text-sm text-gray-500 mb-4">
                    {subtitle}
                </p>
            )}
            {/** content  */}
            <div className={`text-gray-600 ${contentClassname}`}>
                {children}
            </div>
        </div>
    );
};
export default Card;