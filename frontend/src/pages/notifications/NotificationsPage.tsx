import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  TrendingUp,
  Package,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle
} from 'lucide-react';
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MARKET' | 'ORDER' | 'SYSTEM'>('ALL');

  async function loadNotifications() {
    try {
      setLoading(true);
      const res = await getNotificationsApi();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkAsRead(id: string) {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  }

  const filtered = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.category === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MARKET':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'ORDER':
        return <Package className="w-4 h-4 text-sky-600" />;
      case 'QUALITY':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            Notifications & AI Alerts
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time price spikes, order updates, demand shifts and logistics schedules.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
        {(['ALL', 'MARKET', 'ORDER', 'SYSTEM'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'ALL' ? 'All Alerts' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">All caught up!</h3>
          <p className="text-xs text-gray-400 mt-1">No pending notifications in this category.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all ${
                n.isRead
                  ? 'bg-white border-gray-200/70 opacity-80'
                  : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-2xs border border-gray-100 mt-0.5">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                      <Badge variant="neutral" size="sm" className="text-[10px] py-0 px-1.5">
                        {n.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {n.actionUrl && (
                        <Link
                          to={n.actionUrl}
                          className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                        >
                          View Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-xs font-semibold text-gray-400 hover:text-emerald-700 transition-colors p-1"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
