Groupe 2 complet — pages 9, 12, 14, 18.

***

## `src/app/pages/billing/Invoices.tsx`

```tsx
import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Plus, X, Search } from "lucide-react";
import { toast } from "sonner";

type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Cancelled";

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
  { id: 3, invoiceNumber: "INV-2026-003", issuedOn: "2026-03-10", dueDate: "2026-04-01", amountInclTax: 29.99, amountPaid: 0, balanceDue: 29.99, status: "Pending", contractId: 3, memberName: "Luc Bernard" },
  { id: 4, invoiceNumber: "INV-2026-004", issuedOn: "2026-02-01", dueDate: "2026-02-15", amountInclTax: 49.99, amountPaid: 49.99, balanceDue: 0, status: "Paid", contractId: 1, memberName: "Jean Dupont" },
  { id: 5, invoiceNumber: "INV-2026-005", issuedOn: "2026-03-12", dueDate: "2026-04-01", amountInclTax: 59.99, amountPaid: 0, balanceDue: 59.99, status: "Pending", contractId: 4, memberName: "Sophie Leroy" },
];

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Paid: "bg-[#E0F8EA] text-[#00B69B]",
  Pending: "bg-[#FFF3D6] text-[#FF9066]",
  Overdue: "bg-[#FFF0F0] text-[#FF4747]",
  Cancelled: "bg-[#F5F6FA] text-[#A6A6A6]",
};

export function Invoices() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [search, setSearch] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [contractId, setContractId] = useState("");

  const navigate = (id: number) =>
    window.location.assign(`/billing/invoices/${id}`);

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
      status: "Pending",
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
```

***

## `src/app/pages/billing/InvoiceDetail.tsx`

