import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Plus, X, Search } from "lucide-react";
import { toast } from "sonner";

type InvoiceStatus = "Draft" | "Issued" | "Paid" | "PartiallyPaid" | "Overdue" | "Cancelled";

interface Invoice {
  id: number;
  invoiceNumber: string;
  issuedOn: string;
  dueDate: string;
  amountInclTax: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  contractId: number;
  memberName: string;
}

const MOCK_INVOICES: Invoice[] = [
  { id: 1, invoiceNumber: "INV-2026-001", issuedOn: "2026-03-01", dueDate: "2026-03-15", amountInclTax: 49.99, amountPaid: 49.99, balanceDue: 0, status: "Paid", contractId: 1, memberName: "Jean Dupont" },
  { id: 2, invoiceNumber: "INV-2026-002", issuedOn: "2026-03-01", dueDate: "2026-03-15", amountInclTax: 89.99, amountPaid: 0, balanceDue: 89.99, status: "Overdue", contractId: 2, memberName: "Marie Martin" },
  { id: 3, invoiceNumber: "INV-2026-003", issuedOn: "2026-03-10", dueDate: "2026-04-01", amountInclTax: 29.99, amountPaid: 0, balanceDue: 29.99, status: "Issued", contractId: 3, memberName: "Luc Bernard" },
  { id: 4, invoiceNumber: "INV-2026-004", issuedOn: "2026-02-01", dueDate: "2026-02-15", amountInclTax: 49.99, amountPaid: 49.99, balanceDue: 0, status: "Paid", contractId: 1, memberName: "Jean Dupont" },
  { id: 5, invoiceNumber: "INV-2026-005", issuedOn: "2026-03-12", dueDate: "2026-04-01", amountInclTax: 59.99, amountPaid: 25.00, balanceDue: 34.99, status: "PartiallyPaid", contractId: 4, memberName: "Sophie Leroy" },
  { id: 6, invoiceNumber: "INV-2026-006", issuedOn: "2026-03-15", dueDate: "2026-04-15", amountInclTax: 29.99, amountPaid: 0, balanceDue: 29.99, status: "Draft", contractId: 5, memberName: "Pierre Dumont" },
];

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Draft: "bg-[#F5F6FA] text-[#A6A6A6]",
  Issued: "bg-[#EBEBFF] text-[#4880FF]",
  Paid: "bg-[#E0F8EA] text-[#00B69B]",
  PartiallyPaid: "bg-[#FFF3D6] text-[#FF9066]",
  Overdue: "bg-[#FFF0F0] text-[#FF4747]",
  Cancelled: "bg-[#F5F6FA] text-[#A6A6A6]",
};

export function Invoices() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [search, setSearch] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [contractId, setContractId] = useState("");
  const navigateTo = useNavigate();

  const navigate = (id: number) => navigateTo(`/billing/invoices/${id}`);

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.memberName.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = () => {
    if (!contractId.trim()) {
      toast.error("Please enter a Contract ID");
      return;
    }
    const newInv: Invoice = {
      id: invoices.length + 1,
      invoiceNumber: `INV-2026-00${invoices.length + 1}`,
      issuedOn: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 86_400_000).toISOString().split("T")[0],
      amountInclTax: 49.99,
      amountPaid: 0,
      balanceDue: 49.99,
      status: "Issued",
      contractId: Number(contractId),
      memberName: "—",
    };
    setInvoices([newInv, ...invoices]);
    toast.success(`Invoice ${newInv.invoiceNumber} generated`);
    setShowGenerateModal(false);
    setContractId("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#4880FF]" /> Invoices
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-64">
              <Search className="w-4 h-4 text-[#A6A6A6] shrink-0" />
              <input
                type="text"
                placeholder="Search invoice or member…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm text-[#111827] bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
              />
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all"
            >
              <Plus className="w-4 h-4" /> Generate invoice
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
                {["Invoice #", "Member", "Issued", "Due date", "Amount", "Paid", "Balance", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-[#A6A6A6]">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                    onClick={() => navigate(inv.id)}
                  >
                    <td className="px-5 py-4 font-bold text-[#4880FF]">{inv.invoiceNumber}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{inv.memberName}</td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{inv.issuedOn}</td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{inv.dueDate}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                      {inv.amountInclTax.toFixed(2)} €
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#00B69B]">
                      {inv.amountPaid.toFixed(2)} €
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold">
                      {inv.balanceDue > 0 ? (
                        <span className="text-[#FF4747]">{inv.balanceDue.toFixed(2)} €</span>
                      ) : (
                        <span className="text-[#A6A6A6]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASSES[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[#4880FF] font-semibold hover:underline">
                        View →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Generate invoice</h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Contract ID
                  </label>
                  <input
                    type="number"
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    placeholder="ex: 1"
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]"
                    autoFocus
                  />
                </div>
                <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-sm text-[#6B7280]">
                  Calls{" "}
                  <code className="bg-[#F0F0F0] px-1.5 py-0.5 rounded text-xs font-mono text-[#111827]">
                    POST /api/billing/generate
                  </code>{" "}
                  with the given ContractId. A new pending invoice will be created.
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors"
                >
                  Generate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}