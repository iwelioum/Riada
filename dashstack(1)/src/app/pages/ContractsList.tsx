import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { 
  Search, Plus, FileText, ChevronLeft, ChevronRight, X, AlertTriangle
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

const MOCK_CONTRACTS = [
  { id: 1, memberName: "Jean Dupont", memberId: "m-1234", planName: "Premium", status: "Active", startDate: "2025-01-01", endDate: null, homeClub: "Brussels", type: "OpenEnded" },
  { id: 2, memberName: "Jean Dupont", memberId: "m-1234", planName: "Basic", status: "Expired", startDate: "2024-01-01", endDate: "2024-12-31", homeClub: "Brussels", type: "FixedTerm" },
  { id: 3, memberName: "Luc Petit", memberId: "m-1236", planName: "Premium", status: "Suspended", startDate: "2025-03-01", endDate: null, homeClub: "Brussels", type: "OpenEnded" },
  { id: 4, memberName: "Marie Martin", memberId: "m-1235", planName: "VIP", status: "Active", startDate: "2025-02-15", endDate: "2026-02-14", homeClub: "Namur", type: "FixedTerm" },
  { id: 5, memberName: "Sophie Dubois", memberId: "m-1237", planName: "Basic", status: "Cancelled", startDate: "2024-06-01", endDate: "2024-10-15", homeClub: "Liege", type: "OpenEnded" },
];

export function ContractsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredContracts = useMemo(() => {
    return MOCK_CONTRACTS.filter(c => {
      const matchesSearch = c.memberName.toLowerCase().includes(search.toLowerCase()) || 
                            c.id.toString().includes(search);
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="p-8 h-full flex flex-col max-w-[1440px] mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#4880FF]" />
            Contracts <span className="text-[#6B7280] font-medium text-lg ml-1">({filteredContracts.length})</span>
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">Manage all member subscriptions and agreements</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] text-white rounded-lg font-semibold shadow-sm hover:shadow-md hover:bg-[#3b6ee0] transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Contract
        </button>
      </div>

      <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-black/5 flex gap-4 items-center bg-white z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search by member name or contract ID..."
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
          <div className="flex gap-2">
            {["All", "Active", "Suspended", "Expired", "Cancelled"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  statusFilter === status 
                    ? "bg-[#4880FF] text-white shadow-sm" 
                    : "bg-[#F5F6FA] text-[#6B7280] hover:bg-[#EAEBF0] hover:text-[#111827]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:border-black/5">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider w-24">ID</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Member</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Plan</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Dates</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-4 px-6"><div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="w-16 h-4 bg-gray-200 rounded animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B7280]">
                    <FileText className="w-12 h-12 mx-auto text-[#E0E0E0] mb-3" />
                    <p className="font-semibold text-[#111827]">No contracts found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => {
                  let statusBg = "bg-[#F5F6FA]", statusText = "text-[#6B7280]";
                  if (contract.status === "Active") { statusBg = "bg-[#E0F8EA]"; statusText = "text-[#00B69B]"; }
                  else if (contract.status === "Suspended") { statusBg = "bg-[#FFF3D6]"; statusText = "text-[#FF9066]"; }
                  else if (contract.status === "Expired" || contract.status === "Cancelled") { statusBg = "bg-[#FFF0F0]"; statusText = "text-[#FF4747]"; }

                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={contract.id} 
                      className="border-b border-black/5 hover:bg-[#F8FAFF] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                    >
                      <td className="py-4 px-6 font-semibold text-[#111827]">#{contract.id}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-[#111827] hover:text-[#4880FF] transition-colors" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/members/${contract.memberId}`);
                        }}>
                          {contract.memberName}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-[#6B7280]">{contract.planName}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBg} ${statusText}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[#6B7280]">{contract.type === "OpenEnded" ? "Open-Ended" : "Fixed-Term"}</td>
                      <td className="py-4 px-6 text-sm text-[#6B7280]">
                        {contract.startDate} {contract.endDate ? `→ ${contract.endDate}` : "→ Ongoing"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-sm font-semibold text-[#4880FF] opacity-0 group-hover:opacity-100 transition-opacity">
                          View details
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Create New Contract</h3>
                <button onClick={() => setShowNewModal(false)} className="p-2 rounded-lg hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Select Member</label>
                  <select className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]">
                    <option value="">Select a member...</option>
                    <option value="m-1234">Jean Dupont</option>
                    <option value="m-1235">Marie Martin</option>
                    <option value="m-1236">Luc Petit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Plan Type</label>
                  <select className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]">
                    <option value="Premium">Premium</option>
                    <option value="Basic">Basic</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Start Date</label>
                    <input type="date" className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]" defaultValue="2026-03-18" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">End Date</label>
                    <input type="date" className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success("Contract successfully created");
                    setShowNewModal(false);
                  }}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
