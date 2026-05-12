import Card from "../../components/general/card";

const Login = () => {
    return (
        <div className="min-h-screen p-6 flex items-center justify-center">       
            <Card title = "Login">
                <div className="grid grid-cols-1 grid-rows-1 md:grid-cols-2 grid-rows-2 gap-4">         
                    {/** left side  */}
                    <div className="p-4 bg-blue-100 rounded row-span-2 items-center justify-center flex">
                        Left Side Content
                    </div>
                    {/** right side  */}
                    <div className="p-4 bg-green-100 rounded">
                        Right Side Content
                    </div>
                </div>
            </Card>
        </div>
    );
};
export default Login;