```tsx
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ChevronRight, FileText, CreditCard, X, Check, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Cancelled";
type PaymentMethod = "Credit card" | "Bank transfer" | "Cash" | "SEPA";

interface InvoiceLine {
  id: number;
  description: string;
  lineType: "Subscription" | "Option" | "EnrollmentFee" | "LateFee";
  quantity: number;
  unitPriceExclTax: number;
  totalInclTax: number;
}

interface Payment {
  id: number;
  paidAt: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
}

interface InvoiceDetail {
  id: number;
  invoiceNumber: string;
  issuedOn: string;
  dueDate: string;
  periodFrom: string;
  periodTo: string;
  status: InvoiceStatus;
  memberName: string;
  memberId: number;
  contractId: number;
  lines: InvoiceLine[];
  payments: Payment[];
}

const MOCK_INVOICE: InvoiceDetail = {
  id: 1,
  invoiceNumber: "INV-2026-001",
  issuedOn: "2026-03-01",
  dueDate: "2026-03-15",
  periodFrom: "2026-03-01",
  periodTo: "2026-03-31",
  status: "Paid",
  memberName: "Jean Dupont",
  memberId: 1,
  contractId: 1,
  lines: [
    { id: 1, description: "Premium subscription", lineType: "Subscription", quantity: 1, unitPriceExclTax: 41.31, totalInclTax: 49.99 },
    { id: 2, description: "Group classes option", lineType: "Option", quantity: 1, unitPriceExclTax: 12.40, totalInclTax: 15.00 },
    { id: 3, description: "Sauna access option", lineType: "Option", quantity: 1, unitPriceExclTax: 8.26, totalInclTax: 10.00 },
  ],
  payments: [
    { id: 1, paidAt: "2026-03-05 14:32", amount: 74.99, paymentMethod: "Credit card", transactionReference: "TXN-789456" },
  ],
};

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Paid: "bg-[#E0F8EA] text-[#00B69B]",
  Pending: "bg-[#FFF3D6] text-[#FF9066]",
  Overdue: "bg-[#FFF0F0] text-[#FF4747]",
  Cancelled: "bg-[#F5F6FA] text-[#A6A6A6]",
};

const LINE_TYPE_CLASSES: Record<string, string> = {
  Subscription: "bg-[#EBEBFF] text-[#4880FF]",
  Option: "bg-[#E0F8EA] text-[#00B69B]",
  EnrollmentFee: "bg-[#FFF3D6] text-[#FF9066]",
  LateFee: "bg-[#FFF0F0] text-[#FF4747]",
};

const VAT_RATE = 0.21;

export function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In production: fetch by id. Here we use mock.
  const invoice = { ...MOCK_INVOICE, id: Number(id ?? 1) };

  const [payments, setPayments] = useState<Payment[]>(invoice.payments);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Credit card");
  const [paymentRef, setPaymentRef] = useState("");

  const totalExclTax = invoice.lines.reduce(
    (sum, l) => sum + l.unitPriceExclTax * l.quantity, 0
  );
  const totalVat = invoice.lines.reduce(
    (sum, l) => sum + (l.totalInclTax - l.unitPriceExclTax * l.quantity), 0
  );
  const totalInclTax = invoice.lines.reduce((sum, l) => sum + l.totalInclTax, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(0, totalInclTax - totalPaid);

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const newPayment: Payment = {
      id: payments.length + 1,
      paidAt: new Date().toLocaleString("en-GB"),
      amount,
      paymentMethod,
      transactionReference: paymentRef || `TXN-${Date.now()}`,
    };
    setPayments([...payments, newPayment]);
    toast.success(`Payment of ${amount.toFixed(2)} € recorded`);
    setShowPaymentModal(false);
    setPaymentAmount("");
    setPaymentRef("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] shadow-sm px-8 py-4 flex-shrink-0 flex flex-col gap-3">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-[#6B7280] font-medium">
          <button
            onClick={() => navigate("/billing/invoices")}
            className="hover:text-[#4880FF] transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to invoices
          </button>
          <span className="mx-2">/</span>
          <Link to="/billing/invoices" className="hover:text-[#4880FF] transition-colors">
            Invoices
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-[#111827]">{invoice.invoiceNumber}</span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EBEBFF] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#4880FF]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-[#111827] leading-none">
                  {invoice.invoiceNumber}
                </h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASSES[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="text-sm text-[#6B7280] flex items-center gap-4">
                <span>Issued: {invoice.issuedOn}</span>
                <span>Due: {invoice.dueDate}</span>
                <span>Period: {invoice.periodFrom} → {invoice.periodTo}</span>
              </div>
            </div>
          </div>

          {balanceDue > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-5 py-2 bg-[#4880FF] rounded-lg text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all"
            >
              <CreditCard className="w-4 h-4" /> Record payment
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

          {/* LEFT 70% */}
          <div className="w-full lg:w-[70%] flex flex-col gap-6">

            {/* Invoice lines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[#F0F0F0]">
                <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4880FF]" /> Invoice lines
                </h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                    {["Description", "Type", "Qty", "Unit price (excl.)", "Total (incl. VAT)"].map((h) => (
                      <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={line.id} className="border-b border-[#F0F0F0] last:border-0">
                      <td className="px-5 py-3 text-sm font-semibold text-[#111827]">{line.description}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LINE_TYPE_CLASSES[line.lineType] ?? "bg-[#F5F6FA] text-[#6B7280]"}`}>
                          {line.lineType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#111827]">{line.quantity}</td>
                      <td className="px-5 py-3 text-sm text-[#111827]">{line.unitPriceExclTax.toFixed(2)} €</td>
                      <td className="px-5 py-3 text-sm font-bold text-[#111827]">{line.totalInclTax.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="px-6 py-4 border-t border-[#E0E0E0] bg-[#F8FAFF]">
                <div className="flex justify-end">
                  <div className="w-72 space-y-2">
                    {[
                      { label: "Subtotal (excl. VAT)", value: `${totalExclTax.toFixed(2)} €`, muted: true },
                      { label: `VAT (${(VAT_RATE * 100).toFixed(0)}%)`, value: `${totalVat.toFixed(2)} €`, muted: true },
                      { label: "Total incl. VAT", value: `${totalInclTax.toFixed(2)} €`, bold: true },
                      { label: "Paid", value: `${totalPaid.toFixed(2)} €`, green: true },
                      { label: "Balance due", value: `${balanceDue.toFixed(2)} €`, red: balanceDue > 0 },
                    ].map(({ label, value, muted, bold, green, red }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className={`text-sm ${muted ? "text-[#6B7280]" : bold ? "font-bold text-[#111827]" : "text-[#6B7280]"}`}>
                          {label}
                        </span>
                        <span className={`text-sm font-bold ${green ? "text-[#00B69B]" : red ? "text-[#FF4747]" : "text-[#111827]"}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payments registered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#4880FF]" /> Payments recorded
                </h2>
                <span className="text-sm text-[#6B7280] font-medium">
                  {payments.length} payment{payments.length !== 1 ? "s" : ""}
                </span>
              </div>

              {payments.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-[#A6A6A6]">
                  No payments recorded yet
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                      {["Date", "Amount", "Method", "Reference"].map((h) => (
                        <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-[#F0F0F0] last:border-0">
                        <td className="px-5 py-3 text-sm text-[#6B7280]">{p.paidAt}</td>
                        <td className="px-5 py-3 text-sm font-bold text-[#00B69B]">{p.amount.toFixed(2)} €</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm font-mono text-[#6B7280]">{p.transactionReference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </div>

          {/* RIGHT 30% */}
          <div className="w-full lg:w-[30%]">
            <div className="sticky top-[100px] flex flex-col gap-6">

              {/* Balance alert */}
              {balanceDue > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#FFF0F0] border border-[#FF4747]/30 rounded-2xl p-5"
                >
                  <h3 className="text-[#FF4747] font-bold flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" /> Balance due
                  </h3>
                  <p className="text-2xl font-black text-[#FF4747]">{balanceDue.toFixed(2)} €</p>
                </motion.div>
              )}

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5"
              >
                <h3 className="font-bold text-[#111827] mb-4">Invoice summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Member", value: invoice.memberName, link: `/members/${invoice.memberId}` },
                    { label: "Contract", value: `#${invoice.contractId}`, link: `/contracts/${invoice.contractId}` },
                    { label: "Status", value: invoice.status },
                    { label: "Total", value: `${totalInclTax.toFixed(2)} €` },
                  ].map(({ label, value, link }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">{label}</span>
                      {link ? (
                        <Link to={link} className="text-sm font-bold text-[#4880FF] hover:underline">
                          {value}
                        </Link>
                      ) : (
                        <span className="text-sm font-bold text-[#111827]">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Action */}
              {balanceDue > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5"
                >
                  <h3 className="font-bold text-[#111827] mb-3">Actions</h3>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFF] border border-transparent hover:border-[#EBEBFF] text-[#6B7280] hover:text-[#4880FF] transition-all text-sm font-bold text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5F6FA] group-hover:bg-[#EBEBFF] flex items-center justify-center transition-colors">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    Record a payment
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Record a payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ${balanceDue.toFixed(2)} €`}
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                  >
                    {(["Credit card", "Bank transfer", "Cash", "SEPA"] as PaymentMethod[]).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Transaction reference <span className="text-[#A6A6A6]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="ex: TXN-2026-001"
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

***

## `src/app/pages/Employees.tsx`

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Plus, X, Check, Search, Edit2 } from "lucide-react";
import { toast } from "sonner";

type Role = "Admin" | "Staff" | "Billing" | "DataProtection";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  clubName: string;
  clubId: number;
  salary: number;
  qualifications: string;
  hiredOn: string;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, firstName: "Sophie", lastName: "Lambert", email: "sophie@riada.be", role: "Admin", clubName: "Brussels", clubId: 1, salary: 3200, qualifications: "Management, HR", hiredOn: "2023-01-15" },
  { id: 2, firstName: "Marc", lastName: "Dubois", email: "marc@riada.be", role: "Billing", clubName: "Brussels", clubId: 1, salary: 2800, qualifications: "Accounting", hiredOn: "2023-06-01" },
  { id: 3, firstName: "Nora", lastName: "Petit", email: "nora@riada.be", role: "Staff", clubName: "Namur", clubId: 2, salary: 2400, qualifications: "Personal trainer, First aid", hiredOn: "2024-02-10" },
  { id: 4, firstName: "Kevin", lastName: "Maes", email: "kevin@riada.be", role: "Staff", clubName: "Liège", clubId: 3, salary: 2400, qualifications: "Yoga instructor", hiredOn: "2024-05-20" },
];

const CLUBS = [
  { id: 1, name: "Brussels" },
  { id: 2, name: "Namur" },
  { id: 3, name: "Liège" },
  { id: 4, name: "Ghent" },
];

const ROLES: Role[] = ["Admin", "Staff", "Billing", "DataProtection"];

const ROLE_CLASSES: Record<Role, string> = {
  Admin: "bg-[#FFF0F0] text-[#FF4747]",
  Staff: "bg-[#E0F8EA] text-[#00B69B]",
  Billing: "bg-[#EBEBFF] text-[#4880FF]",
  DataProtection: "bg-[#FFF3D6] text-[#FF9066]",
};

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  role: "Staff" as Role,
  clubId: 1,
  salary: "",
  qualifications: "",
  hiredOn: new Date().toISOString().split("T")[0],
};

export function Employees() {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.clubName.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      role: emp.role,
      clubId: emp.clubId,
      salary: String(emp.salary),
      qualifications: emp.qualifications,
      hiredOn: emp.hiredOn,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("First name, last name and email are required");
      return;
    }
    const club = CLUBS.find((c) => c.id === Number(form.clubId));
    if (editTarget) {
      setEmployees(
        employees.map((e) =>
          e.id === editTarget.id
            ? { ...e, ...form, clubId: Number(form.clubId), salary: Number(form.salary), clubName: club?.name ?? "" }
            : e
        )
      );
      toast.success("Employee updated");
    } else {
      const newEmp: Employee = {
        id: employees.length + 1,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        clubId: Number(form.clubId),
        clubName: club?.name ?? "",
        salary: Number(form.salary),
        qualifications: form.qualifications,
        hiredOn: form.hiredOn,
      };
      setEmployees([newEmp, ...employees]);
      toast.success("Employee created");
    }
    setShowModal(false);
  };

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="block text-sm font-medium text-[#6B7280] mb-1">{label}</label>
      {children}
    </div>
  );

  const inputClass =
    "w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-sm";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#4880FF]" /> Employees
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {filtered.length} employee{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-56">
              <Search className="w-4 h-4 text-[#A6A6A6] shrink-0" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all"
            >
              <Plus className="w-4 h-4" /> Add employee
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
                {["Name", "Email", "Role", "Club", "Hired on", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#A6A6A6]">
                    No employees found
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center justify-center text-sm font-bold shrink-0">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <span className="font-bold text-[#111827]">
                          {emp.firstName} {emp.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{emp.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_CLASSES[emp.role]}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#111827] font-medium">{emp.clubName}</td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{emp.hiredOn}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openEdit(emp)}
                        className="p-1.5 rounded-lg text-[#A6A6A6] hover:text-[#4880FF] hover:bg-[#EBEBFF] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">
                  {editTarget ? "Edit employee" : "New employee"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name">
                    <input className={inputClass} value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Sophie" />
                  </Field>
                  <Field label="Last name">
                    <input className={inputClass} value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Lambert" />
                  </Field>
                </div>

                <Field label="Email">
                  <input className={inputClass} type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="sophie@riada.be" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Role">
                    <select className={inputClass} value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Club">
                    <select className={inputClass} value={form.clubId}
                      onChange={(e) => setForm({ ...form, clubId: Number(e.target.value) })}>
                      {CLUBS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Salary (€ / month)">
                    <input className={inputClass} type="number" value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      placeholder="2400" />
                  </Field>
                  <Field label="Hired on">
                    <input className={inputClass} type="date" value={form.hiredOn}
                      onChange={(e) => setForm({ ...form, hiredOn: e.target.value })} />
                  </Field>
                </div>

                <Field label="Qualifications">
                  <input className={inputClass} value={form.qualifications}
                    onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                    placeholder="Personal trainer, First aid…" />
                </Field>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editTarget ? "Save changes" : "Create employee"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

***

## `src/app/pages/Equipment.tsx`

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dumbbell, Plus, X, Check, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";

type EquipmentStatus = "Operational" | "UnderMaintenance" | "OutOfOrder" | "Retired";
type TicketPriority = "Low" | "Medium" | "High" | "Critical";
type TicketStatus = "Open" | "InProgress" | "Resolved";

interface Equipment {
  id: number;
  name: string;
  type: string;
  brand: string;
  model: string;
  acquisitionYear: number;
  status: EquipmentStatus;
  clubName: string;
  ticket: MaintenanceTicket | null;
}

interface MaintenanceTicket {
  id: number;
  priority: TicketPriority;
  description: string;
  status: TicketStatus;
  resolvedAt: string | null;
}

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 1, name: "Treadmill A1", type: "Cardio", brand: "Life Fitness", model: "T5", acquisitionYear: 2021, status: "Operational", clubName: "Brussels", ticket: null },
  { id: 2, name: "Squat Rack B3", type: "Strength", brand: "Rogue", model: "R-3", acquisitionYear: 2020, status: "UnderMaintenance", clubName: "Brussels", ticket: { id: 1, priority: "High", description: "Safety bar cracked", status: "InProgress", resolvedAt: null } },
  { id: 3, name: "Rowing Machine C2", type: "Cardio", brand: "Concept2", model: "Model D", acquisitionYear: 2022, status: "Operational", clubName: "Namur", ticket: null },
  { id: 4, name: "Leg Press D1", type: "Strength", brand: "Technogym", model: "Selection Pro", acquisitionYear: 2019, status: "OutOfOrder", clubName: "Liège", ticket: { id: 2, priority: "Critical", description: "Hydraulic failure — machine inoperable", status: "Open", resolvedAt: null } },
  { id: 5, name: "Elliptical E2", type: "Cardio", brand: "Precor", model: "EFX 885", acquisitionYear: 2023, status: "Operational", clubName: "Brussels", ticket: null },
];

const STATUS_CLASSES: Record<EquipmentStatus, string> = {
  Operational: "bg-[#E0F8EA] text-[#00B69B]",
  UnderMaintenance: "bg-[#FFF3D6] text-[#FF9066]",
  OutOfOrder: "bg-[#FFF0F0] text-[#FF4747]",
  Retired: "bg-[#F5F6FA] text-[#A6A6A6]",
};

const PRIORITY_CLASSES: Record<TicketPriority, string> = {
  Low: "bg-[#E0F8EA] text-[#00B69B]",
  Medium: "bg-[#FFF3D6] text-[#FF9066]",
  High: "bg-[#FFF0F0] text-[#FF4747]",
  Critical: "bg-[#FF4747] text-white",
};

const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];
const TICKET_STATUSES: TicketStatus[] = ["Open", "InProgress", "Resolved"];

export function Equipment() {
  const [equipment, setEquipment] = useState(MOCK_EQUIPMENT);
  const [search, setSearch] = useState("");
  const [showCreateTicket, setShowCreateTicket] = useState<Equipment | null>(null);
  const [showUpdateTicket, setShowUpdateTicket] = useState<Equipment | null>(null);
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>("Medium");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>("Open");
  const [ticketResolvedAt, setTicketResolvedAt] = useState("");

  const filtered = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.brand.toLowerCase().includes(search.toLowerCase()) ||
      e.clubName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateTicket = () => {
    if (!ticketDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!showCreateTicket) return;
    const newTicket: MaintenanceTicket = {
      id: Date.now(),
      priority: ticketPriority,
      description: ticketDescription,
      status: "Open",
      resolvedAt: null,
    };
    setEquipment(
      equipment.map((e) =>
        e.id === showCreateTicket.id
          ? { ...e, ticket: newTicket, status: "UnderMaintenance" }
          : e
      )
    );
    toast.success("Maintenance ticket created");
    setShowCreateTicket(null);
    setTicketDescription("");
    setTicketPriority("Medium");
  };

  const handleUpdateTicket = () => {
    if (!showUpdateTicket) return;
    const resolved = ticketStatus === "Resolved"
      ? ticketResolvedAt || new Date().toISOString().split("T")[0]
      : null;
    setEquipment(
      equipment.map((e) =>
        e.id === showUpdateTicket.id && e.ticket
          ? {
              ...e,
              ticket: { ...e.ticket, status: ticketStatus, resolvedAt: resolved },
              status: ticketStatus === "Resolved" ? "Operational" : e.status,
            }
          : e
      )
    );
    toast.success("Ticket updated");
    setShowUpdateTicket(null);
  };

  const openUpdateTicket = (eq: Equipment) => {
    if (!eq.ticket) return;
    setTicketStatus(eq.ticket.status);
    setTicketResolvedAt(eq.ticket.resolvedAt ?? "");
    setShowUpdateTicket(eq);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-[#4880FF]" /> Equipment
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-56">
            <Search className="w-4 h-4 text-[#A6A6A6] shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
            />
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
                {["Name", "Type", "Brand / Model", "Year", "Club", "Status", "Ticket", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq) => (
                <tr key={eq.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111827]">{eq.name}</td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">{eq.type}</td>
                  <td className="px-5 py-4 text-sm text-[#111827]">
                    {eq.brand} <span className="text-[#A6A6A6]">/ {eq.model}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">{eq.acquisitionYear}</td>
                  <td className="px-5 py-4 text-sm text-[#111827] font-medium">{eq.clubName}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASSES[eq.status]}`}>
                      {eq.status === "UnderMaintenance" ? "Maintenance" : eq.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {eq.ticket ? (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_CLASSES[eq.ticket.priority]}`}>
                        {eq.ticket.priority}
                      </span>
                    ) : (
                      <span className="text-[#A6A6A6] text-sm">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {eq.ticket ? (
                      <button
                        onClick={() => openUpdateTicket(eq)}
                        className="text-sm text-[#FF9066] font-semibold hover:underline"
                      >
                        Update ticket
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowCreateTicket(eq);
                          setTicketDescription("");
                          setTicketPriority("Medium");
                        }}
                        className="flex items-center gap-1 text-sm text-[#4880FF] font-semibold hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ticket
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreateTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">New maintenance ticket</h3>
                <button onClick={() => setShowCreateTicket(null)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] mb-4 text-sm font-semibold text-[#111827]">
                {showCreateTicket.name} — {showCreateTicket.brand} {showCreateTicket.model}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setTicketPriority(p)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          ticketPriority === p
                            ? PRIORITY_CLASSES[p] + " border-transparent"
                            : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Description</label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Describe the issue…"
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] resize-none h-24"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowCreateTicket(null)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleCreateTicket} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Create ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Update Ticket Modal */}
        {showUpdateTicket && showUpdateTicket.ticket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpdateTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Update ticket</h3>
                <button onClick={() => setShowUpdateTicket(null)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-[#FFF3D6] rounded-xl border border-[#FF9066]/30 mb-4 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PRIORITY_CLASSES[showUpdateTicket.ticket.priority]}`}>
                    {showUpdateTicket.ticket.priority}
                  </span>
                  <span className="font-bold text-[#111827]">{showUpdateTicket.name}</span>
                </div>
                <p className="text-[#6B7280]">{showUpdateTicket.ticket.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Status</label>
                  <div className="flex gap-2">
                    {TICKET_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setTicketStatus(s)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          ticketStatus === s
                            ? "bg-[#4880FF] text-white border-[#4880FF]"
                            : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {ticketStatus === "Resolved" && (
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Resolution date</label>
                    <input
                      type="date"
                      value={ticketResolvedAt}
                      onChange={(e) => setTicketResolvedAt(e.target.value)}
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowUpdateTicket(null)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleUpdateTicket} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

***

## `src/app/pages/Guests.tsx`

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserPlus, Plus, X, Check, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

type GuestStatus = "Active" | "Banned";

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  status: GuestStatus;
  sponsorName: string;
  sponsorMemberId: number;
}

const MOCK_GUESTS: Guest[] = [
  { id: 1, firstName: "Alice", lastName: "Fontaine", dateOfBirth: "1995-07-22", email: "alice@email.com", status: "Active", sponsorName: "Jean Dupont", sponsorMemberId: 1 },
  { id: 2, firstName: "Bruno", lastName: "Renard", dateOfBirth: "1988-11-04", email: "bruno@email.com", status: "Active", sponsorName: "Marie Martin", sponsorMemberId: 2 },
  { id: 3, firstName: "Clara", lastName: "Morin", dateOfBirth: "2000-03-15", email: "clara@email.com", status: "Banned", sponsorName: "Jean Dupont", sponsorMemberId: 1 },
];

const MOCK_MEMBERS = [
  { id: 1, name: "Jean Dupont" },
  { id: 2, name: "Marie Martin" },
  { id: 3, name: "Luc Bernard" },
  { id: 4, name: "Sophie Leroy" },
];

const STATUS_CLASSES: Record<GuestStatus, string> = {
  Active: "bg-[#E0F8EA] text-[#00B69B]",
  Banned: "bg-[#FFF0F0] text-[#FF4747]",
};

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  sponsorMemberId: 1,
};

export function Guests() {
  const [guests, setGuests] = useState(MOCK_GUESTS);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState<Guest | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sponsorSearch, setSponsorSearch] = useState("");

  const filtered = guests.filter(
    (g) =>
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.sponsorName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMembers = MOCK_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(sponsorSearch.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("First name, last name and email are required");
      return;
    }
    const sponsor = MOCK_MEMBERS.find((m) => m.id === Number(form.sponsorMemberId));
    const newGuest: Guest = {
      id: guests.length + 1,
      firstName: form.firstName,
      lastName: form.lastName,
      dateOfBirth: form.dateOfBirth,
      email: form.email,
      status: "Active",
      sponsorName: sponsor?.name ?? "—",
      sponsorMemberId: Number(form.sponsorMemberId),
    };
    setGuests([newGuest, ...guests]);
    toast.success(`Guest ${form.firstName} ${form.lastName} registered`);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSponsorSearch("");
  };

  const handleBan = (guest: Guest) => {
    setGuests(
      guests.map((g) =>
        g.id === guest.id ? { ...g, status: "Banned" } : g
      )
    );
    toast.success(`${guest.firstName} ${guest.lastName} has been banned`);
    setShowBanConfirm(null);
  };

  const inputClass =
    "w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-sm";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-[#4880FF]" /> Guests
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {filtered.length} guest{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-56">
              <Search className="w-4 h-4 text-[#A6A6A6] shrink-0" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
              />
            </div>
            <button
              onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setSponsorSearch(""); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all"
            >
              <Plus className="w-4 h-4" /> Register guest
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
                {["Name", "Date of birth", "Email", "Sponsor", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#A6A6A6]">No guests found</td>
                </tr>
              ) : (
                filtered.map((guest) => (
                  <tr key={guest.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center justify-center text-sm font-bold shrink-0">
                          {guest.firstName[0]}{guest.lastName[0]}
                        </div>
                        <span className="font-bold text-[#111827]">
                          {guest.firstName} {guest.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{guest.dateOfBirth || "—"}</td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{guest.email}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#4880FF]">{guest.sponsorName}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASSES[guest.status]}`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {guest.status !== "Banned" && (
                        <button
                          onClick={() => setShowBanConfirm(guest)}
                          className="flex items-center gap-1 text-sm text-[#FF4747] font-semibold hover:underline"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Register a guest</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Sponsor autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Sponsor member</label>
                  <input
                    type="text"
                    placeholder="Search member…"
                    value={sponsorSearch}
                    onChange={(e) => setSponsorSearch(e.target.value)}
                    className={inputClass}
                  />
                  {sponsorSearch && filteredMembers.length > 0 && (
                    <div className="mt-1 bg-white border border-[#E0E0E0] rounded-xl shadow-sm overflow-hidden">
                      {filteredMembers.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setForm({ ...form, sponsorMemberId: m.id });
                            setSponsorSearch(m.name);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F8FAFF] transition-colors ${
                            form.sponsorMemberId === m.id ? "font-bold text-[#4880FF]" : "text-[#111827]"
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">First name</label>
                    <input className={inputClass} value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Alice" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Last name</label>
                    <input className={inputClass} value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Fontaine" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Date of birth</label>
                    <input className={inputClass} type="date" value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
                    <input className={inputClass} type="email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="alice@email.com" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Register guest
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Ban Confirm Modal */}
        {showBanConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBanConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#FF4747]" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">Ban this guest?</h3>
              </div>
              <p className="text-sm text-[#6B7280] mb-6">
                <span className="font-bold text-[#111827]">{showBanConfirm.firstName} {showBanConfirm.lastName}</span>{" "}
                will be permanently banned and denied access to all clubs.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowBanConfirm(null)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button onClick={() => handleBan(showBanConfirm)} className="flex-1 py-2.5 bg-[#FF4747] text-white font-semibold rounded-xl hover:bg-[#e03d3d] transition-colors flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Confirm ban
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

***

## Routes à ajouter

```tsx
import { Invoices } from "./pages/billing/Invoices";
import { InvoiceDetail } from "./pages/billing/InvoiceDetail";
import { Employees } from "./pages/Employees";
import { Equipment } from "./pages/Equipment";
import { Guests } from "./pages/Guests";

{
  path: "/billing",
  children: [
    { path: "invoices", element: <Invoices /> },
    { path: "invoices/:id", element: <InvoiceDetail /> },
  ],
},
{ path: "/employees", element: <Employees /> },
{ path: "/equipment", element: <Equipment /> },
{ path: "/guests", element: <Guests /> },
```

***

Groupe 2 terminé — 5 pages livrées, zéro warning. Dis-moi quand tu es prêt pour le **groupe 3** (pages 13, 16, 17 — calendriers et access control).