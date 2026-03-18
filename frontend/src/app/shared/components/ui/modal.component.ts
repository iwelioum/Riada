import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      (click)="onBackdropClick()"
    >
      <div
        class="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h2 class="text-lg font-bold text-neutral-900">{{ title }}</h2>
          <button
            (click)="close()"
            class="text-neutral-500 hover:text-neutral-700 transition-fast text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div class="p-6">
          <ng-content></ng-content>
        </div>

        <div *ngIf="showActions" class="p-6 border-t border-border flex gap-3 justify-end">
          <app-button
            variant="ghost"
            (clicked)="close()"
          >
            {{ cancelLabel }}
          </app-button>
          <app-button
            variant="primary"
            [disabled]="confirmDisabled"
            (clicked)="confirm()"
          >
            {{ confirmLabel }}
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal';
  @Input() showActions = true;
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmDisabled = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  confirm(): void {
    if (!this.confirmDisabled) {
      this.confirmed.emit();
    }
  }
}
