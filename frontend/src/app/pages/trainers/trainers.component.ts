import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Trainer {
  name: string;
  specialty: string;
  rating: number;
}

@Component({
  selector: 'app-trainers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainers.component.html',
  styleUrl: './trainers.component.scss'
})
export class TrainersComponent {
  trainers: Trainer[] = [
    { name: 'Alex Carey', specialty: 'Strength & Conditioning', rating: 4.8 },
    { name: 'Darlene Robertson', specialty: 'Pilates & Mobility', rating: 4.6 },
    { name: 'Cameron Williamson', specialty: 'HIIT & Cardio', rating: 4.7 },
    { name: 'Wade Warren', specialty: 'Weight loss & Nutrition', rating: 4.9 }
  ];
}
