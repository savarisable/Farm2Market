import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../types';
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../../services/api';
import { X, CheckCheck, Bell, TrendingUp, ShoppingBag, Truck, Sparkles, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsApi();
      if (res?.success && res.notifications) {
        setNotifications(res.notifications);
        if (onCountChange) onCountChange(res.unreadCount);
      }
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadApi();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (onCountChange) onCountChange(0);
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markNotificationReadApi(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      const remainingUnread = notifications.filter((n) => !n.isRead && n.id !== notif.id).length;
      if (onCountChange) onCountChange(remainingUnread);
    }
    if (notif.actionUrl) {
      onClose();
      navigate(notif.actionUrl);
    }
  };

  if (!isOpen) return null;

  const categories = ['ALL', 'MARKET', 'OFFERS', 'ORDERS', 'LOGISTICS', 'AI'];

  const filtered =
    selectedCategory === 'ALL'
      ? notifications
      : notifications.filter((n) => n.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MARKET':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'OFFERS':
      case 'ORDERS':
        return <ShoppingBag className="w-4 h-4 text-sky-600" />;
      case 'LOGISTICS':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'AI':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-forest-800" />
              <h3 className="text-base font-bold text-slate-900">Notification Center</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-100/70 border-b border-slate-200/80 overflow-x-auto text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-forest-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">No notifications in this category.</p>
              </div>
            ) : (
              filtered.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3 rounded-xl transition-all cursor-pointer ${
                    notif.isRead
                      ? 'hover:bg-slate-50 opacity-80'
                      : 'bg-emerald-50/50 hover:bg-emerald-50 border-l-4 border-emerald-600 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs flex-shrink-0">
                      {getCategoryIcon(notif.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">Farm2Market AI Real-time Decision Feed</p>
          </div>
        </div>
      </div>
    </div>
  );
};
