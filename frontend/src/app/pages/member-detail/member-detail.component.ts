import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Target,
  UserPlus,
  CheckCircle2,
  CreditCard,
  Clock,
  Activity,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Calendar as CalendarIcon,
  Download,
  PowerOff,
  ShieldAlert,
  Edit2,
  Save,
  FileText,
  Check,
  Plus,
  ChevronLeft,
  X,
} from 'lucide-angular';
import { getMockContractsByMemberId, getMockMemberById, mockMemberIds } from '../../shared/mocks/riada-data';
import { contractStatusLabel, contractTypeLabel, paymentMethodLabel } from '../../shared/utils/enum-labels';

type MemberStatus = 'Active' | 'Suspended' | 'Anonymized';
type ContractType = 'FixedTerm' | 'OpenEnded';
type ContractStatus = 'Active' | 'Suspended' | 'Expired' | 'Cancelled';

interface ContractDetail {
  id: number;
  planName: string;
  homeClub: string;
  startDate: string;
  endDate: string | null;
  contractType: ContractType;
  status: ContractStatus;
  freezeStartDate: string | null;
  freezeEndDate: string | null;
  activeOptions: string[];
}

interface Note {
  author: string;
  date: string;
  text: string;
}

interface TimelineItem {
  id: number;
  date: string;
  time: string;
  title: string;
  desc?: string;
  icon: any;
  color: string;
  bg: string;
}

interface VisitByDay {
  day: string;
  visits: number;
}

interface MemberDetailData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string | null;
  status: MemberStatus;
  dateOfBirth: string;
  addressStreet: string | null;
  addressCity: string | null;
  addressPostalCode: string | null;
  primaryGoal: string;
  medicalCertificateProvided: boolean;
  gdprConsentAt: string;
  marketingConsent: boolean;
  referralMemberName: string | null;
  createdAt: string;
  totalVisits: number;
  lastVisitDate: string | null;
  weeklyFrequency: string;
  engagementLevel: string;
  riskScore: number;
  contracts: ContractDetail[];
  alerts: string[];
  notes: Note[];
  recentVisits: VisitByDay[];
  timeline: TimelineItem[];
  pendingInvoicesCount: number;
  totalPaid: number;
  sponsoredMembersCount: number;
}

const MEMBER_IDS = [...mockMemberIds];

