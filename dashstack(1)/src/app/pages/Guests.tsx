import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserPlus, Plus, X, Check, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

type GuestStatus = "Active" | "Banned";

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  status: GuestStatus;
  sponsorName: string;
  sponsorMemberId: number;
}

const MOCK_GUESTS: Guest[] = [
  { id: 1, firstName: "Alice", lastName: "Fontaine", dateOfBirth: "1995-07-22", email: "alice@email.com", status: "Active", sponsorName: "Jean Dupont", sponsorMemberId: 1 },
  { id: 2, firstName: "Bruno", lastName: "Renard", dateOfBirth: "1988-11-04", email: "bruno@email.com", status: "Active", sponsorName: "Marie Martin", sponsorMemberId: 2 },
  { id: 3, firstName: "Clara", lastName: "Morin", dateOfBirth: "2000-03-15", email: "clara@email.com", status: "Banned", sponsorName: "Jean Dupont", sponsorMemberId: 1 },
];

const MOCK_MEMBERS = [
  { id: 1, name: "Jean Dupont" },
  { id: 2, name: "Marie Martin" },
  { id: 3, name: "Luc Bernard" },
  { id: 4, name: "Sophie Leroy" },
];

const STATUS_CLASSES: Record<GuestStatus, string> = {
  Active: "bg-[#E0F8EA] text-[#00B69B]",
  Banned: "bg-[#FFF0F0] text-[#FF4747]",
};

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  sponsorMemberId: 1,
};

export function Guests() {
  const [guests, setGuests] = useState(MOCK_GUESTS);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState<Guest | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sponsorSearch, setSponsorSearch] = useState("");

  const filtered = guests.filter(
    (g) =>
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.sponsorName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMembers = MOCK_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(sponsorSearch.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("First name, last name and email are required");
      return;
    }
    const sponsor = MOCK_MEMBERS.find((m) => m.id === Number(form.sponsorMemberId));
    const newGuest: Guest = {
      id: guests.length + 1,
      firstName: form.firstName,
      lastName: form.lastName,
      dateOfBirth: form.dateOfBirth,
      email: form.email,
      status: "Active",
      sponsorName: sponsor?.name ?? "—",
      sponsorMemberId: Number(form.sponsorMemberId),
    };
    setGuests([newGuest, ...guests]);
    toast.success(`Guest ${form.firstName} ${form.lastName} registered`);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSponsorSearch("");
  };

  const handleBan = (guest: Guest) => {
    setGuests(
      guests.map((g) =>
        g.id === guest.id ? { ...g, status: "Banned" } : g
      )
    );
    toast.success(`${guest.firstName} ${guest.lastName} has been banned`);
    setShowBanConfirm(null);
  };

  const inputClass =
    "w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-sm";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-[#4880FF]" /> Guests
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {filtered.length} guest{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setSponsorSearch(""); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all"
            >
              <Plus className="w-4 h-4" /> Register guest
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
                {["Name", "Date of birth", "Email", "Sponsor", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#A6A6A6]">No guests found</td>
                </tr>
              ) : (
                filtered.map((guest) => (
                  <tr key={guest.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center justify-center text-sm font-bold shrink-0">
                          {guest.firstName[0]}{guest.lastName[0]}
                        </div>
                        <span className="font-bold text-[#111827]">
                          {guest.firstName} {guest.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{guest.dateOfBirth || "—"}</td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{guest.email}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#4880FF]">{guest.sponsorName}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASSES[guest.status]}`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {guest.status !== "Banned" && (
                        <button
                          onClick={() => setShowBanConfirm(guest)}
                          className="flex items-center gap-1 text-sm text-[#FF4747] font-semibold hover:underline"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Register a guest</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Sponsor autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Sponsor member</label>
                  <input
                    type="text"
                    placeholder="Search member…"
                    value={sponsorSearch}
                    onChange={(e) => setSponsorSearch(e.target.value)}
                    className={inputClass}
                  />
                  {sponsorSearch && filteredMembers.length > 0 && (
                    <div className="mt-1 bg-white border border-[#E0E0E0] rounded-xl shadow-sm overflow-hidden">
                      {filteredMembers.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setForm({ ...form, sponsorMemberId: m.id });
                            setSponsorSearch(m.name);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F8FAFF] transition-colors ${
                            form.sponsorMemberId === m.id ? "font-bold text-[#4880FF]" : "text-[#111827]"
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">First name</label>
                    <input className={inputClass} value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Alice" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Last name</label>
                    <input className={inputClass} value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Fontaine" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Date of birth</label>
                    <input className={inputClass} type="date" value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
                    <input className={inputClass} type="email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="alice@email.com" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Register guest
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Ban Confirm Modal */}
        {showBanConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBanConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#FF4747]" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">Ban this guest?</h3>
              </div>
              <p className="text-sm text-[#6B7280] mb-6">
                <span className="font-bold text-[#111827]">{showBanConfirm.firstName} {showBanConfirm.lastName}</span>{" "}
                will be permanently banned and denied access to all clubs.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowBanConfirm(null)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={() => handleBan(showBanConfirm)} className="flex-1 py-2.5 bg-[#FF4747] text-white font-semibold rounded-xl hover:bg-[#e03d3d] transition-colors flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Confirm ban
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}