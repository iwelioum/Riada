
src/app/pages/Plans.tsx
tsx
import { useState, Fragment } from "react";
import { motion } from "motion/react";
import { Tag, Check, ChevronDown, ChevronUp, DollarSign } from "lucide-react";

const MOCK_PLANS = [
  {
    id: 1,
    planName: "Basic",
    basePrice: 29.99,
    commitmentMonths: 1,
    enrollmentFee: 0,
    limitedClubAccess: true,
    duoPassAllowed: false,
    options: [
      { optionName: "Group classes", monthlyPrice: 15.0 },
      { optionName: "Sauna access", monthlyPrice: 10.0 },
    ],
  },
  {
    id: 2,
    planName: "Premium",
    basePrice: 49.99,
    commitmentMonths: 12,
    enrollmentFee: 25.0,
    limitedClubAccess: false,
    duoPassAllowed: true,
    options: [
      { optionName: "Group classes", monthlyPrice: 15.0 },
      { optionName: "Sauna access", monthlyPrice: 10.0 },
      { optionName: "Parking", monthlyPrice: 8.0 },
    ],
  },
  {
    id: 3,
    planName: "VIP",
    basePrice: 89.99,
    commitmentMonths: 12,
    enrollmentFee: 50.0,
    limitedClubAccess: false,
    duoPassAllowed: true,
    options: [
      { optionName: "Group classes", monthlyPrice: 15.0 },
      { optionName: "Sauna access", monthlyPrice: 10.0 },
      { optionName: "Parking", monthlyPrice: 8.0 },
      { optionName: "Personal trainer (1x/week)", monthlyPrice: 40.0 },
    ],
  },
];

