
// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { PERSONAS } from '../constants';
import { Persona } from '../types';
import { 
  Sparkles, Code, Scale, ScrollText, Plus, X, 
  UserPlus, ShieldAlert, Ghost, Sword, Brain, Zap, 
  MessageSquareQuote, Heart, Target, Wand2, Thermometer,
  Layers, BarChart3, Activity, ChevronRight, ChevronLeft,
  User, Palette, MessageSquare
} from 'lucide-react';

interface Props {
  onSelect: (persona: Persona) => void;
  customPersonas: Persona[];
  onAddCustom: (persona: Persona) => void;
}

const PersonaHub: React.FC<Props> = ({ onSelect, customPersonas, onAddCustom }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newPersona, setNewPersona] = useState<Partial<Persona>>({
    name: '',
    role: '',
    description: '',
    systemInstruction: '',
    avatar: '🤖',
    category: 'Custom',
    communicationStyle: 'Technical & Concise',
    emotionalState: 'Neutral',
    cognitiveBiases: 'None'
  });

  const getIcon = (category: string, id: string) => {
    if (id === 'aggressive-debater') return <Sword size={22} className="text-red-400" />;
    if (id === 'cyber-psychic') return <Ghost size={22} className="text-purple-400" />;
    if (id === 'code-master') return <Brain size={22} className="text-blue-400" />;
    
    switch(category) {
      case 'Technical': return <Code size={22} className="text-blue-400" />;
      case 'Professional': return <Scale size={22} className="text-amber-400" />;
      case 'Creative': return <ScrollText size={22} className="text-purple-400" />;
      case 'Custom': return <UserPlus size={22} className="text-pink-400" />;
      default: return <Sparkles size={22} className="text-emerald-400" />;
    }
  };

  const allAvailable = [...PERSONAS, ...customPersonas];

  const handleCreate = () => {
    if (!newPersona.name || !newPersona.systemInstruction) return;
    
    const syntheticInstruction = `
      ${newPersona.systemInstruction}
      [COMMUNICATION STYLE]: ${newPersona.communicationStyle}
      [EMOTIONAL STATE]: ${newPersona.emotionalState}
      [COGNITIVE BIASES]: ${newPersona.cognitiveBiases}
    `.trim();

    const persona: Persona = {
      ...newPersona as Persona,
      systemInstruction: syntheticInstruction,
      id: `custom-${Date.now()}`,
      isCustom: true,
      color: 'from-zinc-500/20 to-zinc-900/40'
    };
    onAddCustom(persona);
    setShowModal(false);
    setCurrentStep(1);
  };

  const sampleOutput = useMemo(() => {
    const { name, communicationStyle, emotionalState, cognitiveBiases } = newPersona;
    if (!name) return "Awaiting neural pattern input...";
    
    const intro = emotionalState === 'Aggressive' ? "Listen carefully." : 
                  emotionalState === 'Empathetic' ? "I hear you, and I understand." : 
                  "Response initialized.";

    return `${intro} I am ${name}. My current emotional state is calibrated to '${emotionalState}'. As requested, I will communicate in a ${communicationStyle.toLowerCase()} manner. ${cognitiveBiases !== 'None' ? `Note: My reasoning may be influenced by ${cognitiveBiases.toLowerCase()} filters.` : 'My logic gates remain objective.'}`;
  }, [newPersona]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="h-full overflow-y-auto p-10 max-w-[1400px] mx-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black mb-3 tracking-tighter bg-gradient-to-r from-white via-white to-zinc-600 bg-clip-text text-transparent italic">
            PERSONA HUB
          </h1>
          <p className="text-zinc-500 text-xl font-medium max-w-2xl leading-relaxed">
            Select an existing cognitive template or architect a unique neural identity from scratch.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-white text-black font-black rounded-[1.5rem] flex items-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)] group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform" /> ENGINEER NEW
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {allAvailable.map(persona => (
          <div 
            key={persona.id}
            onClick={() => onSelect(persona)}
            className="group relative bg-[#0d1117]/60 border border-zinc-800/50 rounded-[2.5rem] p-8 cursor-pointer hover:border-blue-500/40 hover:bg-zinc-900/80 transition-all duration-500 overflow-hidden flex flex-col h-full shadow-2xl hover:-translate-y-2"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${persona.color || 'from-zinc-500/10 to-transparent'} opacity-10 group-hover:opacity-30 transition-opacity duration-700`} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-8">
                <div className="text-6xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 ease-out drop-shadow-2xl">{persona.avatar}</div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors">
                  {getIcon(persona.category, persona.id)}
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors italic uppercase">{persona.name}</h3>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-2">
                {persona.role}
                {persona.isCustom && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[9px]">CUSTOM</span>}
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-10 flex-1 font-medium group-hover:text-zinc-300 transition-colors">
                {persona.description}
              </p>

              <button className="w-full py-4 bg-zinc-800/60 group-hover:bg-blue-600 text-zinc-300 group-hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border border-zinc-700/50 group-hover:border-blue-500/50">
                ACTIVATE SESSION
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[4rem] w-full max-w-6xl h-[90vh] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] flex">
            
            <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5 bg-zinc-900/5">
              {/* Header */}
              <div className="p-16 pb-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter italic uppercase">NEURAL ARCHITECT</h2>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] mt-2">CONFIGURING COGNITIVE PIPELINE • STEP {currentStep} OF 3</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-4 bg-zinc-900 hover:bg-red-500/10 rounded-full text-zinc-500 hover:text-red-400 transition-all">
                    <X size={28} />
                  </button>
                </div>

                {/* Step Indicators */}
                <div className="flex gap-4">
                  {[1, 2, 3].map(step => (
                    <div 
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${currentStep >= step ? 'bg-blue-500' : 'bg-zinc-800'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-16 pt-10">
                {currentStep === 1 && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-4 mb-2">
                       <User size={20} className="text-blue-500" />
                       <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 italic">Basic Identity</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Entity Name</label>
                        <input 
                          value={newPersona.name}
                          onChange={e => setNewPersona({...newPersona, name: e.target.value})}
                          placeholder="e.g. Socratic Oracle"
                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Avatar Representation</label>
                        <input 
                          value={newPersona.avatar}
                          onChange={e => setNewPersona({...newPersona, avatar: e.target.value})}
                          placeholder="Emoji avatar"
                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-white focus:border-blue-500/50 outline-none transition-all text-center text-2xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Primary Role / Title</label>
                      <input 
                        value={newPersona.role}
                        onChange={e => setNewPersona({...newPersona, role: e.target.value})}
                        placeholder="e.g. Logical sparring partner"
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Short Description</label>
                      <textarea 
                        value={newPersona.description}
                        onChange={e => setNewPersona({...newPersona, description: e.target.value})}
                        placeholder="Define the purpose of this neural entity..."
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-white focus:border-blue-500/50 outline-none transition-all resize-none placeholder:text-zinc-700"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-4 mb-2">
                       <Palette size={20} className="text-purple-500" />
                       <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 italic">Personality Calibration</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Communication Style</label>
                        <select 
                          value={newPersona.communicationStyle}
                          onChange={e => setNewPersona({...newPersona, communicationStyle: e.target.value})}
                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option>Technical & Concise</option>
                          <option>Socratic & Probing</option>
                          <option>Poetic & Abstract</option>
                          <option>Aggressive & Direct</option>
                          <option>Casual & Friendly</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Emotional State</label>
                        <select 
                          value={newPersona.emotionalState}
                          onChange={e => setNewPersona({...newPersona, emotionalState: e.target.value})}
                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option>Neutral</option>
                          <option>Aggressive</option>
                          <option>Empathetic</option>
                          <option>Coldly Logical</option>
                          <option>Melancholic</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 italic text-zinc-500 text-sm leading-relaxed">
                      "Personality parameters define the tone and linguistic markers of the model's output. These are enforced as system-level constraints during inference."
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-4 mb-2">
                       <Brain size={20} className="text-emerald-500" />
                       <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 italic">Intelligence Framework</h3>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cognitive Bias Filters</label>
                      <select 
                        value={newPersona.cognitiveBiases}
                        onChange={e => setNewPersona({...newPersona, cognitiveBiases: e.target.value})}
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option>None</option>
                        <option>Optimism Bias</option>
                        <option>Extreme Skepticism</option>
                        <option>Authority Bias</option>
                        <option>Dunning-Kruger Effect (Simulation)</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Core Directive (System Instruction)</label>
                      <textarea 
                        value={newPersona.systemInstruction}
                        onChange={e => setNewPersona({...newPersona, systemInstruction: e.target.value})}
                        rows={6}
                        placeholder="Define the deep-level operating principles and constraints..."
                        className="w-full bg-zinc-900 border border-white/5 rounded-3xl p-6 text-white focus:border-blue-500/50 outline-none transition-all resize-none placeholder:text-zinc-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="p-16 pt-8 border-t border-white/5 flex items-center justify-between gap-6">
                <button 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-10 py-5 bg-zinc-900 text-zinc-400 border border-white/5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                
                {currentStep < 3 ? (
                  <button 
                    onClick={nextStep}
                    className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-blue-900/20"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={handleCreate}
                    disabled={!newPersona.name || !newPersona.systemInstruction}
                    className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Wand2 size={18} /> Deploy Neural Entity
                  </button>
                )}
              </div>
            </div>

            {/* Live Preview Sidebar */}
            <div className="w-[450px] bg-[#0c0c0c] p-16 flex flex-col">
              <div className="mb-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">Cognitive Simulation</h4>
                <div className="h-0.5 w-12 bg-blue-500"></div>
              </div>
              
              <div className="flex-1 space-y-10">
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group min-h-[120px]">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Zap size={40} className="text-blue-500" />
                  </div>
                  <p className="text-zinc-400 font-mono text-sm leading-relaxed italic">
                    "{sampleOutput}"
                  </p>
                </div>

                <div className="space-y-6 pt-10 border-t border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Activity size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Consistency Status</div>
                        <div className="text-white font-bold text-xs uppercase tracking-tight">Active In-Memory Build</div>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-600">
                         <span>Neural Integrity</span>
                         <span className="text-blue-500">100%</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full"></div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-auto">
                 <p className="text-[9px] text-zinc-700 font-medium leading-relaxed uppercase tracking-[0.2em]">
                   V. 2.5 Neural Synthesis Engine • Local Buffer Active
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaHub;
