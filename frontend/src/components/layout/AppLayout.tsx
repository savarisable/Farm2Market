import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { MultilingualChatbot } from '../ai/MultilingualChatbot';
import { EditProfileModal } from '../common/EditProfileModal';
import { getNotificationsApi } from '../../services/api';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setIsMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Fetch real unread notification count
  useEffect(() => {
    if (isAuthenticated) {
      getNotificationsApi()
        .then((res) => {
          if (res?.success && Array.isArray(res.notifications)) {
            const unread = res.notifications.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Mandatory login enforcement for inner portal access
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar — slides in as overlay on mobile, fixed on desktop */}
      <div
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onOpenProfile={() => { setIsProfileOpen(true); setIsMobileOpen(false); }}
          onNavClick={() => setIsMobileOpen(false)}
        />
      </div>

      {/* Main Content Area — full width on mobile, offset sidebar width on desktop */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 lg:${
          isCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Persistent Topbar */}
        <Topbar
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={unreadCount}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onCountChange={(cnt) => setUnreadCount(cnt)}
      />

      {/* Omnipresent Multilingual Saarthi AI Assistant */}
      <MultilingualChatbot />

      {/* Profile Editor Modal */}
      <EditProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
