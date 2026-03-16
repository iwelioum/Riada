import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

    this.loading = !isRefresh && this.threads.length === 0;
    this.refreshing = isRefresh;
    this.loadError = null;
    this.actionError = null;

    window.setTimeout(() => {
      if (requestId !== this.loadRequestId) {
        return;
      }

      try {
        this.threads = this.mergeThreadState(this.buildSeedThreads());
        this.selectedThreadId = this.resolveSelectedThreadId(selectedBeforeReload, this.threads);
        this.draftByThreadId = draftsBeforeReload;
        this.replyDraft = this.selectedThreadId ? this.draftByThreadId[this.selectedThreadId] ?? '' : '';
        this.lastLoadedAt = new Date().toISOString();
      } catch (error) {
        console.error('Unable to load inbox', error);
        this.loadError = 'Failed to load inbox data. Please retry.';
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    }, 420);
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

    window.setTimeout(() => {
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
    }, 620);
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

  private buildSeedThreads(): MessageThread[] {
    return [
      {
        id: 1,
        memberId: 2481,
        memberName: 'Alex Carey',
        subject: 'Need to reschedule Thursday PT session',
        channel: 'SMS',
        status: 'Unread',
        priority: 'Medium',
        assignee: 'Front Desk',
        unreadCount: 2,
        tags: ['Scheduling', 'PT'],
        lastActivityAt: this.minutesAgo(12),
        followUpAt: null,
        conversation: [
          {
            direction: 'incoming',
            content: 'Hi team, I cannot come at 19:30 tonight. Can we move the session to tomorrow?',
            createdAt: this.minutesAgo(12)
          },
          {
            direction: 'incoming',
            content: 'If tomorrow is full, Saturday morning works too.',
            createdAt: this.minutesAgo(8)
          }
        ]
      },
      {
        id: 2,
        memberId: 1752,
        memberName: 'Cameron Williamson',
        subject: 'Invoice 2451 appears duplicated',
        channel: 'Email',
        status: 'Follow-up',
        priority: 'High',
        assignee: 'Billing Desk',
        unreadCount: 0,
        tags: ['Billing', 'Urgent'],
        lastActivityAt: this.minutesAgo(39),
        followUpAt: this.minutesFromNow(90),
        conversation: [
          {
            direction: 'incoming',
            content: 'I was charged twice for the monthly renewal. Can someone check invoice 2451?',
            createdAt: this.minutesAgo(105)
          },
          {
            direction: 'outgoing',
            content: 'Thanks Cameron, billing is reviewing this and will reply today.',
            createdAt: this.minutesAgo(92)
          },
          {
            direction: 'incoming',
            content: 'Great, thank you. I need confirmation before end of day.',
            createdAt: this.minutesAgo(39)
          }
        ]
      },
      {
        id: 3,
        memberId: 3925,
        memberName: 'Kalendra Wingman',
        subject: 'Low attendance check-in',
        channel: 'In-app',
        status: 'Follow-up',
        priority: 'Medium',
        assignee: 'Coach Team',
        unreadCount: 1,
        tags: ['Retention'],
        lastActivityAt: this.minutesAgo(165),
        followUpAt: this.minutesAgo(25),
        conversation: [
          {
            direction: 'system',
            content: 'Retention signal created from churn score report (score: 81).',
            createdAt: this.minutesAgo(205)
          },
          {
            direction: 'outgoing',
            content: 'Hi Kalendra, we prepared a lighter schedule for this week. Want us to share it?',
            createdAt: this.minutesAgo(188)
          },
          {
            direction: 'incoming',
            content: 'Yes please. I can train only 2x this week.',
            createdAt: this.minutesAgo(165)
          }
        ]
      },
      {
        id: 4,
        memberId: 4102,
        memberName: 'Rina Patel',
        subject: 'Guest pass approved',
        channel: 'Email',
        status: 'Resolved',
        priority: 'Low',
        assignee: 'Operations Desk',
        unreadCount: 0,
        tags: ['Guests'],
        lastActivityAt: this.minutesAgo(410),
        followUpAt: null,
        conversation: [
          {
            direction: 'incoming',
            content: 'Can I bring my sister for Saturday yoga?',
            createdAt: this.minutesAgo(530)
          },
          {
            direction: 'outgoing',
            content: 'Approved. Please provide her full name at check-in.',
            createdAt: this.minutesAgo(518)
          },
          {
            direction: 'system',
            content: 'Thread automatically closed after successful confirmation.',
            createdAt: this.minutesAgo(410)
          }
        ]
      }
    ];
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
