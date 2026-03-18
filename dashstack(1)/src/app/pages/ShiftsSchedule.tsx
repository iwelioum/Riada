import { useState } from "react";
import { motion } from "motion/react";
import { CalendarRange, ChevronLeft, ChevronRight, Clock } from "lucide-react";

type ShiftType = "Opening" | "Morning" | "Afternoon" | "Evening" | "Closing" | "Custom";

interface Shift {
  id: number;
  employeeId: number;
  employeeName: string;
  role: string;
  clubName: string;
  dayOfWeek: number; // 0 = Mon … 6 = Sun
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SHIFT_COLORS: Record<ShiftType, { bg: string; text: string; border: string }> = {
  Opening:   { bg: "bg-[#E0F8EA]",  text: "text-[#00B69B]", border: "border-[#00B69B]/30" },
  Morning:   { bg: "bg-[#EBEBFF]",  text: "text-[#4880FF]", border: "border-[#4880FF]/30" },
  Afternoon: { bg: "bg-[#FFF3D6]",  text: "text-[#FF9066]", border: "border-[#FF9066]/30" },
  Evening:   { bg: "bg-[#F3F0FF]",  text: "text-[#8B5CF6]", border: "border-[#8B5CF6]/30" },
  Closing:   { bg: "bg-[#FFF0F0]",  text: "text-[#FF4747]", border: "border-[#FF4747]/30" },
  Custom:    { bg: "bg-[#F5F6FA]",  text: "text-[#6B7280]", border: "border-[#E0E0E0]"    },
};

const MOCK_SHIFTS: Shift[] = [
  // Sophie Lambert (Manager) – Brussels
  { id: 1,  employeeId: 1, employeeName: "Sophie Lambert", role: "Manager",     clubName: "Brussels", dayOfWeek: 0, shiftType: "Morning",   startTime: "08:00", endTime: "16:00" },
  { id: 2,  employeeId: 1, employeeName: "Sophie Lambert", role: "Manager",     clubName: "Brussels", dayOfWeek: 1, shiftType: "Morning",   startTime: "08:00", endTime: "16:00" },
  { id: 3,  employeeId: 1, employeeName: "Sophie Lambert", role: "Manager",     clubName: "Brussels", dayOfWeek: 2, shiftType: "Morning",   startTime: "08:00", endTime: "16:00" },
  { id: 4,  employeeId: 1, employeeName: "Sophie Lambert", role: "Manager",     clubName: "Brussels", dayOfWeek: 3, shiftType: "Morning",   startTime: "08:00", endTime: "16:00" },
  { id: 5,  employeeId: 1, employeeName: "Sophie Lambert", role: "Manager",     clubName: "Brussels", dayOfWeek: 4, shiftType: "Morning",   startTime: "08:00", endTime: "16:00" },

  // Marc Dubois (Receptionist) – Brussels
  { id: 6,  employeeId: 2, employeeName: "Marc Dubois",    role: "Receptionist", clubName: "Brussels", dayOfWeek: 0, shiftType: "Opening",   startTime: "06:00", endTime: "14:00" },
  { id: 7,  employeeId: 2, employeeName: "Marc Dubois",    role: "Receptionist", clubName: "Brussels", dayOfWeek: 2, shiftType: "Opening",   startTime: "06:00", endTime: "14:00" },
  { id: 8,  employeeId: 2, employeeName: "Marc Dubois",    role: "Receptionist", clubName: "Brussels", dayOfWeek: 4, shiftType: "Closing",   startTime: "14:00", endTime: "22:00" },
  { id: 9,  employeeId: 2, employeeName: "Marc Dubois",    role: "Receptionist", clubName: "Brussels", dayOfWeek: 5, shiftType: "Closing",   startTime: "14:00", endTime: "22:00" },

  // Nora Petit (Instructor) – Namur
  { id: 10, employeeId: 3, employeeName: "Nora Petit",     role: "Instructor",  clubName: "Namur",    dayOfWeek: 1, shiftType: "Afternoon", startTime: "10:00", endTime: "18:00" },
  { id: 11, employeeId: 3, employeeName: "Nora Petit",     role: "Instructor",  clubName: "Namur",    dayOfWeek: 3, shiftType: "Afternoon", startTime: "10:00", endTime: "18:00" },
  { id: 12, employeeId: 3, employeeName: "Nora Petit",     role: "Instructor",  clubName: "Namur",    dayOfWeek: 5, shiftType: "Afternoon", startTime: "10:00", endTime: "18:00" },
  { id: 13, employeeId: 3, employeeName: "Nora Petit",     role: "Instructor",  clubName: "Namur",    dayOfWeek: 6, shiftType: "Morning",   startTime: "09:00", endTime: "13:00" },

  // Kevin Maes (Instructor) – Liège
  { id: 14, employeeId: 4, employeeName: "Kevin Maes",     role: "Instructor",  clubName: "Liège",    dayOfWeek: 0, shiftType: "Evening",   startTime: "14:00", endTime: "22:00" },
  { id: 15, employeeId: 4, employeeName: "Kevin Maes",     role: "Instructor",  clubName: "Liège",    dayOfWeek: 2, shiftType: "Evening",   startTime: "14:00", endTime: "22:00" },
  { id: 16, employeeId: 4, employeeName: "Kevin Maes",     role: "Instructor",  clubName: "Liège",    dayOfWeek: 4, shiftType: "Evening",   startTime: "14:00", endTime: "22:00" },

  // Lena Bogaert (Technician) – Brussels
  { id: 17, employeeId: 5, employeeName: "Lena Bogaert",   role: "Technician",  clubName: "Brussels", dayOfWeek: 1, shiftType: "Custom",    startTime: "09:00", endTime: "17:00" },
  { id: 18, employeeId: 5, employeeName: "Lena Bogaert",   role: "Technician",  clubName: "Brussels", dayOfWeek: 3, shiftType: "Custom",    startTime: "09:00", endTime: "17:00" },
];

const CLUBS = ["All clubs", "Brussels", "Namur", "Liège"];

function getWeekStart(offset: number): Date {
  const today = new Date(2026, 2, 18); // 18 March 2026 = Wednesday (index 2)
  const monday = new Date(today);
  monday.setDate(today.getDate() - 2 + offset * 7); // go back to Monday
  return monday;
}

function formatWeekRange(weekOffset: number): string {
  const start = getWeekStart(weekOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getDayDate(weekOffset: number, dayIdx: number): string {
  const start = getWeekStart(weekOffset);
  const d = new Date(start);
  d.setDate(start.getDate() + dayIdx);
  return d.getDate().toString();
}

// Today is Wednesday = index 2 in our week (Mon=0)
const TODAY_DAY_IDX = 2;

const UNIQUE_EMPLOYEES = Array.from(
  new Map(MOCK_SHIFTS.map(s => [s.employeeId, { id: s.employeeId, name: s.employeeName, role: s.role, club: s.clubName }])).values()
);

export function ShiftsSchedule() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [clubFilter, setClubFilter] = useState("All clubs");

  const filteredEmployees = clubFilter === "All clubs"
    ? UNIQUE_EMPLOYEES
    : UNIQUE_EMPLOYEES.filter(e => e.club === clubFilter);

  const visibleShifts = MOCK_SHIFTS.filter(s =>
    clubFilter === "All clubs" || s.clubName === clubFilter
  );

  const getShifts = (empId: number, day: number) =>
    visibleShifts.filter(s => s.employeeId === empId && s.dayOfWeek === day);

  const totalShiftsThisWeek = visibleShifts.length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <CalendarRange className="w-6 h-6 text-[#4880FF]" /> Shift Schedule
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {totalShiftsThisWeek} shift{totalShiftsThisWeek !== 1 ? "s" : ""} · {formatWeekRange(weekOffset)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Club filter */}
            <div className="flex rounded-xl overflow-hidden border border-[#E0E0E0]">
              {CLUBS.map((c) => (
                <button
                  key={c}
                  onClick={() => setClubFilter(c)}
                  className={`px-3 py-2 text-sm font-semibold transition-colors ${
                    clubFilter === c
                      ? "bg-[#4880FF] text-white"
                      : "bg-white text-[#6B7280] hover:bg-[#F8FAFF]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Week navigation */}
            <div className="flex items-center gap-1 border border-[#E0E0E0] rounded-xl overflow-hidden">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="px-3 py-2 text-[#6B7280] hover:bg-[#F8FAFF] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className={`px-3 py-2 text-sm font-semibold transition-colors ${
                  weekOffset === 0 ? "bg-[#4880FF] text-white" : "text-[#6B7280] hover:bg-[#F8FAFF]"
                }`}
              >
                This week
              </button>
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="px-3 py-2 text-[#6B7280] hover:bg-[#F8FAFF] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-2 flex-shrink-0 flex items-center gap-4">
        {(Object.entries(SHIFT_COLORS) as [ShiftType, typeof SHIFT_COLORS[ShiftType]][]).map(([type, { bg, text }]) => (
          <span key={type} className={`flex items-center gap-1.5 text-xs font-semibold ${text}`}>
            <span className={`w-2.5 h-2.5 rounded-sm ${bg} inline-block`} />
            {type}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden min-w-[800px]"
        >
          {/* Column headers */}
          <div className="grid border-b border-[#E0E0E0]" style={{ gridTemplateColumns: "200px repeat(7, 1fr)" }}>
            <div className="px-4 py-3 bg-[#F8FAFF] border-r border-[#E0E0E0]">
              <span className="text-xs font-bold text-[#6B7280] uppercase">Employee</span>
            </div>
            {DAYS.map((day, i) => {
              const isToday = weekOffset === 0 && i === TODAY_DAY_IDX;
              return (
                <div
                  key={day}
                  className={`px-3 py-3 text-center border-r border-[#E0E0E0] last:border-r-0 ${isToday ? "bg-[#EBEBFF]" : "bg-[#F8FAFF]"}`}
                >
                  <p className={`text-xs font-bold uppercase ${isToday ? "text-[#4880FF]" : "text-[#6B7280]"}`}>{day}</p>
                  <p className={`text-lg font-black ${isToday ? "text-[#4880FF]" : "text-[#111827]"}`}>
                    {getDayDate(weekOffset, i)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Employee rows */}
          {filteredEmployees.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-[#A6A6A6]">
              No employees for this club
            </div>
          ) : (
            filteredEmployees.map((emp, empIdx) => (
              <div
                key={emp.id}
                className={`grid border-b border-[#F0F0F0] last:border-b-0 ${empIdx % 2 === 0 ? "" : "bg-[#FAFAFA]"}`}
                style={{ gridTemplateColumns: "200px repeat(7, 1fr)" }}
              >
                {/* Employee info */}
                <div className="px-4 py-3 border-r border-[#E0E0E0] flex flex-col justify-center">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <div className="w-7 h-7 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center justify-center text-xs font-bold shrink-0">
                      {emp.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111827] truncate">{emp.name}</p>
                      <p className="text-[11px] text-[#A6A6A6]">{emp.role} · {emp.club}</p>
                    </div>
                  </div>
                </div>

                {/* Day cells */}
                {DAYS.map((_, dayIdx) => {
                  const shifts = getShifts(emp.id, dayIdx);
                  const isToday = weekOffset === 0 && dayIdx === TODAY_DAY_IDX;
                  return (
                    <div
                      key={dayIdx}
                      className={`px-2 py-2 border-r border-[#F0F0F0] last:border-r-0 min-h-[64px] flex flex-col gap-1 ${isToday ? "bg-[#F8FAFF]" : ""}`}
                    >
                      {shifts.map(shift => {
                        const col = SHIFT_COLORS[shift.shiftType];
                        return (
                          <div
                            key={shift.id}
                            className={`rounded-lg px-2 py-1 border ${col.bg} ${col.border}`}
                          >
                            <p className={`text-[11px] font-bold ${col.text}`}>{shift.shiftType}</p>
                            <p className="text-[10px] text-[#6B7280] flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {shift.startTime}–{shift.endTime}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </motion.div>

        {/* ShiftType summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5 grid grid-cols-3 md:grid-cols-6 gap-4"
        >
          {(Object.entries(SHIFT_COLORS) as [ShiftType, typeof SHIFT_COLORS[ShiftType]][]).map(([type, { bg, text }]) => {
            const count = visibleShifts.filter(s => s.shiftType === type).length;
            return (
              <div key={type} className={`bg-white rounded-xl border ${SHIFT_COLORS[type].border} p-4 text-center`}>
                <p className={`text-2xl font-black ${text}`}>{count}</p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">{type}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
