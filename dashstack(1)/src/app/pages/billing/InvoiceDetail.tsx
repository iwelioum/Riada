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