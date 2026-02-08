
// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, ChatSession, FileAttachment } from '../types';
import { PERSONAS } from '../constants';
import { geminiService } from '../services/geminiService';
import MessageItem from './MessageItem';
import FileUploader from './FileUploader';
import { 
  Send, Paperclip, Loader2, X, Search, 
  Sparkles, BrainCircuit, ChevronDown, 
  Video, ShieldCheck, Monitor, Smartphone,
  Zap, Command, Cpu, Globe, ArrowUpRight
} from 'lucide-react';

interface Props {
  session: ChatSession;
  onUpdate: (session: ChatSession) => void;
}

const ChatWindow: React.FC<Props> = ({ session, onUpdate }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [ingestionStage, setIngestionStage] = useState<'idle' | 'reading' | 'reasoning'>('idle');
  const [hasKey, setHasKey] = useState(true);
  const [showLocalSearch, setShowLocalSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const persona = PERSONAS.find(p => p.id === session.personaId) || PERSONAS[0];

  useEffect(() => {
    const checkKey = async () => {
      if (persona.mode === 'video') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, [persona]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isStreaming, scrollToBottom]);

  const filteredMessages = useMemo(() => {
    return session.messages.filter(m => 
      !localSearchQuery.trim() || m.content.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
  }, [session.messages, localSearchQuery]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;

    const currentInput = input;
    const currentAttachments = [...attachments];

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: currentInput,
      attachments: currentAttachments,
      timestamp: Date.now()
    };

    const initialMessages = [...session.messages, userMessage];
    const initialSession = {
      ...session,
      messages: initialMessages,
      title: session.messages.length === 0 ? (currentInput.slice(0, 40) || 'Brief Session') : session.title,
      updatedAt: Date.now()
    };
    
    onUpdate(initialSession);
    setInput('');
    setAttachments([]);
    setIsStreaming(true);

    if (persona.mode === 'video') {
      setVideoStatus('Synthesizing Visual Layers...');
      try {
        const videoUrl = await geminiService.generateVideo(currentInput, selectedAspectRatio);
        onUpdate({
          ...initialSession,
          messages: [...initialMessages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `### Synthesis Complete\nVisual data successfully rendered at **${selectedAspectRatio}**.`,
            videoUrl: videoUrl,
            timestamp: Date.now()
          }]
        });
      } catch (error) {
        onUpdate({
          ...initialSession,
          messages: [...initialMessages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `### Failed to Render\n${error.message}`,
            timestamp: Date.now()
          }]
        });
      } finally {
        setIsStreaming(false);
        setVideoStatus('');
      }
      return;
    }

    setIngestionStage(currentAttachments.length > 0 ? 'reading' : 'reasoning');
    try {
      let fullContent = '';
      const assistantMessageId = crypto.randomUUID();
      const stream = geminiService.streamChat(
        session.messages,
        currentInput,
        currentAttachments,
        persona.systemInstruction,
        persona.id
      );
      
      let firstChunk = true;
      for await (const chunk of stream) {
        if (firstChunk) {
           setIngestionStage('reasoning');
           firstChunk = false;
        }
        fullContent += chunk;
        onUpdate({
          ...initialSession,
          messages: [...initialMessages, {
            id: assistantMessageId,
            role: 'assistant',
            content: fullContent,
            timestamp: Date.now()
          }]
        });
      }
    } catch (error) {
      onUpdate({
        ...initialSession,
        messages: [...initialMessages, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "### System Alert\nCritical neural pipeline failure.",
          timestamp: Date.now()
        }]
      });
    } finally {
      setIsStreaming(false);
      setIngestionStage('idle');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden">
      {/* Search Header Overlay */}
      <div className={`absolute top-0 left-0 right-0 z-40 glass-panel border-b border-white/5 transition-all duration-500 shadow-2xl ${showLocalSearch ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <Search size={18} className="text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search conversation history..." 
            value={localSearchQuery} 
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-zinc-700"
            autoFocus={showLocalSearch}
          />
          <button onClick={() => setShowLocalSearch(false)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"><X size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-20 pb-40 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          {session.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-1000">
               <div className="relative mb-10 group">
                  <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-1000"></div>
                  <div className="text-[9rem] relative z-10 drop-shadow-2xl filter brightness-110">{persona.avatar}</div>
               </div>
               
               <div className="space-y-4 max-w-2xl">
                 <h3 className="text-5xl font-black tracking-tighter text-white italic uppercase">{persona.name}</h3>
                 <p className="text-zinc-500 font-medium text-lg leading-relaxed">{persona.description}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 w-full max-w-3xl">
                  {[
                    { icon: <Zap className="text-amber-400" />, title: "Summarize Complex Files", desc: "Drag PDFs for instant neural mapping." },
                    { icon: <BrainCircuit className="text-blue-400" />, title: "Technical Architecture", desc: "Engineer scalable systems from scratch." },
                    { icon: <Globe className="text-emerald-400" />, title: "Search Grounding", desc: "Real-time access to the global mesh." },
                    { icon: <Cpu className="text-purple-400" />, title: "Deep Reasoning", desc: "Advanced logic for brutal constraints." }
                  ].map((feat, i) => (
                    <button key={i} className="flex items-start gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-3xl text-left hover:bg-white/[0.07] hover:border-white/10 transition-all group">
                       <div className="p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">{feat.icon}</div>
                       <div>
                          <div className="text-[13px] font-black uppercase tracking-tight text-white flex items-center gap-2">
                             {feat.title} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">{feat.desc}</div>
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredMessages.map((msg, idx) => (
                <MessageItem key={msg.id} message={msg} isLast={idx === session.messages.length - 1} query={localSearchQuery} />
              ))}
            </div>
          )}

          {isStreaming && (
            <div className="flex gap-6 py-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-xl">
                 <Loader2 size={24} className="animate-spin text-blue-400" />
              </div>
              <div className="flex flex-col flex-1 gap-2 pt-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/80 animate-pulse">
                  {persona.mode === 'video' ? (videoStatus || "Synthesizing Frames...") : (ingestionStage === 'reading' ? 'Ingesting Dataset...' : 'Neural Reasoning...')}
                </span>
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-700 w-1/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto space-y-4">
          
          {/* Active File Pills */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-6 animate-in slide-in-from-bottom-2">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-tight shadow-xl">
                   <span>{file.name}</span>
                   <button onClick={() => removeAttachment(i)} className="hover:text-white transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-widest text-zinc-600">
             <div className="flex items-center gap-4">
                <button onClick={() => setShowLocalSearch(true)} className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"><Search size={14} /> Search Session</button>
                <div className="h-3 w-px bg-zinc-800"></div>
                {persona.mode === 'video' ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedAspectRatio('16:9')} className={`transition-colors ${selectedAspectRatio === '16:9' ? 'text-white' : 'hover:text-white'}`}>16:9</button>
                    <button onClick={() => setSelectedAspectRatio('9:16')} className={`transition-colors ${selectedAspectRatio === '9:16' ? 'text-white' : 'hover:text-white'}`}>9:16</button>
                  </div>
                ) : (
                  <span className="text-blue-500/50">Gemini 3 Pro Active</span>
                )}
             </div>
             <div className="flex items-center gap-2">
                <Command size={12} /> Enter to send
             </div>
          </div>
          
          <form 
            onSubmit={handleSubmit}
            className="relative glass-panel rounded-[2.5rem] p-4 flex items-end gap-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] focus-within:border-blue-500/30 transition-all border border-white/5"
          >
            <FileUploader onFiles={(files) => setAttachments(prev => [...prev, ...files])}>
              <button type="button" className="p-4 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                <Paperclip size={24} />
              </button>
            </FileUploader>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder={persona.mode === 'video' ? "Describe the frame composition..." : `Query ${persona.name}...`}
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] py-4 max-h-80 resize-none placeholder:text-zinc-700 font-medium text-zinc-100 leading-relaxed overflow-hidden"
              style={{ height: 'auto' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isStreaming || (persona.mode === 'video' && !hasKey)}
              className={`p-4 rounded-2xl transition-all shadow-xl active:scale-95 ${input.trim() && !isStreaming ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20' : 'bg-zinc-800 text-zinc-600'}`}
            >
              {isStreaming ? <Loader2 size={24} className="animate-spin" /> : <ArrowUpRight size={24} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
