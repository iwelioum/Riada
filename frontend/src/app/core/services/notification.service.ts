import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public readonly notifications$ = this.notificationsSubject.asObservable();

  private notificationIdCounter = 0;

  /**
   * Show a success notification.
   * @param message The message to display
   * @param duration Duration in ms before auto-dismiss (default: 3000)
   */
  success(message: string, duration: number = 3000): void {
    this.addNotification('success', message, duration, true);
  }

  /**
   * Show an error notification.
   * @param message The error message
   * @param duration Duration in ms before auto-dismiss (default: 5000)
   */
  error(message: string, duration: number = 5000): void {
    this.addNotification('error', message, duration, true);
  }

  /**
   * Show a warning notification.
   * @param message The warning message
   * @param duration Duration in ms before auto-dismiss (default: 4000)
   */
  warning(message: string, duration: number = 4000): void {
    this.addNotification('warning', message, duration, true);
  }

  /**
   * Show an info notification.
   * @param message The info message
   * @param duration Duration in ms before auto-dismiss (default: 3000)
   */
  info(message: string, duration: number = 3000): void {
    this.addNotification('info', message, duration, true);
  }

  /**
   * Dismiss a specific notification by ID.
   */
  dismiss(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  /**
   * Dismiss all notifications.
   */
  dismissAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Get current notifications as observable.
   */
  getNotifications$(): Observable<Notification[]> {
    return this.notifications$;
  }

  private addNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    duration: number,
    dismissible: boolean
  ): void {
    const id = `notification-${++this.notificationIdCounter}`;
    const notification: Notification = {
      id,
      type,
      message,
      duration,
      dismissible
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notification]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }
}
