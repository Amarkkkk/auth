const Card = ({title, children, className=""}) => {
    return (
        <div className={`bg-white border rounded-lg shadow p-4 ${className}`}>
            {/** title  */}
            {title && (
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                    {title}
                </h2>
            )}
            {/** content  */}
            <div className="text-gray-600">
                {children}
            </div>
        </div>
    );
};
export default Card;