import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight, ArrowLeft, Mail, Phone, MapPin, Target, UserPlus, 
  CheckCircle2, CreditCard, Clock, Activity, AlertTriangle, XCircle, 
  MoreVertical, Calendar as CalendarIcon, Download, PowerOff, ShieldAlert,
  Edit2, Save, FileText, Check, Plus, ChevronLeft, X
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { MemberDetailType, ContractDetail } from "../types/member";
import { goalLabel, sourceLabel, genderLabel } from "../utils/enumLabels";
import { formatMemberSince, computeRisk } from "../utils/memberUtils";

// --- Mock Data ---
const MOCK_MEMBER: MemberDetailType = {
  id: "m-1234",
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean.dupont@email.com",
  mobilePhone: "+32 600 00 00 00",
  status: "Active",
  gender: "Male",
  dateOfBirth: "1990-04-12",
  nationality: "Belgian",
  addressStreet: "1 Rue de la Loi",
  addressCity: "Brussels",
  addressPostalCode: "1000",
  primaryGoal: "MuscleGain",
  acquisitionSource: "SocialMedia",
  medicalCertificateProvided: true,
  gdprConsentAt: "01/01/2025",
  marketingConsent: true,
  referralMemberName: "Marie Martin",
  createdAt: "2025-01-01T10:00:00Z",
  totalVisits: 47,
  lastVisitDate: "Yesterday, 18:32",
  weeklyFrequency: "3x / week",
  engagementLevel: "Highly active",
  riskScore: 82,
  contracts: [
    {
      id: 1,
      planName: "Premium",
      homeClub: "Brussels",
      startDate: "2025-01-01",
      endDate: null,
      contractType: "OpenEnded",
      status: "Active",
      freezeStartDate: null,
      freezeEndDate: null,
      activeOptions: ["Group classes", "Sauna access"]
    },
    {
      id: 2,
      planName: "Basic",
      homeClub: "Brussels",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      contractType: "FixedTerm",
      status: "Expired",
      freezeStartDate: null,
      freezeEndDate: null,
      activeOptions: []
    }
  ],
  alerts: [
    "Subscription expired 5 days ago",
    "Last invoice unpaid (89.99€)",
    "No visit for 30 days"
  ],
  notes: [
    { author: "Sophie (admin)", date: "15/03/2026", text: "Member interested in VIP plan, call back in April" },
    { author: "Marc (billing)", date: "02/03/2026", text: "Agreed to 2-installment payment for invoice #INV-2024-089" }
  ],
  recentVisits: [
    { day: "Mon", visits: 1 },
    { day: "Tue", visits: 0 },
    { day: "Wed", visits: 1 },
    { day: "Thu", visits: 1 },
    { day: "Fri", visits: 0 },
    { day: "Sat", visits: 1 },
    { day: "Sun", visits: 0 },
  ],
  timeline: [
    { id: 1, date: "Today", time: "09:14", type: "visite", title: "Visit — Brussels Club", icon: Activity, color: "text-[#4AD991]", bg: "bg-[#E0F8EA]" },
    { id: 2, date: "3 days ago", time: "14:30", type: "payment", title: "Payment recorded — 49.99€", desc: "Credit card", icon: CreditCard, color: "text-[#4880FF]", bg: "bg-[#EBEBFF]" },
    { id: 3, date: "5 days ago", time: "18:02", type: "visite", title: "Visit — Namur Club", icon: Activity, color: "text-[#4AD991]", bg: "bg-[#E0F8EA]" },
    { id: 4, date: "2 months ago", time: "10:00", type: "contrat", title: "Contract frozen — 14 days", icon: Clock, color: "text-[#FF9066]", bg: "bg-[#FFF3D6]" },
    { id: 5, date: "14 months ago", time: "11:15", type: "inscription", title: "Registration — Basic Plan", icon: CheckCircle2, color: "text-[#4AD991]", bg: "bg-[#E0F8EA]" },
  ],
  pendingInvoicesCount: 3,
  totalPaid: 1249.97,
  sponsoredMembersCount: 2
};

