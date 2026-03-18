import { useState, Fragment } from "react";
import { motion } from "motion/react";
import { Tag, Check, ChevronDown, ChevronUp, DollarSign } from "lucide-react";

const MOCK_PLANS = [
  {
    id: 1,
    planName: "Basic",
    basePrice: 29.99,
    commitmentMonths: 1,
    enrollmentFee: 0,
    limitedClubAccess: true,
    duoPassAllowed: false,
    options: [
      { optionName: "Group classes", monthlyPrice: 15.0 },
      { optionName: "Sauna access", monthlyPrice: 10.0 },
    ],
  },
  {
    id: 2,
    planName: "Premium",
    basePrice: 49.99,
    commitmentMonths: 12,
    enrollmentFee: 25.0,
    limitedClubAccess: false,
    duoPassAllowed: true,
    options: [
      { optionName: "Group classes", monthlyPrice: 15.0 },
      { optionName: "Sauna access", monthlyPrice: 10.0 },
      { optionName: "Parking", monthlyPrice: 8.0 },
    ],
  },
  {
    id: 3,
    planName: "VIP",
    basePrice: 89.99,
    commitmentMonths: 12,
    enrollmentFee: 50.0,
    limitedClubAccess: false,
    duoPassAllowed: true,
    options: [
      { optionName: "Group classes", monthlyPrice: 15.0 },
      { optionName: "Sauna access", monthlyPrice: 10.0 },
      { optionName: "Parking", monthlyPrice: 8.0 },
      { optionName: "Personal trainer (1x/week)", monthlyPrice: 40.0 },
    ],
  },
];

export function Plans() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <Tag className="w-6 h-6 text-[#4880FF]" /> Subscription Plans
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {MOCK_PLANS.length} plans available
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
                {[
                  "Plan",
                  "Base price",
                  "Commitment",
                  "Enrollment fee",
                  "Club access",
                  "Duo pass",
                  "Options",
                ].map((h) => (
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
              {MOCK_PLANS.map((plan) => (
                <Fragment key={plan.id}>
                  <tr
                    className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                    onClick={() => toggle(plan.id)}
                  >
                    <td className="px-5 py-4 font-bold text-[#111827]">
                      {plan.planName}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#4880FF]">
                      {plan.basePrice.toFixed(2)} €
                    </td>
                    <td className="px-5 py-4 text-sm text-[#111827]">
                      {plan.commitmentMonths === 1
                        ? "Month-to-month"
                        : `${plan.commitmentMonths} months`}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#111827]">
                      {plan.enrollmentFee > 0
                        ? `${plan.enrollmentFee.toFixed(2)} €`
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          plan.limitedClubAccess
                            ? "bg-[#FFF3D6] text-[#FF9066]"
                            : "bg-[#E0F8EA] text-[#00B69B]"
                        }`}
                      >
                        {plan.limitedClubAccess ? "Limited" : "All clubs"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {plan.duoPassAllowed ? (
                        <Check className="w-5 h-5 text-[#00B69B]" />
                      ) : (
                        <span className="text-[#A6A6A6] text-lg">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button className="flex items-center gap-1 text-sm text-[#4880FF] font-semibold">
                        {plan.options.length} options
                        {expandedId === plan.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedId === plan.id && (
                    <tr className="bg-[#F8FAFF]">
                      <td colSpan={7} className="px-8 py-4">
                        <p className="text-xs font-bold text-[#6B7280] uppercase mb-3">
                          Available options
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {plan.options.map((opt) => (
                            <div
                              key={opt.optionName}
                              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#E0E0E0] text-sm"
                            >
                              <DollarSign className="w-4 h-4 text-[#4880FF]" />
                              <span className="font-semibold text-[#111827]">
                                {opt.optionName}
                              </span>
                              <span className="text-[#6B7280]">
                                {opt.monthlyPrice.toFixed(2)} € / month
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}