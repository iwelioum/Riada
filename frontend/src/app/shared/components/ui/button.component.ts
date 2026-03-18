import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [ngClass]="getClasses()"
      [disabled]="disabled || loading"
      (click)="onClick()"
      class="font-medium transition-fast inline-flex items-center justify-center gap-2 whitespace-nowrap"
    >
      <span *ngIf="loading" class="inline-block animate-spin">⏳</span>
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }

  getClasses(): string {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-500 shadow-sm hover:shadow-md',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
      danger: 'bg-danger text-white hover:bg-danger-500 shadow-sm hover:shadow-md',
      ghost: 'bg-transparent text-primary hover:bg-muted',
      outline: 'bg-transparent border border-primary text-primary hover:bg-muted',
    };

    return `
      rounded-lg
      ${sizeClasses[this.size]}
      ${variantClasses[this.variant]}
      ${this.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${this.fullWidth ? 'w-full' : ''}
    `.trim().replace(/\s+/g, ' ');
  }
}
