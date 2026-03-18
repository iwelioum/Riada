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
  { id: 4, name: "Riada Ghent", city: "Ghent", operationalStatus: "TemporarilyClosed", is24_7: true, employeeCount: 0, equipmentCount: 0 },
];

type Club = (typeof MOCK_CLUBS)[0];

function statusBadge(status: string): string {
  switch (status) {
    case "Open": return "bg-[#E0F8EA] text-[#00B69B]";
    case "TemporarilyClosed": return "bg-[#FFF3D6] text-[#FF9066]";
    case "PermanentlyClosed": return "bg-[#FFF0F0] text-[#FF4747]";
    default: return "bg-[#F5F6FA] text-[#6B7280]";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "TemporarilyClosed": return "Temp. closed";
    case "PermanentlyClosed": return "Closed";
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