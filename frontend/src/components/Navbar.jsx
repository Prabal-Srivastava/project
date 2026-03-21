import { Link, useNavigate } from 'react-router-dom';
import { Terminal, LogOut, LayoutDashboard, Code2 } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <Terminal size={20} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">CodeRunner <span className="text-indigo-500">SaaS</span></span>
      </Link>

      <div className="flex items-center gap-6">
        {token ? (
          <>
            <Link to="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link to="/editor" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
              <Code2 size={18} />
              <span className="hidden sm:inline">Editor</span>
            </Link>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/pricing" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
              Pricing
            </Link>
            <Link to="/login" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
