import React, { useState, useEffect, useRef } from 'react';

const MockInterviewer = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAiText, setCurrentAiText] = useState('');
  const [transcript, setTranscript] = useState('');
  
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const accumulatedAiTextRef = useRef('');
  const currentSentenceRef = useRef('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize WebSocket
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/interview/${sessionId}`);

    wsRef.current.onmessage = (event) => {
      const token = event.data;
      if (token === '[DONE]') {
        // Stream finished: flush any remaining sentence buffer
        if (currentSentenceRef.current.trim().length > 0) {
            speak(currentSentenceRef.current);
        }
        setMessages((prev) => [...prev, { role: 'ai', content: accumulatedAiTextRef.current }]);
        
        // Reset buffers
        accumulatedAiTextRef.current = '';
        setCurrentAiText('');
        currentSentenceRef.current = '';
      } else {
        // Append token to buffers
        accumulatedAiTextRef.current += token;
        setCurrentAiText(accumulatedAiTextRef.current);
        currentSentenceRef.current += token;

        // Dynamic Sentence Parsing: Speak when punctuation is reached
        if (/[.!?]\s$/.test(currentSentenceRef.current) || /[.!?]$/.test(currentSentenceRef.current)) {
          speak(currentSentenceRef.current);
          currentSentenceRef.current = ''; // Clear buffer for next sentence
        }
      }
    };

    // 2. Initialize Speech-To-Text (Browser Native)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        // Ensure it keeps listening if user hasn't explicitly stopped it
        if (isRecording) {
          try { recognitionRef.current.start(); } catch(e){}
        }
      };
    } else {
      console.warn("Speech Recognition API is not supported in this browser.");
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, [sessionId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, currentAiText, transcript]);

  const speak = (text) => {
    if (!text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: tweak voice properties
    utterance.rate = 1.05; 
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartSpeaking = () => {
    window.speechSynthesis.cancel(); // Stop AI speaking to avoid echo
    setTranscript('');
    setIsRecording(true);
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const handleStopSpeaking = () => {
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    
    // Send transcribed text over WebSocket once user lets go of the button
    if (transcript.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
      wsRef.current.send(transcript);
      setTranscript('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-center shadow-sm z-10">
        <h2 className="text-lg font-bold text-slate-800 tracking-wide">Live AI Interview</h2>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Streaming AI Text */}
        {currentAiText && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm">
              {currentAiText} <span className="animate-pulse inline-block w-2 h-4 bg-slate-400 ml-1"></span>
            </div>
          </div>
        )}
        
        {/* Live User Transcript */}
        {transcript && (
          <div className="flex justify-end opacity-70">
            <div className="max-w-[75%] p-4 rounded-2xl bg-indigo-600 text-white rounded-br-none shadow-md">
              {transcript}
            </div>
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="p-8 bg-white border-t border-slate-200 flex justify-center items-center pb-12">
        <button
          onMouseDown={handleStartSpeaking}
          onMouseUp={handleStopSpeaking}
          onMouseLeave={isRecording ? handleStopSpeaking : undefined}
          onTouchStart={handleStartSpeaking}
          onTouchEnd={handleStopSpeaking}
          className={`px-10 py-5 rounded-full font-bold text-white transition-all transform select-none ${
            isRecording 
              ? 'bg-rose-500 scale-105 shadow-[0_0_25px_rgba(244,63,94,0.6)]' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
          }`}
        >
          {isRecording ? 'Release to Send' : 'Hold to Speak'}
        </button>
      </div>
    </div>
  );
};

export default MockInterviewer;
