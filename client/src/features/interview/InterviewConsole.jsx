import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, StopCircle, MessageSquare,
    Clock, Monitor, Info, AlertCircle,
    CheckCircle2, Loader2, Sparkles, Volume2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InterviewConsole = ({ sessionData, onComplete, onCancel }) => {
    const { socket } = useAuth();
    const [status, setStatus] = useState('active'); // active, ending
    const [transcript, setTranscript] = useState([]);
    const [isMicActive, setIsMicActive] = useState(true);
    const [timer, setTimer] = useState(0);
    const [aiIsSpeaking, setAiIsSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const scrollRef = useRef(null);
    const timerRef = useRef(null);
    const [audioData, setAudioData] = useState(new Array(20).fill(10));

    useEffect(() => {
        if (!socket) return;

        // Transcript handling
        const handleTranscript = (data) => {
            setTranscript(prev => [...prev, data]);
            if (data.role === 'ai') {
                setAiIsSpeaking(false);
                // Simulate AI stopped speaking visually
            }
        };

        const handleAiAudio = () => {
            setAiIsSpeaking(true);
            // Visualizer pulse for AI speaking
            setAudioData(prev => prev.map(() => Math.random() * 80 + 20));
        };

        const handleError = (data) => {
            setError(data.message);
        };

        socket.on('interview:transcript', handleTranscript);
        socket.on('interview:ai_audio', handleAiAudio);
        socket.on('interview:error', handleError);

        // Timer
        timerRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);

        return () => {
            socket.off('interview:transcript', handleTranscript);
            socket.off('interview:ai_audio', handleAiAudio);
            socket.off('interview:error', handleError);
            clearInterval(timerRef.current);
        };
    }, [socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (feedback) {
        // ... Feedback UI ...
        return null; // For now
    }

    return (
        <div className="w-full h-full min-h-[600px] flex flex-col gap-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 glass-card bg-slate-900/50 border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                        <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">{sessionData?.opportunityTitle || 'Technical Interview'}</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Neural Link Established</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">Session Duration</p>
                        <p className="text-sm font-black text-white font-mono">{formatTime(timer)}</p>
                    </div>
                    <button
                        onClick={onComplete}
                        className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all border border-white/5 hover:border-red-500/30"
                    >
                        <StopCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Console */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                <div className="lg:col-span-5 glass-card bg-slate-900/40 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent pointer-events-none" />

                    <div className="relative mb-12">
                        <motion.div
                            animate={{
                                scale: aiIsSpeaking ? [1, 1.2, 1] : 1,
                                opacity: aiIsSpeaking ? [0.2, 0.5, 0.2] : 0.1
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-primary-500 rounded-full blur-3xl"
                        />
                        <div className={`w-40 h-40 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-500 ${aiIsSpeaking ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-white/10 bg-slate-950/50'}`}>
                            {aiIsSpeaking ? (
                                <Volume2 className="w-16 h-16 text-primary-500" />
                            ) : (
                                <Mic className={`w-16 h-16 ${isMicActive ? 'text-primary-500' : 'text-slate-600'}`} />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-1.5 h-12 items-end mb-12">
                        {audioData.map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: aiIsSpeaking ? [`${h}%`, `${h * 1.5}%`, `${h}%`] : '10%' }}
                                transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
                                className={`w-1.5 rounded-full ${aiIsSpeaking ? 'bg-primary-500/60' : 'bg-slate-700'}`}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isMicActive ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isMicActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                            {isMicActive ? 'Mic Active' : 'Mic Muted'}
                        </div>
                        {/* Mic toggle logic handled by parent or just internal state if needed */}
                    </div>
                </div>

                <div className="lg:col-span-7 glass-card bg-slate-900/40 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary-500" />
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Transcript</h3>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {transcript.map((msg, idx) => (
                            <motion.div initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} key={idx} className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${msg.role === 'ai' ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' : 'bg-primary-600 text-white rounded-tr-none'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[8px] font-black text-slate-600 mt-2 uppercase tracking-widest">
                                    {msg.role === 'ai' ? 'Interviewer' : 'Subject'} • {new Date().toLocaleTimeString()}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 shadow-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
            )}
        </div>
    );
};

export default InterviewConsole;
