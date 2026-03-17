import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MemberSummary, RiskScore } from '../../core/models/api-models';
import { ApiService } from '../../core/services/api.service';

type ThreadStatus = 'Unread' | 'Follow-up' | 'Resolved';
type ThreadChannel = 'Email' | 'SMS' | 'In-app';
type ThreadPriority = 'Low' | 'Medium' | 'High';
type ConversationDirection = 'incoming' | 'outgoing' | 'system';
type FollowUpWindowHours = 4 | 24 | 48;

interface ConversationItem {
  direction: ConversationDirection;
  content: string;
  createdAt: string;
}

interface MessageThread {
  id: number;
  memberId: number;
  memberName: string;
  subject: string;
  channel: ThreadChannel;
  status: ThreadStatus;
  priority: ThreadPriority;
  assignee: string;
  unreadCount: number;
  tags: string[];
  lastActivityAt: string;
  followUpAt: string | null;
  conversation: ConversationItem[];
}

interface ReplyTemplate {
  id: string;
  label: string;
  content: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit, OnDestroy {
  readonly assignees = ['Front Desk', 'Coach Team', 'Billing Desk', 'Operations Desk'];
  readonly statusFilters: Array<ThreadStatus | 'All'> = ['All', 'Unread', 'Follow-up', 'Resolved'];
  readonly channelFilters: Array<ThreadChannel | 'All'> = ['All', 'Email', 'SMS', 'In-app'];
  readonly priorityFilters: Array<ThreadPriority | 'All'> = ['All', 'High', 'Medium', 'Low'];
  readonly assigneeFilters: Array<string | 'All'> = ['All', ...this.assignees];
  readonly followUpWindows: FollowUpWindowHours[] = [4, 24, 48];
  readonly templates: ReplyTemplate[] = [
    {
      id: 'reschedule',
      label: 'Reschedule class',
      content: 'Thanks for your message. We can move your booking to tomorrow at 18:00. Please confirm if this slot works for you.'
    },
    {
      id: 'billing-followup',
      label: 'Billing clarification',
      content: 'We checked your invoice and will share a corrected statement within 24h. Thanks for your patience.'
    },
    {
      id: 'retention-check',
      label: 'Retention check-in',
      content: 'We noticed your attendance dropped recently. Would you like us to build a lighter plan for this week?'
    }
  ];

  threads: MessageThread[] = [];
  loading = false;
  refreshing = false;
  loadError: string | null = null;
  actionNotice: string | null = null;
  actionError: string | null = null;
  isSending = false;
  lastLoadedAt: string | null = null;

  searchTerm = '';
  statusFilter: ThreadStatus | 'All' = 'All';
  channelFilter: ThreadChannel | 'All' = 'All';
  priorityFilter: ThreadPriority | 'All' = 'All';
  assigneeFilter: string | 'All' = 'All';
  selectedThreadId: number | null = null;
  selectedTemplateId = '';
  replyDraft = '';

  private draftByThreadId: Record<number, string> = {};
  private loadRequestId = 0;
  private noticeTimerId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadThreads();
  }

  ngOnDestroy(): void {
    if (this.noticeTimerId !== null) {
      window.clearTimeout(this.noticeTimerId);
    }
  }

