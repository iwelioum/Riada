import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="getClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  @Input() padding: 'sm' | 'md' | 'lg' = 'md';
  @Input() hover = false;
  @Input() border = true;

  getClasses(): string {
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return `
      bg-card rounded-2xl shadow-md
      ${paddingClasses[this.padding]}
      ${this.hover ? 'hover:shadow-lg transition-shadow' : ''}
      ${this.border ? 'border border-border' : ''}
    `.trim().replace(/\s+/g, ' ');
  }
}
