import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ClubSummary, Equipment } from '../../core/models/api-models';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent implements OnInit {
  equipment: Equipment[] = [];
  clubs: ClubSummary[] = [];
  loading = false;
  filters: { clubId?: number; status?: string } = {};
  ticketPriority = 'Medium';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.listClubs().subscribe((clubs) => {
      this.clubs = clubs || [];
    });
    this.loadEquipment();
  }

  loadEquipment() {
    this.loading = true;
    this.apiService.listEquipment(this.filters).subscribe({
      next: (data) => {
        this.equipment = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading equipment:', err);
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Operational':
        return 'badge-success';
      case 'Maintenance':
        return 'badge-warning';
      case 'Retired':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  createTicket(equipmentId: number) {
    const title = prompt('Enter maintenance title:');
    if (title) {
      const ticket = { equipmentId, priority: this.ticketPriority, description: title };
      this.apiService.createMaintenanceTicket(ticket).subscribe({
        next: () => {
          alert('Maintenance ticket created');
          this.loadEquipment();
        },
        error: (err) => {
          console.error('Error creating ticket:', err);
          alert('Failed to create ticket');
        }
      });
    }
  }
}