function buildMember(id: string): MemberDetailData {
  const summary = getMockMemberById(id) ?? getMockMemberById('m-1234');
  if (!summary) {
    throw new Error('Missing base member fixture');
  }

  const contracts: ContractDetail[] = getMockContractsByMemberId(summary.id).map((contract) => ({
    id: contract.id,
    planName: contract.planName,
    homeClub: contract.homeClub,
    startDate: contract.startDate,
    endDate: contract.endDate,
    contractType: contract.type,
    status: contract.status,
    freezeStartDate: null,
    freezeEndDate: null,
    activeOptions: contract.planName === 'VIP'
      ? ['Group classes', 'Sauna access', 'Personal coaching']
      : contract.planName === 'Premium'
        ? ['Group classes', 'Sauna access']
        : ['Group classes'],
  }));

  const primaryGoal = summary.currentPlan === 'VIP' ? 'Performance' : summary.currentPlan === 'Premium' ? 'Muscle gain' : 'Fitness';
  const weeklyFrequency = summary.status === 'Suspended' ? '1x / week' : summary.totalVisits > 200 ? '4x / week' : '3x / week';
  const engagementLevel = summary.riskScore >= 70 ? 'Low activity' : summary.riskScore >= 45 ? 'Moderate activity' : 'Highly active';
  const pendingInvoicesCount = summary.status === 'Suspended' ? 4 : summary.riskScore > 45 ? 2 : 1;
  const totalPaid = summary.currentPlan === 'VIP' ? 1699.97 : summary.currentPlan === 'Premium' ? 1249.97 : 649.97;
  const alerts = summary.status === 'Suspended'
    ? ['Subscription suspended', 'Outstanding balance']
    : pendingInvoicesCount > 1
      ? ['Last invoice unpaid (89.99€)', 'No visit for 14 days']
      : [];

  if (summary.status === 'Anonymized') {
    return {
      id: summary.id,
      firstName: 'Anonymized',
      lastName: 'Member',
      email: '—',
      mobilePhone: null,
      status: 'Anonymized',
      dateOfBirth: '—',
      addressStreet: null,
      addressCity: null,
      addressPostalCode: null,
      primaryGoal: '—',
      medicalCertificateProvided: false,
      gdprConsentAt: '—',
      marketingConsent: false,
      referralMemberName: null,
      createdAt: '2025-01-01T10:00:00Z',
      totalVisits: 0,
      lastVisitDate: null,
      weeklyFrequency: '—',
      engagementLevel: '—',
      riskScore: 0,
      contracts: [],
      alerts: [],
      notes: [],
      recentVisits: [
        { day: 'Mon', visits: 0 },
        { day: 'Tue', visits: 0 },
        { day: 'Wed', visits: 0 },
        { day: 'Thu', visits: 0 },
        { day: 'Fri', visits: 0 },
        { day: 'Sat', visits: 0 },
        { day: 'Sun', visits: 0 },
      ],
      timeline: [],
      pendingInvoicesCount: 0,
      totalPaid: 0,
      sponsoredMembersCount: 0,
    };
  }

  return {
    id: summary.id,
    firstName: summary.firstName,
    lastName: summary.lastName,
    email: summary.email,
    mobilePhone: summary.mobilePhone ?? null,
    status: summary.status,
    dateOfBirth: '1990-04-12',
    addressStreet: '1 Rue de la Loi',
    addressCity: summary.homeClub ?? 'Brussels',
    addressPostalCode: '1000',
    primaryGoal,
    medicalCertificateProvided: true,
    gdprConsentAt: '01/01/2025',
    marketingConsent: true,
    referralMemberName: summary.id === 'm-1234' ? 'Marie Martin' : null,
    createdAt: '2025-01-01T10:00:00Z',
    totalVisits: summary.totalVisits,
    lastVisitDate: summary.lastVisitDate,
    weeklyFrequency,
    engagementLevel,
    riskScore: summary.riskScore,
    contracts,
    alerts,
    notes: [
      { author: 'Sophie (admin)', date: '15/03/2026', text: 'Member interested in plan update, follow-up this month.' },
      { author: 'Marc (billing)', date: '02/03/2026', text: 'Payment schedule reviewed with member.' },
    ],
    recentVisits: [
      { day: 'Mon', visits: summary.status === 'Suspended' ? 0 : 1 },
      { day: 'Tue', visits: 0 },
      { day: 'Wed', visits: summary.status === 'Suspended' ? 0 : 1 },
      { day: 'Thu', visits: summary.status === 'Suspended' ? 0 : 1 },
      { day: 'Fri', visits: 0 },
      { day: 'Sat', visits: summary.status === 'Suspended' ? 0 : 1 },
      { day: 'Sun', visits: 0 },
    ],
    timeline: [
      { id: 1, date: 'Today', time: '09:14', title: `Visit — ${summary.homeClub ?? 'Club'}`, icon: Activity, color: 'text-[#4AD991]', bg: 'bg-[#E0F8EA]' },
      { id: 2, date: '3 days ago', time: '14:30', title: 'Payment recorded — 49.99€', desc: 'Credit card', icon: CreditCard, color: 'text-[#4880FF]', bg: 'bg-[#EBEBFF]' },
      { id: 3, date: '14 months ago', time: '11:15', title: `Registration — ${summary.currentPlan ?? 'Basic'} Plan`, icon: CheckCircle2, color: 'text-[#4AD991]', bg: 'bg-[#E0F8EA]' },
    ],
    pendingInvoicesCount,
    totalPaid,
    sponsoredMembersCount: summary.id === 'm-1234' ? 2 : 0,
  };
}

