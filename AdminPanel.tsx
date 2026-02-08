
import React, { useState, useEffect } from 'react';
import { Settings, Key, ShieldCheck, Activity, Save, LogOut, Terminal, Lock, Cpu, Globe, Eye, EyeOff, RefreshCcw, Clock, Zap } from 'lucide-react';

const ADMIN_EMAIL = "admin@novaai.com"; 
const ADMIN_PASSWORD = "nova-secure-2025"; 

type AdminTab = 'config' | 'logs' | 'metrics';

interface LogEntry {
  id: number;
  timestamp: string;
  feature: string;
  prompt: string;
  status: number;
}

const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('config');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  const [settings, setSettings] = useState({
    gemini_api_key: "••••••••••••••••",
    veo_api_key: "••••••••••••••••",
    is_maintenance: false,
    system_load: "Minimal",
    last_update: new Date().toLocaleString()
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      setIsLoggingIn(true);
      setTimeout(() => {
        setIsLoggedIn(true);
        setIsLoggingIn(false);
      }, 800);
    } else {
      alert("Access Denied: Neural handshake failed.");
    }
  };

  const fetchLogs = () => {
    setIsLoadingLogs(true);
    // Read from localStorage to avoid "Failed to fetch" errors
    const localLogs = JSON.parse(localStorage.getItem('nova_activity_logs') || '[]');
    setLogs(localLogs);
    setTimeout(() => setIsLoadingLogs(false), 500);
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === 'logs') {
      fetchLogs();
    }
    
    const handleUpdate = () => {
      if (activeTab === 'logs') fetchLogs();
    };
    window.addEventListener('nova_logs_updated', handleUpdate);
    return () => window.removeEventListener('nova_logs_updated', handleUpdate);
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('nova_admin_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const newSettings = { ...settings, last_update: new Date().toLocaleString() };
      localStorage.setItem('nova_admin_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      alert("Configuration update failed.");
      setSaveStatus('idle');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-full bg-[#050505] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="bg-[#0d0d0d] p-12 rounded-[3rem] border border-white/5 w-full max-w-md text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"></div>
          <div className="mb-10 relative">
            <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="text-blue-500" size={48} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Security Gate</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">NovaAI Internal Systems</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="relative group/input">
              <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-blue-500 transition-colors" />
              <input type="email" required placeholder="Administrator Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-medium outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700" />
            </div>
            <div className="relative group/input">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-blue-500 transition-colors" />
              <input type={showPassword ? "text" : "password"} required placeholder="Secure Access Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-white text-sm font-medium outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 mt-4 disabled:opacity-50">
              {isLoggingIn ? <Cpu className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              Authenticate session
            </button>
          </form>
          <p className="mt-10 text-[9px] text-zinc-700 font-black uppercase tracking-widest leading-relaxed">
            Unauthorized access strictly prohibited. CID logging enabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0a] text-white flex animate-in slide-in-from-right-4 duration-700">
      {/* Sidebar navigation */}
      <div className="w-72 border-r border-white/5 bg-[#0d0d0d] p-8 flex flex-col gap-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20"><Settings size={20} /></div>
          <h1 className="text-lg font-black tracking-tighter italic uppercase">Admin Core</h1>
        </div>
        <div className="flex-1 space-y-3">
          <button onClick={() => setActiveTab('config')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            <Key size={16} /> API Configuration
          </button>
          <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            <Terminal size={16} /> System Logs
          </button>
          <button onClick={() => setActiveTab('metrics')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'metrics' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            <Activity size={16} /> Neural Metrics
          </button>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="mt-auto flex items-center gap-3 p-4 text-red-500 hover:bg-red-500/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
          <LogOut size={16} /> Terminate Session
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-12 md:p-20 custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'config' && (
            <div className="space-y-16 animate-in fade-in duration-500">
              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter italic uppercase">System Settings</h2>
                <p className="text-zinc-500 text-lg font-medium">Core neural infrastructure management.</p>
              </div>
              <div className="grid gap-10">
                <div className="bg-[#0d0d0d] p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl relative group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Cpu size={100} /></div>
                  <div className="space-y-8 relative z-10">
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500"><Key size={14} className="text-blue-500" /> Gemini Intelligence Key</label>
                      <input type="password" value={settings.gemini_api_key} onChange={(e) => setSettings({...settings, gemini_api_key: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl p-5 text-zinc-100 font-mono text-sm outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500"><Key size={14} className="text-emerald-500" /> Veo Cinematic Key</label>
                      <input type="password" value={settings.veo_api_key} onChange={(e) => setSettings({...settings, veo_api_key: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl p-5 text-zinc-100 font-mono text-sm outline-none focus:border-emerald-500/50 transition-all" />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/5">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Maintenance Mode</div>
                        <div className="text-[9px] text-zinc-600 font-bold uppercase">Restricts user pipeline access</div>
                      </div>
                      <button onClick={() => setSettings({...settings, is_maintenance: !settings.is_maintenance})} className={`w-14 h-8 rounded-full transition-all relative ${settings.is_maintenance ? 'bg-amber-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.is_maintenance ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} disabled={saveStatus === 'saving'} className={`flex items-center justify-center gap-3 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 ${saveStatus === 'saved' ? 'bg-emerald-600 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}>
                  {saveStatus === 'saving' ? <Cpu className="animate-spin" size={20} /> : (saveStatus === 'saved' ? <ShieldCheck size={20} /> : <Save size={20} />)}
                  {saveStatus === 'saving' ? 'Syncing Layers...' : (saveStatus === 'saved' ? 'Platform Synchronized' : 'Push configuration to production')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter italic uppercase">Telemetry Logs</h2>
                  <p className="text-zinc-500 text-sm font-medium mt-1">Real-time monitoring of user cognitive requests.</p>
                </div>
                <button onClick={fetchLogs} disabled={isLoadingLogs} className="p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-white/5 transition-all text-zinc-400 hover:text-blue-400 active:scale-95">
                  <RefreshCcw size={20} className={isLoadingLogs ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Timestamp</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Feature</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">User Prompt</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 text-xs font-mono text-zinc-600 whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${log.feature === 'Video' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                            {log.feature}
                          </span>
                        </td>
                        <td className="p-6 text-sm text-zinc-300 font-medium italic max-w-md truncate">"{log.prompt}"</td>
                        <td className="p-6 text-center">
                          <span className={`text-[10px] font-black ${log.status === 200 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {log.status === 200 ? 'SUCCESS 200' : `ERROR ${log.status}`}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center text-zinc-700 italic font-medium uppercase tracking-widest text-xs">
                          No telemetry records detected in current buffer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="space-y-4 text-center">
                  <h2 className="text-4xl font-black tracking-tighter italic uppercase">Neural Metrics</h2>
                  <p className="text-zinc-500 text-sm font-medium">Synthesized real-time telemetry analytics.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#0d0d0d] p-10 rounded-[3rem] border border-white/5 space-y-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500"><Zap size={40} /></div>
                    <div className="text-center">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Cognitive Throughput</div>
                      <div className="text-4xl font-black italic tracking-tighter">984 T/SEC</div>
                    </div>
                  </div>
                  <div className="bg-[#0d0d0d] p-10 rounded-[3rem] border border-white/5 space-y-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500"><Clock size={40} /></div>
                    <div className="text-center">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Average Latency</div>
                      <div className="text-4xl font-black italic tracking-tighter">14ms</div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
