import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  FileCode,
  Send,
  BarChart3,
  UserCog,
  Settings,
  User,
  LogOut,
  MailCheck,
  Menu,
  X,
  Bell,
  LineChart,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const allNavigation = [
    { name: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
    { name: t.nav.analytics, href: '/analytics', icon: LineChart, adminOnly: false },
    { name: t.nav.subscribers, href: '/subscribers', icon: Users, adminOnly: false },
    { name: t.nav.templates, href: '/templates', icon: FileCode, adminOnly: false },
    { name: t.nav.campaigns, href: '/campaigns', icon: Send, adminOnly: false },
    { name: t.nav.reports, href: '/reports', icon: BarChart3, adminOnly: false },
    { name: t.nav.users, href: '/users', icon: UserCog, adminOnly: true },
    { name: t.nav.settings, href: '/settings', icon: Settings, adminOnly: true },
    { name: t.nav.profile, href: '/profile', icon: User, adminOnly: false },
  ];

  const navigation = allNavigation.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 antialiased font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <MailCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-none">
                MailPulse
              </span>
              <span className="text-[10px] text-purple-600 font-bold tracking-wider uppercase">
                {t.nav.platform}
              </span>
            </div>
          </NavLink>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.nav.mainMenu}</p>
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span className="flex-1">{item.name}</span>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate text-xs">
                <p className="font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-slate-500 truncate text-[11px]">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title={t.nav.logout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Navbar */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.nav.systemOnline}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100/80 rounded-xl p-1 text-xs font-bold">
              <button
                onClick={() => setLanguage('tr')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  language === 'tr' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🇹🇷 TR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  language === 'en' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🇺🇸 EN
              </button>
            </div>

            {/* Swagger Docs Link */}
            <a
              href="http://localhost:5000/swagger"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {t.nav.swaggerDocs} <ExternalLink className="h-3 w-3" />
            </a>

            {/* Notifications Button */}
            <button
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition relative"
              title={t.nav.notifications}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Profile Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-2xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block text-xs font-bold text-slate-800">{user?.fullName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-20 py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.fullName}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                    </div>
                    <NavLink
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <User className="h-3.5 w-3.5" /> {t.nav.accountSettings}
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <Settings className="h-3.5 w-3.5" /> {t.nav.settings}
                      </NavLink>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" /> {t.nav.logout}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* View Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
