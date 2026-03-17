import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../core/services/notification.service';

/**
 * Toast notification container component.
 * Place this in your root layout or app component to display all notifications.
 *
 * Usage in app.component.html:
 * <app-notification-container></app-notification-container>
 */
@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div
        *ngFor="let notification of notifications"
        [class]="'notification notification-' + notification.type"
        [@fadeInOut]
      >
        <div class="notification-content">
          <span class="notification-icon">
            <ng-container [ngSwitch]="notification.type">
              <span *ngSwitchCase="'success'">✓</span>
              <span *ngSwitchCase="'error'">✕</span>
              <span *ngSwitchCase="'warning'">⚠</span>
              <span *ngSwitchCase="'info'">ℹ</span>
            </ng-container>
          </span>
          <span class="notification-message">{{ notification.message }}</span>
        </div>
        <button
          *ngIf="notification.dismissible"
          class="notification-close"
          (click)="onDismiss(notification.id)"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-icon {
      font-size: 18px;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
    }

    .notification-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 20px;
      padding: 0;
      margin-left: 12px;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 1;
    }

    /* Type-specific styles */
    .notification-success {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .notification-success .notification-icon {
      color: #28a745;
    }

    .notification-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .notification-error .notification-icon {
      color: #dc3545;
    }

    .notification-warning {
      background-color: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }

    .notification-warning .notification-icon {
      color: #ffc107;
    }

    .notification-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }

    .notification-info .notification-icon {
      color: #17a2b8;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .notification-container {
        left: 10px;
        right: 10px;
        max-width: none;
      }

      .notification {
        margin-bottom: 8px;
        padding: 10px 12px;
      }
    }
  `]
})
export class NotificationContainerComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications$().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  onDismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
