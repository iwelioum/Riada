import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusFormat',
  standalone: true,
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'suspended': 'Suspended',
      'pending': 'Pending',
      'cancelled': 'Cancelled',
      'expired': 'Expired',
      'anonymized': 'Anonymized',
    };
    return statusMap[value?.toLowerCase()] || value;
  }
}
