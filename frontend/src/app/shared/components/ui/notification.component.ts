import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed top-6 right-6 max-w-sm p-4 rounded-lg shadow-lg animate-slide-in-down z-50"
      [ngClass]="getClasses()"
    >
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 text-xl">
          {{ getIcon() }}
        </div>
        <div class="flex-1">
          <p class="font-semibold">{{ title }}</p>
          <p *ngIf="message" class="text-sm opacity-90 mt-1">{{ message }}</p>
        </div>
        <button
          (click)="close()"
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  `,
})
export class NotificationComponent implements OnInit {
  @Input() type: NotificationType = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() duration = 4000;
  @Output() closed = new EventEmitter<void>();

  isVisible = true;

  ngOnInit(): void {
    if (this.duration > 0) {
      setTimeout(() => this.close(), this.duration);
    }
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  getClasses(): string {
    const typeClasses = {
      success: 'bg-success-50 text-success border border-success-100',
      error: 'bg-danger-50 text-danger border border-danger-100',
      warning: 'bg-warning-50 text-warning border border-warning-100',
      info: 'bg-primary-50 text-primary border border-primary-100',
    };
    return typeClasses[this.type];
  }

  getIcon(): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[this.type];
  }
}
