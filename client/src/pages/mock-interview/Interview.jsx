import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Mic, StopCircle, ArrowRight, Bot, ShieldAlert, Monitor } from 'lucide-react';

import API from '../../utils/api';
import { toast } from 'react-hot-toast';

const Interview = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [questions, setQuestions] = useState([]);
    const [loadingQs, setLoadingQs] = useState(true);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const videoRef = useRef(null);
    // streamRef holds the live MediaStream so the cleanup function is never stale
    const streamRef = useRef(null);

    // --- Guard Clause: redirect if user refreshes and loses location.state ---
    useEffect(() => {
        if (!location.state) {
            navigate('/student/mock-interview/setup', { replace: true });
        }
    }, [location.state, navigate]);

    const isLastQuestion = questions.length > 0 && currentQuestionIdx === questions.length - 1;

    useEffect(() => {
        const fetchQuestions = async () => {
            const { jobRole = 'Software Engineer', experience = '0' } = location.state || {};
            try {
                const { data } = await API.post('/ai/generate-questions', { jobRole, experience });
                if (data.success && data.questions) {
                    setQuestions(data.questions);
                } else {
                    setQuestions(["Tell me about your technical background.", "What are your strongest skills?"]);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to generate AI questions');
                setQuestions(["Tell me about your technical background.", "What are your strongest skills?"]);
            } finally {
                setLoadingQs(false);
            }
        };

        fetchQuestions();

        // Initialize Webcam locally using native browser APIs to avoid heavy external libraries
        const initWebcam = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = mediaStream; // store in ref so cleanup is never stale
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Failed to access webcam:", err);
                setError('Camera/Microphone access denied. Please allow permissions to proceed.');
            }
        };

        initWebcam();

        return () => {
            // Use streamRef to guarantee we stop the *actual* media stream,
            // not the stale closure value of `stream` state.
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            handleEndInterview();
        }
    };

    const handleEndInterview = () => {
        // Stop tracks using the ref which always holds the live stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        const { jobRole = 'Software Engineer' } = location.state || {};
        const answeredQuestions = questions.slice(0, currentQuestionIdx + 1);

        navigate('/student/mock-interview/results/1', {
            state: { jobRole, answeredQuestions }
        });
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
            <div className="flex items-center justify-between mb-8 glass-card p-4 px-6 border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600/20 text-primary-500 rounded-xl flex items-center justify-center">
                        <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-tight">
                            Live Interview Session
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                Recording Active
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest bg-slate-900 border border-white/5 py-2 px-4 rounded-xl">
                    Question {questions.length > 0 ? currentQuestionIdx + 1 : 0} of {questions.length}
                </div>

                <button
                    onClick={handleEndInterview}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-colors border border-red-500/20"
                >
                    <StopCircle className="w-4 h-4" /> End Early
                </button>
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Video Feed */}
                <div className="lg:col-span-8 glass-card bg-slate-900/50 p-4 flex flex-col relative overflow-hidden h-[500px] lg:h-auto">
                    {error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-10 p-8 text-center">
                            <ShieldAlert className="w-12 h-12 text-yellow-500 mb-4" />
                            <p className="text-white font-bold">{error}</p>
                            <p className="text-sm text-slate-400 mt-2">We require your camera and mic to conduct the AI evaluation.</p>
                        </div>
                    ) : null}

                    {/* Simple Native Video Element Wrapper */}
                    <div className="flex-grow bg-[#050505] rounded-2xl overflow-hidden relative border border-white/5">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted // mute own audio to avoid feedback
                            className="w-full h-full object-cover transform -scale-x-100" // Mirrors the webcam
                        />

                        <div className="absolute bottom-6 mx-auto inset-x-0 w-max px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-4">
                            <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-wider">
                                <Video className="w-4 h-4 text-green-400" /> Cam Active
                            </div>
                            <div className="w-px h-4 bg-white/20" />
                            <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-wider">
                                <Mic className="w-4 h-4 text-green-400" /> Mic Active
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Question console */}
                <div className="lg:col-span-4 glass-card bg-slate-900/40 p-6 flex flex-col h-[500px] lg:h-auto">
                    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                        <Bot className="w-5 h-5 text-primary-500" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            AI Output Monitor
                        </h3>
                    </div>

                    <div className="flex-grow flex flex-col">
                        <motion.div
                            key={currentQuestionIdx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-primary-500/10 border border-primary-500/20 p-6 rounded-2xl relative"
                        >
                            <div className="absolute -top-3 left-6 px-2 bg-slate-950 text-[9px] font-black text-primary-400 uppercase tracking-widest border border-primary-500/20 rounded">
                                Question Agent
                            </div>
                            <p className="text-white text-lg font-medium leading-relaxed">
                                {loadingQs ? "Initializing Neural Link... Generating tailored questions based on your profile." : questions[currentQuestionIdx]}
                            </p>
                        </motion.div>

                        <div className="mt-8">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black text-center mb-6">
                                Speak your answer clearly. Click next when completed.
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button
                            onClick={handleNext}
                            disabled={loadingQs}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${loadingQs
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/20'
                                }`}
                        >
                            {isLastQuestion ? 'Finish Evaluation' : 'Next Question'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Interview;
