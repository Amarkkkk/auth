import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from './pages/auth/signin';
import ProtectedRoutes from './routes/protectedroutes';
import Signup from './pages/auth/signup';
import Dashboard from './pages/home/dashboard';
import Analytics from './pages/home/analytics';
import Task from './pages/home/task';

function App(){
    return (
        <BrowserRouter>            
            <Routes>
                <Route path='/' element={<Login/>}/>
                <Route path='/signup' element={<Signup/>}/>            
                <Route path='/dashboard' element={<ProtectedRoutes><Dashboard/></ProtectedRoutes>}/>
                <Route path='/analytics' element={<ProtectedRoutes><Analytics/></ProtectedRoutes>}/>
                <Route path='/task' element={<ProtectedRoutes><Task/></ProtectedRoutes>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;