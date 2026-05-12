import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from './pages/auth/login';
import Home from './pages/home';
import About from './pages/about';
import Contact from './pages/contact';
import ProtectedRoutes from './routes/protectedroutes';

function App(){
    return (
        <BrowserRouter>            
            <Routes>
                <Route path='/' element={<Login/>}/>
                <Route path='/home' element={<ProtectedRoutes><Home/></ProtectedRoutes>}/>
                <Route path='/about' element={<ProtectedRoutes><About/></ProtectedRoutes>}/>
                <Route path='/contact' element={<ProtectedRoutes><Contact/></ProtectedRoutes>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;