import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Plus, X, Check, Clock, Users, MapPin } from "lucide-react";
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