import { Link, Outlet, useLocation } from "react-router";
import {
  Search, Bell, ChevronDown, User, Key, RotateCcw, LogOut,
  Settings as SettingsIcon, Calendar, AlertCircle, Check,
  LayoutDashboard, Users, FileText, CreditCard, Building2,
  BookOpen, CalendarDays, ShieldCheck, UserPlus, UserCog,
  CalendarRange, Wrench, ShieldAlert, BarChart2, PieChart,
  HeartPulse, Receipt,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "sonner";

interface NavLink {
  name: string;
  path: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavSection {
  label: string;
  links: NavLink[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    links: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Membership",
    links: [
      { name: "Members", path: "/members", icon: Users },
      { name: "Contracts", path: "/contracts", icon: FileText },
      { name: "Plans", path: "/subscriptions/plans", icon: CreditCard },
    ],
  },
  {
    label: "Operations",
    links: [
      { name: "Clubs", path: "/clubs", icon: Building2 },
      { name: "Courses", path: "/courses", icon: BookOpen, exact: true },
      { name: "Schedule", path: "/courses/schedule", icon: CalendarDays },
      { name: "Access Control", path: "/access-control", icon: ShieldCheck },
      { name: "Guests", path: "/guests", icon: UserPlus },
    ],
  },
  {
    label: "Staff",
    links: [
      { name: "Employees", path: "/employees", icon: UserCog, exact: true },
      { name: "Shift Schedule", path: "/employees/schedule", icon: CalendarRange },
      { name: "Equipment", path: "/equipment", icon: Wrench },
    ],
  },
  {
    label: "Analytics",
    links: [
      { name: "Risk Scores", path: "/analytics/risk", icon: ShieldAlert },
      { name: "Frequency", path: "/analytics/frequency", icon: BarChart2 },
      { name: "Options", path: "/analytics/options", icon: PieChart },
      { name: "Health", path: "/analytics/health", icon: HeartPulse },
    ],
  },
  {
    label: "Billing",
    links: [
      { name: "Invoices", path: "/billing/invoices", icon: Receipt },
    ],
  },
];

function NavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const isActive = link.exact
    ? pathname === link.path
    : pathname === link.path || pathname.startsWith(link.path + "/") || (link.path !== "/" && pathname.startsWith(link.path));
  const Icon = link.icon;
  return (
    <Link
      to={link.path}
      className={`flex items-center gap-3 pl-6 pr-4 py-2.5 rounded-r-lg text-[14px] font-medium transition-all duration-200 mr-5 ${
        isActive
          ? "bg-[#4880FF] text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] translate-x-1"
          : "text-[#505050] hover:bg-[#F0F4FF] hover:text-[#4880FF] ml-3 pl-3 rounded-lg hover:translate-x-0.5"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {link.name}
    </Link>
  );
}

export function Layout() {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const languageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageRef.current && !languageRef.current.contains(event.target as Node))
        setLanguageOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node))
        setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node))
        setNotificationsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] text-[#202224]">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-white border-r border-[#E0E0E0] flex flex-col pt-7 pb-4">
        <div className="px-6 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-[#4880FF]">Riada</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EBEBFF] text-[#4880FF] uppercase tracking-wide">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-0">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-6 mb-1.5 text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">
                {section.label}
              </p>
              <nav className="flex flex-col gap-0.5">
                {section.links.map((link) => (
                  <NavItem key={link.path} link={link} pathname={location.pathname} />
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="mt-4 pt-4 border-t border-[#F0F0F0] flex flex-col gap-0.5">
          <Link
            to="/settings"
            className={`flex items-center gap-3 pl-6 pr-4 py-2.5 rounded-r-lg text-[14px] font-medium transition-all duration-200 mr-5 ${
              location.pathname === "/settings"
                ? "bg-[#4880FF] text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)]"
                : "text-[#505050] hover:bg-[#F0F4FF] hover:text-[#4880FF] ml-3 pl-3 rounded-lg"
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            Settings
          </Link>
          <Link
            to="/logout"
            className="flex items-center gap-3 ml-3 pl-3 pr-4 py-2.5 mr-5 rounded-lg text-[14px] font-medium text-[#505050] hover:bg-[#FFF0F0] hover:text-[#EF3826] transition-all duration-200"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[70px] bg-white border-b border-[#E0E0E0] flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex-1 max-w-[400px]">
            <div className="relative">
              <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#A6A6A6]" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-[46px] pr-4 py-2.5 bg-[#F5F6FA] border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#4880FF] text-[#202224] placeholder-[#A6A6A6]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 relative">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); setLanguageOpen(false); setProfileOpen(false); }}
                className="relative p-2 text-[#4880FF] hover:bg-gray-50 rounded-full transition-colors"
              >
                <Bell className="w-6 h-6 fill-current" />
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4747] text-[10px] font-bold text-white border-2 border-white">
                  6
                </span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    key="notifications-menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E0E0E0] overflow-hidden z-50"
                  >
                    <div className="px-6 py-4 border-b border-[#F0F0F0]">
                      <h3 className="text-[15px] font-semibold text-[#202224]">Notifications</h3>
                    </div>
                    <div className="flex flex-col py-2">
                      {[
                        { icon: ShieldAlert, color: "bg-[#FFF0F0]", iconColor: "text-[#FF4747]", title: "Overdue invoices", sub: "3 members have unpaid balances" },
                        { icon: UserPlus, color: "bg-[#E0F8EA]", iconColor: "text-[#00B69B]", title: "New member registered", sub: "Jean Dupont joined Brussels" },
                        { icon: Wrench, color: "bg-[#FFF3D6]", iconColor: "text-[#FF9066]", title: "Equipment alert", sub: "Treadmill #4 needs maintenance" },
                        { icon: SettingsIcon, color: "bg-[#EBEBFF]", iconColor: "text-[#4880FF]", title: "System update", sub: "Dashboard updated successfully" },
                      ].map(({ icon: Icon, color, iconColor, title, sub }) => (
                        <div key={title} className="flex items-center px-6 py-3 hover:bg-[#F8FAFF] cursor-pointer transition-colors">
                          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 mr-4`}>
                            <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#202224]">{title}</p>
                            <p className="text-[12px] text-[#A6A6A6] truncate">{sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="py-3 border-t border-[#F0F0F0] text-center bg-white cursor-pointer hover:bg-[#F8FAFF] transition-colors">
                      <span className="text-[13px] font-semibold text-[#4880FF]">View all notifications</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language */}
            <div className="relative" ref={languageRef}>
              <div
                className="flex items-center space-x-2 cursor-pointer hover:opacity-80 py-2 group"
                onClick={() => { setLanguageOpen(!languageOpen); setProfileOpen(false); setNotificationsOpen(false); }}
              >
                <img src="https://flagcdn.com/w40/gb.png" alt="UK Flag" className="w-[30px] h-[20px] rounded-sm shadow-sm object-cover group-hover:scale-105 transition-transform" />
                <span className="text-sm font-semibold text-[#646464] group-hover:text-[#4880FF] transition-colors">English</span>
                <ChevronDown className={`w-[14px] h-[14px] text-[#646464] transition-transform ${languageOpen ? "rotate-180 text-[#4880FF]" : "group-hover:text-[#4880FF]"}`} />
              </div>

              <AnimatePresence>
                {languageOpen && (
                  <motion.div
                    key="language-menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E0E0E0] py-3 z-50"
                  >
                    <p className="px-5 pb-2 text-[11px] font-bold text-[#A6A6A6] uppercase tracking-wider">Language</p>
                    {[
                      { flag: "gb", label: "English", active: true },
                      { flag: "fr", label: "French", active: false },
                      { flag: "nl", label: "Dutch", active: false },
                    ].map(({ flag, label, active }) => (
                      <div key={label} className="flex items-center justify-between px-5 py-2.5 hover:bg-[#F8FAFF] cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                          <img src={`https://flagcdn.com/w40/${flag}.png`} alt={label} className="w-[28px] h-[18px] rounded-sm shadow-sm object-cover" />
                          <span className="text-[13px] font-medium text-[#202224] group-hover:text-[#4880FF] transition-colors">{label}</span>
                        </div>
                        {active && <Check className="w-4 h-4 text-[#4880FF]" />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <div
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80 py-2 group"
                onClick={() => { setProfileOpen(!profileOpen); setLanguageOpen(false); setNotificationsOpen(false); }}
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User Avatar"
                  className="w-[44px] h-[44px] rounded-full object-cover border-2 border-transparent group-hover:border-[#4880FF] transition-all duration-300 shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#404040] group-hover:text-[#4880FF] transition-colors">Moni Roy</span>
                  <span className="text-[12px] font-medium text-[#828282]">Manager</span>
                </div>
                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#E0E0E0] group-hover:border-[#4880FF] transition-colors">
                  <ChevronDown className={`w-3 h-3 text-[#A6A6A6] transition-transform ${profileOpen ? "rotate-180 text-[#4880FF]" : "group-hover:text-[#4880FF]"}`} />
                </div>
              </div>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    key="profile-menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E0E0E0] py-3 z-50"
                  >
                    <div className="flex flex-col">
                      <Link to="/settings" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFF] transition-all group">
                        <User className="w-4 h-4 text-[#4880FF]" />
                        <span className="text-[13px] font-medium text-[#202224] group-hover:text-[#4880FF] transition-colors">My Profile</span>
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFF] transition-all group">
                        <Key className="w-4 h-4 text-[#FF479A]" />
                        <span className="text-[13px] font-medium text-[#202224] group-hover:text-[#FF479A] transition-colors">Change Password</span>
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFF] transition-all group">
                        <RotateCcw className="w-4 h-4 text-[#B548C6]" />
                        <span className="text-[13px] font-medium text-[#202224] group-hover:text-[#B548C6] transition-colors">Activity Log</span>
                      </Link>
                      <div className="w-full h-px bg-[#F0F0F0] my-1" />
                      <Link to="/logout" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FFF0F0] transition-all group">
                        <LogOut className="w-4 h-4 text-[#EF3826]" />
                        <span className="text-[13px] font-medium text-[#202224] group-hover:text-[#EF3826] transition-colors">Log out</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