const MEMBER_IDS = ["m-1234", "m-1235", "m-1236"];

// --- Components ---

export function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberDetailType>(MOCK_MEMBER);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<MemberDetailType>(MOCK_MEMBER);
  const [menuOpen, setMenuOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Modals state
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Forms state
  const [freezeDays, setFreezeDays] = useState(14);
  const [contractPlan, setContractPlan] = useState("Basic");
  const [contractType, setContractType] = useState("OpenEnded");
  const [contractStartDate, setContractStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractEndDate, setContractEndDate] = useState("");
  const [contractOptions, setContractOptions] = useState<string[]>([]);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CreditCard");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  useEffect(() => {
    setMember({ ...MOCK_MEMBER, id: id || "m-1234", firstName: id === "m-1235" ? "Marie" : id === "m-1236" ? "Luc" : "Jean" });
    setEditData({ ...MOCK_MEMBER, id: id || "m-1234", firstName: id === "m-1235" ? "Marie" : id === "m-1236" ? "Luc" : "Jean" });
  }, [id]);

  const currentIndex = MEMBER_IDS.indexOf(id || "m-1234");
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < MEMBER_IDS.length - 1;

  const handlePrev = () => {
    if (hasPrev) navigate(`/members/${MEMBER_IDS[currentIndex - 1]}`);
  };

  const handleNext = () => {
    if (hasNext) navigate(`/members/${MEMBER_IDS[currentIndex + 1]}`);
  };

  const handleCheckIn = () => {
    toast.success("Check-in successful", { description: `${member.firstName} has access to the club.` });
  };

  const toggleStatus = () => {
    const newStatus = member.status === "Active" ? "Suspended" : "Active";
    setMember({ ...member, status: newStatus });
    setEditData({ ...editData, status: newStatus });
    toast.success(`Status updated: ${newStatus}`);
  };

  const handleSaveInfo = () => {
    setMember(editData);
    setIsEditing(false);
    toast.success("Personal information updated.");
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const newNote = { author: "You (staff)", date: new Date().toLocaleDateString('en-GB'), text: noteText };
    setMember({ ...member, notes: [newNote, ...member.notes] });
    setNoteText("");
    toast.success("Note added to profile.");
  };

  const activeContract = member.contracts.find(c => c.status === "Active");
  const pastContracts = member.contracts.filter(c => c.status !== "Active");

  const computedRisk = computeRisk(member.status, member.lastVisitDate);
  const statusColor = member.status === "Active" ? "bg-[#00B69B]" : member.status === "Suspended" ? "bg-[#FF9066]" : "bg-[#A6A6A6]";
  const riskColor = computedRisk <= 30 ? "bg-[#00B69B]" : computedRisk <= 60 ? "bg-[#FF9066]" : "bg-[#FF4747]";
  const riskText = computedRisk <= 30 ? "text-[#00B69B]" : computedRisk <= 60 ? "text-[#FF9066]" : "text-[#FF4747]";
  
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] shadow-sm px-8 py-4 flex-shrink-0 flex flex-col gap-3">
        {/* Breadcrumb and Nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-[#6B7280] font-medium">
            <button onClick={() => navigate('/members')} className="hover:text-[#4880FF] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="mx-2">/</span>
            <Link to="/members" className="hover:text-[#4880FF] transition-colors">Members</Link>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-[#111827]">{member.firstName} {member.lastName}</span>
            
            <div className="flex items-center gap-1 ml-4 border-l border-black/10 pl-4">
              <button 
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1 rounded text-[#6B7280] hover:bg-[#F5F6FA] hover:text-[#111827] disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1 rounded text-[#6B7280] hover:bg-[#F5F6FA] hover:text-[#111827] disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm ${member.status === "Anonymized" ? "bg-[#F0F0F0] text-[#A6A6A6]" : "bg-[#EBEBFF] text-[#4880FF]"}`}>
                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
              </div>
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${statusColor}`}></div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className={`text-2xl font-bold leading-none ${member.status === "Anonymized" ? "text-[#A6A6A6]" : "text-[#111827]"}`}>
                  {member.firstName} {member.lastName}
                </h1>
                <button 
                  onClick={toggleStatus}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    member.status === "Active" 
                      ? "border-[#00B69B] text-[#00B69B] hover:bg-[#E0F8EA]" 
                      : member.status === "Suspended"
                      ? "border-[#FF9066] text-[#FF9066] hover:bg-[#FFF3D6]"
                      : "border-[#A6A6A6] text-[#A6A6A6] bg-[#F0F0F0]"
                  }`}
                  disabled={member.status === "Anonymized"}
                >
                  {member.status === "Active" ? "Active" : member.status === "Suspended" ? "Suspended" : "Anonymized"}
                </button>
                {activeContract && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">
                    {activeContract.planName}
                  </span>
                )}
                {member.status !== "Anonymized" && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${riskColor}`}>
                    Risk {computedRisk}/100
                  </span>
                )}
              </div>
              <div className="text-sm text-[#6B7280] flex items-center gap-4">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Club: <span className="font-semibold text-[#4880FF] cursor-pointer hover:underline">{activeContract?.homeClub ?? "—"}</span></span>
                <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Goal: {goalLabel[member.primaryGoal ?? ""] ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              disabled={member.status === "Anonymized"}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-lg text-sm font-semibold text-[#6B7280] hover:text-[#4880FF] hover:border-[#4880FF] transition-all disabled:opacity-50"
            >
              {isEditing ? <XCircle className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button 
              onClick={handleCheckIn}
              disabled={member.status !== "Active"}
              className="flex items-center gap-2 px-5 py-2 bg-[#4880FF] rounded-lg text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Activity className="w-4 h-4" /> Check-in
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 border border-[#E0E0E0] rounded-lg text-[#6B7280] hover:bg-[#F5F6FA] transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {menuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E0E0E0] py-2 z-50"
                  >
                    <button onClick={toggleStatus} disabled={member.status === "Anonymized"} className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#F5F6FA] flex items-center gap-2 disabled:opacity-50">
                      {member.status === "Active" ? <PowerOff className="w-4 h-4 text-[#FF9066]" /> : <CheckCircle2 className="w-4 h-4 text-[#00B69B]" />}
                      {member.status === "Active" ? "Suspend member" : "Reactivate member"}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#F5F6FA] flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#4880FF]" /> Export PDF profile
                    </button>
                    <div className="h-px bg-[#E0E0E0] my-2"></div>
                    <button 
                      onClick={() => {
                        setMember({...member, status: "Anonymized", firstName: "Anonymized", lastName: "Member", email: "—", mobilePhone: "—", addressStreet: null, addressCity: null, addressPostalCode: null});
                        setMenuOpen(false);
                      }}
                      disabled={member.status === "Anonymized"}
                      className="w-full text-left px-4 py-2 text-sm text-[#FF4747] hover:bg-[#FFF0F0] flex items-center gap-2 font-medium disabled:opacity-50"
                    >
                      <ShieldAlert className="w-4 h-4" /> Anonymize (GDPR)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          
          {/* LEFT COLUMN 70% */}
          <div className="w-full lg:w-[70%] flex flex-col gap-8">
            
            {/* Infos personnelles */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4880FF]" /> Personal Information
                </h2>
                {isEditing && (
                  <button onClick={handleSaveInfo} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B69B] text-white rounded-md text-sm font-semibold hover:bg-[#00a088] transition-colors">
                    <Save className="w-4 h-4" /> Save
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <InfoField label="Email" icon={Mail} value={member.email} isEditing={false} 
                  clickable={!isEditing && member.status !== "Anonymized"}
                  onClick={() => !isEditing && member.status !== "Anonymized" && window.open(`mailto:${member.email}`)}
                />
                <InfoField label="Phone" icon={Phone} value={member.mobilePhone ?? "—"} isEditing={isEditing} 
                  onChange={(v: string) => setEditData({...editData, mobilePhone: v})} 
                  onClick={() => !isEditing && member.status !== "Anonymized" && window.open(`tel:${member.mobilePhone}`)}
                  clickable={!isEditing && member.status !== "Anonymized"}
                />
                <InfoField label="Date of birth" icon={CalendarIcon} value={`${member.dateOfBirth}`} isEditing={isEditing} 
                  onChange={(v: string) => setEditData({...editData, dateOfBirth: v.split(' ')[0]})} 
                />
                
                {/* 3 Address Fields instead of 1 */}
                <InfoField label="Street" icon={MapPin} value={member.addressStreet ?? "—"} isEditing={isEditing} 
                  onChange={(v: string) => setEditData({...editData, addressStreet: v})} 
                />
                <InfoField label="City" icon={MapPin} value={member.addressCity ?? "—"} isEditing={isEditing} 
                  onChange={(v: string) => setEditData({...editData, addressCity: v})} 
                />
                <InfoField label="Postal Code" icon={MapPin} value={member.addressPostalCode ?? "—"} isEditing={isEditing} 
                  onChange={(v: string) => setEditData({...editData, addressPostalCode: v})} 
                />

                <div className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#6B7280] shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6B7280] font-medium mb-0.5">Medical certificate</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${member.medicalCertificateProvided ? 'bg-[#00B69B]' : 'bg-[#FF9066]'}`}></span>
                      <span className="text-sm font-semibold text-[#111827]">{member.medicalCertificateProvided ? 'Provided' : 'Missing'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#6B7280] shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6B7280] font-medium mb-0.5">GDPR Consent</p>
                    <span className="text-sm font-semibold text-[#111827]">Accepted on {member.gdprConsentAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#6B7280] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6B7280] font-medium mb-0.5">Marketing consent</p>
                    {isEditing ? (
                      <label className="flex items-center gap-2 cursor-pointer mt-1">
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${editData.marketingConsent ? 'bg-[#00B69B]' : 'bg-[#E0E0E0]'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${editData.marketingConsent ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={editData.marketingConsent}
                          onChange={(e) => setEditData({...editData, marketingConsent: e.target.checked})}
                        />
                      </label>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${member.marketingConsent ? 'bg-[#E0F8EA] text-[#00B69B]' : 'bg-[#FFF0F0] text-[#FF4747]'}`}>
                        {member.marketingConsent ? "Accepted" : "Declined"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#6B7280] shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6B7280] font-medium mb-0.5">Referral</p>
                    <span className="text-sm font-semibold text-[#4880FF] hover:underline cursor-pointer">{member.referralMemberName ?? "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#6B7280] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6B7280] font-medium mb-0.5">Member since</p>
                    <span className="text-sm font-semibold text-[#111827]">{formatMemberSince(member.createdAt)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contrats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 px-1">
                <FileText className="w-5 h-5 text-[#4880FF]" /> Contracts
              </h2>
              
              {/* Contrat actif */}
              {activeContract ? (
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(72,128,255,0.08)] border-2 border-[#4880FF] p-6 relative">
                  <div className="absolute top-0 right-0 bg-[#4880FF] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Active</div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#111827] mb-1">{activeContract.planName}</h3>
                      <p className="text-sm text-[#6B7280]">Type: <span className="font-medium text-[#111827]">{activeContract.contractType === "OpenEnded" ? "Open-ended" : "Fixed-term"}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#6B7280]">Start: <span className="font-medium text-[#111827]">{activeContract.startDate}</span></p>
                      <p className="text-sm text-[#6B7280]">End: <span className="font-medium text-[#111827]">{activeContract.endDate ?? "—"}</span></p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-bold text-[#6B7280] uppercase mb-2">Active options</p>
                    <div className="flex flex-wrap gap-2">
                      {activeContract.activeOptions.map((opt, i) => (
                        <span key={i} className="px-3 py-1 bg-[#F5F6FA] text-[#6B7280] rounded-full text-xs font-semibold border border-[#E0E0E0]">
                          {opt}
                        </span>
                      ))}
                      {activeContract.activeOptions.length === 0 && <span className="text-sm text-[#A6A6A6]">No options</span>}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#F0F0F0]">
                    <button className="flex-1 py-2 bg-[#F5F6FA] hover:bg-[#EBEBFF] hover:text-[#4880FF] text-[#6B7280] text-sm font-bold rounded-lg transition-colors">
                      Renew
                    </button>
                    <button 
                      onClick={() => setShowFreezeModal(true)}
                      className="flex-1 py-2 bg-[#F5F6FA] hover:bg-[#FFF3D6] hover:text-[#FF9066] text-[#6B7280] text-sm font-bold rounded-lg transition-colors"
                    >
                      Freeze
                    </button>
                    <button 
                      onClick={() => setShowNewContractModal(true)}
                      className="w-10 h-10 flex items-center justify-center bg-[#F5F6FA] hover:bg-[#4880FF] hover:text-white text-[#6B7280] rounded-lg transition-colors" 
                      title="New contract"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 text-center py-10">
                  <FileText className="w-12 h-12 text-[#E0E0E0] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[#111827] mb-1">No active contract</h3>
                  <p className="text-[#6B7280] text-sm mb-6">This member currently has no active subscription.</p>
                  <button 
                    onClick={() => setShowNewContractModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] text-white rounded-lg text-sm font-bold hover:bg-[#3b6ee0] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Create contract
                  </button>
                </div>
              )}

              {/* Contrats passés */}
              {pastContracts.map(contract => (
                <div key={contract.id} className="bg-white/60 rounded-xl border border-[#E0E0E0] p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${contract.status === 'Suspended' ? 'bg-[#FF9066]' : 'bg-[#A6A6A6]'}`}></span>
                      <span className="text-sm font-bold text-[#6B7280]">{contract.planName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F0F0F0] text-[#6B7280] rounded-full">{contract.status}</span>
                    </div>
                    <p className="text-xs text-[#A6A6A6]">{contract.startDate} — {contract.endDate ?? "..."}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                    className="text-sm text-[#4880FF] font-medium hover:underline"
                  >
                    View details
                  </button>
                </div>
              ))}
            </motion.div>

            {/* Activité */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6"
            >
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-[#4880FF]" /> Activity & Engagement
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-[#F8FAFF] border border-[#EBEBFF]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">Last visit</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00B69B]"></span>
                    <span className="text-lg font-bold text-[#111827]">{member.lastVisitDate ?? "—"}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F6FA] border border-[#E0E0E0]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">Total visits</p>
                  <p className="text-lg font-bold text-[#111827]">{member.totalVisits} visits</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F6FA] border border-[#E0E0E0]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">Frequency</p>
                  <p className="text-lg font-bold text-[#111827]">{member.weeklyFrequency}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FFF3EE] border border-[#FFE2D6]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">Engagement</p>
                  <p className="text-lg font-bold text-[#FF9066] flex items-center gap-1">🔥 {member.engagementLevel}</p>
                </div>
              </div>

              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={member.recentVisits} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#A6A6A6", fontSize: 12 }} />
                    <Tooltip cursor={{fill: '#F5F6FA'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="visits" fill="#4880FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Timeline Unifiée */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6"
            >
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-[#4880FF]" /> Unified Timeline
              </h2>

              <div className="relative pl-6 border-l-2 border-[#F0F0F0] space-y-6 ml-2">
                {member.timeline.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[43px] top-1 w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center border-4 border-white shadow-sm`}>
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
                        {item.desc && <p className="text-xs text-[#6B7280] mt-1">{item.desc}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 text-sm font-bold text-[#4880FF] bg-[#F8FAFF] rounded-lg hover:bg-[#EBEBFF] transition-colors border border-[#EBEBFF]">
                Load more events
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN 30% (STICKY CONTAINER) */}
          <div className="w-full lg:w-[30%] flex flex-col gap-6">
            <div className="sticky top-[100px] flex flex-col gap-6">
              
              {/* Alertes actives */}
              {member.alerts.length > 0 && member.status !== "Anonymized" && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#FFF0F0] border border-[#FF4747]/30 rounded-2xl p-5 shadow-sm"
                >
                  <h3 className="text-[#FF4747] font-bold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5" /> Active Alerts
                  </h3>
                  <ul className="space-y-2">
                    {member.alerts.map((alert, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#111827] font-medium">
                        <span className="text-[#FF4747] mt-0.5">•</span> {alert}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Risk Score */}
              {member.status !== "Anonymized" && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[#111827]">Risk Score</h3>
                    <span className={`text-xl font-black ${riskText}`}>{computedRisk}/100</span>
                  </div>
                  <div className="h-2 w-full bg-[#F0F0F0] rounded-full overflow-hidden mb-4">
                    <div className={`h-full ${riskColor}`} style={{ width: `${computedRisk}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-[#6B7280] uppercase mb-2">Detected factors:</p>
                  <ul className="space-y-1.5 text-sm text-[#6B7280]">
                    <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-[#FF4747]" /> 3 unpaid invoices</li>
                    <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#FF9066]" /> 12 denied accesses (60d)</li>
                    <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#FF9066]" /> No visit for 18d</li>
                  </ul>
                </motion.div>
              )}

              {/* Actions Rapides */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5 flex flex-col gap-2"
              >
                <h3 className="font-bold text-[#111827] mb-2">Quick Actions</h3>
                <ActionButton disabled={member.status === "Anonymized"} icon={Mail} label="Send email" onClick={() => window.open(`mailto:${member.email}`)} />
                <ActionButton disabled={member.status === "Anonymized"} icon={Phone} label="Call" onClick={() => window.open(`tel:${member.mobilePhone}`)} />
                <ActionButton disabled={member.status === "Anonymized"} icon={CreditCard} label="Create manual payment" onClick={() => setShowPaymentModal(true)} />
                <ActionButton disabled={member.status === "Anonymized"} icon={Edit2} label="Add a note" onClick={() => {
                  document.getElementById("note-input")?.focus();
                }} />
              </motion.div>

              {/* Stats Rapides */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5"
              >
                <h3 className="font-bold text-[#111827] mb-4">Financial Overview & Stats</h3>
                <div className="space-y-3">
                  <StatRow label="Total collected" value={`${member.totalPaid} €`} highlight />
                  <StatRow label="Pending invoices" value={member.pendingInvoicesCount} warning={member.pendingInvoicesCount > 0} />
                  <StatRow label="Sponsored members" value={`${member.sponsoredMembersCount} members`} />
                </div>
              </motion.div>

              {/* Notes internes */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5 flex flex-col h-full"
              >
                <h3 className="font-bold text-[#111827] mb-4 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#4880FF]" /> Internal Notes
                </h3>
                
                <div className="flex flex-col gap-3 mb-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {member.notes.map((note, i) => (
                    <div key={i} className="bg-[#F8FAFF] p-3 rounded-xl border border-[#EBEBFF] text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#4880FF] text-xs">{note.author}</span>
                        <span className="text-[10px] text-[#A6A6A6]">{note.date}</span>
                      </div>
                      <p className="text-[#111827]">{note.text}</p>
                    </div>
                  ))}
                  {member.notes.length === 0 && <p className="text-sm text-[#A6A6A6] italic text-center py-4">No internal notes yet.</p>}
                </div>

                <div className="mt-auto relative">
                  <textarea 
                    id="note-input"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write a note..."
                    disabled={member.status === "Anonymized"}
                    className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] resize-none h-20 transition-all disabled:opacity-50"
                  ></textarea>
                  <button 
                    onClick={handleAddNote}
                    className="absolute bottom-2 right-2 p-1.5 bg-[#4880FF] text-white rounded-lg hover:bg-[#3b6ee0] transition-colors disabled:opacity-50"
                    disabled={!noteText.trim() || member.status === "Anonymized"}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* MODAL FREEZE CONTRACT */}
        {showFreezeModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowFreezeModal(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#111827]">Freeze contract</h3>
                  <button onClick={() => setShowFreezeModal(false)} className="text-[#6B7280] hover:bg-[#F5F6FA] p-1.5 rounded-lg"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Duration (in days)</label>
                    <input 
                      type="number" 
                      value={freezeDays} 
                      onChange={(e) => setFreezeDays(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]"
                    />
                  </div>
                  
                  <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF]">
                    <p className="text-sm text-[#6B7280]">Estimated freeze dates:</p>
                    <p className="font-semibold text-[#111827] mt-1">
                      From {new Date().toLocaleDateString('en-GB')} to {new Date(Date.now() + freezeDays * 86400000).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowFreezeModal(false)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                  <button onClick={() => {
                    toast.success(`Contract frozen for ${freezeDays} days`);
                    setShowFreezeModal(false);
                  }} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors">Confirm</button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* MODAL NEW CONTRACT */}
        {showNewContractModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowNewContractModal(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#111827]">New contract</h3>
                  <button onClick={() => setShowNewContractModal(false)} className="text-[#6B7280] hover:bg-[#F5F6FA] p-1.5 rounded-lg"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#6B7280] mb-1">Plan</label>
                      <select 
                        value={contractPlan} onChange={(e) => setContractPlan(e.target.value)}
                        className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6B7280] mb-1">Type</label>
                      <select 
                        value={contractType} onChange={(e) => setContractType(e.target.value)}
                        className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                      >
                        <option value="OpenEnded">Open-ended</option>
                        <option value="FixedTerm">Fixed-term</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#6B7280] mb-1">Start date</label>
                      <input 
                        type="date" value={contractStartDate} onChange={(e) => setContractStartDate(e.target.value)}
                        className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                      />
                    </div>
                    {contractType === "FixedTerm" && (
                      <div>
                        <label className="block text-sm font-medium text-[#6B7280] mb-1">End date</label>
                        <input 
                          type="date" value={contractEndDate} onChange={(e) => setContractEndDate(e.target.value)}
                          className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">Options</label>
                    <div className="flex flex-col gap-2">
                      {["Group classes", "Sauna access", "Parking"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={contractOptions.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) setContractOptions([...contractOptions, opt]);
                              else setContractOptions(contractOptions.filter(o => o !== opt));
                            }}
                            className="w-4 h-4 text-[#4880FF] rounded border-[#E0E0E0] focus:ring-[#4880FF]"
                          />
                          <span className="text-sm text-[#111827]">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowNewContractModal(false)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                  <button onClick={() => {
                    toast.success("New contract created");
                    setShowNewContractModal(false);
                  }} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors">Create contract</button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* MODAL MANUAL PAYMENT */}
        {showPaymentModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#111827]">Create manual payment</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="text-[#6B7280] hover:bg-[#F5F6FA] p-1.5 rounded-lg"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Amount (€)</label>
                    <input 
                      type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="ex: 49.99"
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Method</label>
                    <select 
                      value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                    >
                      <option value="CreditCard">Credit card</option>
                      <option value="BankTransfer">Bank transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="SepaDirectDebit">SEPA Direct Debit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Reference (optional)</label>
                    <input 
                      type="text" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="ex: INV-2026-001"
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Note (optional)</label>
                    <textarea 
                      value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="Payment details..."
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] resize-none h-20"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                  <button onClick={() => {
                    if(!paymentAmount) {
                      toast.error("Please enter an amount");
                      return;
                    }
                    toast.success(`Payment of ${paymentAmount}€ recorded`);
                    setShowPaymentModal(false);
                  }} className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors">Save</button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* CREATE CONTRACT MODAL */}
        {showNewContractModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewContractModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#111827]">Create new contract</h3>
                <button onClick={() => setShowNewContractModal(false)} className="text-[#6B7280] hover:bg-[#F5F6FA] p-1.5 rounded-lg"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Member</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={`${member.firstName} ${member.lastName} — ${member.email}`}
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Home Club</label>
                    <select 
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                    >
                      <option value="1">Brussels Center</option>
                      <option value="2">Namur Station</option>
                      <option value="3">Liège South</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Plan</label>
                    <select 
                      value={contractPlan}
                      onChange={(e) => setContractPlan(e.target.value)}
                      className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                    >
                      <option value="Basic">Basic (29.99€/mo)</option>
                      <option value="Premium">Premium (49.99€/mo)</option>
                      <option value="VIP">VIP (89.99€/mo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Contract Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setContractType("OpenEnded")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors border ${contractType === "OpenEnded" ? 'bg-[#4880FF] text-white border-[#4880FF]' : 'bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF] hover:text-[#4880FF]'}`}
                      >
                        Open-ended
                      </button>
                      <button
                        onClick={() => setContractType("FixedTerm")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors border ${contractType === "FixedTerm" ? 'bg-[#4880FF] text-white border-[#4880FF]' : 'bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF] hover:text-[#4880FF]'}`}
                      >
                        Fixed-term
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#6B7280] mb-1">Start Date</label>
                      <input 
                        type="date"
                        value={contractStartDate}
                        onChange={(e) => setContractStartDate(e.target.value)}
                        className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                      />
                    </div>
                    {contractType === "FixedTerm" && (
                      <div>
                        <label className="block text-sm font-medium text-[#6B7280] mb-1">End Date <span className="text-[#FF4747]">*</span></label>
                        <input 
                          type="date"
                          value={contractEndDate}
                          onChange={(e) => setContractEndDate(e.target.value)}
                          className="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2 text-[#111827] focus:outline-none focus:border-[#4880FF]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#FFF3D6] border border-[#FF9066]/30 text-[#FF9066] px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-0.5">Technical Debt Warning</p>
                      <p>Options selection is visible below but will not be saved by the backend yet. They will be available soon.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-3">Available Options</label>
                    <div className="space-y-3">
                      {[
                        { id: "opt1", name: "Group classes", price: 15.00 },
                        { id: "opt2", name: "Sauna access", price: 10.00 },
                        { id: "opt3", name: "Personal Coaching (1h)", price: 40.00 },
                        { id: "opt4", name: "Towel service", price: 5.00 }
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-xl cursor-pointer hover:border-[#4880FF] transition-colors">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={contractOptions.includes(opt.id)}
                              onChange={(e) => {
                                if (e.target.checked) setContractOptions([...contractOptions, opt.id]);
                                else setContractOptions(contractOptions.filter(id => id !== opt.id));
                              }}
                              className="w-4 h-4 text-[#4880FF] rounded border-[#E0E0E0] focus:ring-[#4880FF]"
                            />
                            <span className="font-medium text-[#111827]">{opt.name}</span>
                          </div>
                          <span className="text-sm font-bold text-[#6B7280]">+{opt.price.toFixed(2)}€</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-[#F0F0F0]">
                <button onClick={() => setShowNewContractModal(false)} className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-bold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
                <button 
                  onClick={() => {
                    if (contractType === "FixedTerm" && !contractEndDate) {
                      toast.error("End date is required for Fixed-term contracts");
                      return;
                    }
                    toast.success("Contract successfully created!");
                    setShowNewContractModal(false);
                  }} 
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-bold rounded-xl hover:bg-[#3b6ee0] transition-colors"
                >
                  Create Contract
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Subcomponents ---

function InfoField({ label, icon: Icon, value, isEditing, onChange, onClick, clickable }: any) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0 group">
      <div className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#6B7280] shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#6B7280] font-medium mb-0.5">{label}</p>
        {isEditing ? (
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange && onChange(e.target.value)}
            className="w-full text-sm font-semibold text-[#111827] bg-white border border-[#4880FF] rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
          />
        ) : (
          <p 
            className={`text-sm font-semibold text-[#111827] truncate ${clickable ? 'cursor-pointer hover:text-[#4880FF] hover:underline' : ''}`}
            onClick={onClick}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFF] border border-transparent hover:border-[#EBEBFF] text-[#6B7280] hover:text-[#4880FF] transition-all text-sm font-bold text-left group disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#6B7280]"
    >
      <div className="w-8 h-8 rounded-lg bg-[#F5F6FA] group-hover:bg-[#EBEBFF] flex items-center justify-center transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      {label}
    </button>
  );
}

function StatRow({ label, value, highlight, warning }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#F0F0F0] last:border-0">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-[#00B69B]' : warning ? 'text-[#FF4747]' : 'text-[#111827]'}`}>
        {value}
      </span>
    </div>
  );
}
