import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  MapPin,
  Sparkles,
  Users,
  Store,
  PlusCircle,
  FileText,
  ShoppingBag,
  Truck,
  Layers,
  BarChart3,
  Compass,
  QrCode,
  Wallet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Map,
  User,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenProfile?: () => void;
  onNavClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, onOpenProfile, onNavClick }) => {
  const { user, role, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation schema configured by role using t() for live i18n
  const farmerLinks = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/my-crops', label: t('myCrops'), icon: Sprout },
    { to: '/market-intelligence', label: t('marketIntel'), icon: TrendingUp },
    { to: '/best-market', label: t('findBestMarket'), icon: MapPin, highlight: true },
    { to: '/find-buyers', label: t('findBuyers'), icon: Users },
    { to: '/negotiations', label: t('offersNegotiations'), icon: FileText },
    { to: '/crop-planning', label: t('cropPlanning'), icon: Compass, highlight: true },
    { to: '/quality-assessment', label: t('qualityAssessment'), icon: Sparkles },
    { to: '/orders', label: t('orders'), icon: ShoppingBag },
    { to: '/logistics', label: t('logistics'), icon: Truck },
    { to: '/earnings', label: t('earnings'), icon: Wallet },
    { to: '/passport/MH-AMR-COT-FAM1', label: t('cropPassport'), icon: QrCode },
  ];

  const buyerLinks = [
    { to: '/buyer', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/post-requirement', label: 'Post Requirement', icon: PlusCircle, highlight: true },
    { to: '/farmer-marketplace', label: 'Farmer Marketplace', icon: Store },
    { to: '/bulk-marketplace', label: 'Bulk Institutional Orders', icon: Layers },
    { to: '/negotiations', label: t('offersNegotiations'), icon: FileText },
    { to: '/orders', label: t('orders'), icon: ShoppingBag },
    { to: '/logistics', label: t('logistics'), icon: Truck },
  ];

  const fpoLinks = [
    { to: '/fpo', label: 'FPO Dashboard', icon: LayoutDashboard },
    { to: '/fpo-aggregation', label: 'Volume Aggregation', icon: Layers, highlight: true },
    { to: '/farmer-marketplace', label: 'Available Supply', icon: Store },
    { to: '/bulk-marketplace', label: 'Bulk Orders', icon: ShoppingBag },
    { to: '/logistics', label: 'Consolidated Freight', icon: Truck },
    { to: '/orders', label: t('orders'), icon: FileText },
  ];

  const consumerLinks = [
    { to: '/consumer', label: 'Farm Fresh Market', icon: Store, highlight: true },
    { to: '/transparency', label: 'Price Transparency', icon: BarChart3 },
    { to: '/passport/MH-NAS-TOM-26091', label: t('cropPassport'), icon: QrCode },
    { to: '/orders', label: t('orders'), icon: ShoppingBag },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Overview', icon: ShieldCheck },
    { to: '/admin/regional', label: 'Regional Intelligence', icon: Map, highlight: true },
    { to: '/admin/impact', label: 'Platform Impact Simulator', icon: BarChart3 },
    { to: '/market-intelligence', label: t('marketIntel'), icon: TrendingUp },
    { to: '/logistics', label: t('logistics'), icon: Truck },
    { to: '/orders', label: t('orders'), icon: FileText },
  ];

  let currentNav = farmerLinks;
  if (role === 'BUYER') currentNav = buyerLinks;
  else if (role === 'FPO') currentNav = fpoLinks;
  else if (role === 'CONSUMER') currentNav = consumerLinks;
  else if (role === 'ADMIN') currentNav = adminLinks;

  return (
    <aside
      className={`h-full transition-all duration-300 bg-forest-950 text-white border-r border-forest-900 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-forest-900/60 bg-forest-950">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl">🌾</span>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight leading-none">
                  FARM2MARKET <span className="text-agri-400">SmartMandi</span>
                </h1>
                <p className="text-[10px] text-forest-300 font-medium tracking-wider uppercase mt-0.5">
                  Direct Agri-Commerce Engine
                </p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl">🌾</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-forest-300 hover:text-white hover:bg-forest-900/60 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Badge & Edit Profile Trigger */}
        {!isCollapsed && user && (
          <div
            onClick={onOpenProfile}
            className="mx-3 mt-3 px-3 py-2 rounded-lg bg-forest-900/50 border border-forest-800/60 flex items-center justify-between hover:bg-forest-900/80 transition-all cursor-pointer group"
            title="Click to edit profile"
          >
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate group-hover:text-agri-300 transition-colors">
                {user.name}
              </p>
              <p className="text-[11px] text-forest-300 truncate">{user.location}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-agri-600 text-white">
                {role}
              </span>
              <User className="w-3.5 h-3.5 text-forest-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-4 px-2.5 space-y-1 max-h-[calc(100vh-210px)] overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-agri-600 text-white font-semibold shadow-xs'
                      : 'text-forest-200 hover:text-white hover:bg-forest-900/60'
                  } ${item.highlight && !isCollapsed ? 'ring-1 ring-agri-400/40' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${item.highlight ? 'text-agri-300' : ''}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-forest-900/60 bg-forest-950">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors cursor-pointer"
          title={t('signOut')}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>{t('signOut')}</span>}
        </button>
      </div>
    </aside>
  );
};
