import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { 
  Search, Plus, Users, ChevronLeft, ChevronRight, X, Mail, Phone, 
  CreditCard, CheckSquare, Activity, ShieldAlert, ArrowRight, RotateCcw
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MemberSummary } from "../types/member";
import { computeRisk } from "../utils/memberUtils";

const ALL_MEMBERS: MemberSummary[] = [
  { id: "m-1234", firstName: "Jean", lastName: "Dupont", currentPlan: "Premium", status: "Active", homeClub: "Brussels", email: "jean@example.com", mobilePhone: "+32 471 12 34 56", lastVisitDate: "Yesterday, 18:30", totalVisits: 142, riskScore: computeRisk("Active", "Yesterday, 18:30") },
  { id: "m-1235", firstName: "Marie", lastName: "Martin", currentPlan: "Basic", status: "Active", homeClub: "Namur", email: "marie@example.com", mobilePhone: "+32 472 23 45 67", lastVisitDate: "Today, 09:15", totalVisits: 85, riskScore: computeRisk("Active", "Today, 09:15") },
  { id: "m-1236", firstName: "Luc", lastName: "Petit", currentPlan: "Premium", status: "Suspended", homeClub: "Brussels", email: "luc@example.com", mobilePhone: "+32 473 34 56 78", lastVisitDate: "3 months ago", totalVisits: 24, riskScore: computeRisk("Suspended", "3 months ago") },
  { id: "m-1237", firstName: "Sophie", lastName: "Dubois", currentPlan: "VIP", status: "Active", homeClub: "Liege", email: "sophie@example.com", mobilePhone: "+32 474 45 67 89", lastVisitDate: "Yesterday, 12:00", totalVisits: 231, riskScore: computeRisk("Active", "Yesterday, 12:00") },
  { id: "m-1238", firstName: "Pierre", lastName: "Lefevre", currentPlan: "Basic", status: "Active", homeClub: "Brussels", email: "pierre@example.com", mobilePhone: "+32 475 56 78 90", lastVisitDate: "2 days ago", totalVisits: 45, riskScore: computeRisk("Active", "2 days ago") },
  { id: "m-1239", firstName: "Julie", lastName: "Moreau", currentPlan: "Premium", status: "Active", homeClub: "Namur", email: "julie@example.com", mobilePhone: "+32 476 67 89 01", lastVisitDate: "Today, 07:45", totalVisits: 112, riskScore: computeRisk("Active", "Today, 07:45") },
  { id: "m-1240", firstName: "Antoine", lastName: "Laurent", currentPlan: "Basic", status: "Suspended", homeClub: "Liege", email: "antoine@example.com", mobilePhone: "+32 477 78 90 12", lastVisitDate: "1 month ago", totalVisits: 12, riskScore: computeRisk("Suspended", "1 month ago") },
  { id: "m-1241", firstName: "Claire", lastName: "Simon", currentPlan: "VIP", status: "Active", homeClub: "Brussels", email: "claire@example.com", mobilePhone: "+32 478 89 01 23", lastVisitDate: "Yesterday, 19:20", totalVisits: 304, riskScore: computeRisk("Active", "Yesterday, 19:20") },
  { id: "m-1242", firstName: "Thomas", lastName: "Michel", currentPlan: "Premium", status: "Active", homeClub: "Namur", email: "thomas@example.com", mobilePhone: "+32 479 90 12 34", lastVisitDate: "4 days ago", totalVisits: 67, riskScore: computeRisk("Active", "4 days ago") },
  { id: "m-1243", firstName: "Celine", lastName: "Bernard", currentPlan: "Basic", status: "Active", homeClub: "Liege", email: "celine@example.com", mobilePhone: "+32 480 01 23 45", lastVisitDate: "1 week ago", totalVisits: 38, riskScore: computeRisk("Active", "1 week ago") },
  { id: "m-1244", firstName: "Marc", lastName: "Leroy", currentPlan: null, status: "Anonymized", homeClub: null, email: "anonymized@example.com", mobilePhone: undefined, lastVisitDate: null, totalVisits: 0, riskScore: 0 },
  { id: "m-1245", firstName: "Elodie", lastName: "Roux", currentPlan: "VIP", status: "Suspended", homeClub: "Namur", email: "elodie@example.com", mobilePhone: "+32 482 23 45 67", lastVisitDate: "2 months ago", totalVisits: 189, riskScore: computeRisk("Suspended", "2 months ago") },
  { id: "m-1246", firstName: "Nicolas", lastName: "David", currentPlan: "Basic", status: "Active", homeClub: "Liege", email: "nicolas@example.com", mobilePhone: "+32 483 34 56 78", lastVisitDate: "Yesterday, 17:00", totalVisits: 54, riskScore: computeRisk("Active", "Yesterday, 17:00") },
];

