import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-6 uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">
        <Home size={14} />
        <span>Home</span>
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = name.length > 20 ? `${name.slice(0, 20)}...` : name;

        return (
          <div key={name} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-zinc-700" />
            {isLast ? (
              <span className="text-indigo-400 font-bold">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-white transition-colors">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
