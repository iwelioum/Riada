import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="getClasses()">
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: 'sm' | 'md' = 'sm';

  getClasses(): string {
    const sizeClasses = {
      sm: 'px-2.5 py-1 text-xs font-semibold',
      md: 'px-3 py-1.5 text-sm font-semibold',
    };

    const variantClasses = {
      default: 'bg-neutral-100 text-neutral-700',
      primary: 'bg-primary-50 text-primary',
      success: 'bg-success-50 text-success',
      warning: 'bg-warning-50 text-warning',
      danger: 'bg-danger-50 text-danger',
      muted: 'bg-neutral-200 text-neutral-600',
    };

    return `
      inline-flex items-center justify-center rounded-full
      ${sizeClasses[this.size]}
      ${variantClasses[this.variant]}
    `.trim().replace(/\s+/g, ' ');
  }
}
