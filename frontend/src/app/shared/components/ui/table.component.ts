import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'action';
}

export interface TableRow {
  [key: string]: any;
  id?: string | number;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto rounded-lg border border-border bg-card">
      <table class="w-full text-sm text-left text-neutral-600">
        <thead class="bg-neutral-50 border-b border-border text-xs font-bold text-neutral-700 uppercase">
          <tr>
            <th
              *ngFor="let col of columns"
              [style.width]="col.width"
              class="px-6 py-4"
            >
              <div class="flex items-center gap-2">
                {{ col.label }}
                <span *ngIf="col.sortable" class="text-neutral-400 cursor-pointer">↑↓</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let row of rows; let last = last"
            class="border-b border-border hover:bg-neutral-50 transition-colors last:border-b-0"
          >
            <td *ngFor="let col of columns" class="px-6 py-4">
              <span *ngIf="col.type === 'status'" class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                [ngClass]="getStatusClasses(row[col.key])">
                {{ row[col.key] }}
              </span>
              <span *ngIf="!col.type || col.type === 'text'">{{ row[col.key] }}</span>
              <span *ngIf="col.type === 'number'">{{ row[col.key] | number }}</span>
              <span *ngIf="col.type === 'date'">{{ row[col.key] | date: 'short' }}</span>
              <span *ngIf="col.type === 'action'" class="text-primary cursor-pointer hover:underline">
                View
              </span>
            </td>
          </tr>
          <tr *ngIf="rows.length === 0" class="border-b border-border">
            <td [attr.colspan]="columns.length" class="px-6 py-8 text-center text-neutral-500">
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div *ngIf="totalPages > 1" class="flex items-center justify-between mt-6 px-4">
      <span class="text-sm text-neutral-600">
        Page {{ currentPage }} of {{ totalPages }} • {{ totalRows }} total items
      </span>
      <div class="flex gap-2">
        <button
          [disabled]="currentPage === 1"
          (click)="previousPage()"
          class="px-4 py-2 border border-border rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        <button
          [disabled]="currentPage === totalPages"
          (click)="nextPage()"
          class="px-4 py-2 border border-border rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  `,
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: TableRow[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalRows = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<TableRow>();

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  getStatusClasses(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Active': 'bg-success-50 text-success',
      'Inactive': 'bg-neutral-100 text-neutral-600',
      'Suspended': 'bg-warning-50 text-warning',
      'Pending': 'bg-primary-50 text-primary',
      'Cancelled': 'bg-danger-50 text-danger',
    };
    return statusClasses[status] || 'bg-neutral-100 text-neutral-600';
  }
}
