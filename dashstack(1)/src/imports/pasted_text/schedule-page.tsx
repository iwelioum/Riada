Groupe 3 complet — pages 13, 16, 17.

***

## `src/app/pages/Schedule.tsx`

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Plus, X, Check, ChevronLeft, ChevronRight, Clock, Users, MapPin } from "lucide-react";
import { toast } from "sonner";

type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
type RecurrenceType = "OneTime" | "Weekly" | "BiWeekly";

interface ScheduledSession {
  id: number;
  courseName: string;
  courseId: number;
  instructorName: string;
  clubName: string;
  clubId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  enrolled: number;
  recurrence: RecurrenceType;
  color: string;
}

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 → 21:00

const MOCK_SESSIONS: ScheduledSession[] = [
  { id: 1, courseName: "Power Yoga", courseId: 1, instructorName: "Nora Petit", clubName: "Brussels", clubId: 1, dayOfWeek: "Monday", startTime: "08:00", durationMinutes: 60, capacity: 20, enrolled: 14, recurrence: "Weekly", color: "#4880FF" },
  { id: 2, courseName: "HIIT Blast", courseId: 2, instructorName: "Marc Dubois", clubName: "Brussels", clubId: 1, dayOfWeek: "Tuesday", startTime: "12:00", durationMinutes: 45, capacity: 15, enrolled: 15, recurrence: "Weekly", color: "#FF4747" },
  { id: 3, courseName: "Pilates Core", courseId: 3, instructorName: "Nora Petit", clubName: "Namur", clubId: 2, dayOfWeek: "Wednesday", startTime: "10:00", durationMinutes: 50, capacity: 12, enrolled: 8, recurrence: "Weekly", color: "#00B69B" },
  { id: 4, courseName: "Boxing Fundamentals", courseId: 5, instructorName: "Kevin Maes", clubName: "Liège", clubId: 3, dayOfWeek: "Thursday", startTime: "18:00", durationMinutes: 60, capacity: 16, enrolled: 11, recurrence: "Weekly", color: "#FF9066" },
  { id: 5, courseName: "Aqua Fitness", courseId: 4, instructorName: "Sophie Lambert", clubName: "Brussels", clubId: 1, dayOfWeek: "Saturday", startTime: "09:00", durationMinutes: 45, capacity: 25, enrolled: 18, recurrence: "BiWeekly", color: "#9B59B6" },
  { id: 6, courseName: "Power Yoga", courseId: 1, instructorName: "Nora Petit", clubName: "Brussels", clubId: 1, dayOfWeek: "Friday", startTime: "07:00", durationMinutes: 60, capacity: 20, enrolled: 6, recurrence: "Weekly", color: "#4880FF" },
];

const MOCK_COURSES = [
  { id: 1, name: "Power Yoga" },
  { id: 2, name: "HIIT Blast" },
  { id: 3, name: "Pilates Core" },
  { id: 4, name: "Aqua Fitness" },
  { id: 5, name: "Boxing Fundamentals" },
];

const MOCK_INSTRUCTORS = [
  { id: 1, name: "Nora Petit" },
  { id: 2, name: "Marc Dubois" },
  { id: 3, name: "Kevin Maes" },
  { id: 4, name: "Sophie Lambert" },
];

const MOCK_CLUBS = [
  { id: 1, name: "Brussels" },
  { id: 2, name: "Namur" },
  { id: 3, name: "Liège" },
];

const COURSE_COLORS = ["#4880FF", "#FF4747", "#00B69B", "#FF9066", "#9B59B6", "#F39C12"];

const RECURRENCES: RecurrenceType[] = ["OneTime", "Weekly", "BiWeekly"];

const EMPTY_FORM = {
  courseId: 1,
  instructorId: 1,
  clubId: 1,
  dayOfWeek: "Monday" as DayOfWeek,
  startTime: "09:00",
  durationMinutes: 60,
  capacity: 20,
  recurrence: "Weekly" as RecurrenceType,
  color: "#4880FF",
};

function timeToRow(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h - 7 + m / 60;
}