  loadThreads(isRefresh = false): void {
    const requestId = ++this.loadRequestId;
    const selectedBeforeReload = this.selectedThreadId;
    const draftsBeforeReload = { ...this.draftByThreadId };
    const issues: string[] = [];

    this.loading = !isRefresh && this.threads.length === 0;
    this.refreshing = isRefresh;
    this.loadError = null;
    this.actionError = null;

    forkJoin({
      risks: this.api.getRiskScores(20).pipe(
        catchError((error) => {
          issues.push(`Risk signals: ${this.getErrorMessage(error, 'unavailable')}`);
          return of([] as RiskScore[]);
        })
      ),
      members: this.api.getMembers({ page: 1, pageSize: 60 }).pipe(
        map((response) => response.items ?? []),
        catchError((error) => {
          issues.push(`Members: ${this.getErrorMessage(error, 'unavailable')}`);
          return of([] as MemberSummary[]);
        })
      )
    }).subscribe({
      next: ({ risks, members }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.threads = this.mergeThreadState(this.buildThreadsFromApi(risks, members));
        this.selectedThreadId = this.resolveSelectedThreadId(selectedBeforeReload, this.threads);
        this.draftByThreadId = draftsBeforeReload;
        this.replyDraft = this.selectedThreadId ? this.draftByThreadId[this.selectedThreadId] ?? '' : '';
        this.lastLoadedAt = new Date().toISOString();

        if (!this.threads.length && issues.length > 0) {
          this.loadError = `Inbox unavailable: ${issues.join(' ')}`;
        } else if (!this.threads.length) {
          this.loadError = 'No active conversations detected from current operational signals.';
        } else if (issues.length > 0) {
          this.loadError = `Inbox partially loaded: ${issues.join(' ')}`;
        }
      },
      error: (error) => {
        if (requestId !== this.loadRequestId) {
          return;
        }
        this.loadError = this.getErrorMessage(error, 'Failed to load inbox data. Please retry.');
      },
      complete: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }
        this.loading = false;
        this.refreshing = false;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'All';
    this.channelFilter = 'All';
    this.priorityFilter = 'All';
    this.assigneeFilter = 'All';
  }

  selectThread(threadId: number): void {
    this.persistDraftForSelectedThread();
    this.selectedThreadId = threadId;
    this.replyDraft = this.draftByThreadId[threadId] ?? '';
    this.actionNotice = null;
    this.actionError = null;

    const thread = this.threads.find((item) => item.id === threadId);
    if (!thread) {
      return;
    }

    if (thread.unreadCount > 0) {
      thread.unreadCount = 0;
      if (thread.status === 'Unread') {
        thread.status = 'Follow-up';
      }
    }
  }

  onTemplateChange(): void {
    if (!this.selectedTemplateId) {
      return;
    }

    const selectedTemplate = this.templates.find((template) => template.id === this.selectedTemplateId);
    if (!selectedTemplate) {
      return;
    }

    this.onReplyDraftChange(selectedTemplate.content);
  }

  onReplyDraftChange(value: string): void {
    this.replyDraft = value;
    this.actionError = null;

    if (this.selectedThreadId !== null) {
      this.draftByThreadId[this.selectedThreadId] = value;
    }
  }

  sendReply(): void {
    const thread = this.selectedThread;
    const content = this.replyDraft.trim();

    if (!thread || this.isSending) {
      return;
    }

    if (content.length < 5) {
      this.actionError = 'Reply must contain at least 5 characters.';
      return;
    }

    this.isSending = true;
    this.actionError = null;
    const threadId = thread.id;
    const activeThread = this.threads.find((item) => item.id === threadId);
    if (!activeThread) {
      this.isSending = false;
      return;
    }

    const now = new Date().toISOString();
    activeThread.conversation = [
      ...activeThread.conversation,
      {
        direction: 'outgoing',
        content,
        createdAt: now
      }
    ];
    activeThread.lastActivityAt = now;
    activeThread.unreadCount = 0;
    activeThread.status = 'Follow-up';
    activeThread.followUpAt = null;

    this.draftByThreadId[threadId] = '';
    if (this.selectedThreadId === threadId) {
      this.replyDraft = '';
    }
    this.selectedTemplateId = '';
    this.isSending = false;
    this.setActionNotice(`Reply sent to ${activeThread.memberName}.`);
  }

  markThreadResolved(): void {
    const thread = this.selectedThread;
    if (!thread || thread.status === 'Resolved') {
      return;
    }

    thread.status = 'Resolved';
    thread.unreadCount = 0;
    thread.followUpAt = null;
    this.appendSystemMessage(thread, 'Conversation was marked as resolved by the admin team.');
    this.setActionNotice(`Thread for ${thread.memberName} closed.`);
  }

  reopenThread(): void {
    const thread = this.selectedThread;
    if (!thread || thread.status !== 'Resolved') {
      return;
    }

    thread.status = 'Follow-up';
    this.appendSystemMessage(thread, 'Conversation reopened to continue follow-up.');
    this.setActionNotice(`Thread for ${thread.memberName} reopened.`);
  }

  assignThread(assignee: string): void {
    const thread = this.selectedThread;
    if (!thread) {
      return;
    }

    thread.assignee = assignee;
    this.setActionNotice(`Thread assigned to ${assignee}.`);
  }

  flagThreadHighPriority(): void {
    const thread = this.selectedThread;
    if (!thread || thread.priority === 'High') {
      return;
    }

    thread.priority = 'High';
    thread.status = 'Follow-up';
    this.setActionNotice(`${thread.memberName} conversation escalated as high priority.`);
  }

  scheduleFollowUp(hours: FollowUpWindowHours): void {
    const thread = this.selectedThread;
    if (!thread || thread.status === 'Resolved') {
      return;
    }

    const due = new Date();
    due.setHours(due.getHours() + hours);
    thread.followUpAt = due.toISOString();
    thread.status = 'Follow-up';
    this.appendSystemMessage(thread, `Follow-up reminder scheduled for ${due.toLocaleString()}.`);
    this.setActionNotice(`Follow-up set for ${thread.memberName} in ${hours}h.`);
  }

  clearFollowUpSchedule(): void {
    const thread = this.selectedThread;
    if (!thread || !thread.followUpAt) {
      return;
    }

    thread.followUpAt = null;
    this.appendSystemMessage(thread, 'Follow-up reminder cleared by admin.');
    this.setActionNotice(`Follow-up reminder cleared for ${thread.memberName}.`);
  }

  getStatusClass(status: ThreadStatus): string {
    switch (status) {
      case 'Unread':
        return 'status-unread';
      case 'Follow-up':
        return 'status-followup';
      case 'Resolved':
        return 'status-resolved';
    }
  }

  getPriorityClass(priority: ThreadPriority): string {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
    }
  }

