import { Link } from 'react-router-dom';
import { Terminal, Cpu, Shield, Zap, Globe, Code2, ArrowRight, Github } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const features = [
    {
      icon: <Zap className="text-yellow-400" size={24} />,
      title: "Instant Execution",
      description: "Run your code in seconds with our highly optimized, low-latency execution engine."
    },
    {
      icon: <Shield className="text-green-400" size={24} />,
      title: "Secure Sandboxing",
      description: "Every execution is isolated in a secure Docker container with strict resource limits."
    },
    {
      icon: <Globe className="text-blue-400" size={24} />,
      title: "Multi-Language",
      description: "Support for Python, Node.js, C++, Java, Ruby, and Go out of the box."
    },
    {
      icon: <Cpu className="text-purple-400" size={24} />,
      title: "Scalable Infrastructure",
      description: "Powered by Celery and Redis to handle thousands of concurrent execution jobs."
    },
    {
      icon: <Code2 className="text-indigo-400" size={24} />,
      title: "Modern Editor",
      description: "Feature-rich Monaco Editor with syntax highlighting and auto-completion."
    },
    {
      icon: <Terminal className="text-zinc-400" size={24} />,
      title: "Real-time Output",
      description: "See stdout, stderr, and execution metrics in real-time as your code runs."
    }
  ];

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
              Now supporting 6+ Programming Languages
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Run Code Securely <br />
              <span className="text-white">In the Cloud.</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              CodeRunner is the ultimate SaaS platform for secure, isolated, and scalable code execution. Build, test, and run snippets instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 group"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-zinc-950 relative border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Enterprise-grade Isolation.</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Everything you need to build a code execution engine for your apps, education platform, or competitive programming site.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl border border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 transition-all group"
              >
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Terminal size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">CodeRunner <span className="text-indigo-500">SaaS</span></span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-zinc-500 font-medium">
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Reference</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="p-2 text-zinc-500 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
        <div className="mt-8 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 CodeRunner. Built for production.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
