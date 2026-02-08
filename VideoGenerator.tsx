
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Video, Sparkles, Monitor, Smartphone, Loader2, Play, Download, 
  Trash2, Wand2, ShieldCheck, ExternalLink, Clapperboard, 
  Megaphone, Presentation, TreePine, ChevronDown, Camera, 
  Sun, Clock, Zap, Move, Plus, Image as ImageIcon, X, LayoutGrid, 
  List, History
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  timestamp: number;
}

interface VideoTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
  aspectRatio: string;
  color: string;
}

const TEMPLATES: VideoTemplate[] = [
  {
    id: 'trailer',
    name: 'Cinematic Trailer',
    icon: <Clapperboard size={18} />,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    aspectRatio: '16:9',
    prompt: 'A cinematic drone shot through a neon-lit cyberpunk metropolis during a monsoon, reflections of holographic dragons on the wet pavement, hyper-realistic, 8k, dramatic lighting.'
  },
  {
    id: 'explainer',
    name: '3D Explainer',
    icon: <Presentation size={18} />,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    aspectRatio: '16:9',
    prompt: 'A clean, minimalist 3D animation of a futuristic laboratory where floating holographic gears assemble a complex energy core. Smooth camera pans, soft studio lighting, professional finish.'
  },
  {
    id: 'social',
    name: 'Social Media Ad',
    icon: <Megaphone size={18} />,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    aspectRatio: '9:16',
    prompt: 'A fast-paced, high-energy sequence of glowing digital sneakers running through a forest of fiber-optic trees. Vibrant neon colors, dynamic motion blur, vertical fashion aesthetic.'
  },
  {
    id: 'nature',
    name: 'Nature Doc',
    icon: <TreePine size={18} />,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    aspectRatio: '16:9',
    prompt: 'A slow-motion close-up of a crystalline hummingbird sipping nectar from a glowing flower in a bioluminescent rainforest at twilight. Hyper-detailed textures, ethereal atmosphere.'
  }
];

const CAMERA_STYLES = ['Default', 'Static', 'Slow Pan Left', 'Slow Pan Right', 'Tilt Up', 'Tilt Down', 'Dolly In', 'Dolly Out', 'Crane Shot', '360 Orbit'];
const LIGHTING_STYLES = ['Default', 'Golden Hour', 'Cinematic High Contrast', 'Soft Studio', 'Bioluminescent Glow', 'Volumetric Fog', 'Noir Shadow'];
const SPEEDS = ['Normal', 'Slow Motion', 'Time-lapse', 'High Energy'];

const VideoGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [hasKey, setHasKey] = useState(true);

  // Advanced Options State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [cameraMovement, setCameraMovement] = useState('Default');
  const [lighting, setLighting] = useState('Default');
  const [motionSpeed, setMotionSpeed] = useState('Normal');
  const [duration, setDuration] = useState('5s');
  const [audioCue, setAudioCue] = useState('');
  
  // Reference Images for I2V
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nova_video_history');
    if (saved) setHistory(JSON.parse(saved));

    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  useEffect(() => {
    localStorage.setItem('nova_video_history', JSON.stringify(history));
  }, [history]);

  const handleOpenKey = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const applyTemplate = (template: VideoTemplate) => {
    setPrompt(template.prompt);
    setAspectRatio(template.aspectRatio);
    setActiveTab('create');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (type === 'start') setStartFrame(ev.target?.result as string);
        else setEndFrame(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStatus('Initializing Neural Canvas...');

    // Synthesize prompt with advanced directives
    let synthesizedPrompt = prompt;
    if (cameraMovement !== 'Default') synthesizedPrompt += `. Camera movement: ${cameraMovement}.`;
    if (lighting !== 'Default') synthesizedPrompt += `. Lighting style: ${lighting}.`;
    if (motionSpeed !== 'Normal') synthesizedPrompt += `. Motion speed: ${motionSpeed}.`;
    if (duration !== '5s') synthesizedPrompt += `. Video duration: approximately ${duration}.`;
    if (audioCue.trim()) synthesizedPrompt += `. Atmosphere/Vibe: ${audioCue}.`;

    try {
      // In a real scenario, we'd pass startFrame/endFrame to the service
      const videoUrl = await geminiService.generateVideo(synthesizedPrompt, aspectRatio);
      const newVideo: GeneratedVideo = {
        id: crypto.randomUUID(),
        url: videoUrl,
        prompt: synthesizedPrompt,
        aspectRatio,
        timestamp: Date.now()
      };
      setHistory(prev => [newVideo, ...prev]);
      setPrompt('');
      setStartFrame(null);
      setEndFrame(null);
      setActiveTab('gallery');
    } catch (error) {
      console.error("Video Generation Error:", error);
      alert(`Synthesis failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  const deleteVideo = (id: string) => {
    setHistory(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between px-8 md:px-16 pt-10 pb-6 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-40">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Clapperboard size={20} /></div>
             <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Video Generation</h2>
          </div>
          <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <Plus size={14} /> Create
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <History size={14} /> Gallery
            </button>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active Model</span>
             <span className="text-[10px] font-bold text-emerald-400 uppercase italic">Veo 3.1 Fast-Gen</span>
           </div>
           {!hasKey && (
             <button onClick={handleOpenKey} className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-900/20">Set API Key</button>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'create' ? (
          <div className="p-8 md:p-16 max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {!hasKey && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-6">
                  <ShieldCheck size={40} className="text-amber-500 shrink-0" />
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-amber-500 mb-1">Infrastructure Standby</h3>
                    <p className="text-zinc-400 text-sm max-w-md">Veo Cinematic Generation requires a project with active billing enabled.</p>
                  </div>
                </div>
                <button onClick={handleOpenKey} className="bg-amber-500 text-black px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl">Configure Key</button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-10">
                {/* Visual Directives */}
                <div className="bg-[#0d0d0d] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Sparkles size={80} className="text-emerald-500" /></div>
                   
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 px-2">Visual Script / Vision</label>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your cinematic vision in high detail..."
                        className="w-full bg-black/40 border border-white/5 rounded-3xl p-8 text-lg font-medium text-white focus:border-emerald-500/50 outline-none transition-all resize-none min-h-[220px] placeholder:text-zinc-800"
                      />
                   </div>

                   {/* Reference Images Section */}
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-2">Start Frame (Optional)</label>
                        <div className="relative aspect-video rounded-2xl border-2 border-dashed border-white/5 bg-black/20 flex flex-col items-center justify-center overflow-hidden hover:border-white/10 transition-all">
                          {startFrame ? (
                            <>
                              <img src={startFrame} className="w-full h-full object-cover" />
                              <button onClick={() => setStartFrame(null)} className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg text-white hover:text-red-400"><X size={14} /></button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02]">
                              <ImageIcon size={24} className="text-zinc-700 mb-2" />
                              <span className="text-[9px] font-black uppercase text-zinc-600">Upload Reference</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'start')} />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-2">End Frame (Optional)</label>
                        <div className="relative aspect-video rounded-2xl border-2 border-dashed border-white/5 bg-black/20 flex flex-col items-center justify-center overflow-hidden hover:border-white/10 transition-all">
                          {endFrame ? (
                            <>
                              <img src={endFrame} className="w-full h-full object-cover" />
                              <button onClick={() => setEndFrame(null)} className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg text-white hover:text-red-400"><X size={14} /></button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02]">
                              <ImageIcon size={24} className="text-zinc-700 mb-2" />
                              <span className="text-[9px] font-black uppercase text-zinc-600">Upload Reference</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'end')} />
                            </label>
                          )}
                        </div>
                      </div>
                   </div>

                   {/* Advanced Directive Accordion */}
                   <div className="border border-white/5 rounded-3xl overflow-hidden bg-black/20">
                    <button 
                      onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                      className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all group/adv"
                    >
                      <div className="flex items-center gap-3">
                        <Zap size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover/adv:text-white transition-colors">Advanced Synthesis Directives</span>
                      </div>
                      <ChevronDown size={18} className={`text-zinc-600 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`transition-all duration-500 overflow-hidden ${isAdvancedOpen ? 'max-h-[800px] border-t border-white/5' : 'max-h-0'}`}>
                      <div className="p-8 grid grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500"><Camera size={12} /> Camera Movement</label>
                            <select value={cameraMovement} onChange={(e) => setCameraMovement(e.target.value)} className="w-full bg-black border border-white/5 rounded-2xl p-4 text-xs font-bold text-zinc-300 outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                              {CAMERA_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500"><Sun size={12} /> Lighting</label>
                            <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full bg-black border border-white/5 rounded-2xl p-4 text-xs font-bold text-zinc-300 outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                              {LIGHTING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex gap-3 bg-black/40 p-2 rounded-2xl">
                       <button onClick={() => setAspectRatio('16:9')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${aspectRatio === '16:9' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>16:9</button>
                       <button onClick={() => setAspectRatio('9:16')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${aspectRatio === '9:16' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>9:16</button>
                    </div>
                    <button 
                      onClick={handleGenerate} 
                      disabled={!prompt.trim() || isGenerating || !hasKey}
                      className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-900/20 disabled:opacity-20 disabled:cursor-not-allowed group"
                    >
                      {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />}
                      SYNTHESIZE RENDER
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-8 space-y-6">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5 pb-4">Style Templates</h3>
                   <div className="grid grid-cols-1 gap-4">
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => applyTemplate(t)} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 group ${t.color}`}>
                           <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">{t.icon}</div>
                           <div className="text-left">
                              <div className="text-[10px] font-black uppercase tracking-tight">{t.name}</div>
                              <div className="text-[9px] opacity-60 font-medium">Ready to deploy</div>
                           </div>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-8 min-h-[250px] flex flex-col items-center justify-center text-center space-y-6">
                   {isGenerating ? (
                     <div className="animate-in fade-in duration-500 space-y-4">
                        <div className="relative w-20 h-20 mx-auto">
                           <div className="absolute inset-0 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                           <Video size={30} className="absolute inset-0 m-auto text-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{status}</p>
                     </div>
                   ) : (
                     <div className="opacity-10 space-y-4">
                        <Clapperboard size={60} className="mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Command</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-16 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
             {history.length === 0 ? (
               <div className="py-40 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-zinc-700 space-y-6">
                  <Play size={64} className="opacity-10" />
                  <p className="text-lg font-black uppercase tracking-widest italic">Temporal Vault Empty</p>
                  <button onClick={() => setActiveTab('create')} className="px-10 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all">Start Rendering</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {history.map(item => (
                   <div key={item.id} className="group bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
                      <div className="aspect-video bg-black relative">
                        <video 
                          src={item.url} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          onMouseOver={e => e.currentTarget.play()}
                          onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          muted loop
                        />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <a href={item.url} download className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white hover:bg-emerald-600"><Download size={16} /></a>
                          <button onClick={() => deleteVideo(item.id)} className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-zinc-400 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div className="p-8 space-y-4">
                         <p className="text-sm text-zinc-300 line-clamp-2 font-medium italic">"{item.prompt}"</p>
                         <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                            <span className="bg-zinc-900 px-3 py-1 rounded-full border border-white/5">{item.aspectRatio}</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
