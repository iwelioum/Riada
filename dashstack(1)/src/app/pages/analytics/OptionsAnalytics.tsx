import { motion } from "motion/react";
import { PieChart } from "lucide-react";

const MOCK_OPTIONS = [
  { optionName: "Group classes", subscriptionCount: 312, popularityPercentage: 78 },
  { optionName: "Sauna access", subscriptionCount: 198, popularityPercentage: 49.5 },
  { optionName: "Parking", subscriptionCount: 145, popularityPercentage: 36.3 },
  { optionName: "Personal trainer (1x/week)", subscriptionCount: 67, popularityPercentage: 16.8 },
];

const SORTED_OPTIONS = [...MOCK_OPTIONS].sort(
  (a, b) => b.subscriptionCount - a.subscriptionCount
);

export function OptionsAnalytics() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <PieChart className="w-6 h-6 text-[#4880FF]" /> Options Popularity
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">Subscription rate per option</p>
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
                {["Option", "Subscribers", "Popularity"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SORTED_OPTIONS.map((opt) => (
                <tr key={opt.optionName} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111827]">{opt.optionName}</td>
                  <td className="px-5 py-4 font-semibold text-[#4880FF]">{opt.subscriptionCount}</td>
                  <td className="px-5 py-4 w-64">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4880FF] rounded-full transition-all"
                          style={{ width: `${opt.popularityPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#111827] w-12 text-right">
                        {opt.popularityPercentage}%
                      </span>
                    </div>
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