import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Folder, Clock, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/history/');
        const sortedProjects = response.data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setProjects(sortedProjects);
      } catch (err) {
        console.error('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex-1 space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Workspaces</h1>
          <p className="text-zinc-500 text-sm font-medium">Manage and create your isolated code projects</p>
        </div>
        <Link
          to="/editor"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Playground</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-zinc-900/40 rounded-3xl animate-pulse border border-zinc-800/50"></div>
            ))
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/editor/${project.id}`}
                  className="group relative h-48 bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all hover:bg-zinc-900/60 overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <Folder size={20} className="text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white truncate tracking-tight">{project.name}</h3>
                      <p className="text-sm text-zinc-500 line-clamp-2 font-medium leading-relaxed">{project.description || 'No description provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                      <span>Open Project</span>
                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-[2.5rem] bg-zinc-900/20">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                <Folder size={32} className="text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No projects yet</h3>
              <p className="text-zinc-500 mb-8 font-medium">Create your first workspace to start coding</p>
              <Link
                to="/editor"
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-2xl font-bold transition-all border border-zinc-700 shadow-xl active:scale-95"
              >
                Create Project
              </Link>
            </div>
          )}
        </div>
      </div>
  );
};

export default Dashboard;
