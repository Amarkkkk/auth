import Card from "../../components/general/card";
import TextField from "../../components/general/textfield";
import Button from "../../components/general/buttons";
import Media from "../../components/assets/media";
import loginAnimation from "../../assets/lottie/signin.json";
import image from "../../assets/hero.png";

import { signup } from "../../api/auth";
import { useState } from "react";
const Signup = () => {
    /// variables and states
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",        
        bio: "",
        phone: "",
    });

    /// handlers
    const handleChange = (data) => {
        setForm({...form, [data.target.name]: data.target.value});
    };

    /// submit handler
    const handleSubmit = async (data) => {
        /// stops browser from refreshing and sending normal html request
        data.preventDefault();
        console.log("FORM DATA:", form);
        try {
            const response = await signup(form);
            /// show success response
            console.log(response);
            /// save token to local storage
            localStorage.setItem("token", response.data.token);

        } 
        catch (err) {
            /// show error response
            console.error(
                err.response?.data?.message || "Signup failed"
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
                                Sign Up
                            </h2>
                            <p className="text-sm text-gray-500">
                                Enter your details to create an account
                            </p>
                        </div>

                        {/** form fields */}
                        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
                            <TextField onChange={handleChange} name="name" value={form.name} label="Name" type="text" placeholder="Enter your name" />
                            <TextField onChange={handleChange} name="email" value={form.email} label="Email" type="email" placeholder="Enter your email" />
                            <TextField onChange={handleChange} name="bio" value={form.bio} label="Bio" type="text" placeholder="Enter your bio" />
                            <TextField onChange={handleChange} name="phone" value={form.phone} label="Phone" type="text" placeholder="Enter your phone number" />
                            <TextField onChange={handleChange} name="password" value={form.password} label="Password" type="password" placeholder="Enter your password" />                            
                        
                        {/** remember me and forgot password */}
                        <div className="flex flex-row items-center justify-between mt-4">
                            <div>    
                                <input type="checkbox" id="remember" className="mr-2" />
                                <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>                            
                            </div>                            
                            <Button variant="text">Forgot Password</Button>
                        </div>

                        {/** login button and sign up link */}
                        <Button type="submit" to="/dashboard" variant="primary">Sign Up</Button>
                        <div className="flex items-center justify-center">
                            <span className="text-sm text-gray-600">Already have an account?</span>
                            <Button type="submit" variant="text" to="/">Login</Button>
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
export default Signup;