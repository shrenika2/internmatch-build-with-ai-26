import React from 'react';

const MembersList = ({ members, onlineUserIds = [] }) => {
  // Safe members array
  const safeMembers = Array.isArray(members) ? members : [];

  return (
    <div className="w-60 bg-gray-900 h-full border-l border-gray-800 p-3 overflow-y-auto hidden md:block flex-shrink-0">
       {/* Online Category */}
       <div className="mb-4">
           <div className="px-2 mb-1 text-xs font-bold text-gray-400 uppercase">
               Online — {onlineUserIds.length}
           </div>
           {safeMembers.filter(m => onlineUserIds.includes(m._id)).map(m => (
                <div key={m._id} className="flex items-center px-2 py-1 rounded hover:bg-gray-800 cursor-pointer opacity-100">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-xs mr-2 relative">
                        {m.name[0]}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    </div>
                    <span className="text-gray-300 text-sm font-medium truncate">
                        {m.name}
                    </span>
                </div>
           ))}
           {/* Fallback showing current user if list empty implies self */}
           {onlineUserIds.length === 0 && <div className="text-gray-600 text-xs px-2 italic">You are online</div>}
       </div>

       {/* Offline Category */}
       <div className="mb-4">
           <div className="px-2 mb-1 text-xs font-bold text-gray-400 uppercase">
               Offline
           </div>
           {safeMembers.filter(m => !onlineUserIds.includes(m._id)).map(m => (
                <div key={m._id} className="flex items-center px-2 py-1 rounded hover:bg-gray-800 cursor-pointer opacity-50 hover:opacity-100">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-xs mr-2">
                        {m.name[0]}
                    </div>
                    <span className="text-gray-400 text-sm truncate">
                        {m.name}
                    </span>
                </div>
           ))}
       </div>
    </div>
  );
};

export default MembersList;
