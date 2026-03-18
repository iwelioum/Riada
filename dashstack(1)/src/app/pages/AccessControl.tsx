import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Search, CheckCircle2, XCircle, Clock } from "lucide-react";

type AccessResult = "Granted" | "Denied";
type DenialReason =
  | "InvalidBadge"
  | "SuspendedContract"
  | "PendingPayment"
  | "WrongClub"
  | "GuestBanned"
  | null;

interface AccessLog {
  id: number;
  attemptedAt: string;
  memberName: string | null;
  memberId: number | null;
  badgeId: string;
  clubName: string;
  result: AccessResult;
  denialReason: DenialReason;
}

const MOCK_LOGS: AccessLog[] = [
  { id: 1, attemptedAt: "2026-03-18 08:12:34", memberName: "Jean Dupont", memberId: 1, badgeId: "BADGE-001", clubName: "Brussels", result: "Granted", denialReason: null },
  { id: 2, attemptedAt: "2026-03-18 08:15:02", memberName: "Marie Martin", memberId: 2, badgeId: "BADGE-002", clubName: "Brussels", result: "Denied", denialReason: "PendingPayment" },
  { id: 3, attemptedAt: "2026-03-18 09:01:45", memberName: null, memberId: null, badgeId: "BADGE-999", clubName: "Namur", result: "Denied", denialReason: "InvalidBadge" },
  { id: 4, attemptedAt: "2026-03-18 09:20:11", memberName: "Luc Bernard", memberId: 3, badgeId: "BADGE-003", clubName: "Liège", result: "Denied", denialReason: "WrongClub" },
  { id: 5, attemptedAt: "2026-03-18 10:05:00", memberName: "Sophie Leroy", memberId: 4, badgeId: "BADGE-004", clubName: "Brussels", result: "Granted", denialReason: null },
  { id: 6, attemptedAt: "2026-03-18 10:22:18", memberName: "Pierre Dumont", memberId: 5, badgeId: "BADGE-005", clubName: "Brussels", result: "Denied", denialReason: "SuspendedContract" },
  { id: 7, attemptedAt: "2026-03-18 11:07:44", memberName: "Clara Morin", memberId: null, badgeId: "BADGE-006", clubName: "Brussels", result: "Denied", denialReason: "GuestBanned" },
  { id: 8, attemptedAt: "2026-03-18 11:45:55", memberName: "Jean Dupont", memberId: 1, badgeId: "BADGE-001", clubName: "Brussels", result: "Granted", denialReason: null },
];

const DENIAL_LABELS: Record<NonNullable<DenialReason>, string> = {
  InvalidBadge: "Invalid badge",
  SuspendedContract: "Suspended contract",
  PendingPayment: "Pending payment",
  WrongClub: "Wrong club",
  GuestBanned: "Guest banned",
};

const DENIAL_CLASSES: Record<NonNullable<DenialReason>, string> = {
  InvalidBadge: "bg-[#F5F6FA] text-[#6B7280]",
  SuspendedContract: "bg-[#FFF0F0] text-[#FF4747]",
  PendingPayment: "bg-[#FFF3D6] text-[#FF9066]",
  WrongClub: "bg-[#FFF3D6] text-[#FF9066]",
  GuestBanned: "bg-[#FFF0F0] text-[#FF4747]",
};

const RESULT_FILTER_OPTIONS = ["All", "Granted", "Denied"] as const;
type ResultFilter = (typeof RESULT_FILTER_OPTIONS)[number];

export function AccessControl() {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("All");

  const granted = MOCK_LOGS.filter((l) => l.result === "Granted").length;
  const denied = MOCK_LOGS.filter((l) => l.result === "Denied").length;
  const grantRate = Math.round((granted / MOCK_LOGS.length) * 100);

  const filtered = MOCK_LOGS.filter((log) => {
    const matchSearch =
      !search ||
      log.memberName?.toLowerCase().includes(search.toLowerCase()) ||
      log.badgeId.toLowerCase().includes(search.toLowerCase()) ||
      log.clubName.toLowerCase().includes(search.toLowerCase());
    const matchResult =
      resultFilter === "All" || log.result === resultFilter;
    return matchSearch && matchResult;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#4880FF]" /> Access Control
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {MOCK_LOGS.length} access attempts today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-56">
              <Search className="w-4 h-4 text-[#A6A6A6] shrink-0" />
              <input
                type="text"
                placeholder="Search member or badge…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
              />
            </div>
            <div className="flex rounded-xl overflow-hidden border border-[#E0E0E0]">
              {RESULT_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setResultFilter(opt)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    resultFilter === opt
                      ? "bg-[#4880FF] text-white"
                      : "bg-white text-[#6B7280] hover:bg-[#F8FAFF]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              label: "Granted",
              value: granted,
              icon: CheckCircle2,
              color: "text-[#00B69B]",
              bg: "bg-[#E0F8EA]",
              border: "border-[#00B69B]/20",
            },
            {
              label: "Denied",
              value: denied,
              icon: XCircle,
              color: "text-[#FF4747]",
              bg: "bg-[#FFF0F0]",
              border: "border-[#FF4747]/20",
            },
            {
              label: "Grant rate",
              value: `${grantRate}%`,
              icon: ShieldCheck,
              color: "text-[#4880FF]",
              bg: "bg-[#EBEBFF]",
              border: "border-[#4880FF]/20",
            },
          ].map(({ label, value, icon: Icon, color, bg, border }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl shadow-sm border ${border} p-6 flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-[#111827]">{value}</p>
                <p className="text-sm text-[#6B7280] font-medium">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logs table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Time", "Member", "Badge", "Club", "Result", "Reason"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#A6A6A6]">
                    No access logs match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                        <Clock className="w-3.5 h-3.5" />
                        {log.attemptedAt.split(" ")[1]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {log.memberName ? (
                        <span className="text-sm font-bold text-[#111827]">{log.memberName}</span>
                      ) : (
                        <span className="text-sm text-[#A6A6A6] italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-mono text-[#6B7280]">{log.badgeId}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#111827] font-medium">{log.clubName}</td>
                    <td className="px-5 py-3">
                      {log.result === "Granted" ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#E0F8EA] text-[#00B69B] w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF0F0] text-[#FF4747] w-fit">
                          <XCircle className="w-3.5 h-3.5" /> Denied
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {log.denialReason ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${DENIAL_CLASSES[log.denialReason]}`}>
                          {DENIAL_LABELS[log.denialReason]}
                        </span>
                      ) : (
                        <span className="text-[#A6A6A6] text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}