export function Plans() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <Tag className="w-6 h-6 text-[#4880FF]" /> Subscription Plans
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {MOCK_PLANS.length} plans available
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {[
                  "Plan",
                  "Base price",
                  "Commitment",
                  "Enrollment fee",
                  "Club access",
                  "Duo pass",
                  "Options",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_PLANS.map((plan) => (
                <Fragment key={plan.id}>
                  <tr
                    className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                    onClick={() => toggle(plan.id)}
                  >
                    <td className="px-5 py-4 font-bold text-[#111827]">
                      {plan.planName}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#4880FF]">
                      {plan.basePrice.toFixed(2)} €
                    </td>
                    <td className="px-5 py-4 text-sm text-[#111827]">
                      {plan.commitmentMonths === 1
                        ? "Month-to-month"
                        : `${plan.commitmentMonths} months`}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#111827]">
                      {plan.enrollmentFee > 0
                        ? `${plan.enrollmentFee.toFixed(2)} €`
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          plan.limitedClubAccess
                            ? "bg-[#FFF3D6] text-[#FF9066]"
                            : "bg-[#E0F8EA] text-[#00B69B]"
                        }`}
                      >
                        {plan.limitedClubAccess ? "Limited" : "All clubs"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {plan.duoPassAllowed ? (
                        <Check className="w-5 h-5 text-[#00B69B]" />
                      ) : (
                        <span className="text-[#A6A6A6] text-lg">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button className="flex items-center gap-1 text-sm text-[#4880FF] font-semibold">
                        {plan.options.length} options
                        {expandedId === plan.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedId === plan.id && (
                    <tr className="bg-[#F8FAFF]">
                      <td colSpan={7} className="px-8 py-4">
                        <p className="text-xs font-bold text-[#6B7280] uppercase mb-3">
                          Available options
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {plan.options.map((opt) => (
                            <div
                              key={opt.optionName}
                              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#E0E0E0] text-sm"
                            >
                              <DollarSign className="w-4 h-4 text-[#4880FF]" />
                              <span className="font-semibold text-[#111827]">
                                {opt.optionName}
                              </span>
                              <span className="text-[#6B7280]">
                                {opt.monthlyPrice.toFixed(2)} € / month
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}



src/app/pages/Clubs.tsx
tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  X,
  Clock,
  Users,
  Dumbbell,
  MapPin,
  ChevronRight,
} from "lucide-react";

const MOCK_CLUBS = [
  { id: 1, name: "Riada Brussels", city: "Brussels", operationalStatus: "Open", is24_7: true, employeeCount: 12, equipmentCount: 48 },
  { id: 2, name: "Riada Namur", city: "Namur", operationalStatus: "Open", is24_7: false, employeeCount: 8, equipmentCount: 32 },
  { id: 3, name: "Riada Liège", city: "Liège", operationalStatus: "TemporarilyClosed", is24_7: false, employeeCount: 6, equipmentCount: 28 },
  { id: 4, name: "Riada Ghent", city: "Ghent", operationalStatus: "ComingSoon", is24_7: true, employeeCount: 0, equipmentCount: 0 },
];

type Club = (typeof MOCK_CLUBS)[0];

function statusBadge(status: string): string {
  switch (status) {
    case "Open": return "bg-[#E0F8EA] text-[#00B69B]";
    case "TemporarilyClosed": return "bg-[#FFF3D6] text-[#FF9066]";
    case "PermanentlyClosed": return "bg-[#FFF0F0] text-[#FF4747]";
    case "ComingSoon": return "bg-[#EBEBFF] text-[#4880FF]";
    default: return "bg-[#F5F6FA] text-[#6B7280]";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "TemporarilyClosed": return "Temp. closed";
    case "PermanentlyClosed": return "Closed";
    case "ComingSoon": return "Coming soon";
    default: return status;
  }
}

export function Clubs() {
  const [selected, setSelected] = useState<Club | null>(null);

  const handleSelect = (club: Club) => setSelected(club);
  const handleClose = () => setSelected(null);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#4880FF]" /> Clubs
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {MOCK_CLUBS.length} clubs registered
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Name", "City", "Status", "24/7", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CLUBS.map((club) => (
                <tr
                  key={club.id}
                  className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                  onClick={() => handleSelect(club)}
                >
                  <td className="px-5 py-4 font-bold text-[#111827]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#EBEBFF] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-[#4880FF]" />
                      </div>
                      {club.name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {club.city}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge(club.operationalStatus)}`}>
                      {statusLabel(club.operationalStatus)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {club.is24_7 ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">
                        24/7
                      </span>
                    ) : (
                      <span className="text-[#A6A6A6]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <ChevronRight className="w-4 h-4 text-[#A6A6A6]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={handleClose}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#E0E0E0]">
                <h2 className="text-lg font-bold text-[#111827]">{selected.name}</h2>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge(selected.operationalStatus)}`}>
                    {statusLabel(selected.operationalStatus)}
                  </span>
                  {selected.is24_7 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 24/7
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-center">
                    <Users className="w-6 h-6 text-[#4880FF] mx-auto mb-2" />
                    <p className="text-2xl font-black text-[#111827]">{selected.employeeCount}</p>
                    <p className="text-xs text-[#6B7280] font-medium mt-1">Employees</p>
                  </div>
                  <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-center">
                    <Dumbbell className="w-6 h-6 text-[#4880FF] mx-auto mb-2" />
                    <p className="text-2xl font-black text-[#111827]">{selected.equipmentCount}</p>
                    <p className="text-xs text-[#6B7280] font-medium mt-1">Equipment</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E0E0E0] divide-y divide-[#F0F0F0]">
                  {[
                    { label: "City", value: selected.city },
                    { label: "Status", value: statusLabel(selected.operationalStatus) },
                    { label: "Open 24/7", value: selected.is24_7 ? "Yes" : "No" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center px-4 py-3">
                      <span className="text-sm text-[#6B7280]">{label}</span>
                      <span className="text-sm font-bold text-[#111827]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}



src/app/pages/Courses.tsx
tsx
import { motion } from "motion/react";
import { BookOpen, Flame, Clock, Users } from "lucide-react";

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: "bg-[#E0F8EA] text-[#00B69B]",
  Intermediate: "bg-[#FFF3D6] text-[#FF9066]",
  Advanced: "bg-[#FFF0F0] text-[#FF4747]",
};

const MOCK_COURSES = [
  { id: 1, courseName: "Power Yoga", activityType: "Yoga", difficultyLevel: "Beginner", durationMinutes: 60, maxCapacity: 20, estimatedCalories: 250 },
  { id: 2, courseName: "HIIT Blast", activityType: "Cardio", difficultyLevel: "Advanced", durationMinutes: 45, maxCapacity: 15, estimatedCalories: 600 },
  { id: 3, courseName: "Pilates Core", activityType: "Pilates", difficultyLevel: "Intermediate", durationMinutes: 50, maxCapacity: 12, estimatedCalories: 300 },
  { id: 4, courseName: "Aqua Fitness", activityType: "Swimming", difficultyLevel: "Beginner", durationMinutes: 45, maxCapacity: 25, estimatedCalories: 350 },
  { id: 5, courseName: "Boxing Fundamentals", activityType: "Combat", difficultyLevel: "Intermediate", durationMinutes: 60, maxCapacity: 16, estimatedCalories: 520 },
];

export function Courses() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#4880FF]" /> Courses
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {MOCK_COURSES.length} courses in catalogue
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Course", "Activity type", "Difficulty", "Duration", "Capacity", "Est. calories"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_COURSES.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors cursor-default"
                >
                  <td className="px-5 py-4 font-bold text-[#111827]">{course.courseName}</td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">{course.activityType}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${DIFFICULTY_CLASSES[course.difficultyLevel] ?? "bg-[#F5F6FA] text-[#6B7280]"}`}>
                      {course.difficultyLevel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#111827]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#6B7280]" />
                      {course.durationMinutes} min
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#111827]">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#6B7280]" />
                      {course.maxCapacity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#111827]">
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-[#FF9066]" />
                      ~{course.estimatedCalories} kcal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}



src/app/pages/analytics/RiskAnalytics.tsx
tsx
import { motion } from "motion/react";
import { ShieldAlert } from "lucide-react";

const MOCK_RISKS = [
  { id: 1, memberName: "Jean Dupont", plan: "Premium", overdueInvoices: 3, deniedAccess60d: 12, riskScore: 82 },
  { id: 2, memberName: "Marie Martin", plan: "Basic", overdueInvoices: 1, deniedAccess60d: 4, riskScore: 41 },
  { id: 3, memberName: "Luc Bernard", plan: "VIP", overdueInvoices: 0, deniedAccess60d: 0, riskScore: 8 },
  { id: 4, memberName: "Sophie Leroy", plan: "Premium", overdueInvoices: 2, deniedAccess60d: 18, riskScore: 74 },
  { id: 5, memberName: "Pierre Dumont", plan: "Basic", overdueInvoices: 4, deniedAccess60d: 22, riskScore: 95 },
];

const SORTED_RISKS = [...MOCK_RISKS].sort((a, b) => b.riskScore - a.riskScore);

function RiskBar({ score }: { score: number }) {
  const color = score <= 30 ? "bg-[#00B69B]" : score <= 60 ? "bg-[#FF9066]" : "bg-[#FF4747]";
  const text = score <= 30 ? "text-[#00B69B]" : score <= 60 ? "text-[#FF9066]" : "text-[#FF4747]";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-black w-10 text-right ${text}`}>{score}</span>
    </div>
  );
}

export function RiskAnalytics() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#FF4747]" /> Risk Scores
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Top {SORTED_RISKS.length} at-risk members
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Member", "Plan", "Overdue invoices", "Denied access (60d)", "Risk score"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SORTED_RISKS.map((m) => (
                <tr key={m.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111827]">{m.memberName}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">
                      {m.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold">
                    {m.overdueInvoices > 0
                      ? <span className="text-[#FF4747]">{m.overdueInvoices}</span>
                      : <span className="text-[#A6A6A6]">—</span>}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold">
                    {m.deniedAccess60d > 0
                      ? <span className="text-[#FF9066]">{m.deniedAccess60d}</span>
                      : <span className="text-[#A6A6A6]">—</span>}
                  </td>
                  <td className="px-5 py-4 w-52">
                    <RiskBar score={m.riskScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}



src/app/pages/analytics/FrequencyAnalytics.tsx
tsx
import { useState } from "react";
import { motion } from "motion/react";
import { BarChart2, Calendar } from "lucide-react";

const MOCK_FREQUENCY = [
  { clubName: "Riada Brussels", visitorCount: 1240, avgVisitsPerMember: 8.4 },
  { clubName: "Riada Namur", visitorCount: 780, avgVisitsPerMember: 6.1 },
  { clubName: "Riada Liège", visitorCount: 420, avgVisitsPerMember: 5.3 },
  { clubName: "Riada Ghent", visitorCount: 90, avgVisitsPerMember: 2.1 },
];

const TODAY = new Date().toISOString().split("T")[0];
const MONTH_AGO = new Date(Date.now() - 30 * 86_400_000).toISOString().split("T")[0];

export function FrequencyAnalytics() {
  const [dateFrom, setDateFrom] = useState(MONTH_AGO);
  const [dateTo, setDateTo] = useState(TODAY);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-[#4880FF]" /> Visit Frequency
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Per club breakdown</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-[#6B7280]" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm text-[#111827] bg-transparent focus:outline-none"
              />
            </div>
            <span className="text-[#6B7280] text-sm font-medium">→</span>
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-[#6B7280]" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm text-[#111827] bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Club", "Total visits", "Avg. visits / member"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_FREQUENCY.map((row) => (
                <tr key={row.clubName} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111827]">{row.clubName}</td>
                  <td className="px-5 py-4 font-semibold text-[#4880FF]">
                    {row.visitorCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                    {row.avgVisitsPerMember.toFixed(1)} visits
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}



src/app/pages/analytics/OptionsAnalytics.tsx
tsx
import { motion } from "motion/react";
import { PieChart } from "lucide-react";

const MOCK_OPTIONS = [
  { optionName: "Group classes", subscriptionCount: 312, popularityPercentage: 78 },
  { optionName: "Sauna access", subscriptionCount: 198, popularityPercentage: 49.5 },
  { optionName: "Parking", subscriptionCount: 145, popularityPercentage: 36.3 },
  { optionName: "Personal trainer (1x/week)", subscriptionCount: 67, popularityPercentage: 16.8 },
];

const SORTED_OPTIONS = [...MOCK_OPTIONS].sort(
  (a, b) => b.subscriptionCount - a.subscriptionCount
);

export function OptionsAnalytics() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <PieChart className="w-6 h-6 text-[#4880FF]" /> Options Popularity
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">Subscription rate per option</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Option", "Subscribers", "Popularity"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SORTED_OPTIONS.map((opt) => (
                <tr key={opt.optionName} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111827]">{opt.optionName}</td>
                  <td className="px-5 py-4 font-semibold text-[#4880FF]">{opt.subscriptionCount}</td>
                  <td className="px-5 py-4 w-64">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4880FF] rounded-full transition-all"
                          style={{ width: `${opt.popularityPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#111827] w-12 text-right">
                        {opt.popularityPercentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}



src/app/pages/analytics/HealthAnalytics.tsx
tsx
import { motion } from "motion/react";
import { Activity, Users, FileText, CheckCircle2, XCircle } from "lucide-react";

const MOCK_HEALTH = {
  isHealthy: true,
  status: "All systems operational",
  totalMembers: 400,
  activeContracts: 312,
  pendingInvoices: 28,
};

export function HealthAnalytics() {
  const { isHealthy, status, totalMembers, activeContracts, pendingInvoices } =
    MOCK_HEALTH;

  const kpis = [
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "text-[#4880FF]",
      bg: "bg-[#EBEBFF]",
    },
    {
      label: "Active Contracts",
      value: activeContracts,
      icon: FileText,
      color: "text-[#00B69B]",
      bg: "bg-[#E0F8EA]",
    },
    {
      label: "Pending Invoices",
      value: pendingInvoices,
      icon: Activity,
      color: pendingInvoices > 0 ? "text-[#FF9066]" : "text-[#00B69B]",
      bg: pendingInvoices > 0 ? "bg-[#FFF3D6]" : "bg-[#E0F8EA]",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#4880FF]" /> System Health
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">Platform-wide KPIs</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Health badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border flex items-center gap-4 ${
              isHealthy
                ? "bg-[#E0F8EA] border-[#00B69B]/30"
                : "bg-[#FFF0F0] border-[#FF4747]/30"
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="w-8 h-8 text-[#00B69B] shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-[#FF4747] shrink-0" />
            )}
            <div>
              <p className={`text-lg font-black ${isHealthy ? "text-[#00B69B]" : "text-[#FF4747]"}`}>
                {isHealthy ? "Healthy" : "Unhealthy"}
              </p>
              <p className="text-sm text-[#6B7280] mt-0.5">{status}</p>
            </div>
          </motion.div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (i + 1) }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <p className="text-3xl font-black text-[#111827]">
                  {value.toLocaleString()}
                </p>
                <p className="text-sm text-[#6B7280] font-medium mt-1">{label}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}



src/app/routes.tsx — ajout groupe 1
tsx
import { Plans } from "./pages/Plans";
import { Clubs } from "./pages/Clubs";
import { Courses } from "./pages/Courses";
import { RiskAnalytics } from "./pages/analytics/RiskAnalytics";
import { FrequencyAnalytics } from "./pages/analytics/FrequencyAnalytics";
import { OptionsAnalytics } from "./pages/analytics/OptionsAnalytics";
import { HealthAnalytics } from "./pages/analytics/HealthAnalytics";

// À ajouter dans ton tableau de routes :
{ path: "/subscriptions/plans", element: <Plans /> },
{ path: "/clubs", element: <Clubs /> },
{ path: "/courses", element: <Courses /> },
{
  path: "/analytics",
  children: [
    { path: "risk", element: <RiskAnalytics /> },
    { path: "frequency", element: <FrequencyAnalytics /> },
    { path: "options", element: <OptionsAnalytics /> },
    { path: "health", element: <HealthAnalytics /> },
  ],
},