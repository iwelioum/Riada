import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  Users, FileText, Euro, AlertTriangle, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, Clock, Dumbbell, Wrench, BookOpen,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

const MONTHLY_REVENUE = [
  { month: "Apr", revenue: 28400, contracts: 580 },
  { month: "May", revenue: 31200, contracts: 601 },
  { month: "Jun", revenue: 29800, contracts: 595 },
  { month: "Jul", revenue: 33100, contracts: 618 },
  { month: "Aug", revenue: 35600, contracts: 629 },
  { month: "Sep", revenue: 34200, contracts: 623 },
  { month: "Oct", revenue: 36800, contracts: 638 },
  { month: "Nov", revenue: 35100, contracts: 630 },
  { month: "Dec", revenue: 37400, contracts: 644 },
  { month: "Jan", revenue: 36900, contracts: 641 },
  { month: "Feb", revenue: 37800, contracts: 648 },
  { month: "Mar", revenue: 38420, contracts: 651 },
];

const MEMBER_STATUS_DATA = [
  { label: "Active", value: 782, color: "#00B69B", bg: "bg-[#E0F8EA]" },
  { label: "Suspended", value: 65, color: "#FF9066", bg: "bg-[#FFF3D6]" },
  { label: "Anonymized", value: 12, color: "#A6A6A6", bg: "bg-[#F5F6FA]" },
];

const RECENT_ACCESS = [
  { memberName: "Jean Dupont", club: "Brussels", time: "11:45", result: "Granted" as const },
  { memberName: "Clara Morin", club: "Brussels", time: "11:07", result: "Denied" as const },
  { memberName: "Pierre Dumont", club: "Brussels", time: "10:22", result: "Denied" as const },
  { memberName: "Sophie Leroy", club: "Brussels", time: "10:05", result: "Granted" as const },
  { memberName: "Unknown", club: "Namur", time: "09:01", result: "Denied" as const },
];

const UPCOMING_SESSIONS = [
  { course: "Power Yoga", instructor: "M. Laurent", club: "Brussels", time: "14:00", capacity: 20, enrolled: 18 },
  { course: "HIIT Cardio", instructor: "R. Moreau", club: "Liège", time: "15:30", capacity: 15, enrolled: 15 },
  { course: "Pilates", instructor: "S. Dupuis", club: "Brussels", time: "17:00", capacity: 12, enrolled: 7 },
  { course: "Boxing", instructor: "K. Osei", club: "Namur", time: "18:30", capacity: 10, enrolled: 10 },
];

const EQUIPMENT_SUMMARY = [
  { label: "In Service", count: 142, color: "text-[#00B69B]", bg: "bg-[#E0F8EA]", icon: Dumbbell },
  { label: "Maintenance", count: 8, color: "text-[#FF9066]", bg: "bg-[#FFF3D6]", icon: Wrench },
  { label: "Broken", count: 3, color: "text-[#FF4747]", bg: "bg-[#FFF0F0]", icon: AlertTriangle },
];

const KPI_CARDS = [
  {
    label: "Active Members",
    value: "782",
    sub: "out of 859 total",
    trend: +5.2,
    trendLabel: "vs last month",
    icon: Users,
    accent: "#4880FF",
    bg: "bg-[#EBEBFF]",
    border: "border-[#4880FF]/10",
    link: "/members",
  },
  {
    label: "Active Contracts",
    value: "651",
    sub: "23 expiring soon",
    trend: +2.1,
    trendLabel: "vs last month",
    icon: FileText,
    accent: "#00B69B",
    bg: "bg-[#E0F8EA]",
    border: "border-[#00B69B]/10",
    link: "/contracts",
  },
  {
    label: "Revenue (March)",
    value: "38 420 €",
    sub: "from 651 invoices",
    trend: +6.2,
    trendLabel: "vs February",
    icon: Euro,
    accent: "#8B5CF6",
    bg: "bg-[#F3F0FF]",
    border: "border-[#8B5CF6]/10",
    link: "/billing/invoices",
  },
  {
    label: "Overdue Invoices",
    value: "18",
    sub: "2 847 € outstanding",
    trend: -3,
    trendLabel: "vs last week",
    icon: AlertTriangle,
    accent: "#FF4747",
    bg: "bg-[#FFF0F0]",
    border: "border-[#FF4747]/10",
    link: "/billing/invoices",
  },
];

