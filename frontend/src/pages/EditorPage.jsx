import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { Play, Save, Settings, ChevronDown, Terminal, Cpu, Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const defaultCode = {
    javascript: '// Write your code here\nconsole.log("Hello, CodeRunner!");',
    python: '# Write your code here\nprint("Hello, CodeRunner!")',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeRunner!" << std::endl;\n    return 0;\n}',
    java: 'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeRunner!");\n    }\n}',
    ruby: '# Write your code here\nputs "Hello, CodeRunner!"',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, CodeRunner!")\n}'
  };

  useEffect(() => {
    if (projectId) {
      api.get(`/history/${projectId}`).then(res => {
        if (res.data.files && res.data.files.length > 0) {
          setCode(res.data.files[0].content);
          setLanguage(res.data.files[0].language);
        } else {
          setCode(defaultCode[language]);
        }
      });
    } else {
      setCode(defaultCode[language]);
    }
  }, [projectId]);

  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, running, completed, failed
  const [metrics, setMetrics] = useState({ time: null, memory: null });
  const [jobId, setJobId] = useState(null);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  
  const pollInterval = useRef(null);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    
    // Check if the current code is empty or one of the default snippets
    const isCurrentCodeDefault = Object.values(defaultCode).some(
      snippet => code.trim() === snippet.trim()
    );
    const isInitialDefault = code.trim() === '// Write your code here';
    
    if (isCurrentCodeDefault || isInitialDefault || code.trim() === '') {
      setCode(defaultCode[newLang]);
    }
    
    // Reset output and status when changing language to give a fresh environment
    setOutput('');
    setError('');
    setStatus('idle');
  };

  const runCode = async () => {
    setLoading(true);
    setStatus('running');
    setOutput('');
    setError('');
    setMetrics({ time: null, memory: null });

    try {
      const response = await api.post('/submit', { 
        code, 
        language,
        stdin: showStdin ? stdin : '' 
      });
      setJobId(response.data.job_id);
      startPolling(response.data.job_id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start execution');
      setLoading(false);
      setStatus('failed');
    }
  };

  const startPolling = (id) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    
    pollInterval.current = setInterval(async () => {
      try {
        const response = await api.get(`/job/${id}`);
        console.log("Polling result:", response.data); // Debug log
        
        if (['completed', 'failed', 'timeout'].includes(response.data.status)) {
          clearInterval(pollInterval.current);
          setOutput(response.data.stdout || '');
          setError(response.data.stderr || '');
          setStatus(response.data.status);
          setMetrics({
            time: response.data.execution_time,
            memory: '128MB'
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(pollInterval.current);
        setError('Failed to fetch results');
        setLoading(false);
        setStatus('failed');
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col space-y-6 relative h-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all shadow-lg active:scale-95"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none mb-1">
              {projectId ? `Project: ${projectId.slice(0, 8)}...` : 'New Playground'}
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Secure Cloud Sandbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${
              status === 'completed' ? 'bg-green-500' : 
              status === 'failed' ? 'bg-red-500' : 
              status === 'running' ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-700'
            }`} />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{status}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 min-h-[500px]">
        {/* Editor Toolbar */}
        <div className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 bg-zinc-900/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select 
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none bg-zinc-800 text-zinc-200 pl-4 pr-10 py-2 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="ruby">Ruby</option>
                <option value="go">Go</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
            <div className="h-6 w-[1px] bg-zinc-800" />
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-zinc-800">
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowStdin(!showStdin)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all text-xs
                ${showStdin 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/50 shadow-indigo-500/10' 
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'}
              `}
            >
              <Terminal size={18} />
              <span>User Input</span>
            </button>
            <div className="h-6 w-[1px] bg-zinc-800" />
            <button 
              onClick={runCode}
              disabled={loading}
              className={`
                flex items-center gap-2 px-8 py-2.5 rounded-2xl font-bold transition-all shadow-xl text-xs
                ${loading 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95 group'}
              `}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="group-hover:scale-110 transition-transform" />}
              <span>{loading ? 'Executing...' : 'Run Snippet'}</span>
            </button>
            <div className="h-6 w-[1px] bg-zinc-800" />
            <button className="p-2.5 text-zinc-400 hover:text-white transition-colors bg-zinc-800 rounded-xl border border-zinc-700 active:scale-95 shadow-lg">
              <Settings size={20} />
            </button>
          </div>
        </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Monaco Editor Container */}
        <div className="flex-1 border-r border-zinc-800 bg-[#1e1e1e] flex flex-col">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'cpp' ? 'cpp' : language} // Ensure Monaco language ID
              value={code}
              key={language} // Force re-render of editor component when language changes for a fresh environment
              onChange={(val) => setCode(val)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
                fontFamily: 'Fira Code, monospace',
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>

          <AnimatePresence>
            {showStdin && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 192 }}
                exit={{ height: 0 }}
                className="border-t border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden"
              >
                <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/30">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Terminal size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Standard Input (stdin)</span>
                  </div>
                  <button 
                    onClick={() => setShowStdin(false)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input to be passed to your program..."
                  className="flex-1 bg-zinc-950 text-zinc-300 p-4 font-mono text-sm focus:outline-none resize-none placeholder:text-zinc-700 leading-relaxed"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Output Panel */}
        <div className="w-1/3 flex flex-col bg-zinc-950">
          <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/30">
            <div className="flex items-center gap-2 text-zinc-400">
              <Terminal size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Console Output</span>
            </div>
            {status !== 'idle' && (
              <div className="flex items-center gap-3">
                {metrics.time && (
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase">
                    <Clock size={12} />
                    <span>{metrics.time}s</span>
                  </div>
                )}
                {metrics.memory && (
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase">
                    <Cpu size={12} />
                    <span>{metrics.memory}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 p-5 font-mono text-sm overflow-y-auto selection:bg-indigo-500/30">
            {loading && status === 'running' && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Executing in sandbox...</p>
              </div>
            )}
            
            {status === 'idle' && !output && !error && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
                <div className="w-14 h-14 border-2 border-zinc-800 rounded-3xl flex items-center justify-center">
                  <Play size={24} className="text-zinc-600 translate-x-0.5" />
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Press Run to see output</p>
              </div>
            )}

            {output && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <CheckCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Success</span>
                </div>
                <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed bg-green-500/5 p-4 rounded-2xl border border-green-500/10">{output}</pre>
              </div>
            )}

            {error && (
              <div className="space-y-2 mt-4 first:mt-0">
                <div className="flex items-center gap-2 text-red-500 mb-2">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Error</span>
                </div>
                <pre className="text-red-400 whitespace-pre-wrap leading-relaxed bg-red-500/5 p-4 rounded-2xl border border-red-500/20">{error}</pre>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-900/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                status === 'completed' ? 'bg-green-500' : 
                status === 'failed' ? 'bg-red-500' : 
                status === 'running' ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-700'
              }`}></div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{status}</span>
            </div>
            <button 
              onClick={() => {setOutput(''); setError(''); setStatus('idle');}}
              className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors"
            >
              Clear Console
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default EditorPage;
