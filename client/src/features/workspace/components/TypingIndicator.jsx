import React from 'react';

const TypingIndicator = ({ typings }) => {
  if (!typings || typings.length === 0) return null;

  return (
    <div className="flex items-center space-x-1 p-2 bg-transparent absolute bottom-[4rem] left-4 z-20 animate-pulse">
      <div className="flex space-x-1">
          <div className="w-2 h-2 bg-[#dbdee1] rounded-full animate-bounce delay-75"></div>
          <div className="w-2 h-2 bg-[#dbdee1] rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-[#dbdee1] rounded-full animate-bounce delay-300"></div>
      </div>
      <span className="text-xs font-bold text-[#dbdee1] ml-2">
        {typings.length === 1 
            ? `${typings[0]} is typing...` 
            : typings.length === 2 
                ? `${typings[0]} and ${typings[1]} are typing...` 
                : 'Several people are typing...'}
      </span>
    </div>
  );
};

export default TypingIndicator;