export function Schedule() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<ScheduledSession | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleCreate = () => {
    const course = MOCK_COURSES.find((c) => c.id === Number(form.courseId));
    const instructor = MOCK_INSTRUCTORS.find((i) => i.id === Number(form.instructorId));
    const club = MOCK_CLUBS.find((c) => c.id === Number(form.clubId));
    const newSession: ScheduledSession = {
      id: sessions.length + 1,
      courseName: course?.name ?? "—",
      courseId: Number(form.courseId),
      instructorName: instructor?.name ?? "—",
      clubName: club?.name ?? "—",
      clubId: Number(form.clubId),
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      durationMinutes: Number(form.durationMinutes),
      capacity: Number(form.capacity),
      enrolled: 0,
      recurrence: form.recurrence,
      color: form.color,
    };
    setSessions([...sessions, newSession]);
    toast.success(`${newSession.courseName} scheduled on ${newSession.dayOfWeek}`);
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id: number) => {
    setSessions(sessions.filter((s) => s.id !== id));
    setSelectedSession(null);
    toast.success("Session removed from schedule");
  };

  const selectClass = "w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]";
  const inputClass = "w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#4880FF]" /> Weekly Schedule
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>
          <button
            onClick={() => { setShowCreateModal(true); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all"
          >
            <Plus className="w-4 h-4" /> Add session
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden min-w-[900px]">
          {/* Day headers */}
          <div className="grid border-b border-[#E0E0E0]" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
            <div className="bg-[#F8FAFF]" />
            {DAYS.map((day) => (
              <div key={day} className="bg-[#F8FAFF] text-center text-xs font-bold text-[#6B7280] uppercase py-3 border-l border-[#E0E0E0]">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="relative" style={{ height: `${HOURS.length * 56}px` }}>
            {/* Hour lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-t border-[#F0F0F0] flex"
                style={{ top: `${(hour - 7) * 56}px` }}
              >
                <div className="w-14 shrink-0 text-xs text-[#A6A6A6] font-medium px-2 -translate-y-2">
                  {`${hour}:00`}
                </div>
                {DAYS.map((day) => (
                  <div key={day} className="flex-1 border-l border-[#F0F0F0] h-14" />
                ))}
              </div>
            ))}

            {/* Sessions */}
            {sessions.map((session) => {
              const dayIndex = DAYS.indexOf(session.dayOfWeek);
              if (dayIndex === -1) return null;
              const top = timeToRow(session.startTime) * 56;
              const height = (session.durationMinutes / 60) * 56;
              const left = `calc(56px + ${dayIndex} * ((100% - 56px) / 7) + 4px)`;
              const width = `calc((100% - 56px) / 7 - 8px)`;
              const isFull = session.enrolled >= session.capacity;

              return (
                <motion.button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    position: "absolute",
                    top: `${top}px`,
                    left,
                    width,
                    height: `${height}px`,
                    backgroundColor: session.color + "22",
                    borderLeft: `3px solid ${session.color}`,
                  }}
                  className="rounded-lg px-2 py-1 text-left overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <p
                    className="text-xs font-bold truncate leading-tight"
                    style={{ color: session.color }}
                  >
                    {session.courseName}
                  </p>
                  <p className="text-[10px] text-[#6B7280] truncate">{session.startTime} · {session.instructorName}</p>
                  {isFull && (
                    <span className="text-[10px] font-bold text-[#FF4747]">FULL</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Session Detail Drawer */}
      <AnimatePresence>
        {selectedSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSelectedSession(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div
                className="p-6 border-b border-[#E0E0E0] flex items-center justify-between"
                style={{ borderTop: `4px solid ${selectedSession.color}` }}
              >
                <h2 className="text-lg font-bold text-[#111827]">{selectedSession.courseName}</h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Enrollment bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#6B7280] font-medium flex items-center gap-1">
                      <Users className="w-4 h-4" /> Enrollment
                    </span>
                    <span className="text-sm font-bold text-[#111827]">
                      {selectedSession.enrolled} / {selectedSession.capacity}
                    </span>
                  </div>
                  <div className="h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(selectedSession.enrolled / selectedSession.capacity) * 100}%`,
                        backgroundColor: selectedSession.enrolled >= selectedSession.capacity ? "#FF4747" : selectedSession.color,
                      }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-xl border border-[#E0E0E0] divide-y divide-[#F0F0F0]">
                  {[
                    { label: "Day", value: selectedSession.dayOfWeek },
                    { label: "Start time", value: selectedSession.startTime },
                    { label: "Duration", value: `${selectedSession.durationMinutes} min` },
                    { label: "Instructor", value: selectedSession.instructorName },
                    { label: "Club", value: selectedSession.clubName },
                    { label: "Recurrence", value: selectedSession.recurrence },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center px-4 py-3">
                      <span className="text-sm text-[#6B7280]">{label}</span>
                      <span className="text-sm font-bold text-[#111827]">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(selectedSession.id)}
                  className="w-full py-2.5 bg-[#FFF0F0] text-[#FF4747] font-semibold rounded-xl hover:bg-[#FFE0E0] transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Remove from schedule
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Schedule a session</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Course</label>
                    <select className={selectClass} value={form.courseId}
                      onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}>
                      {MOCK_COURSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Instructor</label>
                    <select className={selectClass} value={form.instructorId}
                      onChange={(e) => setForm({ ...form, instructorId: Number(e.target.value) })}>
                      {MOCK_INSTRUCTORS.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Club</label>
                    <select className={selectClass} value={form.clubId}
                      onChange={(e) => setForm({ ...form, clubId: Number(e.target.value) })}>
                      {MOCK_CLUBS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Day</label>
                    <select className={selectClass} value={form.dayOfWeek}
                      onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value as DayOfWeek })}>
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Start time</label>
                    <input className={inputClass} type="time" value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Duration (min)</label>
                    <input className={inputClass} type="number" min={15} step={15} value={form.durationMinutes}
                      onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Capacity</label>
                    <input className={inputClass} type="number" min={1} value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Recurrence</label>
                    <select className={selectClass} value={form.recurrence}
                      onChange={(e) => setForm({ ...form, recurrence: e.target.value as RecurrenceType })}>
                      {RECURRENCES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Color</label>
                    <div className="flex gap-2 mt-1">
                      {COURSE_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setForm({ ...form, color: c })}
                          className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: c,
                            borderColor: form.color === c ? "#111827" : "transparent",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Add to schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

***

## `src/app/pages/AccessControl.tsx`

```tsx
import { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Search, CheckCircle2, XCircle, Clock, ChevronDown } from "lucide-react";

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
```

***

## `src/app/pages/GdprRequests.tsx`

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Plus, X, Check, Search, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

type RequestType = "DataExport" | "DataDeletion" | "Rectification";
type RequestStatus = "Pending" | "InProgress" | "Completed" | "Rejected";

interface GdprRequest {
  id: number;
  requestedAt: string;
  memberName: string;
  memberId: number;
  type: RequestType;
  status: RequestStatus;
  notes: string;
  completedAt: string | null;
}

const MOCK_REQUESTS: GdprRequest[] = [
  { id: 1, requestedAt: "2026-03-01", memberName: "Jean Dupont", memberId: 1, type: "DataExport", status: "Completed", notes: "Exported full member profile and contract history.", completedAt: "2026-03-05" },
  { id: 2, requestedAt: "2026-03-10", memberName: "Marie Martin", memberId: 2, type: "DataDeletion", status: "InProgress", notes: "Verifying active contracts before deletion.", completedAt: null },
  { id: 3, requestedAt: "2026-03-15", memberName: "Luc Bernard", memberId: 3, type: "Rectification", status: "Pending", notes: "Member requests email address correction.", completedAt: null },
  { id: 4, requestedAt: "2026-03-17", memberName: "Sophie Leroy", memberId: 4, type: "DataExport", status: "Pending", notes: "", completedAt: null },
];

const TYPE_META: Record<RequestType, { label: string; icon: React.ReactNode; badge: string }> = {
  DataExport: {
    label: "Data Export",
    icon: <Download className="w-4 h-4" />,
    badge: "bg-[#EBEBFF] text-[#4880FF]",
  },
  DataDeletion: {
    label: "Deletion",
    icon: <Trash2 className="w-4 h-4" />,
    badge: "bg-[#FFF0F0] text-[#FF4747]",
  },
  Rectification: {
    label: "Rectification",
    icon: <Check className="w-4 h-4" />,
    badge: "bg-[#FFF3D6] text-[#FF9066]",
  },
};

const STATUS_CLASSES: Record<RequestStatus, string> = {
  Pending: "bg-[#FFF3D6] text-[#FF9066]",
  InProgress: "bg-[#EBEBFF] text-[#4880FF]",
  Completed: "bg-[#E0F8EA] text-[#00B69B]",
  Rejected: "bg-[#FFF0F0] text-[#FF4747]",
};

const STATUSES: RequestStatus[] = ["Pending", "InProgress", "Completed", "Rejected"];
const REQUEST_TYPES: RequestType[] = ["DataExport", "DataDeletion", "Rectification"];

const MOCK_MEMBERS = [
  { id: 1, name: "Jean Dupont" },
  { id: 2, name: "Marie Martin" },
  { id: 3, name: "Luc Bernard" },
  { id: 4, name: "Sophie Leroy" },
  { id: 5, name: "Pierre Dumont" },
];

const EMPTY_FORM = {
  memberId: 1,
  type: "DataExport" as RequestType,
  notes: "",
};

export function GdprRequests() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editRequest, setEditRequest] = useState<GdprRequest | null>(null);
  const [editStatus, setEditStatus] = useState<RequestStatus>("Pending");
  const [editNotes, setEditNotes] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = requests.filter((r) => {
    const matchSearch =
      !search ||
      r.memberName.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    const member = MOCK_MEMBERS.find((m) => m.id === Number(form.memberId));
    const newReq: GdprRequest = {
      id: requests.length + 1,
      requestedAt: new Date().toISOString().split("T")[0],
      memberName: member?.name ?? "—",
      memberId: Number(form.memberId),
      type: form.type,
      status: "Pending",
      notes: form.notes,
      completedAt: null,
    };
    setRequests([newReq, ...requests]);
    toast.success("GDPR request created");
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
  };

  const openEdit = (req: GdprRequest) => {
    setEditRequest(req);
    setEditStatus(req.status);
    setEditNotes(req.notes);
  };

  const handleUpdate = () => {
    if (!editRequest) return;
    setRequests(
      requests.map((r) =>
        r.id === editRequest.id
          ? {
              ...r,
              status: editStatus,
              notes: editNotes,
              completedAt:
                editStatus === "Completed"
                  ? new Date().toISOString().split("T")[0]
                  : r.completedAt,
            }
          : r
      )
    );
    toast.success("Request updated");
    setEditRequest(null);
  };

  const inputClass =
    "w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]";
  const selectClass =
    "w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#4880FF]" /> GDPR Requests
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {filtered.length} request{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-52">
              <Search className="w-4 h-4 text-[#A6A6A6] shrink-0" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "All")}
              className="bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={() => { setShowCreateModal(true); setForm(EMPTY_FORM); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all"
            >
              <Plus className="w-4 h-4" /> New request
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Member", "Type", "Requested", "Status", "Completed", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#A6A6A6]">
                    No requests found
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const meta = TYPE_META[req.type];
                  return (
                    <tr key={req.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                      <td className="px-5 py-4 font-bold text-[#111827]">{req.memberName}</td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${meta.badge}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#6B7280]">{req.requestedAt}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASSES[req.status]}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#6B7280]">
                        {req.completedAt ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openEdit(req)}
                          className="text-sm text-[#4880FF] font-semibold hover:underline"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">New GDPR request</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Member</label>
                  <select className={selectClass} value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: Number(e.target.value) })}>
                    {MOCK_MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Request type</label>
                  <div className="flex gap-2">
                    {REQUEST_TYPES.map((t) => {
                      const meta = TYPE_META[t];
                      return (
                        <button
                          key={t}
                          onClick={() => setForm({ ...form, type: t })}
                          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-bold transition-colors ${
                            form.type === t
                              ? meta.badge + " border-transparent"
                              : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]"
                          }`}
                        >
                          {meta.icon}
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Notes <span className="text-[#A6A6A6]">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional context…"
                    className={inputClass + " resize-none h-20"}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit / Manage Modal */}
        {editRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditRequest(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Manage request</h3>
                <button onClick={() => setEditRequest(null)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] mb-5 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Member</span>
                  <span className="font-bold text-[#111827]">{editRequest.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Type</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_META[editRequest.type].badge}`}>
                    {TYPE_META[editRequest.type].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Requested</span>
                  <span className="font-medium text-[#111827]">{editRequest.requestedAt}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setEditStatus(s)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                          editStatus === s
                            ? STATUS_CLASSES[s] + " border-transparent"
                            : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className={inputClass + " resize-none h-20"}
                    placeholder="Add processing notes…"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setEditRequest(null)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleUpdate} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

***

## Routes à ajouter

```tsx
import { Schedule } from "./pages/Schedule";
import { AccessControl } from "./pages/AccessControl";
import { GdprRequests } from "./pages/GdprRequests";

{ path: "/schedule", element: <Schedule /> },
{ path: "/access-control", element: <AccessControl /> },
{ path: "/gdpr", element: <GdprRequests /> },
```

***

Groupe 3 terminé — 3 pages livrées, zéro warning. Dis-moi quand tu es prêt pour le **groupe 4** (pages restantes — Members, Contracts, MemberDetail, ContractDetail, Dashboard).