export function MembersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredMembers = ALL_MEMBERS.filter(m => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(debouncedSearch.toLowerCase()) || 
                          m.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          (m.mobilePhone && m.mobilePhone.includes(debouncedSearch));
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMembers = filteredMembers.length;
  const totalPages = Math.ceil(totalMembers / ITEMS_PER_PAGE);
  const currentMembers = filteredMembers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPage(1);
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-[1440px] mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#4880FF]" />
            Members <span className="text-[#6B7280] font-medium text-lg ml-1">({totalMembers} members)</span>
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">Manage your members and their subscriptions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] text-white rounded-lg font-semibold shadow-sm hover:shadow-md hover:bg-[#3b6ee0] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add member
        </button>
      </div>

      <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-black/5 flex gap-4 items-center bg-white z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#F5F6FA] border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-[#F5F6FA] text-[#111827] rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-[#4880FF]/20 outline-none cursor-pointer"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Anonymized">Anonymized</option>
          </select>
        </div>

        <div className="overflow-x-auto flex-1 relative">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-[#F5F6FA]/50">
                <th className="py-4 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Member</th>
                <th className="py-4 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Plan</th>
                <th className="py-4 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Club</th>
                <th className="py-4 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Risk</th>
                <th className="py-4 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-black/5">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          <div className="h-3 w-48 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div></td>
                    <td className="py-4 px-6 text-right"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : currentMembers.length > 0 ? (
                currentMembers.map(member => (
                  <motion.tr 
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    whileHover={{ backgroundColor: "#F9FAFB" }}
                    className="border-b border-black/5 last:border-0 group cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.status === 'Anonymized' ? 'bg-[#F0F0F0] text-[#A6A6A6]' : 'bg-[#4880FF]/10 text-[#4880FF]'}`}>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-semibold transition-colors ${member.status === 'Anonymized' ? 'text-[#A6A6A6]' : 'text-[#111827] group-hover:text-[#4880FF]'}`}>
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-[#6B7280] mt-0.5">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        member.status === 'Active' ? 'bg-[#00B69B]/10 text-[#00B69B]' : 
                        member.status === 'Suspended' ? 'bg-[#FF9066]/10 text-[#FF9066]' : 
                        'bg-[#E0E0E0]/50 text-[#A6A6A6]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          member.status === 'Active' ? 'bg-[#00B69B]' : 
                          member.status === 'Suspended' ? 'bg-[#FF9066]' : 
                          'bg-[#A6A6A6]'
                        }`}></span>
                        {member.status === 'Active' ? 'Active' : member.status === 'Suspended' ? 'Suspended' : 'Anonymized'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-[#111827]">
                      {member.currentPlan ?? <span className="text-[#A6A6A6] italic text-xs">No plan</span>}
                    </td>
                    <td className="py-4 px-6 text-[#6B7280]">{member.homeClub ?? "—"}</td>
                    <td className="py-4 px-6">
                      {member.status === 'Anonymized' ? (
                        <span className="text-[#A6A6A6]">—</span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          member.riskScore <= 30 ? 'bg-[#00B69B]/10 text-[#00B69B]' : 
                          member.riskScore <= 60 ? 'bg-[#FF9066]/10 text-[#FF9066]' : 'bg-[#FF4747]/10 text-[#FF4747]'
                        }`}>
                          {member.riskScore}/100
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/members/${member.id}`);
                        }}
                        className="text-sm font-semibold text-[#4880FF] hover:underline"
                      >
                        Open profile
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-[#F5F6FA] rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-[#6B7280]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#111827] mb-2">No members found</h3>
                      <p className="text-[#6B7280] mb-6 max-w-sm">No members match your search criteria. Try modifying your filters.</p>
                      <button 
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#4880FF] text-[#4880FF] rounded-lg font-semibold hover:bg-[#F5F8FF] transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalMembers > 0 && (
          <div className="p-4 border-t border-black/5 bg-white flex items-center justify-between">
            <span className="text-sm text-[#6B7280]">
              Showing <span className="font-semibold text-[#111827]">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold text-[#111827]">{Math.min(page * ITEMS_PER_PAGE, totalMembers)}</span> of <span className="font-semibold text-[#111827]">{totalMembers}</span> results
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-black/10 rounded-lg text-[#111827] hover:bg-[#F5F6FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-black/10 rounded-lg text-[#111827] hover:bg-[#F5F6FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSelectedMember(null)}
            />
            <motion.div 
              initial={{ x: "100%", boxShadow: "-4px 0 24px rgba(0,0,0,0)" }}
              animate={{ x: 0, boxShadow: "-4px 0 24px rgba(0,0,0,0.1)" }}
              exit={{ x: "100%", boxShadow: "-4px 0 24px rgba(0,0,0,0)" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[420px] bg-white z-50 flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${selectedMember.status === 'Anonymized' ? 'bg-[#F0F0F0] text-[#A6A6A6]' : 'bg-[#4880FF]/10 text-[#4880FF]'}`}>
                    {selectedMember.firstName.charAt(0)}{selectedMember.lastName.charAt(0)}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${selectedMember.status === 'Anonymized' ? 'text-[#A6A6A6]' : 'text-[#111827]'}`}>
                      {selectedMember.firstName} {selectedMember.lastName}
                    </h2>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        selectedMember.status === 'Active' ? 'bg-[#00B69B]/10 text-[#00B69B]' : 
                        selectedMember.status === 'Suspended' ? 'bg-[#FF9066]/10 text-[#FF9066]' : 
                        'bg-[#E0E0E0]/50 text-[#A6A6A6]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          selectedMember.status === 'Active' ? 'bg-[#00B69B]' : 
                          selectedMember.status === 'Suspended' ? 'bg-[#FF9066]' : 
                          'bg-[#A6A6A6]'
                        }`}></span>
                        {selectedMember.status === 'Active' ? 'Active' : selectedMember.status === 'Suspended' ? 'Suspended' : 'Anonymized'}
                      </span>
                      {selectedMember.status !== 'Anonymized' && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          selectedMember.riskScore <= 30 ? 'bg-[#00B69B]/10 text-[#00B69B]' : 
                          selectedMember.riskScore <= 60 ? 'bg-[#FF9066]/10 text-[#FF9066]' : 'bg-[#FF4747]/10 text-[#FF4747]'
                        }`}>
                          Risk: {selectedMember.riskScore}/100
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="p-2 text-[#6B7280] hover:bg-[#F5F6FA] hover:text-[#111827] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Alertes (mock) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Active Alerts</h3>
                  {selectedMember.status === 'Suspended' ? (
                    <div className="flex gap-3 p-3 bg-[#FF9066]/10 rounded-xl border border-[#FF9066]/20">
                      <ShieldAlert className="w-5 h-5 text-[#FF9066] shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-[#FF9066] mt-0.5">Subscription suspended</div>
                        <div className="text-xs text-[#FF9066]/80 mt-1">Check the full profile for more details.</div>
                      </div>
                    </div>
                  ) : selectedMember.status === 'Anonymized' ? (
                    <div className="flex gap-3 p-3 bg-[#E0E0E0]/50 rounded-xl border border-[#E0E0E0]">
                      <ShieldAlert className="w-5 h-5 text-[#A6A6A6] shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-[#A6A6A6] mt-0.5">Anonymized Member</div>
                        <div className="text-xs text-[#A6A6A6] mt-1">Data has been removed to comply with GDPR.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 p-3 bg-[#00B69B]/10 rounded-xl border border-[#00B69B]/20">
                      <CheckSquare className="w-5 h-5 text-[#00B69B] shrink-0" />
                      <div className="text-sm font-semibold text-[#00B69B] mt-0.5">No alerts</div>
                    </div>
                  )}
                </div>

                {/* Actions Rapides */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button disabled={selectedMember.status === 'Anonymized'} className="flex flex-col items-center gap-2 p-3 bg-[#F5F6FA] hover:bg-[#EBEBFF] hover:text-[#4880FF] text-[#111827] disabled:opacity-50 disabled:hover:bg-[#F5F6FA] disabled:hover:text-[#111827] rounded-xl transition-colors text-sm font-medium">
                      <Mail className="w-5 h-5" /> Email
                    </button>
                    <button disabled={selectedMember.status === 'Anonymized'} className="flex flex-col items-center gap-2 p-3 bg-[#F5F6FA] hover:bg-[#EBEBFF] hover:text-[#4880FF] text-[#111827] disabled:opacity-50 disabled:hover:bg-[#F5F6FA] disabled:hover:text-[#111827] rounded-xl transition-colors text-sm font-medium">
                      <Phone className="w-5 h-5" /> Call
                    </button>
                    <button disabled={selectedMember.status === 'Anonymized'} className="flex flex-col items-center gap-2 p-3 bg-[#F5F6FA] hover:bg-[#EBEBFF] hover:text-[#4880FF] text-[#111827] disabled:opacity-50 disabled:hover:bg-[#F5F6FA] disabled:hover:text-[#111827] rounded-xl transition-colors text-sm font-medium">
                      <CreditCard className="w-5 h-5" /> Create payment
                    </button>
                    <button disabled={selectedMember.status === 'Anonymized'} className="flex flex-col items-center gap-2 p-3 bg-[#F5F6FA] hover:bg-[#EBEBFF] hover:text-[#4880FF] text-[#111827] disabled:opacity-50 disabled:hover:bg-[#F5F6FA] disabled:hover:text-[#111827] rounded-xl transition-colors text-sm font-medium">
                      <CheckSquare className="w-5 h-5" /> Check-in
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border border-black/5 rounded-xl">
                      <span className="text-sm text-[#6B7280]">Total collected</span>
                      <Link to={`/members/${selectedMember.id}`} className="text-sm font-semibold text-[#4880FF] hover:underline">
                        View profile →
                      </Link>
                    </div>
                    <div className="flex justify-between items-center p-3 border border-black/5 rounded-xl">
                      <span className="text-sm text-[#6B7280]">Pending invoices</span>
                      <Link to={`/members/${selectedMember.id}`} className="text-sm font-semibold text-[#4880FF] hover:underline">
                        View profile →
                      </Link>
                    </div>
                    <div className="flex justify-between items-center p-3 border border-black/5 rounded-xl">
                      <span className="text-sm text-[#6B7280]">Last visit</span>
                      <span className="text-sm font-semibold text-[#111827]">{selectedMember.lastVisitDate ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-black/5 bg-[#F5F6FA]/50">
                <Link 
                  to={`/members/${selectedMember.id}`}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors shadow-sm"
                >
                  Open full profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </>
        )}

        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Add New Member</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">First Name</label>
                    <input type="text" className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]" placeholder="Jean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Last Name</label>
                    <input type="text" className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]" placeholder="Dupont" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
                  <input type="email" className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]" placeholder="jean.dupont@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Phone</label>
                  <input type="tel" className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]" placeholder="+32 400 00 00 00" />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success("Member successfully added!");
                    setShowAddModal(false);
                  }}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors"
                >
                  Add Member
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
