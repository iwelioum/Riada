import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dumbbell, Plus, X, Check, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";

type EquipmentStatus = "InService" | "UnderMaintenance" | "Broken" | "Retired";
type TicketPriority = "Low" | "Medium" | "High" | "Critical";
type TicketStatus = "Reported" | "Assigned" | "InProgress" | "Resolved";

interface Equipment {
  id: number;
  name: string;
  type: string;
  brand: string;
  model: string;
  acquisitionYear: number;
  status: EquipmentStatus;
  clubName: string;
  ticket: MaintenanceTicket | null;
}

interface MaintenanceTicket {
  id: number;
  priority: TicketPriority;
  description: string;
  status: TicketStatus;
  resolvedAt: string | null;
}

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 1, name: "Treadmill A1", type: "Cardio", brand: "Life Fitness", model: "T5", acquisitionYear: 2021, status: "InService", clubName: "Brussels", ticket: null },
  { id: 2, name: "Squat Rack B3", type: "Strength", brand: "Rogue", model: "R-3", acquisitionYear: 2020, status: "UnderMaintenance", clubName: "Brussels", ticket: { id: 1, priority: "High", description: "Safety bar cracked", status: "InProgress", resolvedAt: null } },
  { id: 3, name: "Rowing Machine C2", type: "Cardio", brand: "Concept2", model: "Model D", acquisitionYear: 2022, status: "InService", clubName: "Namur", ticket: null },
  { id: 4, name: "Leg Press D1", type: "Strength", brand: "Technogym", model: "Selection Pro", acquisitionYear: 2019, status: "Broken", clubName: "Liège", ticket: { id: 2, priority: "Critical", description: "Hydraulic failure — machine inoperable", status: "Reported", resolvedAt: null } },
  { id: 5, name: "Elliptical E2", type: "Cardio", brand: "Precor", model: "EFX 885", acquisitionYear: 2023, status: "InService", clubName: "Brussels", ticket: null },
];

const STATUS_CLASSES: Record<EquipmentStatus, string> = {
  InService: "bg-[#E0F8EA] text-[#00B69B]",
  UnderMaintenance: "bg-[#FFF3D6] text-[#FF9066]",
  Broken: "bg-[#FFF0F0] text-[#FF4747]",
  Retired: "bg-[#F5F6FA] text-[#A6A6A6]",
};

const PRIORITY_CLASSES: Record<TicketPriority, string> = {
  Low: "bg-[#E0F8EA] text-[#00B69B]",
  Medium: "bg-[#FFF3D6] text-[#FF9066]",
  High: "bg-[#FFF0F0] text-[#FF4747]",
  Critical: "bg-[#FF4747] text-white",
};

const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];
const TICKET_STATUSES: TicketStatus[] = ["Reported", "Assigned", "InProgress", "Resolved"];

