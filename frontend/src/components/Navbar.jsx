import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './UI';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary animate-pulse-slow" />
            <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              STEGOVAULT
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/90 border-b border-white/10 px-4 py-4 space-y-4">
          <Link to="/about" className="block text-gray-400 hover:text-white">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-gray-400 hover:text-white">Dashboard</Link>
              <button onClick={handleLogout} className="w-full text-left text-gray-400 hover:text-red-500">Logout</button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">Login</Button>
              </Link>
              <Link to="/register" className="block">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