function formatMemberSince(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] shadow-sm px-8 py-4 flex-shrink-0 flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center text-sm text-[#6B7280] font-medium">
        <button (click)="goMembersList()" class="hover:text-[#4880FF] transition-colors flex items-center gap-1">
          <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon> Back
        </button>
        <span class="mx-2">/</span>
        <a routerLink="/members" class="hover:text-[#4880FF] transition-colors">Members</a>
        <lucide-icon [img]="ChevronRightIcon" [size]="16" class="mx-1"></lucide-icon>
        <span class="text-[#111827]">{{ member().firstName }} {{ member().lastName }}</span>

        <div class="flex items-center gap-1 ml-4 border-l border-black/10 pl-4">
          <button (click)="goPrev()" [disabled]="!hasPrev()" class="p-1 rounded text-[#6B7280] hover:bg-[#F5F6FA] hover:text-[#111827] disabled:opacity-30 disabled:hover:bg-transparent">
            <lucide-icon [img]="ChevronLeftIcon" [size]="16"></lucide-icon>
          </button>
          <button (click)="goNext()" [disabled]="!hasNext()" class="p-1 rounded text-[#6B7280] hover:bg-[#F5F6FA] hover:text-[#111827] disabled:opacity-30 disabled:hover:bg-transparent">
            <lucide-icon [img]="ChevronRightIcon" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between mt-2">
      <div class="flex items-center gap-4">
        <div class="relative">
          <div [class]="member().status === 'Anonymized'
            ? 'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm bg-[#F0F0F0] text-[#A6A6A6]'
            : 'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm bg-[#EBEBFF] text-[#4880FF]'">
            {{ member().firstName[0] }}{{ member().lastName[0] }}
          </div>
          <div [class]="'absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ' + statusDotClass(member().status)"></div>
        </div>

        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 [class]="member().status === 'Anonymized' ? 'text-2xl font-bold leading-none text-[#A6A6A6]' : 'text-2xl font-bold leading-none text-[#111827]'">
              {{ member().firstName }} {{ member().lastName }}
            </h1>
            <button
              (click)="toggleStatus()"
              [disabled]="member().status === 'Anonymized'"
              [class]="statusBadgeClass(member().status)">
              {{ member().status }}
            </button>
            @if (activeContract()) {
              <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">{{ activeContract()!.planName }}</span>
            }
            @if (member().status !== 'Anonymized') {
              <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full text-white ' + riskBarClass(computedRisk())">
                Risk {{ computedRisk() }}/100
              </span>
            }
          </div>
          <div class="text-sm text-[#6B7280] flex items-center gap-4">
            <span class="flex items-center gap-1"><lucide-icon [img]="MapPinIcon" [size]="14"></lucide-icon> Club: <span class="font-semibold text-[#4880FF]">{{ activeContract()?.homeClub ?? '—' }}</span></span>
            <span class="flex items-center gap-1"><lucide-icon [img]="TargetIcon" [size]="14"></lucide-icon> Goal: {{ member().primaryGoal }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          (click)="isEditing.set(!isEditing())"
          [disabled]="member().status === 'Anonymized'"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-lg text-sm font-semibold text-[#6B7280] hover:text-[#4880FF] hover:border-[#4880FF] transition-all disabled:opacity-50">
          <lucide-icon [img]="isEditing() ? XCircleIcon : Edit2Icon" [size]="16"></lucide-icon>
          {{ isEditing() ? 'Cancel' : 'Edit' }}
        </button>
        <button
          (click)="handleCheckIn()"
          [disabled]="member().status !== 'Active'"
          class="flex items-center gap-2 px-5 py-2 bg-[#4880FF] rounded-lg text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
          <lucide-icon [img]="ActivityIcon" [size]="16"></lucide-icon>
          Check-in
        </button>
        <button (click)="menuOpen.set(!menuOpen())" class="p-2 border border-[#E0E0E0] rounded-lg text-[#6B7280] hover:bg-[#F5F6FA] transition-colors">
          <lucide-icon [img]="MoreVerticalIcon" [size]="18"></lucide-icon>
        </button>
      </div>
    </div>

    @if (menuOpen()) {
      <div class="absolute right-8 top-[120px] w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E0E0E0] py-2 z-50">
        <button (click)="toggleStatus(); menuOpen.set(false)" [disabled]="member().status === 'Anonymized'" class="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#F5F6FA] flex items-center gap-2 disabled:opacity-50">
          <lucide-icon [img]="member().status === 'Active' ? PowerOffIcon : CheckCircle2Icon" [size]="16" [class]="member().status === 'Active' ? 'text-[#FF9066]' : 'text-[#00B69B]'"></lucide-icon>
          {{ member().status === 'Active' ? 'Suspend member' : 'Reactivate member' }}
        </button>
        <button class="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#F5F6FA] flex items-center gap-2">
          <lucide-icon [img]="DownloadIcon" [size]="16" class="text-[#4880FF]"></lucide-icon>
          Export PDF profile
        </button>
        <div class="h-px bg-[#E0E0E0] my-2"></div>
        <button (click)="anonymizeMember(); menuOpen.set(false)" [disabled]="member().status === 'Anonymized'" class="w-full text-left px-4 py-2 text-sm text-[#FF4747] hover:bg-[#FFF0F0] flex items-center gap-2 font-medium disabled:opacity-50">
          <lucide-icon [img]="ShieldAlertIcon" [size]="16"></lucide-icon>
          Anonymize (GDPR)
        </button>
      </div>
    }
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    <div class="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      <div class="w-full lg:w-[70%] flex flex-col gap-8">
        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 relative overflow-hidden">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-bold text-[#111827] flex items-center gap-2">
              <lucide-icon [img]="FileTextIcon" [size]="18" class="text-[#4880FF]"></lucide-icon>
              Personal Information
            </h2>
            @if (isEditing()) {
              <button (click)="handleSaveInfo()" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B69B] text-white rounded-md text-sm font-semibold hover:bg-[#00a088] transition-colors">
                <lucide-icon [img]="SaveIcon" [size]="16"></lucide-icon>
                Save
              </button>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            @for (field of infoFields(); track field.label) {
              <div class="flex items-center gap-3 py-2 border-b border-[#F0F0F0]">
                <div class="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#6B7280] shrink-0">
                  <lucide-icon [img]="field.icon" [size]="16"></lucide-icon>
                </div>
                <div class="flex-1">
                  <p class="text-xs text-[#6B7280] font-medium mb-0.5">{{ field.label }}</p>
                  @if (isEditing() && field.editable) {
                    <input class="w-full text-sm font-semibold text-[#111827] bg-white border border-[#4880FF] rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
                      [ngModel]="field.value"
                      (ngModelChange)="patchEditable(field.key, $event)" />
                  } @else {
                    <p class="text-sm font-semibold text-[#111827] truncate">{{ field.value || '—' }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h2 class="text-lg font-bold text-[#111827] flex items-center gap-2 px-1">
            <lucide-icon [img]="FileTextIcon" [size]="18" class="text-[#4880FF]"></lucide-icon>
            Contracts
          </h2>

          @if (activeContract()) {
            <div class="bg-white rounded-2xl shadow-[0_4px_20px_rgba(72,128,255,0.08)] border-2 border-[#4880FF] p-6 relative">
              <div class="absolute top-0 right-0 bg-[#4880FF] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">{{ contractStatusText(activeContract()!.status) }}</div>
              <div class="flex justify-between items-start mb-4">
                <div>
                   <h3 class="text-xl font-bold text-[#111827] mb-1">{{ activeContract()!.planName }}</h3>
                   <p class="text-sm text-[#6B7280]">Type: <span class="font-medium text-[#111827]">{{ contractTypeText(activeContract()!.contractType) }}</span></p>
                 </div>
                 <div class="text-right">
                  <p class="text-sm text-[#6B7280]">Start: <span class="font-medium text-[#111827]">{{ activeContract()!.startDate }}</span></p>
                  <p class="text-sm text-[#6B7280]">End: <span class="font-medium text-[#111827]">{{ activeContract()!.endDate ?? '—' }}</span></p>
                </div>
              </div>

              <div class="flex gap-3 pt-4 border-t border-[#F0F0F0]">
                <button class="flex-1 py-2 bg-[#F5F6FA] hover:bg-[#EBEBFF] hover:text-[#4880FF] text-[#6B7280] text-sm font-bold rounded-lg transition-colors">Renew</button>
                <button (click)="showFreezeModal.set(true)" class="flex-1 py-2 bg-[#F5F6FA] hover:bg-[#FFF3D6] hover:text-[#FF9066] text-[#6B7280] text-sm font-bold rounded-lg transition-colors">Freeze</button>
                <button class="w-10 h-10 flex items-center justify-center bg-[#F5F6FA] hover:bg-[#4880FF] hover:text-white text-[#6B7280] rounded-lg transition-colors">
                  <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
                </button>
              </div>
            </div>
          } @else {
            <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 text-center py-10">
              <lucide-icon [img]="FileTextIcon" [size]="40" class="text-[#E0E0E0] mx-auto mb-3"></lucide-icon>
              <h3 class="text-lg font-bold text-[#111827] mb-1">No active contract</h3>
              <p class="text-[#6B7280] text-sm mb-6">This member currently has no active subscription.</p>
            </div>
          }

          @for (contract of pastContracts(); track contract.id) {
            <div class="bg-white/60 rounded-xl border border-[#E0E0E0] p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
              <div>
                 <div class="flex items-center gap-2 mb-1">
                   <span [class]="'w-2 h-2 rounded-full ' + (contract.status === 'Suspended' ? 'bg-[#FF9066]' : 'bg-[#A6A6A6]')"></span>
                   <span class="text-sm font-bold text-[#6B7280]">{{ contract.planName }}</span>
                   <span class="text-[10px] font-bold px-2 py-0.5 bg-[#F0F0F0] text-[#6B7280] rounded-full">{{ contractStatusText(contract.status) }}</span>
                 </div>
                 <p class="text-xs text-[#A6A6A6]">{{ contract.startDate }} — {{ contract.endDate ?? '...' }}</p>
              </div>
              <button (click)="openContract(contract.id)" class="text-sm text-[#4880FF] font-medium hover:underline">View details</button>
            </div>
          }
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
          <h2 class="text-lg font-bold text-[#111827] flex items-center gap-2 mb-6">
            <lucide-icon [img]="ClockIcon" [size]="18" class="text-[#4880FF]"></lucide-icon>
            Unified Timeline
          </h2>
          <div class="relative pl-6 border-l-2 border-[#F0F0F0] space-y-6 ml-2">
            @for (item of member().timeline; track item.id) {
              <div class="relative">
                <div [class]="'absolute -left-[43px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ' + item.bg + ' ' + item.color">
                  <lucide-icon [img]="item.icon" [size]="14"></lucide-icon>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2 text-xs font-bold text-[#6B7280] mb-1">
                    <span>{{ item.date }}</span><span>•</span><span>{{ item.time }}</span>
                  </div>
                  <div class="bg-[#F5F6FA] p-3 rounded-xl border border-[#E0E0E0] inline-block self-start">
                    <p class="text-sm font-bold text-[#111827]">{{ item.title }}</p>
                    @if (item.desc) { <p class="text-xs text-[#6B7280] mt-1">{{ item.desc }}</p> }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="w-full lg:w-[30%] flex flex-col gap-6">
        <div class="sticky top-[100px] flex flex-col gap-6">
          @if (member().alerts.length > 0 && member().status !== 'Anonymized') {
            <div class="bg-[#FFF0F0] border border-[#FF4747]/30 rounded-2xl p-5 shadow-sm">
              <h3 class="text-[#FF4747] font-bold flex items-center gap-2 mb-3">
                <lucide-icon [img]="AlertTriangleIcon" [size]="18"></lucide-icon>
                Active Alerts
              </h3>
              <ul class="space-y-2">
                @for (alert of member().alerts; track alert) {
                  <li class="flex items-start gap-2 text-sm text-[#111827] font-medium">
                    <span class="text-[#FF4747] mt-0.5">•</span> {{ alert }}
                  </li>
                }
              </ul>
            </div>
          }

          @if (member().status !== 'Anonymized') {
            <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5">
              <h3 class="font-bold text-[#111827] mb-4">Quick Actions</h3>
              <div class="grid grid-cols-2 gap-3">
                <button
                  (click)="openEmail()"
                  [disabled]="member().status === 'Anonymized'"
                  class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F8FAFF] text-[#4880FF] border border-[#EBEBFF] hover:bg-[#EBEBFF] transition-colors disabled:opacity-50">
                  <lucide-icon [img]="MailIcon" [size]="16"></lucide-icon>
                  Email
                </button>
                <button
                  (click)="callMember()"
                  [disabled]="member().status === 'Anonymized' || !member().mobilePhone"
                  class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F8FAFF] text-[#4880FF] border border-[#EBEBFF] hover:bg-[#EBEBFF] transition-colors disabled:opacity-50">
                  <lucide-icon [img]="PhoneIcon" [size]="16"></lucide-icon>
                  Call
                </button>
                <button
                  (click)="openManualPayment()"
                  [disabled]="member().status === 'Anonymized'"
                  class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F8FAFF] text-[#4880FF] border border-[#EBEBFF] hover:bg-[#EBEBFF] transition-colors disabled:opacity-50">
                  <lucide-icon [img]="CreditCardIcon" [size]="16"></lucide-icon>
                  Manual Payment
                </button>
                <button
                  (click)="goToActiveContract()"
                  [disabled]="!activeContract()"
                  class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F8FAFF] text-[#4880FF] border border-[#EBEBFF] hover:bg-[#EBEBFF] transition-colors disabled:opacity-50">
                  <lucide-icon [img]="FileTextIcon" [size]="16"></lucide-icon>
                  Active Contract
                </button>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-[#111827]">Risk Score</h3>
                <span [class]="'text-xl font-black ' + riskTextClass(computedRisk())">{{ computedRisk() }}/100</span>
              </div>
              <div class="h-2 w-full bg-[#F0F0F0] rounded-full overflow-hidden mb-4">
                <div [class]="'h-full ' + riskBarClass(computedRisk())" [style.width.%]="computedRisk()"></div>
              </div>
              <ul class="space-y-1.5 text-sm text-[#6B7280]">
                <li class="flex items-center gap-2"><lucide-icon [img]="XCircleIcon" [size]="14" class="text-[#FF4747]"></lucide-icon> {{ member().pendingInvoicesCount }} pending invoices</li>
                <li class="flex items-center gap-2"><lucide-icon [img]="AlertTriangleIcon" [size]="14" class="text-[#FF9066]"></lucide-icon> Last visit: {{ member().lastVisitDate ?? '—' }}</li>
              </ul>
            </div>
          }

          <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5">
            <h3 class="font-bold text-[#111827] mb-4">Financial Overview & Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-[#F0F0F0]">
                <span class="text-sm text-[#6B7280]">Total collected</span>
                <span class="text-sm font-bold text-[#00B69B]">{{ member().totalPaid.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-[#F0F0F0]">
                <span class="text-sm text-[#6B7280]">Pending invoices</span>
                <span class="text-sm font-bold text-[#FF4747]">{{ member().pendingInvoicesCount }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm text-[#6B7280]">Sponsored members</span>
                <span class="text-sm font-bold text-[#111827]">{{ member().sponsoredMembersCount }} members</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5 flex flex-col">
            <h3 class="font-bold text-[#111827] mb-4 flex items-center gap-2">
              <lucide-icon [img]="Edit2Icon" [size]="16" class="text-[#4880FF]"></lucide-icon>
              Internal Notes
            </h3>

            <div class="flex flex-col gap-3 mb-4 max-h-[250px] overflow-y-auto pr-2">
              @for (note of member().notes; track note.author + note.date + note.text) {
                <div class="bg-[#F8FAFF] p-3 rounded-xl border border-[#EBEBFF] text-sm">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-[#4880FF] text-xs">{{ note.author }}</span>
                    <span class="text-[10px] text-[#A6A6A6]">{{ note.date }}</span>
                  </div>
                  <p class="text-[#111827]">{{ note.text }}</p>
                </div>
              }
            </div>

            <div class="mt-auto relative">
              <textarea
                [ngModel]="noteText()"
                (ngModelChange)="noteText.set($event)"
                placeholder="Write a note..."
                [disabled]="member().status === 'Anonymized'"
                class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] resize-none h-20 transition-all disabled:opacity-50"></textarea>
              <button
                (click)="handleAddNote()"
                [disabled]="!noteText().trim() || member().status === 'Anonymized'"
                class="absolute bottom-2 right-2 p-1.5 bg-[#4880FF] text-white rounded-lg hover:bg-[#3b6ee0] transition-colors disabled:opacity-50">
                <lucide-icon [img]="CheckIcon" [size]="14"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  @if (showFreezeModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showFreezeModal.set(false)">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Freeze contract</h3>
          <button (click)="showFreezeModal.set(false)" class="text-[#6B7280] hover:bg-[#F5F6FA] p-1.5 rounded-lg"><lucide-icon [img]="XIcon" [size]="20"></lucide-icon></button>
        </div>
        <div class="space-y-4">
          <label class="block text-sm font-medium text-[#6B7280] mb-1">Duration (in days)</label>
          <input
            type="number"
            [ngModel]="freezeDays()"
            (ngModelChange)="freezeDays.set(max(1, $event))"
            class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]" />
        </div>
        <div class="flex gap-3 mt-8">
          <button (click)="showFreezeModal.set(false)" class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
          <button (click)="confirmFreeze()" class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  }

  @if (showPaymentModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showPaymentModal.set(false)">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Create manual payment</h3>
          <button (click)="showPaymentModal.set(false)" class="text-[#6B7280] hover:bg-[#F5F6FA] p-1.5 rounded-lg"><lucide-icon [img]="XIcon" [size]="20"></lucide-icon></button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Amount (€)</label>
            <input type="number" [ngModel]="paymentAmount()" (ngModelChange)="paymentAmount.set($event)" class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Method</label>
            <select [ngModel]="paymentMethod()" (ngModelChange)="paymentMethod.set($event)" class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]">
              <option value="CreditCard">Credit card</option>
              <option value="BankTransfer">Bank transfer</option>
              <option value="Cash">Cash</option>
              <option value="SepaDirectDebit">SEPA Direct Debit</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3 mt-8">
          <button (click)="showPaymentModal.set(false)" class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
          <button (click)="savePayment()" class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors">Save</button>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class MemberDetailComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly ChevronRightIcon = ChevronRight;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
  readonly TargetIcon = Target;
  readonly UserPlusIcon = UserPlus;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly CreditCardIcon = CreditCard;
  readonly ClockIcon = Clock;
  readonly ActivityIcon = Activity;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly XCircleIcon = XCircle;
  readonly MoreVerticalIcon = MoreVertical;
  readonly CalendarIconRef = CalendarIcon;
  readonly DownloadIcon = Download;
  readonly PowerOffIcon = PowerOff;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly Edit2Icon = Edit2;
  readonly SaveIcon = Save;
  readonly FileTextIcon = FileText;
  readonly CheckIcon = Check;
  readonly PlusIcon = Plus;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly XIcon = X;

  member = signal<MemberDetailData>(buildMember('m-1234'));
  editData = signal<MemberDetailData>(buildMember('m-1234'));
  isEditing = signal(false);
  menuOpen = signal(false);
  noteText = signal('');
  showFreezeModal = signal(false);
  showPaymentModal = signal(false);
  freezeDays = signal(14);
  paymentAmount = signal('');
  paymentMethod = signal('CreditCard');

  currentIndex = computed(() => {
    const idx = MEMBER_IDS.indexOf(this.member().id);
    return idx >= 0 ? idx : 0;
  });
  hasPrev = computed(() => this.currentIndex() > 0);
  hasNext = computed(() => this.currentIndex() < MEMBER_IDS.length - 1);

  activeContract = computed(() => this.member().contracts.find((c) => c.status === 'Active' || c.status === 'Suspended') ?? null);
  pastContracts = computed(() => {
    const current = this.activeContract();
    return this.member().contracts.filter((c) => !current || c.id !== current.id);
  });
  computedRisk = computed(() => this.member().riskScore);

  infoFields = computed(() => {
    const source = this.isEditing() ? this.editData() : this.member();
    return [
      { label: 'Email', value: source.email, icon: Mail, key: 'email', editable: false },
      { label: 'Phone', value: source.mobilePhone ?? '—', icon: Phone, key: 'mobilePhone', editable: true },
      { label: 'Date of birth', value: source.dateOfBirth, icon: CalendarIcon, key: 'dateOfBirth', editable: false },
      { label: 'Street', value: source.addressStreet ?? '—', icon: MapPin, key: 'addressStreet', editable: true },
      { label: 'City', value: source.addressCity ?? '—', icon: MapPin, key: 'addressCity', editable: true },
      { label: 'Postal code', value: source.addressPostalCode ?? '—', icon: MapPin, key: 'addressPostalCode', editable: true },
      { label: 'Medical certificate', value: source.medicalCertificateProvided ? 'Provided' : 'Missing', icon: CheckCircle2, key: 'medicalCertificateProvided', editable: false },
      { label: 'GDPR consent', value: source.gdprConsentAt, icon: ShieldAlert, key: 'gdprConsentAt', editable: false },
      { label: 'Marketing consent', value: source.marketingConsent ? 'Accepted' : 'Declined', icon: Mail, key: 'marketingConsent', editable: false },
      { label: 'Referral', value: source.referralMemberName ?? '—', icon: UserPlus, key: 'referralMemberName', editable: false },
      { label: 'Member since', value: formatMemberSince(source.createdAt), icon: Clock, key: 'createdAt', editable: false },
    ];
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? 'm-1234';
      const nextMember = buildMember(id);
      this.member.set(nextMember);
      this.editData.set(nextMember);
      this.isEditing.set(false);
      this.menuOpen.set(false);
      this.noteText.set('');
      this.showFreezeModal.set(false);
      this.showPaymentModal.set(false);
    });
  }

  goMembersList() {
    this.router.navigate(['/members']);
  }

  goPrev() {
    if (!this.hasPrev()) return;
    const prev = MEMBER_IDS[this.currentIndex() - 1];
    if (prev) this.router.navigate(['/members', prev]);
  }

  goNext() {
    if (!this.hasNext()) return;
    const next = MEMBER_IDS[this.currentIndex() + 1];
    if (next) this.router.navigate(['/members', next]);
  }

  toggleStatus() {
    const current = this.member();
    if (current.status === 'Anonymized') return;
    const next: MemberStatus = current.status === 'Active' ? 'Suspended' : 'Active';
    this.member.set({ ...current, status: next });
    this.editData.set({ ...this.editData(), status: next });
  }

  statusDotClass(status: MemberStatus): string {
    if (status === 'Active') return 'bg-[#00B69B]';
    if (status === 'Suspended') return 'bg-[#FF9066]';
    return 'bg-[#A6A6A6]';
  }

  statusBadgeClass(status: MemberStatus): string {
    if (status === 'Active') return 'text-xs font-bold px-2.5 py-1 rounded-full border border-[#00B69B] text-[#00B69B] hover:bg-[#E0F8EA]';
    if (status === 'Suspended') return 'text-xs font-bold px-2.5 py-1 rounded-full border border-[#FF9066] text-[#FF9066] hover:bg-[#FFF3D6]';
    return 'text-xs font-bold px-2.5 py-1 rounded-full border border-[#A6A6A6] text-[#A6A6A6] bg-[#F0F0F0]';
  }

  riskBarClass(risk: number): string {
    if (risk <= 30) return 'bg-[#00B69B]';
    if (risk <= 60) return 'bg-[#FF9066]';
    return 'bg-[#FF4747]';
  }

  riskTextClass(risk: number): string {
    if (risk <= 30) return 'text-[#00B69B]';
    if (risk <= 60) return 'text-[#FF9066]';
    return 'text-[#FF4747]';
  }

  patchEditable(key: string, value: string) {
    this.editData.set({ ...this.editData(), [key]: value } as MemberDetailData);
  }

  handleSaveInfo() {
    this.member.set(this.editData());
    this.isEditing.set(false);
  }

  handleCheckIn() {
    if (this.member().status !== 'Active') return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const club = this.activeContract()?.homeClub ?? 'Club';

    this.member.update((m) => ({
      ...m,
      totalVisits: m.totalVisits + 1,
      lastVisitDate: 'Today',
      timeline: [
        {
          id: Date.now(),
          date: 'Today',
          time,
          title: `Visit — ${club}`,
          icon: Activity,
          color: 'text-[#4AD991]',
          bg: 'bg-[#E0F8EA]',
        },
        ...m.timeline,
      ],
    }));
    this.editData.set(this.member());
  }

  openEmail() {
    if (this.member().status === 'Anonymized') return;
    window.open(`mailto:${this.member().email}`, '_blank');
  }

  callMember() {
    const mobilePhone = this.member().mobilePhone;
    if (this.member().status === 'Anonymized' || !mobilePhone) return;
    const phone = mobilePhone.replace(/\s+/g, '');
    window.open(`tel:${phone}`, '_self');
  }

  openManualPayment() {
    if (this.member().status === 'Anonymized') return;
    this.showPaymentModal.set(true);
  }

  goToActiveContract() {
    const active = this.activeContract();
    if (!active) return;
    this.router.navigate(['/contracts', active.id]);
  }

  openContract(contractId: number) {
    this.router.navigate(['/contracts', contractId]);
  }

  contractTypeText(type: ContractType): string {
    return contractTypeLabel[type] ?? type;
  }

  contractStatusText(status: ContractStatus): string {
    return contractStatusLabel[status] ?? status;
  }

  handleAddNote() {
    const text = this.noteText().trim();
    if (!text) return;
    const note: Note = {
      author: 'You (staff)',
      date: new Date().toLocaleDateString('en-GB'),
      text,
    };
    this.member.update((m) => ({ ...m, notes: [note, ...m.notes] }));
    this.noteText.set('');
  }

  anonymizeMember() {
    const anonymized: MemberDetailData = {
      ...this.member(),
      status: 'Anonymized',
      firstName: 'Anonymized',
      lastName: 'Member',
      email: '—',
      mobilePhone: null,
      addressStreet: null,
      addressCity: null,
      addressPostalCode: null,
      alerts: [],
    };
    this.member.set(anonymized);
    this.editData.set(anonymized);
  }

  max(a: number, b: number): number {
    return Math.max(a, Number(b) || 1);
  }

  confirmFreeze() {
    const active = this.activeContract();
    if (!active) {
      this.showFreezeModal.set(false);
      return;
    }
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + this.freezeDays());
    const startTxt = start.toISOString().split('T')[0] ?? '';
    const endTxt = end.toISOString().split('T')[0] ?? '';

    this.member.update((m) => ({
      ...m,
      contracts: m.contracts.map((c) => c.id === active.id ? { ...c, freezeStartDate: startTxt, freezeEndDate: endTxt } : c),
      timeline: [{ id: Date.now(), date: 'Today', time: '10:00', title: `Contract frozen — ${this.freezeDays()} days`, icon: Clock, color: 'text-[#FF9066]', bg: 'bg-[#FFF3D6]' }, ...m.timeline],
    }));
    this.showFreezeModal.set(false);
  }

  savePayment() {
    const amount = Number(this.paymentAmount());
    if (!Number.isFinite(amount) || amount <= 0) return;
    const paymentMethod = this.paymentMethod();
    this.member.update((m) => ({
      ...m,
      totalPaid: m.totalPaid + amount,
      pendingInvoicesCount: Math.max(0, m.pendingInvoicesCount - 1),
      timeline: [
        {
          id: Date.now(),
          date: 'Today',
          time: '12:00',
          title: `Payment recorded — ${amount.toFixed(2)}€`,
          desc: paymentMethodLabel[paymentMethod] ?? paymentMethod,
          icon: CreditCard,
          color: 'text-[#4880FF]',
          bg: 'bg-[#EBEBFF]',
        },
        ...m.timeline,
      ],
    }));
    this.paymentAmount.set('');
    this.paymentMethod.set('CreditCard');
    this.showPaymentModal.set(false);
  }
}

