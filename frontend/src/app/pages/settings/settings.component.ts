import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ClubSummary, SubscriptionPlan, SystemHealth } from '../../core/models/api-models';
import { ApiService } from '../../core/services/api.service';

type SettingsTab = 'operations' | 'notifications' | 'automation';
type SettingsProfileId = 'balanced' | 'retention' | 'efficiency';

interface AdminSettingsForm {
  defaultClubId: number | null;
  defaultPlanId: number | null;
  planningWindowDays: number;
  maxGuestPassesPerMember: number;
  churnAlertThreshold: number;
  dailyDigestEnabled: boolean;
  digestHour: string;
  autoInvoiceGeneration: boolean;
  autoEscalateMessages: boolean;
  maintenanceLeadDays: number;
}

interface SettingsProfile {
  id: SettingsProfileId;
  label: string;
  description: string;
  values: Partial<AdminSettingsForm>;
}

interface FormIssue {
  tab: SettingsTab;
  message: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  readonly tabs: Array<{ id: SettingsTab; label: string; description: string }> = [
    { id: 'operations', label: 'Operations', description: 'Club defaults and planning windows' },
    { id: 'notifications', label: 'Notifications', description: 'Digest and alert threshold setup' },
    { id: 'automation', label: 'Automation', description: 'Auto workflows for finance and messaging' }
  ];
  readonly profiles: SettingsProfile[] = [
    {
      id: 'balanced',
      label: 'Balanced profile',
      description: 'Balanced operational defaults for mixed clubs.',
      values: {
        planningWindowDays: 28,
        maxGuestPassesPerMember: 3,
        churnAlertThreshold: 72,
        dailyDigestEnabled: true,
        digestHour: '07:30',
        autoInvoiceGeneration: true,
        autoEscalateMessages: true,
        maintenanceLeadDays: 14
      }
    },
    {
      id: 'retention',
      label: 'Retention profile',
      description: 'Higher sensitivity for churn alerts and proactive communication.',
      values: {
        planningWindowDays: 30,
        maxGuestPassesPerMember: 4,
        churnAlertThreshold: 65,
        dailyDigestEnabled: true,
        digestHour: '07:00',
        autoInvoiceGeneration: false,
        autoEscalateMessages: true,
        maintenanceLeadDays: 12
      }
    },
    {
      id: 'efficiency',
      label: 'Efficiency profile',
      description: 'Streamline billing and scheduling with tighter automation.',
      values: {
        planningWindowDays: 21,
        maxGuestPassesPerMember: 2,
        churnAlertThreshold: 78,
        dailyDigestEnabled: true,
        digestHour: '08:30',
        autoInvoiceGeneration: true,
        autoEscalateMessages: false,
        maintenanceLeadDays: 18
      }
    }
  ];

  activeTab: SettingsTab = 'operations';
  selectedProfileId: SettingsProfileId = 'balanced';
  clubs: ClubSummary[] = [];
  plans: SubscriptionPlan[] = [];
  health: SystemHealth | null = null;

  loadingReferences = false;
  saving = false;
  loadWarning: string | null = null;
  formError: string | null = null;
  saveNotice: string | null = null;
  auditNotice: string | null = null;
  formIssues: FormIssue[] = [];
  lastSavedAt: string | null = null;

