import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ClubFrequency, OptionPopularity, RiskScore, SystemHealth } from '../../core/models/api-models';
import { ApiService } from '../../core/services/api.service';

type ReportFocus = 'Retention' | 'Operations' | 'Revenue';
type ReportPeriod = '7d' | '30d' | '90d' | 'custom';
type RecommendationPriority = 'High' | 'Medium' | 'Low';
type RecommendationStatus = 'Pending' | 'Scheduled' | 'Completed';

interface RecommendationItem {
  id: string;
  title: string;
  reason: string;
  owner: string;
  dueDate: string | null;
  priority: RecommendationPriority;
  status: RecommendationStatus;
}

interface ReportSnapshot {
  riskScores: RiskScore[];
  frequencies: ClubFrequency[];
  options: OptionPopularity[];
  health: SystemHealth | null;
  warning: string | null;
  updatedAt: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  readonly focusOptions: ReportFocus[] = ['Retention', 'Operations', 'Revenue'];
  readonly periodOptions: Array<{ value: ReportPeriod; label: string }> = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  focus: ReportFocus = 'Retention';
  period: ReportPeriod = '30d';
  customFrom = '';
  customTo = '';

  loading = false;
  refreshing = false;
  exporting = false;
  error: string | null = null;
  partialWarning: string | null = null;
  workflowNotice: string | null = null;
  exportNotice: string | null = null;
  lastUpdatedAt: string | null = null;

  riskScores: RiskScore[] = [];
  frequencies: ClubFrequency[] = [];
  options: OptionPopularity[] = [];
  health: SystemHealth | null = null;

