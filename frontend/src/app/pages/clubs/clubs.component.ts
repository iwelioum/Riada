import { Component, OnInit, inject, signal } from '@angular/core';
import { LucideAngularModule, Building2, X, Clock, Users, Dumbbell, MapPin, ChevronRight } from 'lucide-angular';
import { ClubDetailDto, ClubListDto, ClubsApiService } from '../../shared/services/clubs-api.service';

interface ClubRow {
  id: number;
  name: string;
  city: string;
  operationalStatus: string;
  isOpen247: boolean;
}

interface ClubDetail {
  id: number;
  name: string;
  addressStreet: string | null;
  addressCity: string;
  addressPostalCode: string | null;
  operationalStatus: string;
  employeeCount: number;
  equipmentCount: number;
}

function mapClubRow(dto: ClubListDto): ClubRow {
  return {
    id: dto.id,
    name: dto.name,
    city: dto.addressCity,
    operationalStatus: dto.operationalStatus,
    isOpen247: dto.isOpen247,
  };
}

function mapClubDetail(dto: ClubDetailDto): ClubDetail {
  return {
    id: dto.id,
    name: dto.name,
    addressStreet: dto.addressStreet,
    addressCity: dto.addressCity,
    addressPostalCode: dto.addressPostalCode,
    operationalStatus: dto.operationalStatus,
    employeeCount: dto.employeeCount,
    equipmentCount: dto.equipmentCount,
  };
}

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
      <lucide-icon [img]="Building2Icon" [size]="24" class="text-[#4880FF]"></lucide-icon> Clubs
    </h1>
    <p class="text-sm text-[#6B7280] mt-1">{{ clubs().length }} clubs registered</p>
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    @if (error()) {
      <div class="mb-4 p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
        {{ error() }}
      </div>
    }

    <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
            @for (h of headers; track h) {
              <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td colspan="5" class="px-5 py-12 text-center text-sm text-[#6B7280]">Loading clubs…</td>
            </tr>
          }
          @if (!loading() && clubs().length === 0) {
            <tr>
              <td colspan="5" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No clubs found</td>
            </tr>
          }
          @for (club of clubs(); track club.id) {
            <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors cursor-pointer" (click)="openClub(club)">
              <td class="px-5 py-4 font-bold text-[#111827]">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-[#EBEBFF] flex items-center justify-center shrink-0">
                    <lucide-icon [img]="Building2Icon" [size]="16" class="text-[#4880FF]"></lucide-icon>
                  </div>
                  {{ club.name }}
                </div>
              </td>
              <td class="px-5 py-4 text-sm text-[#6B7280]">
                <span class="flex items-center gap-1">
                  <lucide-icon [img]="MapPinIcon" [size]="16"></lucide-icon> {{ club.city }}
                </span>
              </td>
              <td class="px-5 py-4">
                <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + statusBadge(club.operationalStatus)">
                  {{ statusLabel(club.operationalStatus) }}
                </span>
              </td>
              <td class="px-5 py-4">
                @if (club.isOpen247) {
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">24/7</span>
                } @else {
                  <span class="text-[#A6A6A6]">—</span>
                }
              </td>
              <td class="px-5 py-4">
                <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-[#A6A6A6]"></lucide-icon>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>

  @if (selectedClub()) {
    <div class="fixed inset-0 bg-black/30 z-40" (click)="closeDrawer()"></div>

    <div class="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
      <div class="flex items-center justify-between p-6 border-b border-[#E0E0E0]">
        <h2 class="text-lg font-bold text-[#111827]">{{ selectedClub()!.name }}</h2>
        <button (click)="closeDrawer()" class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
          <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        @if (detailError()) {
          <div class="p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
            {{ detailError() }}
          </div>
        }

        <div class="flex items-center gap-3 flex-wrap">
          <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + statusBadge(clubStatus())">
            {{ statusLabel(clubStatus()) }}
          </span>
          @if (selectedClub()!.isOpen247) {
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center gap-1">
              <lucide-icon [img]="ClockIcon" [size]="12"></lucide-icon> 24/7
            </span>
          }
        </div>

        @if (detailLoading()) {
          <div class="text-sm text-[#6B7280]">Loading club details…</div>
        }

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-center">
            <lucide-icon [img]="UsersIcon" [size]="24" class="text-[#4880FF] mx-auto mb-2"></lucide-icon>
            <p class="text-2xl font-black text-[#111827]">{{ selectedDetail()?.employeeCount ?? '—' }}</p>
            <p class="text-xs text-[#6B7280] font-medium mt-1">Employees</p>
          </div>
          <div class="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-center">
            <lucide-icon [img]="DumbbellIcon" [size]="24" class="text-[#4880FF] mx-auto mb-2"></lucide-icon>
            <p class="text-2xl font-black text-[#111827]">{{ selectedDetail()?.equipmentCount ?? '—' }}</p>
            <p class="text-xs text-[#6B7280] font-medium mt-1">Equipment</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-[#E0E0E0] divide-y divide-[#F0F0F0]">
          <div class="flex justify-between items-center px-4 py-3">
            <span class="text-sm text-[#6B7280]">Street</span>
            <span class="text-sm font-bold text-[#111827]">{{ selectedDetail()?.addressStreet ?? '—' }}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-3">
            <span class="text-sm text-[#6B7280]">City</span>
            <span class="text-sm font-bold text-[#111827]">{{ selectedDetail()?.addressCity ?? selectedClub()!.city }}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-3">
            <span class="text-sm text-[#6B7280]">Postal code</span>
            <span class="text-sm font-bold text-[#111827]">{{ selectedDetail()?.addressPostalCode ?? '—' }}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-3">
            <span class="text-sm text-[#6B7280]">Status</span>
            <span class="text-sm font-bold text-[#111827]">{{ statusLabel(clubStatus()) }}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-3">
            <span class="text-sm text-[#6B7280]">Open 24/7</span>
            <span class="text-sm font-bold text-[#111827]">{{ selectedClub()!.isOpen247 ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class ClubsComponent implements OnInit {
  readonly Building2Icon = Building2;
  readonly XIcon = X;
  readonly ClockIcon = Clock;
  readonly UsersIcon = Users;
  readonly DumbbellIcon = Dumbbell;
  readonly MapPinIcon = MapPin;
  readonly ChevronRightIcon = ChevronRight;
  readonly headers = ['Name', 'City', 'Status', '24/7', ''];

  private readonly clubsApi = inject(ClubsApiService);

  clubs = signal<ClubRow[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedClub = signal<ClubRow | null>(null);
  selectedDetail = signal<ClubDetail | null>(null);
  detailLoading = signal(false);
  detailError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadClubs();
  }

  openClub(club: ClubRow): void {
    this.selectedClub.set(club);
    this.selectedDetail.set(null);
    this.detailError.set(null);
    this.detailLoading.set(true);

    this.clubsApi.getClubDetail(club.id).subscribe({
      next: (detail) => this.selectedDetail.set(mapClubDetail(detail)),
      error: () => this.detailError.set('Unable to load club details.'),
      complete: () => this.detailLoading.set(false),
    });
  }

  closeDrawer(): void {
    this.selectedClub.set(null);
    this.selectedDetail.set(null);
    this.detailError.set(null);
    this.detailLoading.set(false);
  }

  clubStatus(): string {
    return this.selectedDetail()?.operationalStatus ?? this.selectedClub()?.operationalStatus ?? 'Unknown';
  }

  statusBadge(status: string): string {
    return status === 'Open' ? 'bg-[#E0F8EA] text-[#00B69B]'
      : status === 'TemporarilyClosed' ? 'bg-[#FFF3D6] text-[#FF9066]'
        : status === 'PermanentlyClosed' ? 'bg-[#FFF0F0] text-[#FF4747]'
          : 'bg-[#F5F6FA] text-[#6B7280]';
  }

  statusLabel(status: string): string {
    return status === 'TemporarilyClosed' ? 'Temp. closed'
      : status === 'PermanentlyClosed' ? 'Closed'
        : status;
  }

  private loadClubs(): void {
    this.loading.set(true);
    this.error.set(null);
    this.clubsApi.listClubs().subscribe({
      next: (clubs) => this.clubs.set(clubs.map(mapClubRow)),
      error: () => this.error.set('Unable to load clubs.'),
      complete: () => this.loading.set(false),
    });
  }
}
