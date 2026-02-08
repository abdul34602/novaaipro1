
// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sidebar, 
  ChatWindow, 
  PersonaHub,
  VideoGenerator,
  AdminPanel
} from './components';
import { ChatSession, Message, Persona, ViewState } from './types';
import { PERSONAS } from './constants';
import { LayoutGrid, Settings, Search, Plus, Trash2, ChevronRight, Sparkles, Shield, Clapperboard, Layers } from 'lucide-react';

const HighlightText: React.FC<{ text: string; query: string; className?: string }> = ({ text, query, className }) => {
  if (!query.trim()) return <span className={className}>{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-blue-500/40 text-blue-100 rounded-sm px-0.5">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [customPersonas, setCustomPersonas] = useState<Persona[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewState>(ViewState.CHAT);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const allPersonas = useMemo(() => [...PERSONAS, ...customPersonas], [customPersonas]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('nova_ai_sessions');
    const savedPersonas = localStorage.getItem('nova_ai_custom_personas');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedPersonas) setCustomPersonas(JSON.parse(savedPersonas));
  }, []);

  useEffect(() => {
    localStorage.setItem('nova_ai_sessions', JSON.stringify(sessions));
    localStorage.setItem('nova_ai_custom_personas', JSON.stringify(customPersonas));
  }, [sessions, customPersonas]);

  const currentSession = useMemo(() => 
    sessions.find(s => s.id === currentSessionId) || null,
  [sessions, currentSessionId]);

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sessions.map(s => ({ ...s, snippet: null }));
    
    return sessions
      .filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.messages.some(m => m.content.toLowerCase().includes(query))
      )
      .map(s => {
        let snippet = null;
        if (!s.title.toLowerCase().includes(query)) {
          const matchingMsg = s.messages.find(m => m.content.toLowerCase().includes(query));
          if (matchingMsg) {
            const index = matchingMsg.content.toLowerCase().indexOf(query);
            const start = Math.max(0, index - 25);
            const end = Math.min(matchingMsg.content.length, index + query.length + 35);
            snippet = (start > 0 ? '...' : '') + matchingMsg.content.slice(start, end) + (end < matchingMsg.content.length ? '...' : '');
          }
        }
        return { ...s, snippet };
      });
  }, [sessions, searchQuery]);

  const createNewChat = useCallback((personaId: string = 'default') => {
    const persona = allPersonas.find(p => p.id === personaId) || allPersonas[0];
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: `Briefing ${persona.name}`,
      messages: [],
      personaId,
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveView(ViewState.CHAT);
  }, [allPersonas]);

  const addCustomPersona = (p: Persona) => {
    setCustomPersonas(prev => [...prev, p]);
    createNewChat(p.id);
  };

  const updateSession = useCallback((updated: ChatSession) => {
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  }, [currentSessionId]);

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30">
      <aside className={`
        ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'} 
        transition-all duration-500 border-r border-white/5 flex flex-col glass-panel z-30
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-xl tracking-tighter group cursor-pointer" onClick={() => setActiveView(ViewState.CHAT)}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <Sparkles size={22} className="text-white fill-white/20" />
            </div>
            <span className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent italic uppercase">NovaAI</span>
          </div>
        </div>

        <div className="px-6 mb-8 relative">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input 
            type="text"
            placeholder="Search Intelligence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-[13px] font-medium focus:border-blue-500/30 transition-all outline-none placeholder:text-zinc-800"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-8">
          <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Recent Briefings</div>
          {filteredSessions.map(session => {
            const persona = allPersonas.find(p => p.id === session.personaId);
            const isActive = currentSessionId === session.id && activeView === ViewState.CHAT;
            return (
              <button
                key={session.id}
                onClick={() => {
                  setCurrentSessionId(session.id);
                  setActiveView(ViewState.CHAT);
                }}
                className={`
                  w-full text-left p-4 rounded-2xl transition-all group flex flex-col gap-2 relative overflow-hidden
                  ${isActive ? 'bg-white/[0.05] border border-white/5 shadow-2xl' : 'hover:bg-white/[0.02] text-zinc-500 hover:text-zinc-200 border border-transparent'}
                `}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xl shrink-0 group-hover:scale-110 transition-transform duration-500">
                    {persona?.avatar || '✨'}
                  </span>
                  <div className="flex-1 truncate text-[13px] font-bold tracking-tight">
                    <HighlightText text={session.title || 'Briefing'} query={searchQuery} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-2 rounded-xl hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-6 border-t border-white/5 space-y-3 mt-auto bg-black/20">
          <button 
            onClick={() => createNewChat()}
            className="flex items-center gap-3 w-full p-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <Plus size={18} /> New Briefing
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setActiveView(ViewState.VIDEO_LAB)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-white/5 transition-all ${activeView === ViewState.VIDEO_LAB ? 'bg-emerald-600 text-white' : 'bg-white/[0.03] text-zinc-500 hover:text-white hover:bg-white/[0.07]'}`}>
              <Clapperboard size={18} />
              <span className="text-[9px] font-black uppercase">Video</span>
            </button>
            <button onClick={() => setActiveView(ViewState.PERSONA_HUB)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-white/5 transition-all ${activeView === ViewState.PERSONA_HUB ? 'bg-blue-600 text-white' : 'bg-white/[0.03] text-zinc-500 hover:text-white hover:bg-white/[0.07]'}`}>
              <Layers size={18} />
              <span className="text-[9px] font-black uppercase">Personas</span>
            </button>
          </div>
          
          <button onClick={() => setActiveView(ViewState.ADMIN)} className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${activeView === ViewState.ADMIN ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-white hover:bg-white/[0.03]'}`}>
            <Settings size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">System Admin</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
        {/* Responsive Navbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 z-20 glass-panel">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-500 hover:text-white transition-all">
              <Plus size={22} className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-45' : ''}`} />
            </button>
            
            <div className="flex items-center gap-3">
              {activeView === ViewState.CHAT && currentSession ? (
                <>
                  <span className="text-2xl">{allPersonas.find(p => p.id === currentSession.personaId)?.avatar}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white italic uppercase tracking-tighter">
                      {allPersonas.find(p => p.id === currentSession.personaId)?.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Neural Pipeline Sync</span>
                  </div>
                </>
              ) : (
                <span className="text-sm font-black text-white italic uppercase tracking-[0.3em]">{activeView.replace('_', ' ')} Studio</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-zinc-900/50 border border-white/5 rounded-xl text-[10px] font-black text-zinc-400">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-slow shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
               SYNAPSE ACTIVE
             </div>
             <div className="w-9 h-9 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 text-[10px] font-black">
               PRO
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {activeView === ViewState.CHAT ? (
            currentSession ? (
              <ChatWindow session={currentSession} onUpdate={updateSession} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600/30 blur-[80px] animate-pulse"></div>
                  <div className="w-32 h-32 bg-zinc-900 border border-white/5 rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl relative z-10 transform hover:rotate-6 transition-transform duration-700">
                    🚀
                  </div>
                </div>
                <div className="max-w-2xl space-y-6">
                  <h1 className="text-7xl font-black tracking-tighter italic uppercase text-white">Neural Lab</h1>
                  <p className="text-zinc-500 text-xl font-medium leading-relaxed">
                    Deploy world-class intelligence for your most complex architectural and creative constraints.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <button onClick={() => createNewChat()} className="px-12 py-5 bg-white text-black hover:bg-zinc-200 rounded-[2rem] font-black transition-all flex items-center gap-3 active:scale-95 shadow-2xl shadow-white/10 uppercase text-xs tracking-[0.2em]">
                    <Plus size={20} /> Initialize Session
                  </button>
                  <button onClick={() => setActiveView(ViewState.PERSONA_HUB)} className="px-12 py-5 bg-zinc-900 border border-white/5 text-white hover:bg-zinc-800 rounded-[2rem] font-black transition-all flex items-center gap-3 active:scale-95 uppercase text-xs tracking-[0.2em]">
                    <LayoutGrid size={20} /> Explore Entities
                  </button>
                </div>
              </div>
            )
          ) : activeView === ViewState.PERSONA_HUB ? (
            <PersonaHub onSelect={(p) => createNewChat(p.id)} customPersonas={customPersonas} onAddCustom={addCustomPersona} />
          ) : activeView === ViewState.VIDEO_LAB ? (
            <VideoGenerator />
          ) : (
            <AdminPanel />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
