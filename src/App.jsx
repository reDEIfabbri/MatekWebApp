import { useState, useEffect } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import './App.css';
import { Button } from "@/components/ui/button"

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedInRole, setLoggedInRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      setLoggedInRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setLoggedInRole(null);
  };

  if (loggedInRole === 'ADMIN') {
    return (
      <div className="App">
        <AdminDashboard />
        <Button onClick={handleLogout} className="absolute top-4 right-4">Logout</Button>
      </div>
    );
  }

  if (loggedInRole === 'STUDENT') {
    return (
      <div className="App p-6">
        <h1 className="text-2xl">Student Dashboard (Placeholder)</h1>
        <Button onClick={handleLogout} className="mt-4">Logout</Button>
      </div>
    );
  }

  // If not logged in
  return (
    <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="mb-4">
        <Button 
          variant={isLogin ? "default" : "outline"} 
          onClick={() => setIsLogin(true)}
          className="mr-2"
        >
          Login
        </Button>
        <Button 
          variant={!isLogin ? "default" : "outline"} 
          onClick={() => setIsLogin(false)}
        >
          Register
        </Button>
      </div>
      
      {isLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}

export default App;
