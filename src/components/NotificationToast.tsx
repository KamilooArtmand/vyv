import React, { useEffect } from 'react';
import { NotificationItem } from '../types';
import { Bell, X } from 'lucide-react';

interface NotificationToastProps {
  notification: NotificationItem | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div
      dir="ltr"
      className="fixed top-6 right-6 z-50 max-w-sm w-full bg-zinc-900/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-slide-up"
    >
      {notification.imageUrl && (
        <div className="h-28 w-full overflow-hidden relative">
          <img
            src={notification.imageUrl}
            alt={notification.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30"></div>
        </div>
      )}

      <div className="p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
            <Bell size={16} />
          </div>
          <div className="pl-1 pr-6">
            <h4 className="text-sm font-bold text-white mb-1 leading-snug">{notification.title}</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">{notification.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
