import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  MapPin,
  AlertTriangle,
  RefreshCcw,
  Snowflake,
  X,
} from "lucide-react";
import { toast } from "sonner";

const MOCK_CONTRACT = {
  id: 42,
  memberId: 1,
  memberName: "Jean Dupont",
  planName: "Premium",
  homeClub: "Bruxelles",
  contractType: "OpenEnded" as "FixedTerm" | "OpenEnded",
  status: "Active" as "Active" | "Suspended" | "Expired" | "Cancelled",
  startDate: "2025-01-01",
  endDate: null as string | null,
  freezeStartDate: null as string | null,
  freezeEndDate: null as string | null,
  activeOptions: ["Group Classes", "Sauna Access"],
  alerts: ["Last invoice unpaid", "No visit in 18 days"],
  billing: {
    totalPaid: 1249.97,
    nextDueDate: "2026-04-01",
  },
  timeline: [
    { id: 1, title: "Contract created", date: "2025-01-01", type: "contract" },
    { id: 2, title: "Payment received — €49.99", date: "2026-03-14", type: "payment" },
  ],
};

export function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Make the mock dynamic based on the URL id
  const getMockData = (contractId: number) => {
    const isBasic = contractId % 2 === 0;
    
    return {
      ...MOCK_CONTRACT,
      id: contractId,
      planName: isBasic ? "Basic" : "Premium",
      status: contractId === 2 ? "Expired" : contractId === 3 ? "Suspended" : "Active" as any,
      memberName: contractId === 3 ? "Luc Martin" : contractId === 2 ? "Jean Dupont" : "Jean Dupont",
      memberId: contractId === 3 ? "m-1236" : "m-1234",
      contractType: isBasic ? "FixedTerm" as any : "OpenEnded" as any,
      endDate: isBasic ? "2024-12-31" : null,
      alerts: contractId === 3 ? ["Card rejected"] : contractId === 1 ? ["No visit in 18 days"] : [],
    };
  };

  const [contract] = useState(getMockData(Number(id ?? 42)));
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeDays, setFreezeDays] = useState(14);

  const statusClasses = useMemo(() => {
    switch (contract.status) {
      case "Active":
        return "bg-[#E0F8EA] text-[#00B69B] border-[#00B69B]/20";
      case "Suspended":
        return "bg-[#FFF3D6] text-[#FF9066] border-[#FF9066]/20";
      case "Expired":
        return "bg-[#FFF0F0] text-[#FF4747] border-[#FF4747]/20";
      default:
        return "bg-[#F5F6FA] text-[#6B7280] border-[#E0E0E0]";
    }
  }, [contract.status]);

  const hasFreeze = !!contract.freezeStartDate && !!contract.freezeEndDate;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] shadow-sm px-8 py-4">
        <div className="flex items-center text-sm text-[#6B7280] font-medium">
          <button onClick={() => navigate(-1)} className="hover:text-[#4880FF] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="mx-2">/</span>
          <Link to="/contracts" className="hover:text-[#4880FF]">Contracts</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-[#111827]">Contract #{contract.id}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#111827]">
                {contract.planName}
                <Link to={`/members/${contract.memberId}`} className="ml-3 text-sm font-normal text-[#6B7280] hover:text-[#4880FF] hover:underline transition-colors">
                  — {contract.memberName}
                </Link>
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusClasses}`}>
                {contract.status}
              </span>
            </div>
            <div className="text-sm text-[#6B7280] flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {contract.homeClub}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {contract.contractType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.success("Renew action ready for API wiring")}
              className="px-4 py-2 rounded-lg bg-white border border-[#E0E0E0] text-[#6B7280] hover:text-[#4880FF] hover:border-[#4880FF]"
            >
              <RefreshCcw className="w-4 h-4 inline mr-2" />
              Renew
            </button>
            <button
              onClick={() => setShowFreezeModal(true)}
              className="px-4 py-2 rounded-lg bg-[#4880FF] text-white hover:bg-[#3b6ee0]"
            >
              <Snowflake className="w-4 h-4 inline mr-2" />
              Freeze
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[70%] flex flex-col gap-6">
            {hasFreeze && (
              <div className="bg-[#FFF3D6] border border-[#FF9066]/20 rounded-2xl p-4 text-[#111827]">
                Contract frozen from {contract.freezeStartDate} to {contract.freezeEndDate}
              </div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
              <h2 className="text-lg font-bold text-[#111827] mb-5">Contract information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="Member" value={contract.memberName} />
                <InfoRow label="Plan" value={contract.planName} />
                <InfoRow label="Club" value={contract.homeClub} />
                <InfoRow label="Type" value={contract.contractType} />
                <InfoRow label="Status" value={contract.status} />
                <InfoRow label="Start date" value={contract.startDate} />
                <InfoRow label="End date" value={contract.endDate ?? "—"} />
                <InfoRow
                  label="Freeze"
                  value={
                    contract.freezeStartDate && contract.freezeEndDate
                      ? `${contract.freezeStartDate} → ${contract.freezeEndDate}`
                      : "No active freeze"
                  }
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Active options</h2>
              <div className="flex flex-wrap gap-2">
                {contract.activeOptions.map((option) => (
                  <span
                    key={option}
                    className="px-3 py-1 bg-[#F5F6FA] text-[#6B7280] rounded-full text-xs font-semibold border border-[#E0E0E0]"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Timeline</h2>
              <div className="space-y-4">
                {contract.timeline.map((item) => (
                  <div key={item.id} className="border border-[#E0E0E0] rounded-xl p-4 bg-[#F5F6FA]">
                    <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{item.date}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-[30%]">
            <div className="sticky top-[96px] flex flex-col gap-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5">
                <h3 className="font-bold text-[#111827] mb-4">Billing overview</h3>
                <InfoRow label="Total paid" value={`€${contract.billing.totalPaid}`} />
                <InfoRow label="Next due date" value={contract.billing.nextDueDate} />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-[#FFF0F0] border border-[#FF4747]/20 rounded-2xl p-5">
                <h3 className="font-bold text-[#FF4747] mb-3">Alerts</h3>
                <ul className="space-y-2">
                  {contract.alerts.map((alert) => (
                    <li key={alert} className="text-sm text-[#111827] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#FF4747] mt-0.5" />
                      {alert}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5">
                <h3 className="font-bold text-[#111827] mb-3">Actions</h3>
                <button
                  onClick={() => setShowFreezeModal(true)}
                  className="w-full mb-2 py-3 rounded-xl bg-[#F5F6FA] hover:bg-[#FFF3D6] text-[#6B7280] hover:text-[#FF9066] font-semibold transition-colors"
                >
                  Freeze contract
                </button>
                <button
                  onClick={() => toast.success("Renew action ready for API wiring")}
                  className="w-full py-3 rounded-xl bg-[#4880FF] text-white hover:bg-[#3b6ee0] font-semibold transition-colors"
                >
                  Renew contract
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFreezeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFreezeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Freeze contract</h3>
                <button onClick={() => setShowFreezeModal(false)} className="p-2 rounded-lg hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  {[7, 14, 30, 60].map((days) => (
                    <button
                      key={days}
                      onClick={() => setFreezeDays(days)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                        freezeDays === days
                          ? "bg-[#4880FF] text-white border-[#4880FF]"
                          : "bg-white text-[#6B7280] border-[#E0E0E0]"
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={freezeDays}
                    onChange={(e) => setFreezeDays(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]"
                  />
                </div>

                <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-sm text-[#111827]">
                  Estimated freeze: {freezeDays} day(s)
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowFreezeModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success(`Contract frozen for ${freezeDays} days`);
                    setShowFreezeModal(false);
                  }}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#F0F0F0] last:border-0">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className="text-sm font-semibold text-[#111827] text-right">{value}</span>
    </div>
  );
}
