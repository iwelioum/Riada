import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Users,
  Plus,
  Search,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  CreditCard,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
} from 'lucide-angular';
import { mockMembers } from '../../shared/mocks/riada-data';

type MemberStatus = 'Active' | 'Suspended' | 'Anonymized';

interface MemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  currentPlan: string | null;
  status: MemberStatus;
  homeClub: string | null;
  email: string;
  mobilePhone?: string;
  lastVisitDate: string | null;
  totalVisits: number;
  riskScore: number;
}

interface NewMemberForm {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
}

const MOCK_MEMBERS: MemberSummary[] = [...mockMembers];

const ITEMS_PER_PAGE = 10;

const emptyForm = (): NewMemberForm => ({
  firstName: '',
  lastName: '',
  email: '',
  mobilePhone: '',
});

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="p-8 h-full flex flex-col max-w-[1440px] mx-auto w-full bg-[#F5F6FA]">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
        <lucide-icon [img]="UsersIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
        Members <span class="text-[#6B7280] font-medium text-lg ml-1">({{ filteredMembers().length }} members)</span>
      </h1>
      <p class="text-[#6B7280] text-sm mt-1">Manage your members and their subscriptions</p>
    </div>
    <button
      (click)="showAddModal.set(true)"
      class="flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] text-white rounded-lg font-semibold shadow-sm hover:shadow-md hover:bg-[#3b6ee0] transition-all">
      <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
      Add member
    </button>
  </div>

  <div class="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] flex-1 flex flex-col overflow-hidden">
    <div class="p-6 border-b border-black/5 flex gap-4 items-center bg-white z-10">
      <div class="relative flex-1 max-w-md">
        <lucide-icon [img]="SearchIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"></lucide-icon>
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          [ngModel]="search()"
          (ngModelChange)="onSearchChange($event)"
          class="w-full pl-10 pr-10 py-2.5 bg-[#F5F6FA] border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
        />
        @if (search()) {
          <button (click)="onSearchChange('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]">
            <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
          </button>
        }
      </div>
      <select
        [ngModel]="statusFilter()"
        (ngModelChange)="onStatusChange($event)"
        class="px-4 py-2.5 bg-[#F5F6FA] text-[#111827] rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-[#4880FF]/20 outline-none cursor-pointer">
        @for (option of statusOptions; track option) {
          <option [value]="option">{{ option === 'All' ? 'All statuses' : option }}</option>
        }
      </select>
    </div>

    <div class="overflow-x-auto flex-1 relative">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-black/5 bg-[#F5F6FA]/50">
            @for (h of headers; track h) {
              <th class="py-4 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" [class.text-right]="h === 'Actions'">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (pagedMembers().length === 0) {
            <tr>
              <td colspan="6" class="py-20">
                <div class="flex flex-col items-center justify-center text-center">
                  <div class="w-16 h-16 bg-[#F5F6FA] rounded-full flex items-center justify-center mb-4">
                    <lucide-icon [img]="UsersIcon" [size]="32" class="text-[#6B7280]"></lucide-icon>
                  </div>
                  <h3 class="text-lg font-bold text-[#111827] mb-2">No members found</h3>
                  <p class="text-[#6B7280] mb-6 max-w-sm">No members match your search criteria. Try modifying your filters.</p>
                  <button
                    (click)="resetFilters()"
                    class="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#4880FF] text-[#4880FF] rounded-lg font-semibold hover:bg-[#F5F8FF] transition-colors">
                    <lucide-icon [img]="RotateCcwIcon" [size]="16"></lucide-icon>
                    Reset filters
                  </button>
                </div>
              </td>
            </tr>
          }
          @for (member of pagedMembers(); track member.id) {
            <tr (click)="selectedMember.set(member)" class="border-b border-black/5 last:border-0 group cursor-pointer hover:bg-[#F9FAFB] transition-colors">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div [class]="member.status === 'Anonymized'
                    ? 'w-10 h-10 rounded-full bg-[#F0F0F0] text-[#A6A6A6] flex items-center justify-center font-bold text-sm'
                    : 'w-10 h-10 rounded-full bg-[#4880FF]/10 text-[#4880FF] flex items-center justify-center font-bold text-sm'">
                    {{ member.firstName[0] }}{{ member.lastName[0] }}
                  </div>
                  <div>
                    <div [class]="member.status === 'Anonymized'
                      ? 'font-semibold text-[#A6A6A6]'
                      : 'font-semibold text-[#111827] group-hover:text-[#4880FF] transition-colors'">
                      {{ member.firstName }} {{ member.lastName }}
                    </div>
                    <div class="text-xs text-[#6B7280] mt-0.5">{{ member.email }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <span [class]="'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ' + statusBadgeClass(member.status)">
                  <span [class]="'w-1.5 h-1.5 rounded-full ' + statusDotClass(member.status)"></span>
                  {{ member.status }}
                </span>
              </td>
              <td class="py-4 px-6 font-medium text-[#111827]">
                @if (member.currentPlan) {
                  <span>{{ member.currentPlan }}</span>
                } @else {
                  <span class="text-[#A6A6A6] italic text-xs">No plan</span>
                }
              </td>
              <td class="py-4 px-6 text-[#6B7280]">{{ member.homeClub ?? '—' }}</td>
              <td class="py-4 px-6">
                @if (member.status === 'Anonymized') {
                  <span class="text-[#A6A6A6]">—</span>
                } @else {
                  <span [class]="'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ' + riskClass(member.riskScore)">
                    {{ member.riskScore }}/100
                  </span>
                }
              </td>
              <td class="py-4 px-6 text-right">
                <button
                  (click)="openProfile(member.id); $event.stopPropagation()"
                  class="text-sm font-semibold text-[#4880FF] hover:underline">
                  Open profile
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (filteredMembers().length > 0) {
      <div class="p-4 border-t border-black/5 bg-white flex items-center justify-between">
        <span class="text-sm text-[#6B7280]">
          Showing <span class="font-semibold text-[#111827]">{{ startIndex() }}</span> to
          <span class="font-semibold text-[#111827]">{{ endIndex() }}</span> of
          <span class="font-semibold text-[#111827]">{{ filteredMembers().length }}</span> results
        </span>
        <div class="flex gap-2">
          <button
            (click)="previousPage()"
            [disabled]="page() === 1"
            class="p-2 border border-black/10 rounded-lg text-[#111827] hover:bg-[#F5F6FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <lucide-icon [img]="ChevronLeftIcon" [size]="18"></lucide-icon>
          </button>
          <button
            (click)="nextPage()"
            [disabled]="page() === totalPages()"
            class="p-2 border border-black/10 rounded-lg text-[#111827] hover:bg-[#F5F6FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <lucide-icon [img]="ChevronRightIcon" [size]="18"></lucide-icon>
          </button>
        </div>
      </div>
    }
  </div>

  @if (selectedMember()) {
    <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" (click)="selectedMember.set(null)"></div>
    <div class="fixed top-0 right-0 bottom-0 w-[420px] bg-white z-50 flex flex-col shadow-2xl">
      <div class="p-6 border-b border-black/5 flex justify-between items-start">
        <div class="flex gap-4 items-center">
          <div [class]="selectedMember()!.status === 'Anonymized'
            ? 'w-14 h-14 rounded-full bg-[#F0F0F0] text-[#A6A6A6] flex items-center justify-center font-bold text-xl'
            : 'w-14 h-14 rounded-full bg-[#4880FF]/10 text-[#4880FF] flex items-center justify-center font-bold text-xl'">
            {{ selectedMember()!.firstName[0] }}{{ selectedMember()!.lastName[0] }}
          </div>
          <div>
            <h2 [class]="selectedMember()!.status === 'Anonymized' ? 'text-xl font-bold text-[#A6A6A6]' : 'text-xl font-bold text-[#111827]'">
              {{ selectedMember()!.firstName }} {{ selectedMember()!.lastName }}
            </h2>
            <p class="text-xs text-[#6B7280] mt-1">{{ selectedMember()!.email }}</p>
          </div>
        </div>
        <button (click)="selectedMember.set(null)" class="p-2 text-[#6B7280] hover:bg-[#F5F6FA] hover:text-[#111827] rounded-full transition-colors">
          <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Active Alerts</h3>
          @if (selectedMember()!.status === 'Suspended') {
            <div class="flex gap-3 p-3 bg-[#FF9066]/10 rounded-xl border border-[#FF9066]/20">
              <lucide-icon [img]="ShieldAlertIcon" [size]="20" class="text-[#FF9066] shrink-0"></lucide-icon>
              <div>
                <div class="text-sm font-semibold text-[#FF9066] mt-0.5">Subscription suspended</div>
                <div class="text-xs text-[#FF9066]/80 mt-1">Check the full profile for more details.</div>
              </div>
            </div>
          } @else if (selectedMember()!.status === 'Anonymized') {
            <div class="flex gap-3 p-3 bg-[#E0E0E0]/50 rounded-xl border border-[#E0E0E0]">
              <lucide-icon [img]="ShieldAlertIcon" [size]="20" class="text-[#A6A6A6] shrink-0"></lucide-icon>
              <div>
                <div class="text-sm font-semibold text-[#A6A6A6] mt-0.5">Anonymized member</div>
                <div class="text-xs text-[#A6A6A6] mt-1">Data has been removed to comply with GDPR.</div>
              </div>
            </div>
          } @else {
            <div class="flex gap-3 p-3 bg-[#00B69B]/10 rounded-xl border border-[#00B69B]/20">
              <lucide-icon [img]="CheckSquareIcon" [size]="20" class="text-[#00B69B] shrink-0"></lucide-icon>
              <div class="text-sm font-semibold text-[#00B69B] mt-0.5">No alerts</div>
            </div>
          }
        </div>

        <div class="space-y-3">
          <h3 class="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Quick actions</h3>
          <div class="grid grid-cols-2 gap-2">
            @for (action of drawerActions; track action.label) {
              <button
                [disabled]="selectedMember()!.status === 'Anonymized'"
                class="flex flex-col items-center gap-2 p-3 bg-[#F5F6FA] hover:bg-[#EBEBFF] hover:text-[#4880FF] text-[#111827] disabled:opacity-50 disabled:hover:bg-[#F5F6FA] disabled:hover:text-[#111827] rounded-xl transition-colors text-sm font-medium">
                <lucide-icon [img]="action.icon" [size]="18"></lucide-icon>
                {{ action.label }}
              </button>
            }
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-black/5 bg-[#F5F6FA]/50">
        <button
          (click)="openProfile(selectedMember()!.id)"
          class="w-full flex justify-center items-center gap-2 py-3 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors shadow-sm">
          Open full profile
          <lucide-icon [img]="ArrowRightIcon" [size]="16"></lucide-icon>
        </button>
      </div>
    </div>
  }

  @if (showAddModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showAddModal.set(false)">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Add New Member</h3>
          <button (click)="showAddModal.set(false)" class="p-2 rounded-lg hover:bg-[#F5F6FA]">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">First Name</label>
              <input class="input-field" [ngModel]="newMemberForm().firstName" (ngModelChange)="patchNewMember('firstName', $event)" placeholder="Jean" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">Last Name</label>
              <input class="input-field" [ngModel]="newMemberForm().lastName" (ngModelChange)="patchNewMember('lastName', $event)" placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
            <input class="input-field" type="email" [ngModel]="newMemberForm().email" (ngModelChange)="patchNewMember('email', $event)" placeholder="jean.dupont@example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Phone</label>
            <input class="input-field" [ngModel]="newMemberForm().mobilePhone" (ngModelChange)="patchNewMember('mobilePhone', $event)" placeholder="+32 400 00 00 00" />
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button (click)="showAddModal.set(false)" class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
          <button (click)="createMember()" class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors">Add Member</button>
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .input-field {
      @apply w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF];
    }
  `],
})
export class MembersComponent {
  private router = inject(Router);

  readonly UsersIcon = Users;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly XIcon = X;
  readonly RotateCcwIcon = RotateCcw;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly CreditCardIcon = CreditCard;
  readonly CheckSquareIcon = CheckSquare;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly ArrowRightIcon = ArrowRight;

  readonly headers = ['Member', 'Status', 'Plan', 'Club', 'Risk', 'Actions'];
  readonly statusOptions: Array<'All' | MemberStatus> = ['All', 'Active', 'Suspended', 'Anonymized'];
  readonly drawerActions = [
    { icon: Mail, label: 'Email' },
    { icon: Phone, label: 'Call' },
    { icon: CreditCard, label: 'Payment' },
    { icon: CheckSquare, label: 'Check-in' },
  ];

  members = signal<MemberSummary[]>(MOCK_MEMBERS);
  search = signal('');
  statusFilter = signal<'All' | MemberStatus>('All');
  page = signal(1);
  selectedMember = signal<MemberSummary | null>(null);
  showAddModal = signal(false);
  newMemberForm = signal<NewMemberForm>(emptyForm());

  filteredMembers = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.members().filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const matchesSearch = !query
        || fullName.includes(query)
        || member.email.toLowerCase().includes(query)
        || (member.mobilePhone?.includes(query) ?? false);
      const matchesStatus = status === 'All' || member.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredMembers().length / ITEMS_PER_PAGE)));
  pagedMembers = computed(() => {
    const start = (this.page() - 1) * ITEMS_PER_PAGE;
    return this.filteredMembers().slice(start, start + ITEMS_PER_PAGE);
  });

  startIndex = computed(() => ((this.page() - 1) * ITEMS_PER_PAGE) + 1);
  endIndex = computed(() => Math.min(this.page() * ITEMS_PER_PAGE, this.filteredMembers().length));

  onSearchChange(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  onStatusChange(value: 'All' | MemberStatus) {
    this.statusFilter.set(value);
    this.page.set(1);
  }

  previousPage() {
    this.page.set(Math.max(1, this.page() - 1));
  }

  nextPage() {
    this.page.set(Math.min(this.totalPages(), this.page() + 1));
  }

  resetFilters() {
    this.search.set('');
    this.statusFilter.set('All');
    this.page.set(1);
  }

  openProfile(memberId: string) {
    this.router.navigate(['/members', memberId]);
  }

  statusBadgeClass(status: MemberStatus): string {
    if (status === 'Active') return 'bg-[#00B69B]/10 text-[#00B69B]';
    if (status === 'Suspended') return 'bg-[#FF9066]/10 text-[#FF9066]';
    return 'bg-[#E0E0E0]/50 text-[#A6A6A6]';
  }

  statusDotClass(status: MemberStatus): string {
    if (status === 'Active') return 'bg-[#00B69B]';
    if (status === 'Suspended') return 'bg-[#FF9066]';
    return 'bg-[#A6A6A6]';
  }

  riskClass(score: number): string {
    if (score <= 30) return 'bg-[#00B69B]/10 text-[#00B69B]';
    if (score <= 60) return 'bg-[#FF9066]/10 text-[#FF9066]';
    return 'bg-[#FF4747]/10 text-[#FF4747]';
  }

  patchNewMember(key: keyof NewMemberForm, value: string) {
    this.newMemberForm.set({ ...this.newMemberForm(), [key]: value });
  }

  createMember() {
    const form = this.newMemberForm();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      return;
    }
    const next: MemberSummary = {
      id: `m-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      currentPlan: 'Basic',
      status: 'Active',
      homeClub: 'Brussels',
      email: form.email.trim(),
      mobilePhone: form.mobilePhone.trim() || undefined,
      lastVisitDate: 'Today',
      totalVisits: 0,
      riskScore: 20,
    };
    this.members.set([next, ...this.members()]);
    this.showAddModal.set(false);
    this.newMemberForm.set(emptyForm());
    this.page.set(1);
  }
}

