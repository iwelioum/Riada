import { motion } from "motion/react";
import { ShieldAlert } from "lucide-react";

const MOCK_RISKS = [
  { id: 1, memberName: "Jean Dupont", plan: "Premium", overdueInvoices: 3, deniedAccess60d: 12, riskScore: 82 },
  { id: 2, memberName: "Marie Martin", plan: "Basic", overdueInvoices: 1, deniedAccess60d: 4, riskScore: 41 },
  { id: 3, memberName: "Luc Bernard", plan: "VIP", overdueInvoices: 0, deniedAccess60d: 0, riskScore: 8 },
  { id: 4, memberName: "Sophie Leroy", plan: "Premium", overdueInvoices: 2, deniedAccess60d: 18, riskScore: 74 },
  { id: 5, memberName: "Pierre Dumont", plan: "Basic", overdueInvoices: 4, deniedAccess60d: 22, riskScore: 95 },
];

const SORTED_RISKS = [...MOCK_RISKS].sort((a, b) => b.riskScore - a.riskScore);

function RiskBar({ score }: { score: number }) {
  const color = score <= 30 ? "bg-[#00B69B]" : score <= 60 ? "bg-[#FF9066]" : "bg-[#FF4747]";
  const text = score <= 30 ? "text-[#00B69B]" : score <= 60 ? "text-[#FF9066]" : "text-[#FF4747]";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-black w-10 text-right ${text}`}>{score}</span>
    </div>
  );
}

export function RiskAnalytics() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#FF4747]" /> Risk Scores
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Top {SORTED_RISKS.length} at-risk members
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
                {["Member", "Plan", "Overdue invoices", "Denied access (60d)", "Risk score"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SORTED_RISKS.map((m) => (
                <tr key={m.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111827]">{m.memberName}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">
                      {m.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold">
                    {m.overdueInvoices > 0
                      ? <span className="text-[#FF4747]">{m.overdueInvoices}</span>
                      : <span className="text-[#A6A6A6]">—</span>}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold">
                    {m.deniedAccess60d > 0
                      ? <span className="text-[#FF9066]">{m.deniedAccess60d}</span>
                      : <span className="text-[#A6A6A6]">—</span>}
                  </td>
                  <td className="px-5 py-4 w-52">
                    <RiskBar score={m.riskScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}