  getFollowUpClass(thread: MessageThread): string {
    if (!thread.followUpAt || thread.status === 'Resolved') {
      return 'followup-none';
    }

    return new Date(thread.followUpAt).getTime() <= Date.now() ? 'followup-overdue' : 'followup-upcoming';
  }

  trackByThreadId(index: number, thread: MessageThread): number {
    return thread.id;
  }

  get filteredThreads(): MessageThread[] {
    const term = this.searchTerm.trim().toLowerCase();

    return [...this.threads]
      .filter((thread) => {
        const matchesStatus = this.statusFilter === 'All' || thread.status === this.statusFilter;
        const matchesChannel = this.channelFilter === 'All' || thread.channel === this.channelFilter;
        const matchesPriority = this.priorityFilter === 'All' || thread.priority === this.priorityFilter;
        const matchesAssignee = this.assigneeFilter === 'All' || thread.assignee === this.assigneeFilter;
        const matchesSearch =
          !term ||
          thread.memberName.toLowerCase().includes(term) ||
          thread.subject.toLowerCase().includes(term) ||
          thread.assignee.toLowerCase().includes(term) ||
          thread.tags.some((tag) => tag.toLowerCase().includes(term));

        return matchesStatus && matchesChannel && matchesPriority && matchesAssignee && matchesSearch;
      })
      .sort((a, b) => {
        const followUpWeightDiff = this.getFollowUpSortWeight(a) - this.getFollowUpSortWeight(b);
        if (followUpWeightDiff !== 0) {
          return followUpWeightDiff;
        }

        if (a.followUpAt && b.followUpAt) {
          const byFollowUpDate = new Date(a.followUpAt).getTime() - new Date(b.followUpAt).getTime();
          if (byFollowUpDate !== 0) {
            return byFollowUpDate;
          }
        }

        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      });
  }

  get selectedThread(): MessageThread | undefined {
    return this.threads.find((thread) => thread.id === this.selectedThreadId);
  }

  get canSendReply(): boolean {
    return !!this.selectedThread && !this.isSending && this.replyDraft.trim().length >= 5;
  }

  get unreadThreadsCount(): number {
    return this.threads.filter((thread) => thread.unreadCount > 0).length;
  }

  get unresolvedCount(): number {
    return this.threads.filter((thread) => thread.status !== 'Resolved').length;
  }

  get unreadMessagesTotal(): number {
    return this.threads.reduce((total, thread) => total + thread.unreadCount, 0);
  }

  get pendingFollowUpsCount(): number {
    return this.threads.filter((thread) => thread.status !== 'Resolved' && !!thread.followUpAt).length;
  }

