
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { User, Copy, Check, FileText, BrainCircuit, PlayCircle, Download, Share2 } from 'lucide-react';

interface Props {
  message: Message;
  isLast: boolean;
  query?: string;
}

const MessageItem: React.FC<Props> = ({ message, query }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if ((window as any).katex && contentRef.current) {
      const mathBlocks = contentRef.current.querySelectorAll('.math-block');
      mathBlocks.forEach((block: any) => {
        try {
          const formula = block.dataset.formula;
          if (formula) (window as any).katex.render(formula, block, { throwOnError: false, displayMode: true });
        } catch (e) {}
      });
      const mathInlines = contentRef.current.querySelectorAll('.math-inline');
      mathInlines.forEach((inline: any) => {
        try {
          const formula = inline.dataset.formula;
          if (formula) (window as any).katex.render(formula, inline, { throwOnError: false, displayMode: false });
        } catch (e) {}
      });
    }
  }, [message.content]);

  const highlightText = (text: string) => {
    if (!query?.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? `<span class="bg-blue-500/40 text-blue-100 rounded-sm px-0.5">${part}</span>`
        : part
    ).join('');
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
        const lang = match?.[1] || 'intel';
        const code = (match?.[2] || '').trim();
        return (
          <div key={index} className="my-8 overflow-hidden border border-white/5 rounded-3xl bg-[#0a0a0a]/80 shadow-2xl group/code">
            <div className="flex items-center justify-between px-6 py-3 bg-white/[0.03] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                {lang}
              </span>
              <button onClick={() => navigator.clipboard.writeText(code)} className="hover:text-white transition-all">Copy Source</button>
            </div>
            <pre className="p-6 overflow-x-auto font-mono text-[13px] leading-relaxed text-blue-200/70"><code>{code}</code></pre>
          </div>
        );
      }
      
      let subPart = part;
      // Format LaTeX
      subPart = subPart.replace(/\$\$([\s\S]+?)\$\$/g, (m, f) => `<div class="math-block my-6 p-6 bg-zinc-900/40 rounded-3xl border border-white/5 text-center" data-formula="${f.replace(/"/g, '&quot;')}"></div>`);
      subPart = subPart.replace(/\$([\s\S]+?)\$/g, (m, f) => `<span class="math-inline px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-lg mx-0.5" data-formula="${f.replace(/"/g, '&quot;')}"></span>`);
      
      // Markdown-like titles
      subPart = subPart.replace(/^(### )(.*$)/gm, '<h3 class="text-xl font-black text-white mt-10 mb-4 tracking-tighter italic uppercase">$2</h3>');
      subPart = subPart.replace(/^(## )(.*$)/gm, '<h2 class="text-3xl font-black text-white mt-14 mb-6 tracking-tighter italic border-b border-white/5 pb-4 uppercase">$2</h2>');
      
      // Bold/Italic
      subPart = subPart.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>');
      subPart = subPart.replace(/\*(.*?)\*/g, '<em class="text-zinc-300">$1</em>');
      
      const segments = subPart.split(/(`.*?`)/g);
      return (
        <span key={index} className="whitespace-pre-wrap">
          {segments.map((segment, i) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              return <code key={i} className="px-2 py-0.5 bg-zinc-800/80 text-blue-400 rounded-lg mx-1 font-mono text-sm">{segment.slice(1, -1)}</code>;
            }
            const highlighted = (segment.includes('<h') || segment.includes('<div') || segment.includes('<span')) ? segment : highlightText(segment);
            return <span key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />;
          })}
        </span>
      );
    });
  };

  return (
    <div className={`flex gap-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ${isUser ? 'flex-row-reverse' : 'flex-row'}`} role="article">
      {/* Avatar */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-sm shadow-2xl transition-transform duration-500 ${isUser ? 'bg-zinc-900 border border-white/5 text-zinc-500' : 'bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-blue-600/20'}`}>
        {isUser ? <User size={22} strokeWidth={2.5} /> : <BrainCircuit size={22} className="animate-pulse" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Timestamp / Info Row */}
        <div className="flex items-center gap-3 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
           {!isUser && <span>Nova Neural Node</span>}
           {isUser && <span>Operator Protocol</span>}
           <span>•</span>
           <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Message Bubble */}
        <div className={`group relative px-8 py-6 rounded-[2.5rem] text-[15px] leading-relaxed border transition-all duration-500 ${isUser ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none shadow-xl shadow-blue-600/10' : 'bg-white/[0.03] text-zinc-200 border-white/5 rounded-tl-none'}`}>
          {message.attachments && message.attachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {message.attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                  <FileText size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black truncate max-w-[150px] text-zinc-100 uppercase tracking-tight">{file.name}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="break-words font-medium" ref={contentRef}>
            {renderContent(message.content)}
          </div>

          {message.videoUrl && (
            <div className="mt-8 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl bg-black relative aspect-video">
              <video 
                controls 
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              >
                <source src={message.videoUrl} type="video/mp4" />
              </video>
              <div className="absolute bottom-4 right-4 flex gap-2">
                 <a href={message.videoUrl} download className="p-2.5 bg-black/60 backdrop-blur-xl rounded-xl text-white hover:bg-emerald-600 transition-all"><Download size={16} /></a>
              </div>
            </div>
          )}

          {/* Assistant Action Tools */}
          {!isUser && (
            <div className="absolute -right-16 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
               <button onClick={handleCopy} title="Copy Intelligence" className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-zinc-500 hover:text-blue-400 transition-all">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
               </button>
               <button title="Share Neural Log" className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-zinc-500 hover:text-zinc-300 transition-all">
                  <Share2 size={16} />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
