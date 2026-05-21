import Card from "../../components/general/card";
import TextField from "../../components/general/textfield";
import Button from "../../components/general/buttons";
import Media from "../../components/assets/media";
import loginAnimation from "../../assets/lottie/signin.json";
import image from "../../assets/hero.png";

import { login } from "../../api/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    /// state for form fields
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });

    /// handle change in form fields
    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    // handle form submission
    const handleSubmit = async (e) => {
        // prevent page to reload
        e.preventDefault();
        try {
            const response = await login(credentials);
            console.log("Login successful:", response);   
            // store token in local storage
            localStorage.setItem("token", response.data.token);
            // redirect to dashboard    
            navigate("/dashboard");
        } catch (err) {
            console.error(
                err.response?.data?.message || "Login failed"
            );
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen p-4">       
            <Card className="w-full max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">         
                    {/** left side  */}
                    <div className="flex flex-col w-full">

                        {/** header  */}
                        <div className="flex flex-col justify-center items-center mb-6">
                            <h2 className="text-lg font-semibold mb-2 text-gray-800">
                                Sign In
                            </h2>
                            <p className="text-sm text-gray-500">
                                Enter your credentials to access your account
                            </p>
                        </div>
                        <form className="flex flex-col w-full" onSubmit={handleSubmit}>                            
                            {/** form fields */}
                            <TextField onChange={handleChange} value={credentials.email} name="email" label="Email" type="email" placeholder="Enter your email" />
                            <TextField onChange={handleChange} value={credentials.password} name="password" label="Password" type="password" placeholder="Enter your password" />

                            {/** remember me and forgot password */}
                            <div className="flex flex-row items-center justify-between mt-4">
                                <div>    
                                    <input type="checkbox" id="remember" className="mr-2" />
                                    <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>                            
                                </div>                            
                                <Button variant="text">Forgot Password</Button>
                            </div>

                            {/** login button and sign up link */}
                            <Button type="submit" variant="primary">Login</Button>
                            <div className="flex items-center justify-center">
                                <span className="text-sm text-gray-600">Don't have an account?</span>
                                <Button variant="text" to="/signup">Sign Up</Button>
                            </div>
                        </form>

                        {/** additional content or social login options can go here */}
                        <div className="relative mt-4">
                            <hr className="border-gray-400"/>
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                            bg-white px-2 text-sm text-gray-500">
                            or with</span>
                        </div>
                        <div className="flex flex-col space-x-4 justify-center md:flex-row">
                            <Button variant="google">
                                <span className="mr-2">Continue with Google</span>
                            </Button>
                            <Button variant="facebook">
                                <span className="mr-2">Continue with Facebook</span>
                            </Button>
                        </div>                        
                    </div>



                    {/** right side  */}
                    <div className="flex items-center justify-center">
                        <Media 
                        type="lottie"                         
                        animationData={loginAnimation}
                        className="w-full h-full"
                        />                                                
                    </div>
                </div>
            </Card>
        </div>
    );
};
export default Login;