  get overdueFollowUpsCount(): number {
    return this.threads.filter(
      (thread) =>
        thread.status !== 'Resolved' &&
        !!thread.followUpAt &&
        new Date(thread.followUpAt).getTime() <= Date.now()
    ).length;
  }

  get backlogCount(): number {
    const threshold = Date.now() - 2 * 60 * 60 * 1000;
    return this.threads.filter(
      (thread) =>
        thread.status !== 'Resolved' &&
        thread.unreadCount === 0 &&
        !thread.followUpAt &&
        new Date(thread.lastActivityAt).getTime() <= threshold
    ).length;
  }

  get selectedThreadFollowUpLabel(): string {
    const thread = this.selectedThread;
    if (!thread?.followUpAt || thread.status === 'Resolved') {
      return 'No follow-up reminder scheduled.';
    }

    const due = new Date(thread.followUpAt);
    const overdue = due.getTime() <= Date.now();
    return `${overdue ? 'Overdue since' : 'Due'} ${due.toLocaleString()}`;
  }

  private appendSystemMessage(thread: MessageThread, message: string): void {
    const now = new Date().toISOString();
    thread.conversation = [
      ...thread.conversation,
      {
        direction: 'system',
        content: message,
        createdAt: now
      }
    ];
    thread.lastActivityAt = now;
  }

  private setActionNotice(message: string): void {
    this.actionNotice = message;
    this.actionError = null;

    if (this.noticeTimerId !== null) {
      window.clearTimeout(this.noticeTimerId);
    }

    this.noticeTimerId = window.setTimeout(() => {
      this.actionNotice = null;
      this.noticeTimerId = null;
    }, 4200);
  }

  private persistDraftForSelectedThread(): void {
    if (this.selectedThreadId === null) {
      return;
    }

    this.draftByThreadId[this.selectedThreadId] = this.replyDraft;
  }

  private resolveSelectedThreadId(previousSelectedThreadId: number | null, rows: MessageThread[]): number | null {
    if (previousSelectedThreadId !== null && rows.some((thread) => thread.id === previousSelectedThreadId)) {
      return previousSelectedThreadId;
    }
    return rows[0]?.id ?? null;
  }

  private mergeThreadState(seedThreads: MessageThread[]): MessageThread[] {
    const existingById = new Map(this.threads.map((thread) => [thread.id, thread]));

    return seedThreads.map((seedThread) => {
      const existing = existingById.get(seedThread.id);
      if (!existing) {
        return seedThread;
      }

      return {
        ...seedThread,
        status: existing.status,
        priority: existing.priority,
        assignee: existing.assignee,
        unreadCount: existing.unreadCount,
        lastActivityAt: existing.lastActivityAt,
        followUpAt: existing.followUpAt,
        conversation: existing.conversation
      };
    });
  }

  private getFollowUpSortWeight(thread: MessageThread): number {
    if (!thread.followUpAt || thread.status === 'Resolved') {
      return 2;
    }

    return new Date(thread.followUpAt).getTime() <= Date.now() ? 0 : 1;
  }