export function Dashboard() {
  const totalMembers = MEMBER_STATUS_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#F5F6FA]">
      <div className="p-8 flex flex-col gap-7">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Wednesday, 18 March 2026</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {KPI_CARDS.map(({ label, value, sub, trend, trendLabel, icon: Icon, accent, bg, border, link }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-white rounded-2xl p-5 shadow-sm border ${border} hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => window.location.href = link}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-[#00B69B]" : "text-[#FF4747]"}`}
                >
                  {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(trend)}%
                </span>
              </div>
              <p className="text-2xl font-black text-[#111827] leading-tight">{value}</p>
              <p className="text-[13px] font-semibold text-[#6B7280] mt-0.5">{label}</p>
              <p className="text-[11px] text-[#A6A6A6] mt-1">{sub} · {trendLabel}</p>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart + Member Status */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[17px] font-bold text-[#111827]">Monthly Revenue</h2>
                <p className="text-sm text-[#6B7280]">Last 12 months</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#4880FF]">
                  <span className="w-3 h-1.5 rounded-full bg-[#4880FF] inline-block" /> Revenue (€)
                </span>
              </div>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4880FF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4880FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#A6A6A6", fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#A6A6A6", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", fontSize: 13 }}
                    formatter={(v: number) => [`${v.toLocaleString("fr-BE")} €`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4880FF" strokeWidth={3} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#4880FF" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Member status breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0] flex flex-col"
          >
            <h2 className="text-[17px] font-bold text-[#111827] mb-1">Member Status</h2>
            <p className="text-sm text-[#6B7280] mb-5">{totalMembers} total members</p>

            {/* Simple radial progress ring */}
            <div className="flex items-center justify-center my-2">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#F0F0F0" strokeWidth="14" />
                  <circle
                    cx="60" cy="60" r="50" fill="none" stroke="#00B69B" strokeWidth="14"
                    strokeDasharray={`${(782 / totalMembers) * 314} 314`} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-[#111827]">{Math.round((782 / totalMembers) * 100)}%</span>
                  <span className="text-[10px] text-[#6B7280] font-medium">Active</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {MEMBER_STATUS_DATA.map(({ label, value, color, bg }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium text-[#505050]">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(value / totalMembers) * 100}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-sm font-bold text-[#111827] w-8 text-right">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/members" className="mt-5 text-center text-sm text-[#4880FF] font-semibold hover:underline">
              View all members →
            </Link>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Recent Access Logs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#111827]">Recent Access</h2>
              <Link to="/access-control" className="text-xs text-[#4880FF] font-semibold hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {RECENT_ACCESS.map(({ memberName, club, time, result }, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {result === "Granted"
                      ? <CheckCircle2 className="w-4 h-4 text-[#00B69B] shrink-0" />
                      : <XCircle className="w-4 h-4 text-[#FF4747] shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111827] truncate">{memberName}</p>
                      <p className="text-xs text-[#A6A6A6]">{club}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A6A6A6] shrink-0">
                    <Clock className="w-3 h-3" /> {time}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.43 }}
            className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#111827]">Today's Sessions</h2>
              <Link to="/courses/schedule" className="text-xs text-[#4880FF] font-semibold hover:underline">Schedule</Link>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {UPCOMING_SESSIONS.map(({ course, instructor, club, time, capacity, enrolled }, i) => {
                const full = enrolled >= capacity;
                const pct = Math.round((enrolled / capacity) * 100);
                return (
                  <div key={i} className="px-5 py-3">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{course}</p>
                        <p className="text-xs text-[#A6A6A6]">{instructor} · {club}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#6B7280] shrink-0 ml-3">
                        <Clock className="w-3 h-3" /> {time}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${full ? "bg-[#FF4747]" : "bg-[#4880FF]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-bold ${full ? "text-[#FF4747]" : "text-[#6B7280]"}`}>
                        {enrolled}/{capacity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Equipment Summary + Contract Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 }}
            className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#111827]">Equipment</h2>
              <Link to="/equipment" className="text-xs text-[#4880FF] font-semibold hover:underline">View all</Link>
            </div>

            <div className="flex flex-col gap-3 p-5">
              {EQUIPMENT_SUMMARY.map(({ label, count, color, bg, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#505050]">{label}</p>
                  </div>
                  <span className={`text-lg font-black ${color}`}>{count}</span>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-[#F5F5F5]">
              <p className="text-[13px] font-bold text-[#111827] mb-3">Contracts / Month</p>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_REVENUE.slice(-6)} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={8}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#A6A6A6", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#A6A6A6", fontSize: 10 }} domain={["dataMin - 10", "dataMax + 5"]} />
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                      formatter={(v: number) => [v, "Contracts"]}
                    />
                    <Bar dataKey="contracts" fill="#4880FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