  form: AdminSettingsForm = this.createDefaultForm();
  private savedSnapshot: AdminSettingsForm = this.createDefaultForm();
  private loadRequestId = 0;
  private saveRequestId = 0;
  private readonly storageKey = 'riada.settings.admin.v1';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadReferenceData();
  }

  setActiveTab(tab: SettingsTab): void {
    this.activeTab = tab;
    this.saveNotice = null;
    this.formError = null;
    this.auditNotice = null;
  }

  loadReferenceData(): void {
    const requestId = ++this.loadRequestId;
    const keepDraft = this.hasUnsavedChanges && this.threadsAlreadyLoaded;

    this.loadingReferences = true;
    this.loadWarning = null;
    this.formError = null;
    this.auditNotice = null;

    const failedSources: string[] = [];
    let settingsEndpointUnavailable = false;

    forkJoin({
      clubs: this.api.listClubs().pipe(
        catchError((err) => {
          console.error('Failed to load clubs', err);
          failedSources.push('clubs');
          return of([] as ClubSummary[]);
        })
      ),
      plans: this.api.listSubscriptionPlans().pipe(
        catchError((err) => {
          console.error('Failed to load plans', err);
          failedSources.push('plans');
          return of([] as SubscriptionPlan[]);
        })
      ),
      health: this.api.getSystemHealth().pipe(
        catchError((err) => {
          console.error('Failed to load system health', err);
          failedSources.push('system health');
          return of(null);
        })
      ),
      settings: this.api.getAdminSettings().pipe(
        catchError((err) => {
          if (this.isEndpointUnavailable(err)) {
            settingsEndpointUnavailable = true;
            return of(null);
          }

          console.error('Failed to load settings snapshot', err);
          failedSources.push('settings');
          return of(null);
        })
      )
    })
      .pipe(
        finalize(() => {
          if (requestId !== this.loadRequestId) {
            return;
          }
          this.loadingReferences = false;
        })
      )
      .subscribe(({ clubs, plans, health, settings }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.clubs = clubs ?? [];
        this.plans = plans ?? [];
        this.health = health;
        const remoteSettings = this.normalizeSettingsPayload(settings);

        if (keepDraft) {
          this.form = this.reconcileFormWithReferences(this.form);
          this.savedSnapshot = this.reconcileFormWithReferences(this.savedSnapshot);
          this.saveNotice = 'Reference data reloaded. Unsaved draft preserved.';
        } else {
          const persisted = remoteSettings ?? this.loadPersistedSettings();
          const baseline = persisted ? this.reconcileFormWithReferences(persisted) : this.createRecommendedForm();
          this.form = this.cloneForm(baseline);
          this.savedSnapshot = this.cloneForm(baseline);
        }

        this.formIssues = this.collectFormIssues();

        const warnings: string[] = [];
        if (failedSources.length) {
          warnings.push(`Reference data partially loaded: ${failedSources.join(', ')} unavailable.`);
        }
        if (settingsEndpointUnavailable) {
          warnings.push('Settings API endpoint unavailable, local fallback enabled.');
        }

        if (warnings.length) {
          this.loadWarning = warnings.join(' ');
        }
      });
  }

  applySelectedProfile(): void {
    const profile = this.selectedProfile;
    if (!profile) {
      return;
    }

    this.form = this.cloneForm(
      this.reconcileFormWithReferences({
        ...this.form,
        ...profile.values
      })
    );
    this.formIssues = this.collectFormIssues();
    this.formError = null;
    this.auditNotice = null;
    this.saveNotice = `${profile.label} applied. Review and save when ready.`;
  }

  resetChanges(): void {
    this.form = this.cloneForm(this.savedSnapshot);
    this.formIssues = this.collectFormIssues();
    this.formError = null;
    this.auditNotice = null;
    this.saveNotice = 'Unsaved changes discarded.';
  }

  onFormChange(): void {
    this.formError = null;
    this.auditNotice = null;
    this.saveNotice = null;
    this.formIssues = this.collectFormIssues();
  }

  runConfigurationAudit(): void {
    this.formIssues = this.collectFormIssues();

    if (!this.formIssues.length) {
      this.formError = null;
      this.auditNotice = 'Configuration audit passed. No issues found.';
      return;
    }

    this.formError = `${this.formIssues.length} configuration checks require attention.`;
    this.activeTab = this.formIssues[0].tab;
    this.auditNotice = null;
  }

  saveSettings(): void {
    this.formIssues = this.collectFormIssues();
    this.formError = this.formIssues[0]?.message ?? null;
    this.saveNotice = null;
    this.auditNotice = null;

    if (this.formIssues.length || this.saving) {
      if (this.formIssues.length) {
        this.activeTab = this.formIssues[0].tab;
      }
      return;
    }

    const requestId = ++this.saveRequestId;
    this.saving = true;
    const snapshot = this.cloneForm(this.form);

    this.api.saveAdminSettings(this.toSettingsRecord(snapshot))
      .pipe(
        finalize(() => {
          if (requestId !== this.saveRequestId) {
            return;
          }
          this.saving = false;
        })
      )
      .subscribe({
        next: () => {
          if (requestId !== this.saveRequestId) {
            return;
          }

          this.persistSettings(snapshot);
          this.savedSnapshot = this.cloneForm(snapshot);
          this.lastSavedAt = new Date().toISOString();
          this.loadWarning = null;
          this.saveNotice = `Settings saved to server at ${new Date().toLocaleTimeString()}.`;
        },
        error: (error) => {
          if (requestId !== this.saveRequestId) {
            return;
          }

          if (this.isEndpointUnavailable(error)) {
            this.persistSettings(snapshot);
            this.savedSnapshot = this.cloneForm(snapshot);
            this.lastSavedAt = new Date().toISOString();
            this.formError = null;
            this.loadWarning = 'Settings API endpoint unavailable, using local fallback.';
            this.saveNotice = `Settings saved locally at ${new Date().toLocaleTimeString()}.`;
            return;
          }

          this.formError = this.getErrorMessage(error, 'Failed to save settings. Please retry.');
        }
      });
  }

  get hasUnsavedChanges(): boolean {
    return JSON.stringify(this.form) !== JSON.stringify(this.savedSnapshot);
  }

  get canSave(): boolean {
    return !this.loadingReferences && !this.saving && this.hasUnsavedChanges && !this.formIssues.length;
  }

  get selectedClubName(): string {
    const selected = this.clubs.find((club) => club.id === this.form.defaultClubId);
    return selected?.name ?? 'Not defined';
  }

  get selectedPlanName(): string {
    const selected = this.plans.find((plan) => plan.id === this.form.defaultPlanId);
    return selected?.planName ?? 'Not defined';
  }

  get riskSensitivityLabel(): string {
    if (this.form.churnAlertThreshold <= 60) {
      return 'High sensitivity';
    }
    if (this.form.churnAlertThreshold <= 75) {
      return 'Balanced sensitivity';
    }
    return 'Low sensitivity';
  }

  get automationReadiness(): string {
    const switchesEnabled = [
      this.form.autoInvoiceGeneration,
      this.form.autoEscalateMessages,
      this.form.dailyDigestEnabled
    ].filter(Boolean).length;

    if (switchesEnabled === 3) {
      return 'Fully automated';
    }
    if (switchesEnabled === 2) {
      return 'Partially automated';
    }
    return 'Mostly manual';
  }

  get selectedProfile(): SettingsProfile | undefined {
    return this.profiles.find((profile) => profile.id === this.selectedProfileId);
  }

  get threadsAlreadyLoaded(): boolean {
    return this.clubs.length > 0 || this.plans.length > 0 || !!this.health;
  }

  private collectFormIssues(): FormIssue[] {
    const issues: FormIssue[] = [];

    if (this.clubs.length > 0 && this.form.defaultClubId === null) {
      issues.push({ tab: 'operations', message: 'Select a default club before saving.' });
    }

    if (this.plans.length > 0 && this.form.defaultPlanId === null) {
      issues.push({ tab: 'operations', message: 'Select a default subscription plan before saving.' });
    }

    if (this.form.planningWindowDays < 7 || this.form.planningWindowDays > 120) {
      issues.push({ tab: 'operations', message: 'Planning window must be between 7 and 120 days.' });
    }

    if (this.form.maxGuestPassesPerMember < 0 || this.form.maxGuestPassesPerMember > 12) {
      issues.push({ tab: 'operations', message: 'Guest passes per member must stay between 0 and 12.' });
    }

    if (this.form.churnAlertThreshold < 40 || this.form.churnAlertThreshold > 95) {
      issues.push({ tab: 'notifications', message: 'Churn alert threshold must be between 40 and 95.' });
    }

    if (this.form.dailyDigestEnabled && !this.form.digestHour) {
      issues.push({ tab: 'notifications', message: 'Digest delivery time is required when digest is enabled.' });
    }

    if (this.form.maintenanceLeadDays < 3 || this.form.maintenanceLeadDays > 60) {
      issues.push({ tab: 'automation', message: 'Maintenance reminder lead time must be between 3 and 60 days.' });
    }

    return issues;
  }

  private createRecommendedForm(): AdminSettingsForm {
    return {
      defaultClubId: this.clubs[0]?.id ?? null,
      defaultPlanId: this.plans[0]?.id ?? null,
      planningWindowDays: this.health?.isHealthy ? 28 : 21,
      maxGuestPassesPerMember: 3,
      churnAlertThreshold: this.health && this.health.pendingInvoices > 10 ? 68 : 72,
      dailyDigestEnabled: true,
      digestHour: '07:30',
      autoInvoiceGeneration: true,
      autoEscalateMessages: true,
      maintenanceLeadDays: 14
    };
  }

  private createDefaultForm(): AdminSettingsForm {
    return {
      defaultClubId: null,
      defaultPlanId: null,
      planningWindowDays: 21,
      maxGuestPassesPerMember: 2,
      churnAlertThreshold: 72,
      dailyDigestEnabled: true,
      digestHour: '08:00',
      autoInvoiceGeneration: false,
      autoEscalateMessages: false,
      maintenanceLeadDays: 10
    };
  }

  private cloneForm(form: AdminSettingsForm): AdminSettingsForm {
    return { ...form };
  }

  private toSettingsRecord(form: AdminSettingsForm): Record<string, unknown> {
    return {
      defaultClubId: form.defaultClubId,
      defaultPlanId: form.defaultPlanId,
      planningWindowDays: form.planningWindowDays,
      maxGuestPassesPerMember: form.maxGuestPassesPerMember,
      churnAlertThreshold: form.churnAlertThreshold,
      dailyDigestEnabled: form.dailyDigestEnabled,
      digestHour: form.digestHour,
      autoInvoiceGeneration: form.autoInvoiceGeneration,
      autoEscalateMessages: form.autoEscalateMessages,
      maintenanceLeadDays: form.maintenanceLeadDays
    };
  }

  private normalizeSettingsPayload(payload: unknown): AdminSettingsForm | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const value = payload as Partial<AdminSettingsForm>;
    if (typeof value.planningWindowDays !== 'number') {
      return null;
    }

    return {
      defaultClubId: typeof value.defaultClubId === 'number' ? value.defaultClubId : null,
      defaultPlanId: typeof value.defaultPlanId === 'number' ? value.defaultPlanId : null,
      planningWindowDays: value.planningWindowDays,
      maxGuestPassesPerMember: typeof value.maxGuestPassesPerMember === 'number' ? value.maxGuestPassesPerMember : 2,
      churnAlertThreshold: typeof value.churnAlertThreshold === 'number' ? value.churnAlertThreshold : 72,
      dailyDigestEnabled: value.dailyDigestEnabled !== false,
      digestHour: typeof value.digestHour === 'string' ? value.digestHour : '08:00',
      autoInvoiceGeneration: value.autoInvoiceGeneration === true,
      autoEscalateMessages: value.autoEscalateMessages === true,
      maintenanceLeadDays: typeof value.maintenanceLeadDays === 'number' ? value.maintenanceLeadDays : 10
    };
  }

  private isEndpointUnavailable(error: unknown): boolean {
    return error instanceof HttpErrorResponse && [404, 405, 501].includes(error.status);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again before saving settings.';
      }
      if (error.status === 403) {
        return 'Your role does not allow changing settings.';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return fallback;
  }

  private loadPersistedSettings(): AdminSettingsForm | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return this.normalizeSettingsPayload(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return null;
      }
      throw error;
    }
  }

  private persistSettings(form: AdminSettingsForm): void {
    localStorage.setItem(this.storageKey, JSON.stringify(form));
  }

  private reconcileFormWithReferences(form: AdminSettingsForm): AdminSettingsForm {
    return {
      ...form,
      defaultClubId: this.resolvePreferredClubId(form.defaultClubId),
      defaultPlanId: this.resolvePreferredPlanId(form.defaultPlanId)
    };
  }

  private resolvePreferredClubId(selectedClubId: number | null): number | null {
    if (selectedClubId !== null && this.clubs.some((club) => club.id === selectedClubId)) {
      return selectedClubId;
    }
    return this.clubs[0]?.id ?? null;
  }

  private resolvePreferredPlanId(selectedPlanId: number | null): number | null {
    if (selectedPlanId !== null && this.plans.some((plan) => plan.id === selectedPlanId)) {
      return selectedPlanId;
    }
    return this.plans[0]?.id ?? null;
  }
}
