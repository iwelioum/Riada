import { Component, OnInit, inject, signal } from '@angular/core';
import { LucideAngularModule, ShieldAlert } from 'lucide-angular';
import { AnalyticsApiService, MemberRiskScoreResponse } from '../../../shared/services/analytics-api.service';

interface RiskEntry {
  id: number;
  memberName: string;
  plan: string;
  overdueInvoices: number;
  deniedAccess60d: number;
  riskScore: number;
}

function mapRiskEntry(dto: MemberRiskScoreResponse): RiskEntry {
  const fullName = `${dto.firstName} ${dto.lastName}`.trim();
  return {
    id: dto.memberId,
    memberName: fullName || '—',
    plan: dto.planName,
    overdueInvoices: dto.overdueInvoiceCount,
    deniedAccess60d: dto.deniedAccess60d,
    riskScore: dto.riskScore,
  };
}

@Component({
  selector: 'app-risk-analytics',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
      <lucide-icon [img]="ShieldAlertIcon" [size]="24" class="text-[#FF4747]"></lucide-icon> Risk Scores
    </h1>
    <p class="text-sm text-[#6B7280] mt-1">Top {{ risks().length }} at-risk members</p>
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
              <td colspan="5" class="px-5 py-12 text-center text-sm text-[#6B7280]">Loading risk scores…</td>
            </tr>
          }
          @if (!loading() && risks().length === 0) {
            <tr>
              <td colspan="5" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No risk scores found</td>
            </tr>
          }
          @for (m of risks(); track m.id) {
            <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
              <td class="px-5 py-4 font-bold text-[#111827]">{{ m.memberName }}</td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">{{ m.plan }}</span>
              </td>
              <td class="px-5 py-4 text-sm font-semibold">
                @if (m.overdueInvoices > 0) {
                  <span class="text-[#FF4747]">{{ m.overdueInvoices }}</span>
                } @else {
                  <span class="text-[#A6A6A6]">—</span>
                }
              </td>
              <td class="px-5 py-4 text-sm font-semibold">
                @if (m.deniedAccess60d > 0) {
                  <span class="text-[#FF9066]">{{ m.deniedAccess60d }}</span>
                } @else {
                  <span class="text-[#A6A6A6]">—</span>
                }
              </td>
              <td class="px-5 py-4 w-52">
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div class="h-full rounded-full" [class]="riskBarColor(m.riskScore)" [style.width]="riskProgress(m.riskScore) + '%'"></div>
                  </div>
                  <span class="text-sm font-black w-10 text-right" [class]="riskTextColor(m.riskScore)">{{ m.riskScore }}</span>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
})
export class RiskAnalyticsComponent implements OnInit {
  private readonly analyticsApi = inject(AnalyticsApiService);

  readonly ShieldAlertIcon = ShieldAlert;
  readonly headers = ['Member', 'Plan', 'Overdue invoices', 'Denied access (60d)', 'Risk score'];

  readonly risks = signal<RiskEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRiskScores();
  }

  riskBarColor(score: number): string {
    return score <= 30 ? 'bg-[#00B69B]' : score <= 60 ? 'bg-[#FF9066]' : 'bg-[#FF4747]';
  }

  riskTextColor(score: number): string {
    return score <= 30 ? 'text-[#00B69B]' : score <= 60 ? 'text-[#FF9066]' : 'text-[#FF4747]';
  }

  riskProgress(score: number): number {
    if (score < 0) return 0;
    if (score > 100) return 100;
    return score;
  }

  private loadRiskScores(): void {
    this.loading.set(true);
    this.error.set(null);
    this.analyticsApi.getRiskScores(25).subscribe({
      next: (entries) => {
        const mapped = entries.map(mapRiskEntry).sort((a, b) => b.riskScore - a.riskScore);
        this.risks.set(mapped);
      },
      error: () => this.error.set('Unable to load risk scores.'),
      complete: () => this.loading.set(false),
    });
  }
}

