import React, { useState } from 'react';

const NotificationBell = ({ notifications, unreadCount, onClear }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if(!open) onClear(); }} className="relative p-2 text-gray-400 hover:text-white">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-[#2b2d31] border border-[#1f2023] rounded shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-2 font-bold text-gray-300 text-sm border-b border-[#1f2023]">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">No notifications</div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="p-2 hover:bg-[#35373c] cursor-pointer border-b border-[#1f2023] last:border-0">
                 <div className="text-xs text-white font-bold">{n.type === 'mention' ? 'Mentioned by' : 'New message from'} {n.senderName}</div>
                 <div className="text-xs text-gray-400 truncate">{n.content}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