  private buildThreadsFromApi(risks: RiskScore[], members: MemberSummary[]): MessageThread[] {
    const threads: MessageThread[] = [];
    const knownMemberIds = new Set<number>();

    risks.forEach((risk, index) => {
      const memberId = Number(risk.memberId ?? 0);
      if (!Number.isFinite(memberId) || memberId <= 0 || knownMemberIds.has(memberId)) {
        return;
      }

      const score = this.normalizeRiskScore(risk);
      const overdueInvoices = Math.max(0, Number(risk.overdueInvoiceCount ?? 0));
      const priority = this.resolvePriority(score, overdueInvoices);
      const followUpAt = this.resolveFollowUpAt(priority, overdueInvoices);
      const memberName = (risk.memberName ?? '').trim() || `Member #${memberId}`;
      const subject = overdueInvoices > 0
        ? `${overdueInvoices} overdue invoice(s) require follow-up`
        : `Retention signal detected (score ${score})`;
      const assignee = overdueInvoices > 0 ? 'Billing Desk' : 'Coach Team';
      const tags = overdueInvoices > 0 ? ['Billing', 'Retention'] : ['Retention'];

      threads.push({
        id: this.toRiskThreadId(memberId),
        memberId,
        memberName,
        subject,
        channel: overdueInvoices > 0 ? 'Email' : 'In-app',
        status: score >= 80 ? 'Unread' : 'Follow-up',
        priority,
        assignee,
        unreadCount: score >= 80 ? 1 : 0,
        tags,
        lastActivityAt: this.minutesAgo(6 + index * 4),
        followUpAt,
        conversation: [
          {
            direction: 'system',
            content: overdueInvoices > 0
              ? `System flagged ${overdueInvoices} overdue invoice(s). Immediate billing action required.`
              : `System generated a retention alert with score ${score}.`,
            createdAt: this.minutesAgo(8 + index * 4)
          }
        ]
      });

      knownMemberIds.add(memberId);
    });

    members
      .filter((member) => ['Suspended', 'Inactive', 'Pending'].includes(member.status))
      .slice(0, 20)
      .forEach((member, index) => {
        if (knownMemberIds.has(member.id)) {
          return;
        }

        const memberName = `${member.firstName} ${member.lastName}`.trim() || `Member #${member.id}`;
        const status = member.status || 'Pending';
        const subject = this.resolveStatusSubject(status);
        const priority: ThreadPriority = status === 'Suspended' ? 'High' : 'Medium';

        threads.push({
          id: this.toStatusThreadId(member.id),
          memberId: member.id,
          memberName,
          subject,
          channel: 'In-app',
          status: 'Follow-up',
          priority,
          assignee: 'Front Desk',
          unreadCount: 0,
          tags: ['Membership', status],
          lastActivityAt: member.lastVisitDate ?? this.minutesAgo(90 + index * 9),
          followUpAt: this.resolveFollowUpAt(priority, 0),
          conversation: [
            {
              direction: 'system',
              content: `Member currently marked as ${status}. Front desk should review account details and next actions.`,
              createdAt: this.minutesAgo(95 + index * 9)
            }
          ]
        });

        knownMemberIds.add(member.id);
      });

    return threads
      .sort((left, right) => {
        const byPriority = this.priorityRank(left.priority) - this.priorityRank(right.priority);
        if (byPriority !== 0) {
          return byPriority;
        }
        return new Date(right.lastActivityAt).getTime() - new Date(left.lastActivityAt).getTime();
      })
      .slice(0, 40);
  }

  private normalizeRiskScore(risk: RiskScore): number {
    const score = Number(risk.score ?? risk.riskScore ?? 0);
    if (!Number.isFinite(score)) {
      return 0;
    }
    return Math.max(0, Math.round(score));
  }

  private resolvePriority(score: number, overdueInvoices: number): ThreadPriority {
    if (overdueInvoices > 0 || score >= 80) {
      return 'High';
    }
    if (score >= 65) {
      return 'Medium';
    }
    return 'Low';
  }

  private resolveFollowUpAt(priority: ThreadPriority, overdueInvoices: number): string | null {
    if (overdueInvoices > 0 || priority === 'High') {
      return this.minutesFromNow(240);
    }
    if (priority === 'Medium') {
      return this.minutesFromNow(720);
    }
    return null;
  }

  private resolveStatusSubject(status: string): string {
    switch (status) {
      case 'Suspended':
        return 'Membership suspended: review payment and access status';
      case 'Inactive':
        return 'Inactive member follow-up recommended';
      case 'Pending':
        return 'Pending profile requires onboarding follow-up';
      default:
        return 'Member status requires follow-up';
    }
  }

  private priorityRank(priority: ThreadPriority): number {
    switch (priority) {
      case 'High':
        return 0;
      case 'Medium':
        return 1;
      case 'Low':
      default:
        return 2;
    }
  }

  private toRiskThreadId(memberId: number): number {
    return 100000 + memberId;
  }

  private toStatusThreadId(memberId: number): number {
    return 200000 + memberId;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'authentication required';
      }
      if (error.status === 403) {
        return 'access denied for your role';
      }
      if (error.status === 404) {
        return 'endpoint not found';
      }
      if (error.status === 0) {
        return 'API unreachable';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return fallback;
  }

  private minutesAgo(minutes: number): string {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - minutes);
    return timestamp.toISOString();
  }

  private minutesFromNow(minutes: number): string {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() + minutes);
    return timestamp.toISOString();
  }
}
