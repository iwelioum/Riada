import { useState } from "react";
import { motion } from "motion/react";
import { BarChart2, Calendar } from "lucide-react";

const MOCK_FREQUENCY = [
  { clubName: "Riada Brussels", visitorCount: 1240, avgVisitsPerMember: 8.4 },
  { clubName: "Riada Namur", visitorCount: 780, avgVisitsPerMember: 6.1 },
  { clubName: "Riada Liège", visitorCount: 420, avgVisitsPerMember: 5.3 },
  { clubName: "Riada Ghent", visitorCount: 90, avgVisitsPerMember: 2.1 },
];

const TODAY = new Date().toISOString().split("T")[0];
const MONTH_AGO = new Date(Date.now() - 30 * 86_400_000).toISOString().split("T")[0];

export function FrequencyAnalytics() {
  const [dateFrom, setDateFrom] = useState(MONTH_AGO);
  const [dateTo, setDateTo] = useState(TODAY);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-[#4880FF]" /> Visit Frequency
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Per club breakdown</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-[#6B7280]" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm text-[#111827] bg-transparent focus:outline-none"
              />
            </div>
            <span className="text-[#6B7280] text-sm font-medium">→</span>
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-[#6B7280]" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm text-[#111827] bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
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
                {["Club", "Total visits", "Avg. visits / member"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_FREQUENCY.map((row) => (
                <tr key={row.clubName} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111827]">{row.clubName}</td>
                  <td className="px-5 py-4 font-semibold text-[#4880FF]">
                    {row.visitorCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                    {row.avgVisitsPerMember.toFixed(1)} visits
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