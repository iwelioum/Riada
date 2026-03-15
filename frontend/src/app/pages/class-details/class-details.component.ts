import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-class-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './class-details.component.html',
  styleUrl: './class-details.component.scss'
})
export class ClassDetailsComponent {
  title = 'Full Body Strength';
  instructor = 'Alex Carey';
  duration = '45 mins';
  level = 'Intermediate';

  constructor(route: ActivatedRoute) {
    const name = route.snapshot.paramMap.get('id');
    if (name) this.title = decodeURIComponent(name);
  }
}
