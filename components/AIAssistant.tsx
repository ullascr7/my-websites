import React, { useState, useEffect, useRef } from 'react';
import { AiService, AIMode, GroundingChunk } from '../services/aiService';
import { MessageCircle, Zap, Globe, MapPin, BrainCircuit, Mic, X, Send, Volume2, Loader2, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  mode?: AIMode;
  grounding?: GroundingChunk[];
  isThinking?: boolean;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<AIMode>('chat');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Geolocation not available', err)
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, mode };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await AiService.generate(userMsg.text, mode, location);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "I couldn't generate a text response.",
        mode: mode,
        grounding: result.grounding
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error processing your request.",
        mode
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string, id: string) => {
    if (speakingId) return; // Prevent multiple streams for now
    setSpeakingId(id);
    try {
      const audioData = await AiService.speak(text);
      if (audioData) {
        await playAudio(audioData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSpeakingId(null);
    }
  };

  // Audio Decoding & Playback
  const playAudio = async (base64String: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    return new Promise<void>((resolve) => {
      source.onended = () => resolve();
    });
  };

  const ModeButton = ({ m, icon: Icon, label }: { m: AIMode, icon: any, label: string }) => (
    <button
      onClick={() => setMode(m)}
      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
        ${mode === m 
          ? 'bg-brand-600 text-white shadow-sm' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
      title={label}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 animate-bounce-subtle"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col transition-all duration-300 overflow-hidden
      ${isMinimized ? 'w-72 h-16' : 'w-[90vw] sm:w-[450px] h-[600px] max-h-[80vh]'}`}>
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-brand-500 rounded-lg">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <span className="font-semibold">Gemini Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Mode Selector */}
          <div className="p-3 border-b border-slate-100 bg-slate-50 overflow-x-auto">
            <div className="flex space-x-2">
              <ModeButton m="chat" icon={MessageCircle} label="Chat" />
              <ModeButton m="fast" icon={Zap} label="Fast" />
              <ModeButton m="think" icon={BrainCircuit} label="Think" />
              <ModeButton m="search" icon={Globe} label="Search" />
              <ModeButton m="maps" icon={MapPin} label="Maps" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 mt-20">
                <BrainCircuit size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">How can I help you today?</p>
                <div className="mt-4 text-xs grid grid-cols-2 gap-2 max-w-[280px] mx-auto">
                  <span className="p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50" onClick={() => { setMode('search'); setInput("Trending fashion news"); }}>
                    Find fashion trends
                  </span>
                  <span className="p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50" onClick={() => { setMode('maps'); setInput("Best electronics stores near me"); }}>
                    Locate nearby stores
                  </span>
                </div>
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm text-sm
                  ${msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                  
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  
                  {/* Grounding Info */}
                  {msg.grounding && msg.grounding.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs">
                      <p className="font-semibold mb-1 text-slate-500">Sources:</p>
                      <ul className="space-y-1">
                        {msg.grounding.map((chunk, idx) => (
                          <li key={idx} className="flex flex-col">
                            {chunk.web && (
                               <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate flex items-center">
                                 <Globe size={10} className="mr-1" /> {chunk.web.title}
                               </a>
                            )}
                            {chunk.maps && (
                               <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate flex items-center">
                                 <MapPin size={10} className="mr-1" /> {chunk.maps.title}
                               </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions for Bot Messages */}
                  {msg.role === 'model' && (
                    <div className="mt-2 flex items-center justify-end space-x-2">
                       <button 
                         onClick={() => handleSpeak(msg.text, msg.id)}
                         disabled={speakingId !== null}
                         className={`p-1 rounded-full hover:bg-slate-100 ${speakingId === msg.id ? 'text-brand-600 animate-pulse' : 'text-slate-400'}`}
                         title="Read Aloud"
                       >
                         {speakingId === msg.id ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                       </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-brand-600" />
                  <span className="text-xs text-slate-500">
                    {mode === 'think' ? 'Thinking deeply...' : 'Generating...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'search' ? "Search the web..." : mode === 'maps' ? "Find places..." : "Message Gemini..."}
                className="flex-grow bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
