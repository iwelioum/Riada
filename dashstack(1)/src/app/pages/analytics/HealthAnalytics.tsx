import { motion } from "motion/react";
import { Activity, Users, FileText, CheckCircle2, XCircle } from "lucide-react";

const MOCK_HEALTH = {
  isHealthy: true,
  status: "All systems operational",
  totalMembers: 400,
  activeContracts: 312,
  pendingInvoices: 28,
};

export function HealthAnalytics() {
  const { isHealthy, status, totalMembers, activeContracts, pendingInvoices } =
    MOCK_HEALTH;

  const kpis = [
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "text-[#4880FF]",
      bg: "bg-[#EBEBFF]",
    },
    {
      label: "Active Contracts",
      value: activeContracts,
      icon: FileText,
      color: "text-[#00B69B]",
      bg: "bg-[#E0F8EA]",
    },
    {
      label: "Pending Invoices",
      value: pendingInvoices,
      icon: Activity,
      color: pendingInvoices > 0 ? "text-[#FF9066]" : "text-[#00B69B]",
      bg: pendingInvoices > 0 ? "bg-[#FFF3D6]" : "bg-[#E0F8EA]",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#4880FF]" /> System Health
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">Platform-wide KPIs</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Health badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border flex items-center gap-4 ${
              isHealthy
                ? "bg-[#E0F8EA] border-[#00B69B]/30"
                : "bg-[#FFF0F0] border-[#FF4747]/30"
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="w-8 h-8 text-[#00B69B] shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-[#FF4747] shrink-0" />
            )}
            <div>
              <p className={`text-lg font-black ${isHealthy ? "text-[#00B69B]" : "text-[#FF4747]"}`}>
                {isHealthy ? "Healthy" : "Unhealthy"}
              </p>
              <p className="text-sm text-[#6B7280] mt-0.5">{status}</p>
            </div>
          </motion.div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (i + 1) }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <p className="text-3xl font-black text-[#111827]">
                  {value.toLocaleString()}
                </p>
                <p className="text-sm text-[#6B7280] font-medium mt-1">{label}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}