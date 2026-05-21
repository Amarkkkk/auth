const Card = ({title,subtitle, children, classname="", contentClassname=""}) => {
    return (
        <div className={`bg-white border rounded-lg shadow p-4 ${classname}`}>
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