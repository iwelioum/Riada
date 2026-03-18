Voici la version complète et corrigée de `ContractDetail.tsx` — calquée sur le style exact de `MemberDetail` :

```tsx
// src/app/pages/ContractDetail.tsx
import { useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Clock,
  MapPin,
  CreditCard,
  AlertTriangle,
  RefreshCcw,
  Snowflake,
  X,
  CheckCircle2,
  Activity,
  UserCircle,
  Check,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Mock data — aligned with ContractResponse from the back-end spec
// ---------------------------------------------------------------------------
const MOCK_CONTRACT = {
  id: 1,
  memberId: 1,
  memberFirstName: "Jean",
  memberLastName: "Dupont",
  planName: "Premium",
  homeClub: "Brussels",
  contractType: "OpenEnded" as "FixedTerm" | "OpenEnded",
  status: "Active" as "Active" | "Suspended" | "Expired" | "Cancelled",
  startDate: "2025-01-01",
  endDate: null as string | null,
  freezeStartDate: null as string | null,
  freezeEndDate: null as string | null,
  activeOptions: ["Group classes", "Sauna access"],
  billing: {
    totalPaid: 180.0,
    nextPaymentDate: "2026-04-01",
  },
  alerts: ["Next payment due in 14 days"],
  timeline: [
    {
      id: 1,
      date: "Today",
      time: "09:14",
      type: "payment",
      title: "Monthly subscription paid — 45.00€",
      desc: "Credit card",
      icon: CreditCard,
      color: "text-[#4880FF]",
      bg: "bg-[#EBEBFF]",
    },
    {
      id: 2,
      date: "14 months ago",
      time: "11:15",
      type: "contract",
      title: "Contract created — Premium Plan",
      desc: "Open-ended contract",
      icon: FileText,
      color: "text-[#4AD991]",
      bg: "bg-[#E0F8EA]",
    },
  ],
};

// Simulated role for DataProtection gating
type Role = "Admin" | "Staff" | "DataProtection";
const ROLES: Role[] = ["Admin", "Staff", "DataProtection"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState({
    ...MOCK_CONTRACT,
    id: Number(id ?? 1),
  });
  const [currentRole, setCurrentRole] = useState<Role>("Admin");
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [freezeDays, setFreezeDays] = useState(14);

  const canAct = currentRole !== "DataProtection";

  const hasFreeze = !!contract.freezeStartDate && !!contract.freezeEndDate;

  const statusClasses = useMemo(() => {
    switch (contract.status) {
      case "Active":
        return "bg-[#E0F8EA] text-[#00B69B]";
      case "Suspended":
        return "bg-[#FFF3D6] text-[#FF9066]";
      case "Expired":
      case "Cancelled":
        return "bg-[#FFF0F0] text-[#FF4747]";
      default:
        return "bg-[#F5F6FA] text-[#6B7280]";
    }
  }, [contract.status]);

  const freezeReturnDate = new Date(
    Date.now() + freezeDays * 86_400_000
  ).toLocaleDateString("en-GB");

  const handleFreeze = () => {
    toast.success(`Contract frozen for ${freezeDays} day(s)`);
    setContract({
      ...contract,
      freezeStartDate: new Date().toISOString().split("T")[0],
      freezeEndDate: new Date(Date.now() + freezeDays * 86_400_000)
        .toISOString()
        .split("T")[0],
    });
    setShowFreezeModal(false);
  };

  const handleRenew = () => {
    toast.success("Contract renewed successfully");
    setShowRenewModal(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">

      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] shadow-sm px-8 py-4 flex-shrink-0 flex flex-col gap-3">

        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-[#6B7280] font-medium">
          <button
            onClick={() => navigate(`/members/${contract.memberId}`)}
            className="hover:text-[#4880FF] transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to member
          </button>
          <span className="mx-2">/</span>
          <Link
            to={`/members/${contract.memberId}`}
            className="hover:text-[#4880FF] transition-colors"
          >
            {contract.memberFirstName} {contract.memberLastName}
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-[#111827]">Contract #{contract.id}</span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#EBEBFF] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#4880FF]" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-[#111827] leading-none">
                  {contract.planName}
                </h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusClasses}`}>
                  {contract.status}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F5F6FA] text-[#6B7280] border border-[#E0E0E0]">
                  {contract.contractType === "OpenEnded" ? "Open-ended" : "Fixed-term"}
                </span>
              </div>
              <div className="text-sm text-[#6B7280] flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {contract.homeClub}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Start: {contract.startDate}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* DP Role mock selector */}
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-[#E0E0E0] text-[#6B7280] bg-white focus:outline-none focus:border-[#4880FF]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r} Role</option>
              ))}
            </select>

            <button
              onClick={() => setShowFreezeModal(true)}
              disabled={!canAct}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-lg text-sm font-semibold text-[#6B7280] hover:text-[#FF9066] hover:border-[#FF9066] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Snowflake className="w-4 h-4" /> Freeze
            </button>

            <button
              onClick={() => setShowRenewModal(true)}
              disabled={!canAct}
              className="flex items-center gap-2 px-5 py-2 bg-[#4880FF] rounded-lg text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
            >
              <RefreshCcw className="w-4 h-4" /> Renew
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

          {/* LEFT COLUMN 70% */}
          <div className="w-full lg:w-[70%] flex flex-col gap-6">

            {/* Active freeze banner */}
            {hasFreeze && (
              <div className="bg-[#FFF3D6] border border-[#FF9066]/30 rounded-2xl p-4 flex items-center gap-3 text-sm font-medium text-[#111827]">
                <Snowflake className="w-5 h-5 text-[#FF9066] shrink-0" />
                Contract currently frozen — from{" "}
                <span className="font-bold">{contract.freezeStartDate}</span>{" "}
                to{" "}
                <span className="font-bold">{contract.freezeEndDate}</span>
              </div>
            )}

            {/* Contract Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6"
            >
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-[#4880FF]" /> Contract Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                <InfoRow label="Member">
                  <Link
                    to={`/members/${contract.memberId}`}
                    className="text-sm font-bold text-[#4880FF] hover:underline"
                  >
                    {contract.memberFirstName} {contract.memberLastName}
                  </Link>
                </InfoRow>
                <InfoRow label="Home Club">
                  <span className="text-sm font-bold text-[#111827]">{contract.homeClub}</span>
                </InfoRow>
                <InfoRow label="Start Date">
                  <span className="text-sm font-bold text-[#111827]">{contract.startDate}</span>
                </InfoRow>
                <InfoRow label="End Date">
                  <span className="text-sm font-bold text-[#111827]">
                    {contract.endDate ?? "Indefinite"}
                  </span>
                </InfoRow>
                <InfoRow label="Type">
                  <span className="text-sm font-bold text-[#111827]">
                    {contract.contractType === "OpenEnded" ? "Open-ended" : "Fixed-term"}
                  </span>
                </InfoRow>
                <InfoRow label="Status">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusClasses}`}>
                    {contract.status}
                  </span>
                </InfoRow>
              </div>
            </motion.div>

            {/* Active Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6"
            >
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#4880FF]" /> Active Options
              </h2>

              {contract.activeOptions.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No active options on this contract.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {contract.activeOptions.map((opt) => (
                    <span
                      key={opt}
                      className="px-3 py-1.5 bg-[#F5F6FA] text-[#6B7280] rounded-full text-sm font-semibold border border-[#E0E0E0]"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Contract History Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6"
            >
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-[#4880FF]" /> Contract History
              </h2>

              <div className="relative pl-6 border-l-2 border-[#F0F0F0] space-y-6 ml-2">
                {contract.timeline.map((item) => (
                  <div key={item.id} className="relative">
                    <div
                      className={`absolute -left-[43px] top-1 w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center border-4 border-white shadow-sm`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#6B7280] mb-1">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                      <div className="bg-[#F5F6FA] p-3 rounded-xl border border-[#E0E0E0] inline-block self-start">
                        <p className="text-sm font-bold text-[#111827]">{item.title}</p>
                        {item.desc && (
                          <p className="text-xs text-[#6B7280] mt-1">{item.desc}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN 30% STICKY */}
          <div className="w-full lg:w-[30%]">
            <div className="sticky top-[100px] flex flex-col gap-6">

              {/* Alerts */}
              {contract.alerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#FFF0F0] border border-[#FF4747]/30 rounded-2xl p-5 shadow-sm"
                >
                  <h3 className="text-[#FF4747] font-bold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5" /> Contract Alerts
                  </h3>
                  <ul className="space-y-2">
                    {contract.alerts.map((alert, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[#111827] font-medium"
                      >
                        <span className="text-[#FF4747] mt-0.5">•</span>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Billing Overview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5"
              >
                <h3 className="font-bold text-[#111827] mb-4">Billing Overview</h3>
                <div className="space-y-3">
                  <StatRow
                    label="Total paid"
                    value={`${contract.billing.totalPaid.toFixed(2)} €`}
                    highlight
                  />
                  <StatRow
                    label="Next payment"
                    value={contract.billing.nextPaymentDate}
                    warning
                  />
                </div>
              </motion.div>

              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5 flex flex-col gap-2"
              >
                <h3 className="font-bold text-[#111827] mb-2">Actions</h3>
                <ActionButton
                  icon={Snowflake}
                  label="Freeze contract"
                  onClick={() => setShowFreezeModal(true)}
                  disabled={!canAct}
                />
                <ActionButton
                  icon={RefreshCcw}
                  label="Renew contract"
                  onClick={() => setShowRenewModal(true)}
                  disabled={!canAct}
                />
                <ActionButton
                  icon={UserCircle}
                  label="View member profile"
                  onClick={() => navigate(`/members/${contract.memberId}`)}
                />
                {!canAct && (
                  <p className="text-xs text-[#FF4747] flex items-center gap-1 mt-1">
                    <Shield className="w-3.5 h-3.5" />
                    DataProtection role — write actions disabled
                  </p>
                )}
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      <AnimatePresence>

        {/* FREEZE MODAL */}
        {showFreezeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFreezeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Freeze contract</h3>
                <button
                  onClick={() => setShowFreezeModal(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Quick select */}
                <div className="flex gap-2">
                  {[7, 14, 30, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setFreezeDays(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                        freezeDays === d
                          ? "bg-[#4880FF] text-white border-[#4880FF]"
                          : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF] hover:text-[#4880FF]"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Custom duration (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={freezeDays}
                    onChange={(e) =>
                      setFreezeDays(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]"
                  />
                </div>

                {/* Estimated return date */}
                <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF]">
                  <p className="text-sm text-[#6B7280]">Estimated return date:</p>
                  <p className="font-bold text-[#111827] mt-1">
                    {new Date().toLocaleDateString("en-GB")} →{" "}
                    <span className="text-[#4880FF]">{freezeReturnDate}</span>
                  </p>
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
                  onClick={handleFreeze}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors"
                >
                  Confirm freeze
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* RENEW MODAL */}
        {showRenewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRenewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Renew contract</h3>
                <button
                  onClick={() => setShowRenewModal(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-sm text-[#6B7280]">
                You are about to renew the{" "}
                <span className="font-bold text-[#111827]">{contract.planName}</span>{" "}
                contract for{" "}
                <span className="font-bold text-[#111827]">
                  {contract.memberFirstName} {contract.memberLastName}
                </span>
                . This will call{" "}
                <code className="bg-[#F0F0F0] px-1.5 py-0.5 rounded text-xs font-mono text-[#111827]">
                  POST /api/contracts/{contract.id}/renew
                </code>
                .
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowRenewModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenew}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Confirm renewal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#F0F0F0] last:border-0">
      <span className="text-sm text-[#6B7280] font-medium">{label}</span>
      {children}
    </div>
  );
}

function StatRow({
  label,
  value,
  highlight,
  warning,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span
        className={`text-sm font-bold ${
          highlight
            ? "text-[#00B69B]"
            : warning
            ? "text-[#FF9066]"
            : "text-[#111827]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFF] border border-transparent hover:border-[#EBEBFF] text-[#6B7280] hover:text-[#4880FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#6B7280] transition-all text-sm font-bold text-left group"
    >
      <div className="w-8 h-8 rounded-lg bg-[#F5F6FA] group-hover:bg-[#EBEBFF] flex items-center justify-center transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      {label}
    </button>
  );
}
```

***

## Ce qui a été corrigé vs la version précédente

| Problème | Fix appliqué |
|---|---|
| "Contracts" dans la sidebar | À retirer du layout — n'est pas géré ici |
| Prix des options (15€/month) | Supprimés — badges nom uniquement |
| Bouton "Cancel" rouge | Supprimé — pas d'endpoint back |
| Style générique Dashstack | Remplacé par le système exact de `MemberDetail` |
| Header non sticky | `sticky top-0 z-30` appliqué |
| Alertes orange generic | `bg-[#FFF0F0] border-[#FF4747]/30` comme `MemberDetail` |
| Timeline pauvre | Pattern identique à `MemberDetail` avec icônes colorées |
| "View all invoices" sans route | Remplacé par `StatRow` billing simple |