  private recommendationStatusOverrides: Record<string, RecommendationStatus> = {};
  private reportRequestId = 0;
  private readonly reportCache = new Map<string, ReportSnapshot>();
  private readonly maxCacheEntries = 8;
  private readonly recommendationStorageKey = 'riada.reports.recommendation-status.v1';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.restoreRecommendationStatuses();
    this.loadReports();
  }

  applyFilters(): void {
    const dateRangeError = this.validateCustomRange();
    if (dateRangeError) {
      this.error = dateRangeError;
      return;
    }

    this.loadReports();
  }

  refreshReports(): void {
    const dateRangeError = this.validateCustomRange();
    if (dateRangeError) {
      this.error = dateRangeError;
      return;
    }

    this.loadReports(true);
  }

  exportSnapshot(): void {
    if (!this.hasData || this.exporting) {
      return;
    }

    this.exporting = true;
    const now = new Date();
    const rows: string[][] = [
      ['Metric', 'Value'],
      ['Focus', this.focus],
      ['Period', this.periodLabel],
      ['System status', this.health?.status ?? 'Unavailable'],
      ['High risk members', `${this.highRiskCount}`],
      ['Average risk score', `${this.averageRiskScore}`],
      ['Total visitors', `${this.totalVisitors}`],
      ['Average option popularity (%)', `${this.averageOptionPopularity}`],
      [],
      ['Top members', 'Plan', 'Risk score', 'Overdue invoices', 'Denied access 60d'],
      ...this.focusRiskRows.map((member) => [
        member.memberName,
        member.planName,
        `${member.score}`,
        `${member.overdueInvoiceCount}`,
        `${member.deniedAccess60d}`
      ])
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${value.replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `riada-${this.focus.toLowerCase()}-report-${now.toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.exporting = false;
    this.setExportNotice(`CSV snapshot exported for ${this.focus} (${this.periodLabel}).`);
  }

  setRecommendationStatus(recommendationId: string, status: RecommendationStatus): void {
    this.recommendationStatusOverrides[recommendationId] = status;
    this.persistRecommendationStatuses();
    const action = this.recommendations.find((item) => item.id === recommendationId);
    if (action) {
      this.workflowNotice = `${action.title} marked as ${status}.`;
    }
  }

  resetRecommendationWorkflow(): void {
    this.recommendationStatusOverrides = {};
    this.persistRecommendationStatuses();
    this.workflowNotice = 'Recommendation workflow statuses were reset.';
  }

  getRecommendationPriorityClass(priority: RecommendationPriority): string {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
    }
  }

  getRecommendationStatusClass(status: RecommendationStatus): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Scheduled':
        return 'status-scheduled';
      case 'Completed':
        return 'status-completed';
    }
  }

  get focusRiskRows(): RiskScore[] {
    const scores = [...this.riskScores];

    if (this.focus === 'Revenue') {
      return scores
        .sort((a, b) => b.overdueInvoiceCount - a.overdueInvoiceCount || b.score - a.score)
        .slice(0, 8);
    }

    if (this.focus === 'Operations') {
      return scores
        .sort((a, b) => b.deniedAccess60d - a.deniedAccess60d || b.score - a.score)
        .slice(0, 8);
    }

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  get topClubs(): ClubFrequency[] {
    return [...this.frequencies].sort((a, b) => b.visitorCount - a.visitorCount).slice(0, 6);
  }

  get recommendations(): RecommendationItem[] {
    const actions: RecommendationItem[] = [];

    if (this.highRiskCount > 0) {
      actions.push({
        id: 'retention-outreach',
        title: 'Launch retention outreach',
        reason: `${this.highRiskCount} members are above risk score 70.`,
        owner: 'Coach Team',
        dueDate: this.daysFromNow(3),
        priority: 'High',
        status: 'Pending'
      });
    }

    if (this.health && this.health.pendingInvoices > 0) {
      actions.push({
        id: 'invoice-backlog',
        title: 'Clear pending invoice backlog',
        reason: `${this.health.pendingInvoices} invoices still pending payment.`,
        owner: 'Billing Desk',
        dueDate: this.daysFromNow(2),
        priority: 'Medium',
        status: 'Scheduled'
      });
    }

    const topClub = this.topClubs[0];
    if (topClub) {
      actions.push({
        id: `attendance-playbook-${topClub.clubName.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Replicate ${topClub.clubName} attendance playbook`,
        reason: `${topClub.visitorCount} check-ins in selected period.`,
        owner: 'Operations Desk',
        dueDate: this.daysFromNow(5),
        priority: 'Low',
        status: 'Scheduled'
      });
    }

    if (this.options.length > 0 && this.averageOptionPopularity < 20) {
      actions.push({
        id: 'addon-promotion',
        title: 'Promote add-on options during check-in',
        reason: `Average option popularity is ${this.averageOptionPopularity}%.`,
        owner: 'Front Desk',
        dueDate: this.daysFromNow(4),
        priority: 'Medium',
        status: 'Pending'
      });
    }

    if (!actions.length) {
      actions.push({
        id: 'stable-operations',
        title: 'No urgent action required',
        reason: 'Current data shows stable operations for this reporting window.',
        owner: 'Operations Desk',
        dueDate: null,
        priority: 'Low',
        status: 'Completed'
      });
    }

    return actions.slice(0, 4).map((action) => ({
      ...action,
      status: this.recommendationStatusOverrides[action.id] ?? action.status
    }));
  }

  get pendingRecommendationsCount(): number {
    return this.recommendations.filter((item) => item.status === 'Pending').length;
  }

  get completedRecommendationsCount(): number {
    return this.recommendations.filter((item) => item.status === 'Completed').length;
  }

  get highRiskCount(): number {
    return this.riskScores.filter((item) => item.score >= 70).length;
  }

  get averageRiskScore(): number {
    if (!this.riskScores.length) {
      return 0;
    }

    const totalScore = this.riskScores.reduce((total, member) => total + member.score, 0);
    return this.round(totalScore / this.riskScores.length, 1);
  }

  get totalVisitors(): number {
    return this.frequencies.reduce((total, club) => total + club.visitorCount, 0);
  }

  get averageOptionPopularity(): number {
    if (!this.options.length) {
      return 0;
    }

    const total = this.options.reduce((sum, option) => sum + option.popularityPercentage, 0);
    return this.round(total / this.options.length, 1);
  }

  get hasData(): boolean {
    return this.riskScores.length > 0 || this.frequencies.length > 0 || this.options.length > 0 || !!this.health;
  }

  get periodLabel(): string {
    if (this.period === 'custom') {
      if (this.customFrom && this.customTo) {
        return `${this.customFrom} to ${this.customTo}`;
      }
      return 'Custom range';
    }

    const option = this.periodOptions.find((item) => item.value === this.period);
    return option?.label ?? this.period;
  }

  trackByRecommendationId(index: number, recommendation: RecommendationItem): string {
    return recommendation.id;
  }

  private loadReports(isRefresh = false): void {
    const cacheKey = this.getCacheKey();
    if (!isRefresh) {
      const cached = this.reportCache.get(cacheKey);
      if (cached) {
        this.reportCache.delete(cacheKey);
        this.reportCache.set(cacheKey, cached);
        this.applySnapshot(cached);
        this.partialWarning = cached.warning;
        this.error = !this.hasData ? 'No report data available for the selected window.' : null;
        return;
      }
    }

    const requestId = ++this.reportRequestId;
    this.loading = !isRefresh;
    this.refreshing = isRefresh;
    this.error = null;
    this.partialWarning = null;
    this.exportNotice = null;

    const failedSources: string[] = [];
    const dateRange = this.resolveDateRange();

    forkJoin({
      riskScores: this.api.getRiskScores(25).pipe(
        catchError((err) => {
          console.error('Risk scores failed', err);
          failedSources.push('risk scores');
          return of([] as RiskScore[]);
        })
      ),
      frequencies: this.api.getFrequency(dateRange.dateFrom, dateRange.dateTo).pipe(
        catchError((err) => {
          console.error('Club frequency failed', err);
          failedSources.push('club frequency');
          return of([] as ClubFrequency[]);
        })
      ),
      options: this.api.getOptionPopularity().pipe(
        catchError((err) => {
          console.error('Option popularity failed', err);
          failedSources.push('option popularity');
          return of([] as OptionPopularity[]);
        })
      ),
      health: this.api.getSystemHealth().pipe(
        catchError((err) => {
          console.error('System health failed', err);
          failedSources.push('system health');
          return of(null);
        })
      )
    })
      .pipe(
        finalize(() => {
          if (requestId !== this.reportRequestId) {
            return;
          }
          this.loading = false;
          this.refreshing = false;
        })
      )
      .subscribe(({ riskScores, frequencies, options, health }) => {
        if (requestId !== this.reportRequestId) {
          return;
        }

        const snapshot: ReportSnapshot = {
          riskScores: riskScores ?? [],
          frequencies: frequencies ?? [],
          options: options ?? [],
          health: health ?? null,
          warning: failedSources.length ? `Partial data loaded: ${failedSources.join(', ')} unavailable.` : null,
          updatedAt: new Date().toISOString()
        };

        this.setCachedSnapshot(cacheKey, snapshot);
        this.applySnapshot(snapshot);
        this.partialWarning = snapshot.warning;

        if (!this.hasData) {
          this.error = 'No report data available for the selected window.';
        }
      });
  }

  private applySnapshot(snapshot: ReportSnapshot): void {
    this.riskScores = [...snapshot.riskScores];
    this.frequencies = [...snapshot.frequencies];
    this.options = [...snapshot.options];
    this.health = snapshot.health;
    this.lastUpdatedAt = snapshot.updatedAt;
  }

  private getCacheKey(): string {
    const dateRange = this.resolveDateRange();
    return [dateRange.dateFrom ?? 'all', dateRange.dateTo ?? 'all'].join('|');
  }

  private validateCustomRange(): string | null {
    if (this.period !== 'custom') {
      return null;
    }

    if (!this.customFrom || !this.customTo) {
      return 'Provide both start and end dates for a custom range.';
    }

    const from = new Date(`${this.customFrom}T00:00:00`);
    const to = new Date(`${this.customTo}T00:00:00`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return 'Custom range dates are invalid.';
    }

    if (from > to) {
      return 'Custom range start date must be before end date.';
    }

    const maxRangeInDays = 366;
    const rangeLength = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (rangeLength > maxRangeInDays) {
      return 'Custom range cannot exceed 366 days.';
    }

    return null;
  }

  private resolveDateRange(): { dateFrom?: string; dateTo?: string } {
    if (this.period === 'custom') {
      return {
        dateFrom: this.customFrom || undefined,
        dateTo: this.customTo || undefined
      };
    }

    const to = new Date();
    const from = new Date();
    const offset = this.period === '7d' ? 7 : this.period === '30d' ? 30 : 90;
    from.setDate(from.getDate() - offset);

    return {
      dateFrom: this.formatDate(from),
      dateTo: this.formatDate(to)
    };
  }

  private formatDate(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private round(value: number, precision = 0): number {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }

  private daysFromNow(days: number): string {
    const target = new Date();
    target.setDate(target.getDate() + days);
    return this.formatDate(target);
  }

  private setExportNotice(message: string): void {
    this.exportNotice = message;
    window.setTimeout(() => {
      if (this.exportNotice === message) {
        this.exportNotice = null;
      }
    }, 3600);
  }

  private setCachedSnapshot(cacheKey: string, snapshot: ReportSnapshot): void {
    if (this.reportCache.has(cacheKey)) {
      this.reportCache.delete(cacheKey);
    }
    this.reportCache.set(cacheKey, snapshot);

    if (this.reportCache.size > this.maxCacheEntries) {
      const oldestKey = this.reportCache.keys().next().value as string | undefined;
      if (oldestKey) {
        this.reportCache.delete(oldestKey);
      }
    }
  }

  private persistRecommendationStatuses(): void {
    localStorage.setItem(this.recommendationStorageKey, JSON.stringify(this.recommendationStatusOverrides));
  }

  private restoreRecommendationStatuses(): void {
    const raw = localStorage.getItem(this.recommendationStorageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const restored: Record<string, RecommendationStatus> = {};
      Object.entries(parsed).forEach(([key, value]) => {
        if (this.isRecommendationStatus(value)) {
          restored[key] = value;
        }
      });
      this.recommendationStatusOverrides = restored;
    } catch (error) {
      console.warn('Failed to parse persisted recommendation statuses.', error);
      localStorage.removeItem(this.recommendationStorageKey);
      this.workflowNotice = 'Saved recommendation statuses were invalid and have been reset.';
    }
  }

  private isRecommendationStatus(value: unknown): value is RecommendationStatus {
    return value === 'Pending' || value === 'Scheduled' || value === 'Completed';
  }
}