export function Equipment() {
  const [equipment, setEquipment] = useState(MOCK_EQUIPMENT);
  const [search, setSearch] = useState("");
  const [showCreateTicket, setShowCreateTicket] = useState<Equipment | null>(null);
  const [showUpdateTicket, setShowUpdateTicket] = useState<Equipment | null>(null);
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>("Medium");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>("Open");
  const [ticketResolvedAt, setTicketResolvedAt] = useState("");

  const filtered = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.brand.toLowerCase().includes(search.toLowerCase()) ||
      e.clubName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateTicket = () => {
    if (!ticketDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!showCreateTicket) return;
    const newTicket: MaintenanceTicket = {
      id: Date.now(),
      priority: ticketPriority,
      description: ticketDescription,
      status: "Reported",
      resolvedAt: null,
    };
    setEquipment(
      equipment.map((e) =>
        e.id === showCreateTicket.id
          ? { ...e, ticket: newTicket, status: "UnderMaintenance" }
          : e
      )
    );
    toast.success("Maintenance ticket created");
    setShowCreateTicket(null);
    setTicketDescription("");
    setTicketPriority("Medium");
  };

  const handleUpdateTicket = () => {
    if (!showUpdateTicket) return;
    const resolved = ticketStatus === "Resolved"
      ? ticketResolvedAt || new Date().toISOString().split("T")[0]
      : null;
    setEquipment(
      equipment.map((e) =>
        e.id === showUpdateTicket.id && e.ticket
          ? {
              ...e,
              ticket: { ...e.ticket, status: ticketStatus, resolvedAt: resolved },
              status: ticketStatus === "Resolved" ? "InService" : e.status,
            }
          : e
      )
    );
    toast.success("Ticket updated");
    setShowUpdateTicket(null);
  };

  const openUpdateTicket = (eq: Equipment) => {
    if (!eq.ticket) return;
    setTicketStatus(eq.ticket.status);
    setTicketResolvedAt(eq.ticket.resolvedAt ?? "");
    setShowUpdateTicket(eq);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-[#4880FF]" /> Equipment
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-56">
            <Search className="w-4 h-4 text-[#A6A6A6] shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
            />
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
                {["Name", "Type", "Brand / Model", "Year", "Club", "Status", "Ticket", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq) => (
                <tr key={eq.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111827]">{eq.name}</td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">{eq.type}</td>
                  <td className="px-5 py-4 text-sm text-[#111827]">
                    {eq.brand} <span className="text-[#A6A6A6]">/ {eq.model}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">{eq.acquisitionYear}</td>
                  <td className="px-5 py-4 text-sm text-[#111827] font-medium">{eq.clubName}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASSES[eq.status]}`}>
                      {eq.status === "UnderMaintenance" ? "Maintenance" : eq.status === "InService" ? "In Service" : eq.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {eq.ticket ? (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_CLASSES[eq.ticket.priority]}`}>
                        {eq.ticket.priority}
                      </span>
                    ) : (
                      <span className="text-[#A6A6A6] text-sm">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {eq.ticket ? (
                      <button
                        onClick={() => openUpdateTicket(eq)}
                        className="text-sm text-[#FF9066] font-semibold hover:underline"
                      >
                        Update ticket
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowCreateTicket(eq);
                          setTicketDescription("");
                          setTicketPriority("Medium");
                        }}
                        className="flex items-center gap-1 text-sm text-[#4880FF] font-semibold hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ticket
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreateTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">New maintenance ticket</h3>
                <button onClick={() => setShowCreateTicket(null)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] mb-4 text-sm font-semibold text-[#111827]">
                {showCreateTicket.name} — {showCreateTicket.brand} {showCreateTicket.model}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setTicketPriority(p)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          ticketPriority === p
                            ? PRIORITY_CLASSES[p] + " border-transparent"
                            : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Description</label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Describe the issue…"
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] resize-none h-24"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowCreateTicket(null)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleCreateTicket} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Create ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Update Ticket Modal */}
        {showUpdateTicket && showUpdateTicket.ticket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpdateTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Update ticket</h3>
                <button onClick={() => setShowUpdateTicket(null)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-[#FFF3D6] rounded-xl border border-[#FF9066]/30 mb-4 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PRIORITY_CLASSES[showUpdateTicket.ticket.priority]}`}>
                    {showUpdateTicket.ticket.priority}
                  </span>
                  <span className="font-bold text-[#111827]">{showUpdateTicket.name}</span>
                </div>
                <p className="text-[#6B7280]">{showUpdateTicket.ticket.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Status</label>
                  <div className="flex gap-2">
                    {TICKET_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setTicketStatus(s)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          ticketStatus === s
                            ? "bg-[#4880FF] text-white border-[#4880FF]"
                            : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {ticketStatus === "Resolved" && (
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Resolution date</label>
                    <input
                      type="date"
                      value={ticketResolvedAt}
                      onChange={(e) => setTicketResolvedAt(e.target.value)}
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowUpdateTicket(null)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleUpdateTicket} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}