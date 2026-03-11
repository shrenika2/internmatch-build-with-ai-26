import React, { useState } from 'react';

const MessageInput = ({ onSendMessage, onTyping, placeholder = "Message" }) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = React.useRef(null);

  const handleChange = (e) => {
      const val = e.target.value;
      setText(val);
      
      if (onTyping) {
          onTyping(true);
          // Debounce stop typing
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
              onTyping(false);
          }, 2000);
      }
  };

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // Parent handles socket emit
    onSendMessage(text);
    
    // Clear input
    setText('');
    
    // Stop typing indicator
    if (onTyping) {
        clearTimeout(typingTimeoutRef.current);
        onTyping(false);
    }
  };

  return (
    <div className="px-4 pb-6 bg-[#313338]">
      <form onSubmit={send} className="bg-[#383a40] rounded-lg flex items-center px-4 py-2.5">
        <button type="button" className="p-1 mr-3 bg-[#b5bac1] rounded-full hover:text-white transition-colors flex items-center justify-center w-6 h-6">
           <span className="text-[#383a40] font-bold text-lg leading-none mb-[2px]">+</span>
        </button>
        <input 
          className="bg-transparent flex-1 text-[#dbdee1] placeholder-[#949ba4] outline-none font-light"
          placeholder={placeholder}
          value={text}
          onChange={handleChange}
        />
        {/* Optional: Emoji/Gif icons could go here */}
      </form>
    </div>
  );
};

export default MessageInput;
